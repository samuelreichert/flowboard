## Context

Flowboard now has lean board reads:

- `GET /api/board/bootstrap` renders the active board surface without rich card
  content or history.
- `GET /api/board/cards/:cardId` hydrates rich content on demand.
- TanStack Query owns profile, bootstrap, and card-detail server-state reads.

The remaining scalability problem for active card work is the write path. Normal
card creation, editing, movement, and deletion still flow through
`persistAuthenticatedBoard`, which eventually calls the legacy full-board
`PUT /api/boards/:id`. That path has to merge a complete snapshot before saving
and then `writeBoardState` deletes and recreates broad child rows. Card
operations should instead touch the card, card-tag rows, board version, and
only the ordering rows that are actually affected.

## Goals / Non-Goals

**Goals:**

- Add focused active-card mutation endpoints for create, update, move, and
  delete.
- Scope every card mutation to the resolved principal's main board in both
  Supabase and local SQLite modes.
- Keep the response shape lean enough for TanStack Query cache updates.
- Wire normal card composer, card dialog edits, drag/drop moves, and delete
  actions to card mutations instead of full-board save.
- Preserve existing UI behavior and local optimistic feel.
- Leave the legacy full-board save bridge in place for columns, tags, board
  settings, work-cycle completion, and history until later PRs migrate them.

**Non-Goals:**

- Do not migrate column, tag, board settings, or work-cycle mutations in this
  PR.
- Do not add multi-project or multi-board behavior.
- Do not remove `PUT /api/boards/:id` or the complete-board snapshot bridge yet.
- Do not add new database tables unless implementation proves a small index is
  missing for card ordering or ownership checks.
- Do not introduce React Router loaders/actions or Remix-style data APIs.

## Decisions

### Use main-board scoped card routes

Routes:

```text
POST   /api/board/cards
PATCH  /api/board/cards/:cardId
PATCH  /api/board/cards/:cardId/move
DELETE /api/board/cards/:cardId
```

The server resolves the authenticated or local development principal, ensures
the principal's main board exists, and performs every card lookup through that
board. The client never sends owner ids or board ids for these card operations.

Alternative considered: `POST /api/boards/:boardId/cards`. That is more general,
but Flowboard today has one main board and the target architecture intentionally
avoids unused multi-board surface area.

### Keep create idempotent with client-generated UUIDs

The client may send a generated card id on create, matching today's
`crypto.randomUUID()` behavior. The server validates that the target column and
tags belong to the resolved board and rejects duplicate ids outside a safe
retry/idempotency case.

This keeps optimistic cache updates simple because the UI can render the new
card under its final id immediately. Ownership still comes only from the server
principal and board relationships.

Alternative considered: server-only ids with temporary client ids. That is
cleaner in isolation, but adds reconciliation logic throughout active card
routing, card detail cache, and drag/drop immediately after create.

### Separate content edits from movement

`PATCH /api/board/cards/:cardId` updates editable card fields:

```json
{
  "title": "Design API",
  "content": "...rich content...",
  "priority": "medium",
  "tagIds": ["tag_1"]
}
```

`PATCH /api/board/cards/:cardId/move` updates placement:

```json
{
  "columnId": "column_2",
  "beforeCardId": "card_before",
  "afterCardId": null
}
```

The Card Dialog can call the update mutation for title/content/priority/tags
and the move mutation when the selected column changes. Drag/drop maps its
current target card and edge into `beforeCardId` or `afterCardId`.

Alternative considered: one broad card patch that also accepts `columnId` and
sort information. Separating movement keeps validation, ordering, and cache
updates easier to reason about.

### Return lean mutation results

Create, update, and move return the changed card summary/detail fields plus
`boardVersion`:

```json
{
  "boardVersion": 43,
  "card": {
    "id": "card_1",
    "columnId": "column_1",
    "title": "Design API",
    "content": "...",
    "createdAt": "2026-07-17T10:00:00.000Z",
    "priority": "medium",
    "tagIds": ["tag_1"]
  }
}
```

Delete returns the deleted card id, previous column id, and `boardVersion`.
The bootstrap cache uses card summary fields; the card detail cache uses rich
fields.

Alternative considered: returning a full bootstrap after every mutation. That
is simpler on the client but recreates the broad-response pattern this
migration is removing.

### Use focused Prisma transactions

Repository functions should be shaped around card operations:

- `createActiveCard`
- `updateActiveCard`
- `moveActiveCard`
- `deleteActiveCard`

Each function validates board, column, card, and tag ownership through
server-side relationships. Each successful mutation increments `board.version`
in the same transaction as the card change.

For ordering, this PR can keep the current integer `sortOrder` model and
renumber only the affected source/destination columns. That is still much
smaller than rewriting every column, tag, card, work cycle, and history row.
Fractional ranking can be a later optimization if card volume inside one column
becomes the measured bottleneck.

Alternative considered: implement fractional ranks immediately. It would reduce
move writes further, but it is a data-model change that can be deferred until
after resource mutations prove the route/service shape.

### Put mutations beside existing query hooks

Add card mutation wrappers near `useFlowboardQueries.ts` or split a sibling
module if the file becomes noisy. Mutations should:

- cancel affected bootstrap/card-detail queries in `onMutate`
- snapshot previous cache
- optimistically update `['board', 'bootstrap']`
- optimistically update `['board', 'cards', cardId]` when rich detail is known
- rollback on error
- merge the server response and board version on success
- invalidate exact affected queries only when the local optimistic result may
  differ from server ordering

The existing pure board command helpers can be reused for optimistic column
transforms, but they must not imply full-board persistence.

## Risks / Trade-offs

- Card dialog autosave may issue frequent `PATCH` requests while typing rich
  content -> Preserve existing debounce/autosave behavior and send only card
  resource payloads, not full boards.
- Create with client ids can conflict if a retry reuses an id after partial
  success -> Treat same-id create for the same board as idempotent only when the
  payload targets the same card shape; otherwise reject.
- Moving with integer sort order still updates multiple cards in a large column
  -> Limit writes to affected columns now and leave fractional ranking for a
  measured follow-up.
- Optimistic cache updates can drift from server order -> Merge returned card
  fields on success and invalidate bootstrap when server placement differs or a
  mutation response cannot fully reconcile the cache.
- Legacy full-board saves still exist for non-card operations -> Keep the PR
  boundary explicit and update `RUNNING_MODES.md` so reviewers know the bridge
  remains temporary.
