## Why

Card writes now use operation-level persistence, but columns, tags, board
settings, and completed-column settings still flow through the legacy full-board
save bridge. That keeps lower-frequency edits coupled to full aggregate writes
and leaves one large bottleneck in normal board editing.

This change moves the remaining non-history board edits to focused resource
mutations so the app can preserve the lean bootstrap/cache architecture and
reserve full-board replacement for legacy cleanup or recovery paths.

## What Changes

- Add resource-oriented API routes for column create, rename, reorder, and
  delete operations.
- Add resource-oriented API routes for tag create, rename, and delete
  operations.
- Add card-tag assign/unassign routes for tag changes made from card surfaces
  without rewriting the full board.
- Add a board settings patch route for currently supported settings, starting
  with board background.
- Add a work-cycle settings patch route for completed-column configuration
  without completing work or reading history.
- Add focused repository operations that update only affected rows, validate
  ownership, and increment board version on successful mutations.
- Add TanStack Query mutations that optimistically update the board bootstrap
  cache and rollback on failure.
- Keep work-cycle completion, completed history reads, and legacy full-board
  cleanup out of scope for the next follow-up changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `authenticated-board-api`: add resource mutation contracts for columns, tags,
  board settings, work-cycle settings, and card tag assignments.
- `structured-board-persistence`: add operation-level persistence contracts for
  non-card board resources and settings.
- `client-server-state-cache`: add TanStack Query mutation/cache behavior for
  columns, tags, board settings, and completed-column settings.
- `column-management`: require column management flows to use column resource
  mutations instead of the legacy full-board save bridge.
- `board-tag-management`: require tag management and card tag assignment flows
  to use tag/card-tag resource mutations instead of full-board saves.
- `completed-work-history`: require completed-column configuration to use a
  focused work-cycle settings mutation while completion/history behavior stays
  unchanged.

## Impact

- Server API routing in `server/routes/authenticatedBoard.ts`.
- Structured repository operations in `server/db/structuredBoardRepository.ts`.
- Client API helpers in `src/storage/authenticatedApi.ts`.
- TanStack Query mutation hooks and cache helpers under `src/app`.
- Board, column, tag manager, card composer/dialog, settings, and work-cycle
  settings wiring currently calling `persistAuthenticatedBoard`.
- Tests for server repository/routes, authenticated API helpers, query
  mutations, and UI flows proving these operations no longer issue legacy
  full-board `PUT` requests.
- `RUNNING_MODES.md`, because the supported persistence matrix changes for
  non-card board edits.
