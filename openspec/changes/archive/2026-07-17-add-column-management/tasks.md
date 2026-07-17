## 1. Column Ordering Logic

- [x] 1.1 Add a shared column reorder helper that supports move previous, move next, move first, and move last while normalizing column positions.
- [x] 1.2 Update column state changes to persist canonical array order and normalized positions together.
- [x] 1.3 Add unit coverage for reorder edge cases, including no-op moves at first and last positions.

## 2. Manage Columns Dialog

- [x] 2.1 Create a Manage columns dialog that lists columns vertically in current board order.
- [x] 2.2 Add Move to top, Move up, Move down, and Move to bottom controls with disabled edge states and accessible labels.
- [x] 2.3 Add rename and delete entry points that reuse existing validation and confirmation behavior.
- [x] 2.4 Add an add-column entry point while preserving the board-level Add another column affordance.
- [x] 2.5 Add an empty state for boards with no columns.

## 3. Sidebar and Column Menu Integration

- [x] 3.1 Add a Manage columns command to sidebar board actions.
- [x] 3.2 Wire the sidebar command to open the Manage columns dialog.
- [x] 3.3 Add Move left, Move right, Move to first, and Move to last commands to each column actions menu.
- [x] 3.4 Keep unavailable column menu movement commands visible but disabled at board edges.

## 4. Persistence and Completion Behavior

- [x] 4.1 Verify local storage saves and reloads reordered column order.
- [x] 4.2 Verify authenticated structured persistence saves and reloads reordered column order.
- [x] 4.3 Verify completed-column configuration remains tied to the same column ID after reorder.

## 5. UI Verification and Tests

- [x] 5.1 Add interaction tests for dialog reorder controls, column menu movement commands, and disabled edge states.
- [x] 5.2 Add coverage for deleting and renaming columns from Manage columns.
- [x] 5.3 Verify desktop and mobile dialog layouts, including empty, long-title, focused, disabled, and confirmation states.
- [x] 5.4 Run typecheck and the relevant unit/e2e test suite.
