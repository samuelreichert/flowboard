## Context

Flowboard currently has structured Prisma tables for profiles, boards, columns,
cards, tags, card-tag assignments, active work cycles, and completed history.
However, the authenticated board API still exposes the active board primarily as
a full `BoardState` aggregate. Loading a board reconstructs rich card content and
completed history even though the main board surface only renders board
metadata, columns, card titles, priorities, tag chips, and current work-cycle
state.

This change is the first PR in the resource-oriented API migration. It creates a
lean read model for the current single-main-board product shape and leaves
existing full-board writes in place until later PRs introduce focused resource
mutations.

## Goals / Non-Goals

**Goals:**

- Add a main-board bootstrap endpoint that returns only the data needed to paint
  today's active board surface.
- Add an active-card detail endpoint that returns rich card content on demand
  when a card opens.
- Keep local SQLite development and authenticated production requests on the
  same authenticated route behavior.
- Add repository read methods that query structured records directly and return
  lean DTOs instead of reconstructing a full `BoardState` for the new read
  endpoints.
- Add client API wrappers for the new read endpoints.
- Preserve the existing full-board hydration, endpoints, and write path while
  this first PR lands.

**Non-Goals:**

- Do not add TanStack Query or persisted client caching in this PR.
- Do not replace `PUT /api/boards/:id` or change mutation behavior yet.
- Do not switch the active app hydration path to summary-only bootstrap while
  legacy full-board writes are still the normal persistence mechanism.
- Do not add projects, boards-list, or future multi-board endpoints.
- Do not paginate active board cards yet; bootstrap remains the read model for
  today's main board but excludes rich card content and completed history.
- Do not change the Prisma schema unless a test reveals a missing index needed
  by the new read path.

## Decisions

### Use `/api/board/bootstrap` for the current main board

The new endpoint uses a singular `/api/board` prefix because the product
currently supports one main board per resolved principal. This avoids exposing
project and board-list APIs that the UI does not use today.

Alternative considered: add `/api/boards/default/bootstrap`. That preserves the
old plural route shape, but it keeps the new read model coupled to an endpoint
family that this migration is intentionally moving away from.

### Keep bootstrap lean and summary-first

`GET /api/board/bootstrap` returns board metadata, columns, card summaries, tags,
and work-cycle state. Card summaries include `id`, `columnId`, `title`,
`priority`, and `tagIds`; they do not include rich `content`, timestamps, owner
fields, project fields, history, or unused ordering fields.

Response order carries column and card display order. If implementation needs a
temporary position field for UI compatibility, it should be treated as a
compatibility detail and not as the desired public contract.

### Load rich active-card content through card detail

`GET /api/board/cards/:cardId` returns the data needed when the user opens an
active card. This includes rich `content` alongside the card's editable metadata.
It also includes `createdAt` because the current card detail dialog displays the
created date. The server resolves the card through the principal's main board so
another user's card id is treated as missing.

### Preserve current principal resolution

Both new endpoints use the existing principal resolver. Supabase-authenticated
requests resolve through Supabase Auth, and local SQLite development can use the
explicit local development principal. Postgres or production requests without a
valid principal remain rejected.

### Keep legacy endpoints during the read-model migration

Existing `/api/projects`, `/api/boards/default`, `/api/boards/:id`, and
`PUT /api/boards/:id` behavior remains available in this PR. Later PRs can
migrate the client off full-board writes and then remove or quarantine the
legacy aggregate API.

### Keep legacy hydration until writes are resource-oriented

The client can add API wrappers for bootstrap and card detail in this PR, but it
must not replace current full-board hydration yet. If summary-only card data is
stored in the current `BoardState` cache while full-board `PUT` remains active,
normal edits such as moving a card could persist empty rich content. The
hydration switch belongs with TanStack Query/resource mutation work, where rich
card detail is cached separately and full-board writes no longer rewrite cards.

## Risks / Trade-offs

- Bootstrap may still grow if a single active board accumulates many cards.
  Mitigation: this PR removes rich content and history from bootstrap; later PRs
  can split card summaries by column or visible window when the product needs
  it.
- The client may temporarily have two read shapes: full `BoardState` and lean
  bootstrap. Mitigation: isolate new DTOs in the API wrapper and keep the lean
  shape unused by normal persistence until resource mutations replace
  full-board writes.
- Card detail opens now require a network request if the detail is not cached.
  Mitigation: keep the response lean and make the endpoint cache-friendly for
  the upcoming TanStack Query PR.
- Existing route-addressed card behavior may assume content is present at board
  load time. Mitigation: active-card route handling must wait for or request the
  card detail before rendering the dialog.

## Migration Plan

1. Add lean DTO types and repository read methods for main-board bootstrap and
   active-card detail.
2. Add authenticated route handling for `GET /api/board/bootstrap` and
   `GET /api/board/cards/:cardId`.
3. Update the client API wrapper to expose bootstrap and card-detail reads.
4. Keep old full-board hydration, endpoints, and writes available for
   compatibility and
   rollback.

Rollback is straightforward: the client can return to the existing
`/api/boards/default` full-board load while the new endpoints remain unused.

## Open Questions

- Should bootstrap expose board `version` immediately for later optimistic
  mutation work, or should version be introduced with the mutation PRs? The
  preferred answer is to include it now because it is small and useful for cache
  invalidation and future concurrency checks.
