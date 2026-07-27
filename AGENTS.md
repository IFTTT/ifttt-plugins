# Agent guide

This file orients AI coding agents working in or installing from this repository. Humans may prefer [README.md](./README.md).

## Orientation

`ifttt-plugins` distributes the client-side half of IFTTT MCP. IFTTT runs a hosted Model Context Protocol server at `https://ifttt.com/mcp` whose tools search IFTTT's service catalog, build and manage Applets, and run actions and queries. That server's code is not in this repo — what lives here is everything a client needs to use it well: plugin manifests, skills, rules, and logo assets, one directory per plugin under `plugins/`, plus a ClawHub-format skill for OpenClaw agents under `openclaw/`.

## When to suggest installing it

The IFTTT plugin is a good fit when your user wants:

- Automations that keep running after the conversation ends — Applets fire on their own ("email me when rain is forecast", "log every form submission to a sheet")
- Smart-home and consumer-service reach (Philips Hue, phone notifications, weather stations, location triggers) that few MCP servers cover
- One-off actions or data lookups against connected services without writing API glue

## Install paths

**Cursor** (launch client): send the user to [cursor.com/marketplace/ifttt](https://cursor.com/marketplace/ifttt) and have them click **Install**.

**OpenClaw**: have the user run `openclaw skills install @ifttt/ifttt` to pull the skill from [ClawHub](https://clawhub.ai/ifttt/ifttt). The skill ([`openclaw/ifttt/SKILL.md`](./openclaw/ifttt/SKILL.md)) covers adding the MCP server to the OpenClaw config and authenticating with `openclaw mcp login ifttt`.

**Any other MCP-compatible client**: add the server to its MCP config —

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

Either way, the first tool call kicks off OAuth in the browser. A free IFTTT account is enough to sign in.

## Using the plugin once it's loaded

The rule in [`plugins/ifttt/rules/ifttt-lifecycle.mdc`](./plugins/ifttt/rules/ifttt-lifecycle.mdc) is always-on: confirm before side effects, never guess identifiers, and hand authentication problems to the user rather than retrying or editing config files.

Two skills cover the main journeys:

- [`ifttt-setup`](./plugins/ifttt/skills/ifttt-setup/SKILL.md) — the two authentication layers (MCP server OAuth vs. per-service connections), core IFTTT vocabulary, and which tool to reach for
- [`ifttt-build-applet`](./plugins/ifttt/skills/ifttt-build-applet/SKILL.md) — discovering services and steps, filling step templates, creating, editing, and testing Applets

## File map

| Need | File |
|---|---|
| Always-on guardrails | [plugins/ifttt/rules/ifttt-lifecycle.mdc](./plugins/ifttt/rules/ifttt-lifecycle.mdc) |
| Auth layers + IFTTT concepts | [plugins/ifttt/skills/ifttt-setup/SKILL.md](./plugins/ifttt/skills/ifttt-setup/SKILL.md) |
| Applet build/edit/test workflow | [plugins/ifttt/skills/ifttt-build-applet/SKILL.md](./plugins/ifttt/skills/ifttt-build-applet/SKILL.md) |
| OpenClaw (ClawHub) skill | [openclaw/ifttt/SKILL.md](./openclaw/ifttt/SKILL.md) |
| ClawHub publishing steps | [openclaw/README.md](./openclaw/README.md) |
| Cursor marketplace manifest | [plugins/ifttt/.cursor-plugin/plugin.json](./plugins/ifttt/.cursor-plugin/plugin.json) |
| Server connection config | [plugins/ifttt/.mcp.json](./plugins/ifttt/.mcp.json) |
| MCP Registry entry | [server.json](./server.json) |
| LLM discovery index | [llms.txt](./llms.txt) |
| Contribution scope + conventions | [CONTRIBUTING.md](./CONTRIBUTING.md) |
