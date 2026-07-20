## 1. Server Contract And Routing

- [x] 1.1 Define clear-board response DTO types containing empty columns, deleted active card identifiers, normalized active work-cycle state, and board version.
- [x] 1.2 Add route matching for `POST /api/board/clear` in the authenticated board API.
- [x] 1.3 Reject unauthenticated production clear-board requests through existing principal resolution behavior.
- [x] 1.4 Ignore or reject client-supplied board aggregate fields in clear-board requests so ownership and board target come only from the resolved principal.

## 2. Repository Clear Operation

- [x] 2.1 Add a structured repository operation that loads the resolved principal's main board and active card identifiers.
- [x] 2.2 Delete active card-tag assignments, active cards, and active columns for the main board in one transaction.
- [x] 2.3 Clear the active work-cycle completed-column setting during the same transaction.
- [x] 2.4 Preserve board tags, board background, completed history, archived snapshots, project, owner, and profile rows.
- [x] 2.5 Increment board version on successful clear and return the normalized empty active-board result.
- [x] 2.6 Keep clearing an already empty active board idempotent without recreating default columns or deleting unrelated data.

## 3. Server Tests

- [x] 3.1 Add repository tests proving clear board deletes active columns, active cards, and active card-tag assignments.
- [x] 3.2 Add repository tests proving clear board preserves board tags, background, completed history, archived snapshots, project, owner, and profile rows.
- [x] 3.3 Add repository tests proving clear board clears the completed-column setting and increments board version on success.
- [x] 3.4 Add repository tests proving empty-board clears are successful and do not create default columns.
- [x] 3.5 Add route tests for authenticated and local development clear-board success responses.
- [x] 3.6 Add route tests for unauthenticated rejection and client-supplied aggregate/body data handling.

## 4. Client API And Query Mutation

- [x] 4.1 Add a client API helper for `POST /api/board/clear`.
- [x] 4.2 Add a TanStack Query clear-board mutation hook.
- [x] 4.3 Add cache helpers that snapshot bootstrap and affected active-card detail caches for rollback.
- [x] 4.4 On optimistic clear, set bootstrap columns to `[]`, normalize active work-cycle state, and remove affected active-card detail caches.
- [x] 4.5 On success, merge server-returned active work-cycle state and board version into bootstrap cache and invalidate only exact affected queries when needed.
- [x] 4.6 On failure, restore previous bootstrap/detail cache snapshots and expose the existing persistence error state.

## 5. UI Integration

- [x] 5.1 Rewire confirmed clear-board flow to call the clear-board mutation instead of `persistAuthenticatedBoard`.
- [x] 5.2 Preserve the existing sidebar confirmation dialog and cancel behavior.
- [x] 5.3 Preserve visible empty-board behavior after clear while keeping tags, background, and completed history available.
- [x] 5.4 Remove normal clear-board dependence on legacy `/api/boards/:id` writes.

## 6. Client And Integration Tests

- [x] 6.1 Add client API tests for clear-board URL, method, auth headers, response parsing, and error handling.
- [x] 6.2 Add query mutation tests for optimistic empty-board updates, success merge, active-card detail cache cleanup, and rollback.
- [x] 6.3 Update app fetch mocks to handle `POST /api/board/clear`.
- [x] 6.4 Add or update UI tests proving confirming clear board does not call legacy full-board `PUT`.
- [x] 6.5 Add regression coverage proving cancelling clear board does not submit the clear-board command.

## 7. Documentation And Validation

- [x] 7.1 Update `RUNNING_MODES.md` to remove clear board from the legacy bridge list and describe the new clear-board command.
- [x] 7.2 Run focused server tests for authenticated board routes and structured board repository.
- [x] 7.3 Run focused client tests for authenticated API, query hooks, and clear-board UI behavior.
- [x] 7.4 Run `npm run typecheck`.
- [x] 7.5 Run `rtk npx react-doctor@latest --verbose --scope changed`.
- [x] 7.6 Run `openspec validate split-clear-board-resource --strict`.
