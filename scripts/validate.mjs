#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const errors = [];
const warnings = [];

const pluginNamePattern = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile(filePath, context) {
  let raw;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    addError(`${context} is missing: ${filePath}`);
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    addError(`${context} contains invalid JSON (${filePath}): ${error.message}`);
    return null;
  }
}

function normalizeNewlines(content) {
  return content.replace(/\r\n/g, "\n");
}

function parseFrontmatter(content) {
  const normalized = normalizeNewlines(content);
  if (!normalized.startsWith("---\n")) {
    return null;
  }

  const closingIndex = normalized.indexOf("\n---\n", 4);
  if (closingIndex === -1) {
    return null;
  }

  const frontmatterBlock = normalized.slice(4, closingIndex);
  const fields = {};

  for (const line of frontmatterBlock.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    fields[key] = value;
  }

  return fields;
}

async function walkFiles(dirPath) {
  const files = [];
  const stack = [dirPath];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.isFile()) {
        files.push(entryPath);
      }
    }
  }

  return files;
}

function isSafeRelativePath(value) {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return true;
  }
  if (path.isAbsolute(value)) {
    return false;
  }
  const normalized = path.posix.normalize(value.replace(/\\/g, "/"));
  return !normalized.startsWith("../") && normalized !== "..";
}

function extractPathValues(value) {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => extractPathValues(entry));
  }

  if (value && typeof value === "object") {
    const candidates = [];
    if (typeof value.path === "string") {
      candidates.push(value.path);
    }
    if (typeof value.file === "string") {
      candidates.push(value.file);
    }
    return candidates;
  }

  return [];
}

async function validateReferencedPath(pluginDir, fieldName, pathValue, pluginName) {
  if (pathValue.startsWith("http://") || pathValue.startsWith("https://")) {
    return;
  }

  if (!isSafeRelativePath(pathValue)) {
    addError(
      `${pluginName}: field "${fieldName}" has invalid path "${pathValue}". Use a relative path without ".." or absolute prefixes.`
    );
    return;
  }

  const resolved = path.resolve(pluginDir, pathValue);
  const exists = await pathExists(resolved);
  if (!exists) {
    addError(`${pluginName}: field "${fieldName}" references missing path "${pathValue}".`);
  }
}

async function validateFrontmatterFile(filePath, componentName, requiredKeys, pluginName) {
  const content = await fs.readFile(filePath, "utf8");
  const parsed = parseFrontmatter(content);
  const relativeFile = path.relative(repoRoot, filePath);

  if (!parsed) {
    addError(`${pluginName}: ${componentName} file missing YAML frontmatter: ${relativeFile}`);
    return;
  }

  for (const key of requiredKeys) {
    if (!parsed[key] || parsed[key].length === 0) {
      addError(`${pluginName}: ${componentName} file missing "${key}" in frontmatter: ${relativeFile}`);
    }
  }
}

async function validateComponentFrontmatter(pluginDir, pluginName) {
  const componentDirs = [
    { dir: "rules", label: "rule", keys: ["description"], extensions: [".md", ".mdc", ".markdown"] },
    { dir: "agents", label: "agent", keys: ["name", "description"], extensions: [".md", ".mdc", ".markdown"] },
    { dir: "commands", label: "command", keys: ["name", "description"], extensions: [".md", ".mdc", ".markdown", ".txt"] },
  ];

  for (const { dir, label, keys, extensions } of componentDirs) {
    const dirPath = path.join(pluginDir, dir);
    if (!(await pathExists(dirPath))) {
      continue;
    }
    const files = await walkFiles(dirPath);
    for (const file of files) {
      if (extensions.includes(path.extname(file).toLowerCase())) {
        await validateFrontmatterFile(file, label, keys, pluginName);
      }
    }
  }

  const skillsDir = path.join(pluginDir, "skills");
  if (await pathExists(skillsDir)) {
    const files = await walkFiles(skillsDir);
    for (const file of files) {
      if (path.basename(file) === "SKILL.md") {
        await validateFrontmatterFile(file, "skill", ["name", "description"], pluginName);
      }
    }
  }
}

async function validatePlugin(pluginDir, dirName) {
  const manifestPath = path.join(pluginDir, ".cursor-plugin", "plugin.json");
  const manifest = await readJsonFile(manifestPath, `${dirName} plugin manifest`);
  if (!manifest) {
    return;
  }

  if (typeof manifest.name !== "string" || !pluginNamePattern.test(manifest.name)) {
    addError(
      `${dirName}: "name" in plugin.json must be lowercase and use only alphanumerics, hyphens, and periods.`
    );
  } else if (manifest.name !== dirName) {
    addError(`${dirName}: plugin.json name ("${manifest.name}") must match the plugin directory name.`);
  }

  for (const field of ["displayName", "version", "description", "license"]) {
    if (typeof manifest[field] !== "string" || manifest[field].length === 0) {
      addError(`${dirName}: plugin.json is missing required field "${field}".`);
    }
  }

  if (!manifest.author || typeof manifest.author.name !== "string" || manifest.author.name.length === 0) {
    addError(`${dirName}: plugin.json "author.name" is required.`);
  }

  if (typeof manifest.logo !== "string" || manifest.logo.length === 0) {
    addError(`${dirName}: plugin.json "logo" is required.`);
  }

  const manifestFields = ["logo", "rules", "skills", "agents", "commands", "hooks", "mcpServers"];
  for (const field of manifestFields) {
    const values = extractPathValues(manifest[field]);
    for (const value of values) {
      await validateReferencedPath(pluginDir, field, value, dirName);
    }
  }

  await validateComponentFrontmatter(pluginDir, dirName);

  if (!(await pathExists(path.join(pluginDir, "README.md")))) {
    addWarning(`${dirName}: no README.md found.`);
  }
}

async function validateRegistryManifest() {
  const serverJsonPath = path.join(repoRoot, "server.json");
  if (!(await pathExists(serverJsonPath))) {
    addWarning("No server.json found at the repo root (only needed for the MCP Registry).");
    return;
  }

  const manifest = await readJsonFile(serverJsonPath, "MCP Registry manifest");
  if (!manifest) {
    return;
  }

  for (const field of ["name", "description", "version"]) {
    if (typeof manifest[field] !== "string" || manifest[field].length === 0) {
      addError(`server.json is missing required field "${field}".`);
    }
  }

  if (!Array.isArray(manifest.remotes) || manifest.remotes.length === 0) {
    addError('server.json "remotes" must be a non-empty array.');
  }
}

async function main() {
  const pluginsRoot = path.join(repoRoot, "plugins");
  let entries;
  try {
    entries = await fs.readdir(pluginsRoot, { withFileTypes: true });
  } catch {
    addError(`Plugins directory is missing: ${pluginsRoot}`);
    summarizeAndExit();
    return;
  }

  const pluginDirs = entries.filter((entry) => entry.isDirectory());
  if (pluginDirs.length === 0) {
    addError("No plugin directories found under plugins/.");
  }

  for (const entry of pluginDirs) {
    await validatePlugin(path.join(pluginsRoot, entry.name), entry.name);
  }

  await validateRegistryManifest();

  summarizeAndExit();
}

function summarizeAndExit() {
  if (warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
    console.log("");
  }

  if (errors.length > 0) {
    console.error("Validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Validation passed.");
}

await main();
