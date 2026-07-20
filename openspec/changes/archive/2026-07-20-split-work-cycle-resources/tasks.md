## 1. Server Contracts And Routing

- [x] 1.1 Define request and response DTO types for work-cycle completion, completed-history summary pages, and archived-card detail.
- [x] 1.2 Define validation helpers for history pagination limit/cursor values and archived route identifiers.
- [x] 1.3 Add route matching for `POST /api/board/work-cycle/complete`.
- [x] 1.4 Add route matching for `GET /api/board/work-cycles/history`.
- [x] 1.5 Add route matching for `GET /api/board/work-cycles/:cycleId/cards/:cardId`.
- [x] 1.6 Reject malformed completion/history requests with existing board API error helpers and unauthenticated production requests with existing auth behavior.

## 2. Repository Completion Operation

- [x] 2.1 Add shared helpers to load the resolved principal's main board, active work-cycle, completed column, active cards, active card tags, and board tags for completion.
- [x] 2.2 Implement `completeActiveWorkCycle` as one transaction that inserts a completed cycle, archived cards, and archived tag snapshots.
- [x] 2.3 Delete only archived active cards and their active card-tag rows during completion.
- [x] 2.4 Advance the active work-cycle start date and preserve the completed-column setting during completion.
- [x] 2.5 Increment board version in the same transaction as successful completion.
- [x] 2.6 Reject completion without a configured completed column or without active cards in that column without mutating persisted rows.
- [x] 2.7 Return lean completion results containing deleted active card identifiers, updated active work-cycle state, archived cycle summary, and board version.

## 3. Repository History Reads

- [x] 3.1 Implement completed-history summary reads scoped to the resolved principal's main board.
- [x] 3.2 Order history summaries newest-first with a deterministic stable tie-breaker.
- [x] 3.3 Add bounded limit and cursor pagination for history summary reads.
- [x] 3.4 Exclude archived rich content from history summary read results while returning content availability.
- [x] 3.5 Implement archived-card detail reads scoped to the resolved principal's main board history.
- [x] 3.6 Return not-found behavior for missing or cross-owner completed cycle/card identifiers without revealing other users' data.

## 4. Server Tests

- [x] 4.1 Add repository tests proving completion archives active cards, card metadata, rich content, and tag snapshots.
- [x] 4.2 Add repository tests proving completion deletes only affected active cards/card-tags and preserves unrelated active board data/history.
- [x] 4.3 Add repository tests proving completion advances the active work cycle and increments board version only on success.
- [x] 4.4 Add repository tests for rejection when completed column is unset, missing, or empty.
- [x] 4.5 Add repository tests for paged history summaries excluding rich content and returning deterministic cursors.
- [x] 4.6 Add repository tests for archived-card detail success, missing, and owner-scoped behavior.
- [x] 4.7 Add route tests for authenticated and local success responses for completion, history summaries, and archived-card detail.
- [x] 4.8 Add route tests for unauthenticated rejection, invalid pagination, missing resources, and completion validation failures.

## 5. Client API And Query Hooks

- [x] 5.1 Add client API functions for work-cycle completion, completed-history summaries, and archived-card detail in `src/storage/authenticatedApi.ts`.
- [x] 5.2 Add stable query keys for completed-history pages and archived-card detail.
- [x] 5.3 Add TanStack Query history summary hook with bounded pagination support.
- [x] 5.4 Add TanStack Query archived-card detail hook keyed by cycle and card identifiers.
- [x] 5.5 Add TanStack Query completion mutation with optimistic bootstrap/history cache updates and rollback.
- [x] 5.6 Extend shared cache helpers for removing completed-column active card summaries and merging archived cycle summaries.
- [x] 5.7 Merge server-returned completion resources and board version into caches on success and invalidate only exact affected queries when needed.

## 6. UI Integration

- [x] 6.1 Replace History view's `loadCompleteBoardState` trigger with completed-history summary query loading.
- [x] 6.2 Pass history query state into History view so loading, empty, and missing-route states remain recoverable.
- [x] 6.3 Update History card rendering to use summary fields and content availability instead of embedded rich content.
- [x] 6.4 Load archived-card detail when opening an archived card dialog or direct archived-card route.
- [x] 6.5 Route `Complete work` confirmation through the completion mutation instead of `persistAuthenticatedBoard`.
- [x] 6.6 Preserve existing completion confirmation, disabled empty-column behavior, completion pulse, and persistence error messaging.
- [x] 6.7 Keep clear-board behavior on the temporary legacy bridge for the final cleanup slice.
- [x] 6.8 Remove normal completion/history dependence on `/api/boards/default` and `/api/boards/:id`.

## 7. Client And Integration Tests

- [x] 7.1 Update app test fetch mocks to handle completion, history summary, and archived-card detail endpoints.
- [x] 7.2 Add client API tests for completion/history URLs, payloads, auth headers, pagination, detail reads, and error handling.
- [x] 7.3 Add query/mutation hook tests for history loading, archived-card detail loading, completion optimistic updates, rollback, and success merge behavior.
- [x] 7.4 Update completion UI tests to assert work completion no longer calls legacy full-board `PUT`.
- [x] 7.5 Update History view tests to assert opening History no longer calls `/api/boards/default`.
- [x] 7.6 Update archived-card route tests to assert direct routes load history/detail resources and preserve missing-state behavior.
- [x] 7.7 Add regression coverage proving active board bootstrap remains lean and active card detail behavior remains unchanged.

## 8. Documentation And Validation

- [x] 8.1 Update `RUNNING_MODES.md` to describe completion/history resource endpoints while clear-board/legacy cleanup remains future work.
- [x] 8.2 Run focused server tests for authenticated board routes and structured board repository.
- [x] 8.3 Run focused client tests for authenticated API, query hooks, completion flow, History view, archived-card routes, and app routes.
- [x] 8.4 Run `npm run typecheck`.
- [x] 8.5 Run `rtk npx react-doctor@latest --verbose --scope changed` before PR.
- [x] 8.6 Run `openspec validate split-work-cycle-resources --strict`.
