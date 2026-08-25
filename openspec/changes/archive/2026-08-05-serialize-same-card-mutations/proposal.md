## Why

Mutations targeting one card currently run concurrently, so an older success or
rollback can overwrite newer optimistic client state. Ordering these mutations
per card prevents lost edits without serializing unrelated cards or changing the
authenticated API contract.

## What Changes

- Give card create, update, move, delete, tag-assignment, and tag-unassignment
  operations one shared serial execution boundary keyed by card ID.
- Keep mutations for different cards concurrent.
- Reconcile success and failure against newer pending optimistic operations so
  an older result cannot replace a later local edit.
- Limit rollback to the affected card and preserve unrelated card changes and
  monotonically newer board versions.
- Add concurrency-focused tests covering same-card ordering, different-card
  parallelism, success reconciliation, and rollback reconciliation.
- Keep existing request and response shapes unchanged.
- Explicitly exclude save-frequency reduction or debouncing, server-side
  conflict detection, revisions, cross-device reconciliation, move-response
  projection changes, and removal of the post-move bootstrap refetch.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `client-server-state-cache`: Require per-card mutation serialization,
  entity-local optimistic reconciliation, and monotonic result application.
- `card-content-rich-editing`: Require newer local card content to remain
  authoritative in the editor while older saves for the same card settle.

## Impact

- Affects the TanStack Query mutation hooks and cache helpers under `src/app`,
  including the split ownership of card mutations and card-tag mutations.
- Affects mutation-hook and cache-reconciliation tests.
- Does not change server routes, database behavior, API payloads, dependencies,
  or mutation frequency.
