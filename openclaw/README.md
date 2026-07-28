# OpenClaw skills

This directory holds ClawHub-format skills for [OpenClaw](https://openclaw.ai) agents, one folder per skill. Each folder is a self-contained publishable bundle built around a `SKILL.md` — the same IFTTT guidance as the Cursor plugin under [`plugins/ifttt/`](../plugins/ifttt/), restructured into the single-file format [ClawHub](https://clawhub.ai) expects.

## Installing (users)

```sh
openclaw skills install @ifttt/ifttt
```

The skill walks the agent through adding the MCP server (`https://ifttt.com/mcp`) to the OpenClaw config and authenticating with `openclaw mcp login ifttt`.

## Publishing (maintainers)

Publishing requires membership in the `ifttt` org publisher on ClawHub. First release:

```sh
npm i -g clawhub
clawhub login
clawhub skill publish ./openclaw/ifttt \
  --slug ifttt \
  --name "IFTTT" \
  --owner ifttt \
  --version 1.0.0 \
  --changelog "Initial release"
```

The public listing appears at [clawhub.ai/ifttt/ifttt](https://clawhub.ai/ifttt/ifttt). Subsequent publishes auto-increment the patch version unless `--version` is passed — keep the frontmatter `version` in `SKILL.md` in sync.

Notes:

- ClawHub publishes all skills under the MIT-0 license and runs a security analysis that compares declared frontmatter metadata against what the skill actually does — keep `metadata.openclaw` accurate and minimal (this skill needs no env vars or binaries; auth is OAuth via `openclaw mcp login`).
- New releases may be held out of install surfaces until ClawHub's review finishes.
- `node scripts/validate.mjs` checks the frontmatter structure in CI.
