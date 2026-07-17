## Context

Flowboard now has lean authenticated reads and operation-level active-card
mutations. The main board bootstrap contains board metadata, columns, active
card summaries, tags, and active work-cycle settings, while active card rich
content is loaded separately. Card create/update/move/delete already update
focused relational rows and merge results into TanStack Query caches.

The remaining normal edit flows still use the legacy full-board bridge:
creating, renaming, reordering, and deleting columns; creating, renaming, and
deleting tags; assigning tags from card surfaces; changing the board
background; and changing the configured completed column. Those edits are less
frequent than card edits, but they still rewrite a board aggregate and keep the
client dependent on data that bootstrap intentionally omits.

## Goals / Non-Goals

**Goals:**

- Persist column, tag, board background, and completed-column edits through
  resource-oriented API mutations.
- Update only affected structured rows and related join rows.
- Increment board version for every successful persisted mutation.
- Keep ownership validation and local development principal behavior identical
  to existing board/card endpoints.
- Update TanStack Query bootstrap and active-card detail caches
  optimistically, with rollback on mutation failure.
- Remove legacy full-board `PUT` usage from normal column, tag, background, and
  completed-column setting flows.

**Non-Goals:**

- Do not implement work-cycle completion or completed history read endpoints.
- Do not remove `PUT /api/boards/:id`; it remains until the final legacy
  cleanup slice.
- Do not introduce projects, multi-board management, or new board settings not
  used today.
- Do not change card create/update/move/delete endpoint contracts from the
  previous slice.

## Decisions

### Use explicit resource routes instead of a generic board patch endpoint

Add focused routes for the currently supported edit operations:

- `POST /api/board/columns`
- `PATCH /api/board/columns/:columnId`
- `PATCH /api/board/columns/:columnId/move`
- `DELETE /api/board/columns/:columnId`
- `POST /api/board/tags`
- `PATCH /api/board/tags/:tagId`
- `DELETE /api/board/tags/:tagId`
- `PUT /api/board/cards/:cardId/tags/:tagId`
- `DELETE /api/board/cards/:cardId/tags/:tagId`
- `PATCH /api/board/settings`
- `PATCH /api/board/work-cycle/settings`

Rationale: the route shape stays predictable and mirrors domain operations.
Validation can remain narrow, and each route returns exactly the data needed by
the bootstrap cache.

Alternative considered: a single `PATCH /api/board` endpoint accepting partial
patch documents. That would be smaller on paper but easier to turn into another
aggregate mutation path, and it would make ownership and conflict behavior more
implicit.

### Return lean mutation results with board version

Each mutation returns the changed resource, any affected active card summaries,
and the updated board version. Delete responses return deleted identifiers plus
the minimal affected data needed to update caches.

Rationale: the client should not refetch the whole board after every
low-frequency edit unless a relationship makes local patching error-prone. Tag
delete and column delete are the two wider operations; they can return affected
card summaries or trigger exact bootstrap invalidation when simpler.

Alternative considered: always invalidate bootstrap after every non-card edit.
That is simpler, but it makes the app feel less immediate and gives up the
benefit of small mutation responses for straightforward edits like rename or
background changes.

### Keep tag assignment as card-tag resource mutations

Tag assignment from card composer/dialog should use `PUT` and `DELETE` on
`/api/board/cards/:cardId/tags/:tagId` when operating on an existing persisted
card. New unsaved card drafts still submit their initial tag IDs through the
card create endpoint.

Rationale: assigning a tag is neither a tag rename nor a full card field update.
Keeping it as a join-resource operation allows the server to update only the
card-tag row and return the affected card summary/detail metadata.

Alternative considered: keep tag assignment inside `PATCH /api/board/cards/:id`
with `tagIds`. That endpoint already supports full tag replacement and remains
useful for bulk saves from the card dialog, but explicit assign/unassign routes
are safer for small UI interactions and avoid replacing an entire tag set when
one chip changes.

### Preserve completed-column configuration but defer completion/history

`PATCH /api/board/work-cycle/settings` updates `activeWorkCycle.completedColumnId`
only. Completing work stays on the legacy bridge until the dedicated work-cycle
completion and history split.

Rationale: completed-column configuration is a normal setting shown in board
settings and can be persisted independently. Completing work is a domain command
that archives snapshots, clears active cards, and starts a new cycle; it deserves
its own focused proposal.

Alternative considered: include `POST /api/board/work-cycle/complete` here.
That would make the slice too broad and mix a low-frequency setting mutation
with history archival behavior.

### Centralize cache patch helpers for bootstrap-shaped data

Create shared client helpers for applying column, tag, settings, and work-cycle
mutation results to the bootstrap query cache. Active-card detail caches are
updated only when tag assignment changes an opened card's tag IDs.

Rationale: bootstrap is now the board surface read model. One set of helpers
keeps ordering, tag removal, and board version updates consistent across hooks
and tests.

Alternative considered: duplicate optimistic updates inside each component. That
would make regressions easy, especially for tag deletion affecting multiple card
summaries and for column deletion affecting card removal.

## Risks / Trade-offs

- [Risk] Column delete can remove many active cards and their tag assignments. →
  Mitigation: implement it as one transaction, return deleted column/card IDs,
  remove affected detail caches, and cover archived snapshot preservation in
  repository tests.
- [Risk] Tag delete affects every active card that used the tag. → Mitigation:
  update card-tag rows in one transaction, return affected card IDs/summaries or
  invalidate exact bootstrap, and test active/history tag behavior separately.
- [Risk] Optimistic ordering can diverge from server ordering on failed or
  concurrent column moves. → Mitigation: rollback previous bootstrap snapshot on
  error and merge server-returned ordered columns on success.
- [Risk] Existing legacy save helpers can still be called accidentally. →
  Mitigation: add focused UI/API tests asserting normal column, tag,
  background, and completed-column changes do not call `/api/boards/:id` `PUT`.
- [Risk] The malformed legacy `completed-work-history` main spec can make full
  spec validation noisy. → Mitigation: keep the delta spec valid and document
  that the pre-existing main spec formatting issue is separate unless this PR
  chooses to normalize that file as a small documentation fix.
