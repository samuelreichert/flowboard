## Why

Flowboard now has lean read endpoints for the main board bootstrap and active
card details, but the client still loads authenticated board data through the
legacy full-board persistence flow. Moving reads to TanStack Query lets reloads
reuse small cached server-state payloads while keeping rich card content
detail-only.

## What Changes

- Add TanStack Query as the client server-state layer for authenticated reads.
- Add a single app-level `QueryClientProvider` with conservative defaults for
  reload-friendly caching.
- Add centralized query keys and query hooks for profile, main-board bootstrap,
  and active card detail.
- Use `GET /api/board/bootstrap` for the authenticated board surface read model.
- Load rich active-card content from `GET /api/board/cards/:cardId` only when a
  card detail route or dialog is opened.
- Keep existing full-board writes in place for this PR, with explicit safeguards
  so summary-only bootstrap data does not overwrite unhydrated rich card
  content.
- Clear user-owned query cache on sign-out or authenticated user changes.
- Optionally persist only small successful query results: profile, board
  bootstrap, and recently opened active-card detail.

## Capabilities

### New Capabilities

- `client-server-state-cache`: Client-side server-state reads, cache keys,
  optional persistence, and authentication cache isolation for Flowboard data.

### Modified Capabilities

- `structured-board-persistence`: Route-addressed active-card details must be
  hydrated from the card-detail read model when bootstrap only contains active
  card summaries.

## Impact

- Adds TanStack Query dependencies for React query reads and, if implemented in
  this PR, selective cache persistence.
- Affects app provider setup, authenticated profile loading, authenticated board
  bootstrap loading, active card dialog/detail loading, and sign-out cache
  cleanup.
- Does not add new server endpoints beyond those introduced by
  `add-lean-board-bootstrap-api`.
- Does not replace card, column, tag, board settings, work-cycle, or history
  mutations; those remain in later PRs.
