## Why

Flowboard currently keeps page selection, sidebar actions, and card detail dialogs in client state, so copied links always reopen the default app shell instead of the specific destination the user meant to share or save. Authenticated usage makes this more important because sign-in redirects must preserve the intended destination before the app can load protected board data.

## What Changes

- Add canonical client routes for the board, completed work history, tag management, board settings, active card details, archived card details, sign-in, and auth callback flows.
- Use route state as the source of truth for sidebar selection and route-addressable dialogs while preserving the current board-first UI.
- Preserve protected deep links through Supabase OAuth and magic-link sign-in, including an auth callback route that returns users to the originally requested internal destination.
- Resolve active and archived card routes after board data hydrates, with graceful missing-resource handling when a card, cycle, or board cannot be found.
- Keep app hosting compatible with direct browser loads of nested routes through existing SPA fallbacks.

## Capabilities

### New Capabilities

- `app-routing`: Defines Flowboard's canonical client route map, route-owned sidebar destinations, route-owned dialogs, deep-link restoration, and missing-route behavior.

### Modified Capabilities

- `supabase-auth`: Preserve intended app routes through Supabase OAuth and magic-link redirects, and define sign-in/callback route behavior for authenticated destinations.
- `structured-board-persistence`: Ensure route resolution uses authenticated board identity and persisted active/history records without exposing or opening another user's data.

## Impact

- Adds a routing dependency and route configuration to the React/Vite client.
- Refactors navigation callbacks, sidebar items, board/history/card dialogs, tag manager, and board settings to navigate through URLs instead of local-only view/dialog booleans.
- Updates Supabase auth redirect handling to include an internal callback route and safe next-destination preservation.
- Extends tests for direct route loads, back/forward behavior, protected deep links, active cards, archived cards, and missing route targets.
