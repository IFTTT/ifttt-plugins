---
name: ifttt-setup
description: Set up and authenticate the IFTTT MCP connection, understand IFTTT concepts (services, triggers, queries, actions, Applets), and learn which IFTTT tools to reach for. Use when the user first mentions IFTTT, asks what they can automate, or hits authentication/connection errors.
---

# IFTTT setup

## When to use

- The user asks to connect Cursor to IFTTT or mentions IFTTT for the first time
- IFTTT tools return authentication or "service not connected" errors
- The user asks what IFTTT can do or what they can automate

## Key concepts

- **Service**: an integration IFTTT supports (Gmail, Google Sheets, Philips Hue, Webhooks, ...). Each service has a unique `slug` (e.g. `google_sheets`). Never guess slugs — always look them up with `search_services` or `get_services`.
- **Trigger**: the "if this" event that starts an Applet (e.g. "New email in inbox").
- **Action**: the "then that" step an Applet performs (e.g. "Add row to spreadsheet").
- **Query**: an optional step that fetches extra data between the trigger and actions.
- **Ingredient**: a data field produced by a trigger or query, usable in downstream action fields.
- **Applet**: a saved automation combining one trigger, optional queries, and one or more actions.

## Authenticating

There are two separate layers of authentication. Do not confuse them.

**Layer 1 — connecting the MCP server itself (Cursor-managed OAuth).** No IFTTT tool performs this login, and it cannot be fixed by editing `mcp.json` or other config files — never attempt that. If IFTTT tools are unavailable or every call fails with an authentication error:

1. If Cursor offers an authentication action for the `ifttt` server, trigger it once. The browser should open IFTTT's authorization page, where the user signs in (or creates a free account) and approves access.
2. If the browser does not open or auth still fails, hand off to the user: "Open **Cursor Settings → Tools & MCP**, find the `ifttt` server, and click **Connect**. Sign in at ifttt.com and approve access." Then stop and wait for the user to confirm before retrying — do not investigate config files or retry in a loop.
3. Once connected, verify with `get_user_info`. It returns the user's IFTTT plan tier, which gates some features (e.g. Filter Code requires Pro+).

**Layer 2 — connecting individual services (IFTTT-managed).** Once the server is authenticated, each service (Gmail, Dropbox, ...) still needs its own connection on the user's IFTTT account:

1. When a tool reports a service is not connected, call `connect_service` with the `service_slug` — it returns a `connect_url`. Present that URL to the user as a clickable link, wait for them to finish connecting, then retry the original request.
2. If `connect_service` reports `mode: "reconnect"` for a specific account, the account's authorization expired — present the `reconnect_url` and wait for the user to re-authorize before retrying.

## Tool overview

Discovery (read-only):
- `get_user_info` — account, plan tier, and limits
- `search_services` / `get_services` — find services by keyword or list them
- `get_steps` — fetch triggers, queries, and actions for one or more services in a single call (preferred)
- `get_triggers` / `get_queries` / `get_actions` — per-service, per-type variants
- `my_applets` / `search_applets` / `get_applet` — inspect the user's existing Applets

Applet lifecycle:
- `create_applet` / `edit_applet` — build or modify an Applet (see the `ifttt-build-applet` skill)
- `enable_applet` / `disable_applet` / `remove_applet` — manage Applet state
- `set_applet_filter_code` — add conditional logic (Pro+ only)

Direct execution:
- `run_action` — perform a one-off action immediately (has real-world side effects)
- `run_query` — fetch data from a connected service
- `geocode` — resolve place names to coordinates for location-based triggers
