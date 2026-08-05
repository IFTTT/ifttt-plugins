# IFTTT Plugins

[IFTTT](https://ifttt.com) is "if this, then that" — automation across hundreds of services, from Gmail and Google Sheets to Philips Hue and Webhooks. This repository packages that power for AI clients: official plugins that connect an agent to IFTTT's hosted MCP server at `https://ifttt.com/mcp` and teach it to discover services, build Applets, and run actions responsibly.

The MCP server itself is hosted by IFTTT and closed source. This repo holds only what runs inside your client: manifests, skills, rules, and assets.

## Plugins

| Plugin | Description |
|---|---|
| [`ifttt`](plugins/ifttt/) | Service discovery, Applet building and management, and direct actions and queries |

## Installing

Cursor is our launch client — open [cursor.com/marketplace/ifttt](https://cursor.com/marketplace/ifttt) and click **Install**.

Running [OpenClaw](https://openclaw.ai)? Install the skill from [ClawHub](https://clawhub.ai/ifttt/ifttt):

```sh
openclaw skills install @ifttt/ifttt
```

Not on either? Any MCP-compatible client can point at the server directly:

```json
{
  "mcpServers": {
    "ifttt": {
      "type": "http",
      "url": "https://ifttt.com/mcp"
    }
  }
}
```

The first time the server is used, your browser opens IFTTT's sign-in page. A free account is enough — approve access and you're set.

## Repository layout

```
plugins/<name>/
  .cursor-plugin/plugin.json   Cursor marketplace manifest
  .mcp.json                    server connection (referenced from the manifest)
  skills/                      workflows the agent can load (SKILL.md each)
  rules/                       always-on guardrails (.mdc)
  assets/                      logo and icon
  README.md                    user-facing docs
openclaw/<name>/
  SKILL.md                     ClawHub-format skill for OpenClaw agents
server.json                    entry for the official MCP Registry
llms.txt                       discovery index for LLM crawlers
scripts/validate.mjs           structure checks (run in CI)
```

## Contributing

Run `node scripts/validate.mjs` before opening a PR — CI runs the same checks. [CONTRIBUTING.md](./CONTRIBUTING.md) covers scope, conventions, and local testing; AI agents working in this repo should start with [AGENTS.md](./AGENTS.md).

## Links

- IFTTT MCP: [ifttt.com/mcp](https://ifttt.com/mcp)
- Model Context Protocol: [modelcontextprotocol.io](https://modelcontextprotocol.io)
