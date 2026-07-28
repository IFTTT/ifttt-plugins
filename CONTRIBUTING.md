# Contributing

This repository holds the client-side pieces of IFTTT MCP — manifests, skills, rules, and assets. Improvements to any of those are welcome, as issues or PRs against `main`. AI agents contributing here should read [AGENTS.md](./AGENTS.md) first.

The MCP server itself is not developed here. Problems with tool behavior, the service catalog, accounts, or billing belong with [IFTTT Help](https://help.ifttt.com), not this issue tracker.

## Adding a plugin

1. Create `plugins/<name>/` (lowercase kebab-case). Required: `.cursor-plugin/plugin.json` (its `name` must equal the directory name), `assets/logo.svg`, and a `README.md`.
2. Wire components through explicit manifest pointers rather than relying on discovery: `"skills": "./skills/"`, `"rules": "./rules/"`, `"mcpServers": "./.mcp.json"`, `"logo": "assets/logo.svg"`.
3. Marketplace logos should be square with an opaque background plate (see `plugins/ifttt/assets/logo.svg`).

## The OpenClaw skill

`openclaw/<name>/` holds ClawHub-format skills for [OpenClaw](https://openclaw.ai), one folder per skill. Each folder needs a `SKILL.md` whose frontmatter declares `name` (matching the directory name, lowercase letters/numbers/hyphens), `description`, and `version` (semver). The validator checks all three. Keep the skill's guidance in sync with the Cursor plugin's skills and rules — it is the same content restructured into ClawHub's single-file format. Publishing is a manual maintainer step; see [openclaw/README.md](./openclaw/README.md).

## Validation

```
node scripts/validate.mjs
```

CI runs this on every push and PR. It checks manifest fields, referenced paths, and skill/rule frontmatter.

## Local testing in Cursor

Copy the plugin into Cursor's local plugins directory and fully restart Cursor (Cmd+Q):

```
cp -R plugins/<name> ~/.cursor/plugins/local/<name>
```

Local plugins don't show up in the Installed plugins list — confirm their components under Settings → Tools & MCP instead.

## Writing skills and rules

- Name real MCP tools in skills, and verify them against the live server before writing — a skill that references tools that don't exist is worse than no skill.
- Rules are for safety behavior: confirmation before anything destructive or side-effectful, no guessed identifiers, and connection errors that hand off to the user instead of looping.
- Server-level OAuth is completed in the client's settings UI. Never write guidance that has an agent "fix" authentication by editing config files.
- All manifest paths stay relative, with no `..` segments — the validator enforces this.
