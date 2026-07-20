## Context

Flowboard has completed the resource API migration for the current product
surface: bootstrap reads, active-card detail reads, history reads, and
operation-level mutations for cards, columns, tags, board settings, work-cycle
settings, work completion, and clear board.

The old bridge still exists in two places:

- Server routes accept `GET /api/boards/default`, `GET /api/boards/:id`, and
  `PUT /api/boards/:id` as complete-board aggregate operations.
- Client storage/sync code still has helpers for complete-board reads, safety
  snapshots, and remote full-board persistence.

Those paths were useful while the app supported both browser storage and early
SQLite persistence, but they now preserve the architecture we are trying to
leave behind: a board can be rewritten as one JSON-shaped aggregate even though
bootstrap intentionally omits rich content and completed history.

## Goals / Non-Goals

**Goals:**

- Remove legacy complete-board product routes from the authenticated API.
- Remove client helpers and sync behavior that fetch or save complete boards.
- Keep authenticated app state flowing through TanStack Query bootstrap,
  detail, history, and resource mutation caches.
- Update tests, docs, and specs so `/api/boards/default` and `/api/boards/:id`
  are no longer treated as supported product API.
- Make accidental aggregate rewrites difficult by removing the normal client
  path that can submit a full board.

**Non-Goals:**

- Do not add new API endpoints.
- Do not change the supported local development principal or Supabase principal
  resolution behavior.
- Do not remove legacy data normalization for older stored card shapes.
- Do not redesign Prisma tables or migrate historical rows.
- Do not remove internal seed/fixture helpers unless they are only kept for the
  removed product routes.

## Decisions

### Remove Complete-Board Routes From Product Routing

The server will stop routing `GET /api/boards/default`, `GET /api/boards/:id`,
and `PUT /api/boards/:id` as authenticated board API behavior. Normal clients
must use `GET /api/board/bootstrap` for board surface reads, card/history
detail endpoints for rich content, and focused resource mutations for writes.

Alternative considered: keep the old routes as read-only compatibility routes.
That keeps two API shapes alive and still invites client code or tests to depend
on complete-board payloads. Removing the route handling gives the codebase one
clear durable API surface.

### Remove Client Full-Board Persistence

The client will remove `fetchDefaultBoard`, `saveBoard`, authenticated
full-board save helpers, `remotePersistence`, and complete-board safety snapshot
logic from normal app behavior. Authenticated state hydration remains owned by
the query hooks and cache update helpers introduced in the resource API work.

Alternative considered: keep full-board helpers but make them unused. That
still makes regressions easy because future code can import the helper without
crossing a clear boundary.

### Keep Migration-Safe Normalization

Shared board/card normalization remains in scope because old persisted rows or
test fixtures can still contain older card shapes. The cleanup removes aggregate
product API behavior, not compatibility with existing structured data.

Alternative considered: delete all full-board repository utilities at once.
That is riskier because some internal setup paths can still need a normalized
initial board while the app keeps its structured Prisma tables.

### Treat Local And Production The Same At The API Shape

Local SQLite mode and production Supabase mode will use the same bootstrap,
detail, history, and mutation routes. The only difference remains how the
principal is resolved.

Alternative considered: allow local-only complete-board routes for development.
That would reintroduce a second architecture in the mode matrix and make local
testing less representative of production behavior.

## Risks / Trade-offs

- Hidden client code still calls a removed helper -> Use `rg` coverage and
  route-level tests to prove no normal flow calls `/api/boards/default` or
  full-board `PUT`.
- Tests lose a convenient complete-board fixture path -> Keep internal fixture
  builders or repository helpers where needed, but do not expose them as product
  HTTP routes.
- A direct request to a removed route changes response shape -> Document the
  routes as unsupported and assert they do not read or write board data.
- Removing safety snapshots could expose missing resource mutation coverage ->
  Verify card, column, tag, board settings, work-cycle, history, completion,
  and clear-board tests still pass through their dedicated routes.

## Migration Plan

1. Remove the legacy server route matching and handlers for complete-board
   reads/writes.
2. Remove client API helpers and storage modules that perform complete-board
   network persistence.
3. Simplify authenticated sync/controller surfaces so they no longer expose
   `persistAuthenticatedBoard` or `loadCompleteBoardState`.
4. Update mocks and tests to use bootstrap/detail/history/resource endpoints and
   to fail if normal flows call the removed routes.
5. Update `RUNNING_MODES.md` and OpenSpec specs so the durable API surface lists
   only currently supported resource routes.
6. Validate with unit tests, server tests, React Doctor, and OpenSpec strict
   validation.

Rollback is a normal git revert of the cleanup PR. Because this change removes
unsupported compatibility code and adds no database migration, rollback does
not require data restoration.

## Open Questions

None.
