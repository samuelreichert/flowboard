## 1. Server Contracts And Validation

- [x] 1.1 Define card mutation request/response DTO types for create, update, move, and delete.
- [x] 1.2 Add validation helpers for card title, content, priority, tag ids, target column id, and relative move placement.
- [x] 1.3 Reject malformed JSON and invalid card mutation payloads with existing board API error helpers.
- [x] 1.4 Add route matching for `POST /api/board/cards`, `PATCH /api/board/cards/:cardId`, `PATCH /api/board/cards/:cardId/move`, and `DELETE /api/board/cards/:cardId`.

## 2. Repository Card Operations

- [x] 2.1 Add shared helpers to load the resolved principal's main board and validate board-scoped columns, cards, and tags.
- [x] 2.2 Implement `createActiveCard` with focused card and card-tag inserts plus board version increment.
- [x] 2.3 Implement `updateActiveCard` with focused card field updates, card-tag replacement, and board version increment.
- [x] 2.4 Implement `moveActiveCard` with source/destination column ordering updates limited to affected columns and board version increment.
- [x] 2.5 Implement `deleteActiveCard` with active card-tag/card deletion and board version increment.
- [x] 2.6 Return lean card mutation results containing card fields needed by bootstrap/detail caches and the updated board version.

## 3. Server Tests

- [x] 3.1 Add repository tests proving create inserts one card with tags without rewriting unrelated board data.
- [x] 3.2 Add repository tests proving update changes title/content/priority/tags without rewriting unrelated board data.
- [x] 3.3 Add repository tests proving move within and across columns preserves deterministic ordering and leaves unrelated data intact.
- [x] 3.4 Add repository tests proving delete removes active card/tag assignments without deleting archived snapshots.
- [x] 3.5 Add route tests for authenticated and local card create, update, move, and delete success responses.
- [x] 3.6 Add route tests for unauthenticated rejection, cross-owner missing behavior, invalid columns, invalid tags, invalid priority, empty title, and malformed JSON.

## 4. Client API And Mutation Hooks

- [x] 4.1 Add client API functions for create, update, move, and delete card mutations in `src/storage/authenticatedApi.ts`.
- [x] 4.2 Add stable mutation input/result types shared by the mutation hooks and UI wiring.
- [x] 4.3 Add card mutation hooks that use TanStack Query `useMutation` and existing query keys.
- [x] 4.4 Implement optimistic bootstrap cache updates for card create, update, move, and delete.
- [x] 4.5 Implement active card detail cache updates for card create/update/delete and rollback snapshots on mutation errors.
- [x] 4.6 Merge server-returned card fields and board version into caches on mutation success and invalidate only exact affected queries when needed.

## 5. UI Integration

- [x] 5.1 Route Card Composer saves through the create-card mutation instead of `persistAuthenticatedBoard`.
- [x] 5.2 Route Card Dialog title/content/priority/tag edits through the update-card mutation instead of `persistAuthenticatedBoard`.
- [x] 5.3 Route Card Dialog column changes through the move-card mutation.
- [x] 5.4 Route drag/drop card moves through the move-card mutation.
- [x] 5.5 Route card deletion through the delete-card mutation.
- [x] 5.6 Keep column, tag, board settings, work-cycle completion, and history flows on the temporary legacy full-board bridge.
- [x] 5.7 Preserve existing persistence/loading/error messaging for failed card mutations.

## 6. Client And Integration Tests

- [x] 6.1 Update app test fetch mocks to handle the new card mutation endpoints and mutate the mock server board state.
- [x] 6.2 Add client API tests for card mutation request methods, URLs, payloads, auth headers, and error handling.
- [x] 6.3 Add query/mutation hook tests for optimistic create, update, move, delete, rollback, and success merge behavior.
- [x] 6.4 Update Card Composer, Card Dialog, Columns, and route tests to assert card operations no longer call legacy full-board `PUT`.
- [x] 6.5 Add regression coverage proving unhydrated rich content and completed history are not touched by card mutations.

## 7. Documentation And Validation

- [x] 7.1 Update `RUNNING_MODES.md` to describe card mutations using resource endpoints while non-card saves still use the legacy bridge.
- [x] 7.2 Run focused server tests for authenticated board routes and structured board repository.
- [x] 7.3 Run focused client tests for authenticated API, app routes, card composer/dialog, columns, and query mutation behavior.
- [x] 7.4 Run `npm run typecheck`.
- [x] 7.5 Run `rtk npx react-doctor@latest --verbose --scope changed` before PR.
