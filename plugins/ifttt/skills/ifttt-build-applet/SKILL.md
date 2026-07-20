---
name: ifttt-build-applet
description: Build, edit, and test IFTTT Applets step by step — service discovery, step templates, account selection, ingredients, and Filter Code. Use whenever the user wants to create or change an automation ("when X happens, do Y").
---

# Build an IFTTT Applet

## When to use

- The user describes an automation: "when X happens, do Y"
- The user wants to modify, test, or add logic to an existing Applet

## Workflow

1. **Find the services.** Call `search_services` with keywords from the user's request to get exact service slugs. Never guess a slug.
2. **Discover the steps.** Call `get_steps` with the trigger service and action service(s) to fetch available triggers, queries, and actions with their field definitions, ingredients, and a ready-made `step_template`.
3. **Connect missing services.** Discovery results include `connected` and a `connect_url` when a service isn't connected. Present the `connect_url` to the user, wait for confirmation, then re-run discovery to pick up their `account_id`.
4. **Fill the templates.** Copy `step_template` from each chosen step verbatim, then fill in `account_id` and the step's fields. Action and query fields can reference trigger/query ingredients — use them to pass data between steps.
5. **Create.** Call `create_applet` with `name`, an optional but recommended `description`, the `trigger`, and `actions` (plus optional `queries` and `actions_delay` up to 14,145 seconds). The Applet is created and enabled immediately — tell the user this before calling. On success, share the returned `applet_url` so the user can view it.
6. **Handle validation errors.** A failed `create_applet` returns structured `errors`. Fix the referenced fields and retry; don't retry unchanged input.

## Editing

- Call `get_applet` first to see the Applet's current configuration, then `edit_applet` with the changed pieces.
- Applets can only be edited if the user owns them. Editing a published community Applet the user enabled may create the user's own copy — relay that to the user when it happens.

## Filter Code (Pro+ only)

- `set_applet_filter_code` adds conditional logic between trigger and actions.
- Pass a **natural-language prompt** describing the behavior (e.g. "only run on weekdays") — never pass TypeScript/JavaScript directly; the tool generates the code server-side.
- Pass an empty string to clear existing Filter Code.
- If the response includes `made_it_your_own: true`, a new user-owned copy of a community Applet was created — tell the user explicitly and use the new `applet_slug` going forward.

## Testing

- Use `run_query` to preview the data a query step would return.
- Use `run_action` to test an action — but it performs the action for real (sends the email, turns on the lights). Confirm with the user before running actions with visible side effects.
- Location-based triggers need coordinates; use `geocode` to convert place names.
