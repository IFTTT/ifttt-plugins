# IFTTT plugin

Automate the services you use every day — Gmail, Google Sheets, Slack, Philips Hue, Webhooks, and hundreds more — straight from your AI agent. This plugin connects the agent to [IFTTT](https://ifttt.com)'s hosted MCP server (`https://ifttt.com/mcp`) and bundles the skills and rules that teach it to build Applets the right way.

## Setup

1. Install from [Cursor's marketplace](https://cursor.com/marketplace/ifttt).
2. On first use, Cursor opens IFTTT's OAuth page in your browser. Sign in (or create a free account) and approve access.
3. Describe the automation you want — the agent takes it from there.

## What the agent can do

- **Discover**: search IFTTT's service catalog and browse triggers, queries, and actions
- **Automate**: create, edit, enable, disable, and remove Applets ("when X happens, do Y")
- **Execute**: run actions and queries directly — send a notification, add a spreadsheet row, read sensor data
- **Extend**: add Filter Code logic to Applets (IFTTT Pro+)

## Try asking

> "When I get an email with an attachment, save it to Dropbox"
>
> "Turn my office lights red whenever CI fails"
>
> "Send me a phone notification every day at 9am with my first calendar event"
>
> "Add a row to my expenses spreadsheet every time I get a receipt email"
>
> "What's the temperature from my weather station right now?"

## What's included

| Component | Purpose |
|---|---|
| MCP server config (`.mcp.json`) | Streamable HTTP connection to `https://ifttt.com/mcp` with OAuth |
| `ifttt-setup` skill | Authentication, IFTTT concepts, and tool overview |
| `ifttt-build-applet` skill | Step-by-step Applet building, editing, and testing workflow |
| `ifttt-lifecycle` rule | Safety rails: confirmation before destructive or side-effectful calls, no guessed identifiers, connection-error handling |

## Good to know

- New Applets go live the moment they're created — the agent summarizes the trigger and actions and confirms with you first.
- `run_action` performs the action for real (messages get sent, lights get switched), so the agent asks before running anything with visible side effects.
- Filter Code requires [IFTTT Pro+](https://ifttt.com/plans); other features work on every plan.

## Documentation & support

- [ifttt.com/docs/mcp](https://ifttt.com/docs/mcp): IFTTT MCP documentation
- [ifttt.com/plans](https://ifttt.com/plans): plan tiers and features
- [help.ifttt.com](https://help.ifttt.com): support
