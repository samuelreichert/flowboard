## 1. Server Contracts And Validation

- [x] 1.1 Define request and response DTO types for column create, rename, move, and delete mutations.
- [x] 1.2 Define request and response DTO types for tag create, rename, delete, and card-tag assign/unassign mutations.
- [x] 1.3 Define request and response DTO types for board settings and work-cycle settings patch mutations.
- [x] 1.4 Add validation helpers for column titles, tag names, board background values, completed-column identifiers, and relative column placement.
- [x] 1.5 Reject malformed JSON and invalid non-card board mutation payloads with existing board API error helpers.
- [x] 1.6 Add route matching for column, tag, card-tag, board settings, and work-cycle settings mutation endpoints.

## 2. Repository Column Operations

- [x] 2.1 Add shared helpers to load the resolved principal's main board and validate board-scoped columns for non-card mutations.
- [x] 2.2 Implement `createActiveColumn` with focused column insert, deterministic ordering, and board version increment.
- [x] 2.3 Implement `renameActiveColumn` with duplicate-title validation and board version increment.
- [x] 2.4 Implement `moveActiveColumn` with ordering updates limited to affected columns and board version increment.
- [x] 2.5 Implement `deleteActiveColumn` with active card/card-tag cleanup, completed-column clearing when needed, and board version increment.
- [x] 2.6 Return lean column mutation results containing affected columns, deleted identifiers, affected card identifiers, work-cycle settings when changed, and updated board version.

## 3. Repository Tag And Settings Operations

- [x] 3.1 Add shared helpers to validate board-scoped tags and active card/tag pairs.
- [x] 3.2 Implement `createBoardTag` with focused tag insert, unique-name validation, and board version increment.
- [x] 3.3 Implement `renameBoardTag` with unique-name validation and board version increment.
- [x] 3.4 Implement `deleteBoardTag` with active card-tag cleanup, archived snapshot preservation, and board version increment.
- [x] 3.5 Implement `assignActiveCardTag` and `unassignActiveCardTag` with focused card-tag writes and board version increment.
- [x] 3.6 Implement `updateBoardSettings` for board background without rewriting board content.
- [x] 3.7 Implement `updateWorkCycleSettings` for completed-column configuration without completing work or touching history.
- [x] 3.8 Return lean mutation results containing changed tags/settings, affected card summaries or identifiers, and updated board version.

## 4. Server Tests

- [x] 4.1 Add repository tests proving column create, rename, move, and delete update only affected structured rows.
- [x] 4.2 Add repository tests proving column delete removes active cards and clears completed-column setting without deleting archived snapshots.
- [x] 4.3 Add repository tests proving tag create, rename, and delete update only tag/card-tag rows and preserve archived tag snapshots.
- [x] 4.4 Add repository tests proving card-tag assign/unassign updates one active card-tag relationship without rewriting card rows.
- [x] 4.5 Add repository tests proving board background and completed-column settings patch only their owning rows.
- [x] 4.6 Add route tests for authenticated and local success responses for all new mutation endpoints.
- [x] 4.7 Add route tests for unauthenticated rejection, cross-owner missing behavior, duplicate column/tag values, invalid placement, invalid background, invalid completed column, and malformed JSON.

## 5. Client API And Mutation Hooks

- [x] 5.1 Add client API functions for column, tag, card-tag, board settings, and work-cycle settings mutations in `src/storage/authenticatedApi.ts`.
- [x] 5.2 Add stable mutation input/result types shared by client API helpers, mutation hooks, and UI wiring.
- [x] 5.3 Add TanStack Query mutation hooks for column operations with optimistic bootstrap cache updates and rollback.
- [x] 5.4 Add TanStack Query mutation hooks for tag and card-tag operations with bootstrap/detail cache updates and rollback.
- [x] 5.5 Add TanStack Query mutation hooks for board settings and work-cycle settings with bootstrap cache updates and rollback.
- [x] 5.6 Extract shared bootstrap cache patch helpers for columns, tags, board metadata, work-cycle settings, affected card summaries, and board version.
- [x] 5.7 Merge server-returned resources and board version into caches on success and invalidate only exact affected queries when needed.

## 6. UI Integration

- [x] 6.1 Route column creation from board and Manage columns flows through the create-column mutation instead of `persistAuthenticatedBoard`.
- [x] 6.2 Route column rename, reorder, and delete flows through column resource mutations.
- [x] 6.3 Route tag creation, rename, and deletion from the tag manager through tag resource mutations.
- [x] 6.4 Route existing-card tag assign/unassign from card surfaces through card-tag resource mutations.
- [x] 6.5 Keep initial tags for new card drafts inside the existing card create mutation.
- [x] 6.6 Route board background changes through the board settings mutation.
- [x] 6.7 Route completed-column changes from board settings through the work-cycle settings mutation.
- [x] 6.8 Keep work-cycle completion and completed history flows on the temporary legacy bridge.
- [x] 6.9 Preserve existing persistence/loading/error messaging for failed non-card board mutations.

## 7. Client And Integration Tests

- [x] 7.1 Update app test fetch mocks to handle the new non-card board mutation endpoints and mutate mock server bootstrap state.
- [x] 7.2 Add client API tests for mutation methods, URLs, payloads, auth headers, and error handling.
- [x] 7.3 Add query/mutation hook tests for optimistic column, tag, card-tag, settings, rollback, and success merge behavior.
- [x] 7.4 Update column management tests to assert column operations no longer call legacy full-board `PUT`.
- [x] 7.5 Update tag manager and card tag tests to assert tag operations no longer call legacy full-board `PUT`.
- [x] 7.6 Update board settings tests to assert background and completed-column changes no longer call legacy full-board `PUT`.
- [x] 7.7 Add regression coverage proving work-cycle completion and completed history behavior remain unchanged.

## 8. Documentation And Validation

- [x] 8.1 Update `RUNNING_MODES.md` to describe non-card board resource mutations while completion/history and legacy cleanup remain future work.
- [x] 8.2 Run focused server tests for authenticated board routes and structured board repository.
- [x] 8.3 Run focused client tests for authenticated API, mutation hooks, columns, tag manager, card tag assignment, board settings, and app routes.
- [x] 8.4 Run `npm run typecheck`.
- [x] 8.5 Run `rtk npx react-doctor@latest --verbose --scope changed` before PR.
- [x] 8.6 Run `openspec validate add-board-resource-mutations --strict`.
