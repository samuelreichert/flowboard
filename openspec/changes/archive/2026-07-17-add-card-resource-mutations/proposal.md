## Why

Flowboard still saves normal card edits through the legacy full-board `PUT`
path, which rewrites far more data than a card create, edit, move, or delete
should touch. Now that lean bootstrap reads and TanStack Query reads are in
place, card mutations are the highest-value next step toward operation-level
persistence.

## What Changes

- Add resource-oriented card mutation endpoints for today's active board:
  - `POST /api/board/cards`
  - `PATCH /api/board/cards/:cardId`
  - `PATCH /api/board/cards/:cardId/move`
  - `DELETE /api/board/cards/:cardId`
- Persist card mutations through focused Prisma operations scoped to the
  resolved principal's main board instead of `writeBoardState`.
- Return lean changed-card data plus board version so the client can update the
  bootstrap and card-detail query caches.
- Add TanStack Query mutations for card create, update, move, and delete with
  optimistic updates for `['board', 'bootstrap']` and active card detail cache.
- Route normal card composer, card dialog edits, drag/drop moves, and card
  delete through the new card mutation path.
- Keep legacy full-board save behavior for non-card operations until later PRs
  migrate columns, tags, board settings, work-cycle completion, and history.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `authenticated-board-api`: add authenticated card create, patch, move, and
  delete endpoints with owner-scoped validation and lean response contracts.
- `structured-board-persistence`: persist card operations directly against
  card and card-tag rows without rewriting unrelated board data.
- `client-server-state-cache`: add TanStack Query mutation behavior for card
  operations, including optimistic bootstrap/detail cache updates and rollback.

## Impact

- Server route handling in `server/routes/authenticatedBoard.ts`.
- Structured board repository code in `server/db/structuredBoardRepository.ts`
  plus focused tests for card mutation ownership, validation, ordering, and tag
  assignment behavior.
- Client API wrappers in `src/storage/authenticatedApi.ts`.
- Query/mutation hooks around `src/app/useFlowboardQueries.ts`,
  `src/app/queryKeys.ts`, and board action wiring.
- Card composer, card dialog autosave, drag/drop movement, and card delete
  flows currently funneled through `persistAuthenticatedBoard`.
- `RUNNING_MODES.md` persistence matrix, because authenticated card saves will
  no longer bridge through `/api/boards/:id`.
