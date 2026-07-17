## Why

Flowboard's current board API still returns and saves a full board aggregate,
including rich card content and completed history, even when the active board UI
only needs lightweight card summaries. This makes the first step of the
resource-oriented API migration harder and keeps page load tied to data the
screen does not render.

## What Changes

- Add a lean main-board bootstrap read endpoint for today's single-board app
  shape.
- Add an active-card detail read endpoint so rich card content loads only when a
  card is opened.
- Return only UI-used fields from the new read responses.
- Keep existing full-board routes and write behavior temporarily for
  compatibility; this change does not remove or replace mutation paths yet.
- Add focused Prisma-backed read methods for bootstrap and card detail data,
  without using full `BoardState` reconstruction for these new reads.
- Add client API wrappers for the new read endpoints, but keep existing
  full-board hydration active until later PRs remove full-board writes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `authenticated-board-api`: introduce the lean main-board bootstrap and card
  detail read contracts while preserving authenticated/local principal access
  rules.
- `structured-board-persistence`: require structured read methods to support a
  summary-first active board load while preserving rich card content for detail
  reads.

## Impact

- Affected API routes: new `GET /api/board/bootstrap` and
  `GET /api/board/cards/:cardId`.
- Affected server modules: route registration, authenticated board route
  handling, structured board repository read methods, and response DTOs.
- Affected client modules: authenticated API wrapper. The active board
  hydration path remains on the legacy full-board response in this PR to avoid
  summary-only data being written back through the full-board save path.
- Affected tests: board API route tests, structured repository tests, and client
  hydration tests around rich card content loading.
- No new runtime dependency is required in this PR.
