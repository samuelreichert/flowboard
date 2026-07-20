## Why

Clear board is the last normal board action still coupled to the legacy
full-board save bridge. Moving it to a focused resource command removes another
whole-board write path and keeps the migration on track for final legacy
endpoint removal.

## What Changes

- Add an authenticated clear-board command endpoint that clears the resolved
  principal's active board columns, active cards, and active card-tag
  assignments without accepting or saving a full board aggregate.
- Normalize the active work-cycle completed-column setting when the active
  columns are cleared, while preserving board background, board tags, completed
  history, and other unrelated user data.
- Add a structured repository operation that performs the clear in one
  ownership-scoped transaction and increments board version only when the clear
  succeeds.
- Add a TanStack Query mutation for clear board that updates the bootstrap
  cache and active-card detail caches without submitting `/api/boards/:id`.
- Preserve the existing sidebar clear-board confirmation and visible empty-board
  behavior.
- Keep deletion of legacy full-board endpoints out of scope for the final
  cleanup slice.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `authenticated-board-api`: add a clear-board command endpoint with a lean
  scoped response.
- `structured-board-persistence`: add operation-level active-board clear
  semantics for relational rows.
- `client-server-state-cache`: add TanStack Query mutation behavior for clear
  board.
- `board-actions-menu`: require confirmed clear-board actions to persist
  through the focused command while preserving the existing confirmation gate.

## Impact

- Server API routing in `server/routes/authenticatedBoard.ts`.
- Structured repository operations in `server/db/structuredBoardRepository.ts`.
- Client API helpers in `src/storage/authenticatedApi.ts`.
- Query keys, mutation hooks, and cache helpers under `src/app`.
- Clear-board flow in `src/app/useBoardActions.ts` and surrounding app tests.
- Tests for route contracts, repository transaction behavior, query mutation
  cache updates/rollback, and no legacy full-board `PUT` during clear board.
- `RUNNING_MODES.md`, because clear board will no longer be listed as a
  temporary legacy bridge user.
