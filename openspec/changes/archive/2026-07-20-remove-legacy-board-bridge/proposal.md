## Why

All normal board workflows now use lean read models and focused resource
mutations. Keeping the legacy full-board bridge around preserves the old
aggregate-write architecture, keeps stale specs alive, and leaves a risky path
where future changes could accidentally rewrite data that bootstrap did not
load.

## What Changes

- **BREAKING**: Remove the legacy full-board product API routes
  `GET /api/boards/default`, `GET /api/boards/:id`, and
  `PUT /api/boards/:id`.
- Remove client helpers and sync logic that load complete-board safety snapshots
  or persist full board aggregates.
- Remove `remotePersistence`/legacy full-board persistence wiring from normal
  client storage behavior.
- Remove or rewrite tests that depended on `/api/boards/default` or full-board
  `PUT`, replacing remaining assertions with bootstrap/resource endpoints.
- Update runtime docs so every durable mode lists bootstrap, detail, history,
  and operation-level resource endpoints as the only supported board API.
- Keep structured data normalization for old card shapes in scope as data
  migration safety, but do not expose full-board save/load as product behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `authenticated-board-api`: remove legacy full-board endpoints from the
  canonical durable API surface and require unsupported handling for those
  routes.
- `client-server-state-cache`: remove legacy full-board safety snapshot
  behavior now that all normal mutations are resource-level.
- `server-architecture`: clarify that the durable board API is composed of
  bootstrap/detail/history/resource routes rather than full-board aggregate
  routes.

## Impact

- Server API routing in `server/routes/authenticatedBoard.ts`.
- Structured repository exports/tests that only exist to support complete-board
  route reads/writes.
- Client API helpers in `src/storage/authenticatedApi.ts`.
- Client storage/sync modules in `src/storage`,
  `src/app/useAuthenticatedBoardSync.ts`, and any tests importing
  `boardSaveSafety` or `remotePersistence`.
- App test mocks under `src/test/appTestUtils.ts`.
- OpenSpec specs and `RUNNING_MODES.md`.
- Focused route, repository, API, app, and cache tests proving no normal flow
  calls `/api/boards/default` or `/api/boards/:id`.
