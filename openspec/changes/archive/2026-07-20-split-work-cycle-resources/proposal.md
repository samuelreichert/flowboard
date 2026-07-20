## Why

Completion and history are now the last normal board workflows still coupled to
the legacy full-board save/load bridge. Splitting them into work-cycle resource
commands and history read models removes the largest remaining aggregate path
from everyday use and keeps bootstrap lean as history grows.

## What Changes

- Add a focused work-cycle completion command endpoint that archives the
  configured completed column, clears those active cards, starts the next active
  cycle, increments board version, and returns only the changed active-board and
  history summary data.
- Add authenticated history read endpoints that load completed work-cycle
  summaries with bounded pagination/windowing instead of loading a full board
  snapshot.
- Add an archived-card detail endpoint so rich archived content loads only when
  a user opens a completed card.
- Add repository operations that insert completed-cycle rows, archived-card
  snapshots, archived tag snapshots, and active-card cleanup in one transaction
  without rewriting unrelated board data.
- Add TanStack Query hooks/cache keys for completion, history summaries, and
  archived-card detail.
- Route the board `Complete work`, History view, and direct archived-card routes
  through the new work-cycle resources instead of `/api/boards/default` or
  `/api/boards/:id`.
- Keep legacy clear-board/full-board cleanup out of scope for the final slice.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `authenticated-board-api`: add work-cycle completion and completed-history
  read endpoints with scoped, lean responses.
- `structured-board-persistence`: add operation-level completed-work archival
  and history read-model contracts.
- `client-server-state-cache`: add TanStack Query behavior for completion,
  paged history summaries, and archived-card detail.
- `completed-work-history`: require completion/history workflows to use focused
  resource commands and history reads while preserving visible History behavior.

## Impact

- Server API routing in `server/routes/authenticatedBoard.ts`.
- Structured repository operations in `server/db/structuredBoardRepository.ts`.
- Client API helpers in `src/storage/authenticatedApi.ts`.
- Query keys, hooks, and cache helpers under `src/app`.
- Completion flow in `src/app/useBoardActions.ts` and history loading in
  `src/App.tsx`, `src/app/useAuthenticatedBoardSync.ts`, and
  `src/components/HistoryView`.
- Tests for repository archival, route contracts, client API methods, query
  hooks, completion UI behavior, History view, archived-card routes, and no
  legacy full-board `PUT`/default-board reads during completion/history flows.
- `RUNNING_MODES.md`, because completion/history will no longer be listed as
  temporary legacy bridge users.
