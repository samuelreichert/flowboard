## 1. Card Mutation Coordination

- [x] 1.1 Define discriminated operation descriptors for create, update, move,
  delete, tag-assignment, and tag-unassignment mutations with stable operation
  and card identifiers.
- [x] 1.2 Implement a memory-only keyed promise queue that starts one request per
  card at a time, permits different-card concurrency, continues after failure,
  and removes drained queue entries.
- [x] 1.3 Implement pure per-card reconciliation helpers that track confirmed
  summary/detail/placement state and replay pending optimistic operations after
  success or failure.
- [x] 1.4 Add coordinator reset/generation handling so queued work and optimistic
  ledgers do not cross sign-out or authenticated identity changes.

## 2. Mutation Hook Integration

- [x] 2.1 Create one coordinator at the application-controller boundary and
  provide the same instance to the card and board mutation hooks.
- [x] 2.2 Route card create, update, move, and delete transport through the
  per-card queue while retaining their immediate optimistic cache behavior.
- [x] 2.3 Route card tag assignment and unassignment through the same per-card
  queue without serializing unrelated tag-definition or board mutations.
- [x] 2.4 Replace whole-bootstrap card rollback with entity-local reconciliation
  that preserves other cards and reapplies later same-card optimistic work.
- [x] 2.5 Apply card mutation success results through reconciliation, preserve
  submitted optimistic move placement until the existing bootstrap refetch, and
  keep active-card detail state aligned with pending operations.
- [x] 2.6 Merge returned card-mutation board versions monotonically without
  changing any request or response types.

## 3. Concurrency and Reconciliation Tests

- [x] 3.1 Add deterministic coordinator tests proving same-card FIFO execution,
  different-card parallel execution, failure continuation, cleanup, and reset.
- [x] 3.2 Add mutation-hook tests with deferred promises proving update, move,
  delete, create, assign-tag, and unassign-tag operations share the card-ID
  ordering boundary across both hooks.
- [x] 3.3 Add tests proving older successes and failures retain later optimistic
  title, content, priority, tag, and placement operations for the same card.
- [x] 3.4 Add tests proving one card's rollback preserves another card's cache
  changes and reverse-settling different-card responses cannot decrease the
  cached board version.
- [x] 3.5 Add rich-content regression coverage proving an earlier save result or
  failure cannot replace newer local editor content.
- [x] 3.6 Update existing mutation tests to assert entity-local rollback while
  preserving current error presentation and post-move bootstrap revalidation.

## 4. Verification

- [x] 4.1 Run formatting, lint, and TypeScript checks for the changed client
  modules and tests.
- [x] 4.2 Run the focused mutation, cache, card-dialog, and board interaction test
  suites, then run the complete unit test suite.
- [x] 4.3 Confirm no server route, database, dependency, API payload, mutation
  frequency, or compact move-result behavior changed in the final diff.
