# Contributing

This repository holds the client-side pieces of IFTTT MCP — manifests, skills, rules, and assets. Improvements to any of those are welcome, as issues or PRs against `main`. AI agents contributing here should read [AGENTS.md](./AGENTS.md) first.

The MCP server itself is not developed here. Problems with tool behavior, the service catalog, accounts, or billing belong with [IFTTT Help](https://help.ifttt.com), not this issue tracker.

## Adding a plugin

1. Create `plugins/<name>/` (lowercase kebab-case). Required: `.cursor-plugin/plugin.json` (its `name` must equal the directory name), `assets/logo.svg`, and a `README.md`.
2. Register it in `.cursor-plugin/marketplace.json` at the repo root. Cursor reads that file first and ingests only the plugins it lists; each entry needs `name` (equal to the manifest's `name`), `source` (`plugins/<name>`), and a one-line `description`.
3. Wire components through explicit manifest pointers rather than relying on discovery: `"skills": "./skills/"`, `"rules": "./rules/"`, `"mcpServers": "./mcp.json"`, `"logo": "assets/logo.svg"`. Name the MCP config `mcp.json` — that is the file Cursor discovers by default, and it keeps the plugin compatible with the [Agent Plugins](https://agent-plugins.org) layout.
4. Stick to the fields in Cursor's plugin manifest schema (`cursor/plugins`, `schemas/plugin.schema.json`). The schema rejects unknown fields, and so does the validator.
5. Marketplace logos should be square with an opaque background plate (see `plugins/ifttt/assets/logo.svg`).

## The OpenClaw skill

`openclaw/<name>/` holds ClawHub-format skills for [OpenClaw](https://openclaw.ai), one folder per skill. Each folder needs a `SKILL.md` whose frontmatter declares `name` (matching the directory name, lowercase letters/numbers/hyphens), `description`, and `version` (semver). The validator checks all three. Keep the skill's guidance in sync with the Cursor plugin's skills and rules — it is the same content restructured into ClawHub's single-file format. Publishing is a manual maintainer step; see [openclaw/README.md](./openclaw/README.md).

## The MCP Registry entry

[`server.json`](./server.json) is the server's listing in the [official MCP Registry](https://registry.modelcontextprotocol.io), published under the `com.ifttt` namespace. Changing the file does not change the listing — a maintainer has to republish, so bump `version` in the same PR as any change you want to go live. `node scripts/validate.mjs` checks the constraints that are easy to trip over, notably the registry's 100-character cap on `description`; `mcp-publisher validate` checks the file against the live schema.

Publishing is a manual maintainer step. It authenticates by proving ownership of ifttt.com rather than through GitHub, which means signing a challenge with an Ed25519 private key — kept in 1Password (Engineering vault, "MCP Registry - ifttt.com DNS signing key"), deliberately not in this repo's CI, since this repository is public. Its public half is the `v=MCPv1` string in the ifttt.com apex TXT record, managed in `infra-misc`; rotating the key means updating both halves or publishing breaks. The item's notes carry the full sequence — in short, `mcp-publisher login dns --domain ifttt.com --private-key <key>` then `mcp-publisher publish` from the repo root.

## Validation

```
node scripts/validate.mjs
```

CI runs this on every push and PR. It checks the root marketplace manifest (every `plugins/<name>/` is listed, names are unique and match each plugin's manifest, each `source` resolves to a directory with `.cursor-plugin/plugin.json`), plugin manifest fields, referenced paths, and skill/rule frontmatter.

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
