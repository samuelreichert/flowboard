## Context

Flowboard currently owns card create, update, move, and delete mutations in
`useFlowboardCardMutations`, while card-tag assignment mutations live in
`useFlowboardBoardMutations`. A single card-dialog save can submit an update,
multiple tag changes, and a move without waiting for earlier requests.

Each mutation optimistically updates the shared bootstrap and card-detail query
caches. Success handlers then merge a server result, and failure handlers restore
snapshots. Because these lifecycles are independent, an older result can replace
newer optimistic state. Whole-bootstrap rollback can also erase concurrent work
for a different card.

The change must stand alone from content-save coalescing and compact move
responses. It must preserve the existing API payloads and the current post-move
bootstrap revalidation.

## Goals / Non-Goals

**Goals:**

- Run at most one network mutation at a time for each card ID across all
  card-targeting mutation types.
- Allow mutations for different card IDs to remain concurrent.
- Keep optimistic UI updates immediate while preventing settled operations from
  replacing later pending edits.
- Roll back only the affected card state and preserve unrelated cache changes.
- Keep cached board versions monotonic when different-card responses settle in
  a different order from their server commits.
- Keep the coordinator memory-only and scoped to the active application/query
  client lifecycle.

**Non-Goals:**

- Debouncing or otherwise reducing content-save frequency.
- Changing request or response payloads, including the move response.
- Removing the post-move bootstrap refetch.
- Adding server revisions, optimistic concurrency, conflict UI, or cross-device
  reconciliation.
- Serializing board-wide, column, tag-definition, work-cycle, or clear-board
  operations behind one global queue.
- Fixing drag-and-drop placement authoritatively; compact authoritative move
  results remain owned by `return-compact-card-move-results`.

## Decisions

### Use one shared, session-scoped card mutation coordinator

Create the coordinator once at the application-controller boundary and provide
the same instance to both mutation hooks. This preserves the current public hook
split while giving create, update, move, delete, assign-tag, and unassign-tag
operations one ordering authority.

The coordinator is keyed by card ID rather than mutation type. Creating a card
and immediately updating it therefore uses the same queue as two successive
updates. Card-tag mutations participate even though they are currently declared
in the board mutation hook.

Alternative considered: assign a TanStack Query mutation `scope`. A scope is
fixed in hook options, but these hooks accept arbitrary card IDs per mutation
call. One scope per hook would either fail to coordinate across hooks or
serialize every card. Mutation scopes also pause transport after `onMutate`, so
scope alone would not reconcile overlapping optimistic layers.

Alternative considered: consolidate every card-targeting operation into one
large mutation hook. That can work, but moving unrelated public methods and
tests is unnecessary to establish the shared ordering boundary.

### Serialize transport per card without delaying optimistic state

Every submission receives an operation ID and records its card ID before it is
passed to the existing TanStack mutation. `onMutate` continues to update the
cache immediately. The mutation function runs its existing API call through a
promise tail stored for that card ID.

A tail waits for the previous same-card request to settle, regardless of success
or failure, before starting the next request. The tail is removed when it is
still the last registered operation for that card. A rejected request is
converted into a settled queue tail so it cannot poison subsequent work; the
original mutation promise still rejects so the existing error path runs.

Different card IDs have different tails and therefore remain parallel.

Alternative considered: delay the entire mutation, including `onMutate`, until
the previous request completes. That simplifies rollback but allows older cache
state to be synchronized back into the application while a newer local edit is
waiting, making the UI appear to regress.

### Reconcile each card from confirmed state plus pending operations

For each active card queue, retain a small reconciliation record containing the
last confirmed card summary/detail/placement and the ordered pending optimistic
operation descriptors. The record is initialized from the query cache when the
first operation for that card is submitted.

On submission, append the operation and apply its optimistic transform. On
success, advance the confirmed state with authoritative fields from the server
result, remove the completed operation, and reapply all later pending transforms
in submission order. On failure, keep the confirmed state, remove the failed
operation, and perform the same replay. This makes both success and rollback
produce:

`visible card = latest confirmed card + remaining optimistic operations`

Reconciliation writes only the affected card summary, detail, and placement
into the current cache. It must not replace an earlier whole-bootstrap snapshot,
so changes to other cards remain intact.

Move responses do not currently contain authoritative before/after placement.
Until the compact move-result change lands, reconciliation preserves the
submitted optimistic placement and retains the existing exact bootstrap
refetch. It must not infer that a response containing only `columnId` means the
card belongs at the bottom.

Alternative considered: skip any success or rollback when a newer operation is
pending. This fails when multiple queued operations fail because a later
rollback snapshot can still contain optimistic state from an earlier failed
operation.

### Apply board versions monotonically

All card mutation result helpers merge `boardVersion` as the maximum of the
cached and returned versions. This is required even though different cards stay
parallel: a slower response may carry a lower version than a response already
applied for another card.

Optimistic updates and failures do not decrement the cached board version.

### Keep broad resource mutations outside the coordinator

Only operations with one primary `cardId` participate. Deleting a tag or column,
completing a work cycle, and clearing the board can affect many cards but do not
have a single card-owned serial scope. Coordinating those commands would turn
this into global mutation serialization and is outside this change.

### Reset ephemeral coordination state at identity boundaries

The coordinator is not persisted. Its pending ledger is cleared alongside the
user-owned query cache on sign-out or authenticated identity change, and queued
work must not be replayed with a later principal's credentials. An already
started request retains the existing request lifecycle; queued requests that
have not started are prevented from crossing the reset generation.

## Risks / Trade-offs

- [Risk] Replaying operation descriptors is more complex than snapshot rollback.
  → Mitigation: implement reconciliation as pure helpers and test mixed success,
  failure, and operation-type sequences with deferred promises.
- [Risk] Move responses cannot confirm an exact placement with the current API.
  → Mitigation: retain optimistic placement and the existing bootstrap refetch;
  authoritative compact placement remains a separate roadmap change.
- [Risk] Board-wide mutations can still overlap with card-specific mutations.
  → Mitigation: document this boundary and do not claim global transaction
  ordering; those operations retain their existing behavior.
- [Risk] Queue state could leak after completion or identity changes.
  → Mitigation: remove drained per-card records and explicitly reset the
  coordinator with query-cache identity cleanup.
- [Trade-off] A rapid burst still creates the same number of API requests.
  Serialization fixes ordering only; save coalescing is intentionally separate.

## Migration Plan

1. Add the coordinator and pure operation-replay/cache helpers behind the
   existing mutation APIs.
2. Share one coordinator across the card and board mutation hooks.
3. Move card mutation success and failure application to entity-local
   reconciliation and monotonic version helpers.
4. Add deterministic hook tests using deferred request promises.
5. Run the existing unit, type, and UI regression suites.

No database or API migration is required. Rollback consists of restoring the
previous independent mutation lifecycles and cache handlers.

## Open Questions

None. Authoritative move placement and removal of the move-triggered bootstrap
refetch remain explicitly deferred to `return-compact-card-move-results`.
