## 1. Board State Model

- [x] 1.1 Extend shared board types with active work-cycle, completed work-cycle, and archived card snapshot structures.
- [x] 1.2 Add validation helpers for active work cycles, completed work cycles, archived cards, and archived tag snapshots.
- [x] 1.3 Update board-state validation to require normalized work-cycle and history fields.
- [x] 1.4 Update board normalization to initialize missing work-cycle fields and infer a `Done` completed column when available.
- [x] 1.5 Add migration tests for boards with a `Done` column, boards without a `Done` column, empty completed columns, invalid completed-column IDs, and persisted history.

## 2. Storage And Completion Logic

- [x] 2.1 Add storage helpers for reading and writing complete board state including columns, tags, active work cycle, and completed history.
- [x] 2.2 Implement completed-column deletion handling so deleting the configured completed column clears the setting.
- [x] 2.3 Implement a complete-work operation that creates a completed work-cycle entry, snapshots cards with tag names, clears the completed column, and starts the next cycle on the same completion date.
- [x] 2.4 Support completing an empty work cycle by creating a zero-card history entry after confirmation.
- [x] 2.5 Preserve existing optional SQLite API behavior by continuing to persist the complete board payload through `/api/board`.

## 3. Board Settings UX

- [x] 3.1 Add a board settings dialog reachable from the sidebar or existing board settings surface.
- [x] 3.2 Add a completed-column select listing current columns and saving the selected column ID.
- [x] 3.3 Show a useful empty or disabled state when no columns exist for completed-column selection.
- [x] 3.4 Keep the completed-column setting stable across column renames.
- [x] 3.5 Move destructive Clear board into board settings with confirmation instead of primary navigation.

## 4. Complete Work UX

- [x] 4.1 Add the board-level `Complete work` command in the board header using action styling consistent with existing controls.
- [x] 4.2 When no completed column is configured, prevent completion and guide the user to board settings.
- [x] 4.3 Add confirmation copy for completing work with one or more cards, including the card count and configured column name.
- [x] 4.4 Add distinct confirmation copy for completing an empty work cycle.
- [x] 4.5 After confirmation, run the complete-work operation and refresh active board state.
- [x] 4.6 Add a brief post-confirmation flush-style animation that does not block or control persistence.

## 5. History View UX

- [x] 5.1 Add a sidebar `History` navigation item and render a separate History workspace view.
- [x] 5.2 Display completed work-cycle groups sorted with the most recent cycle first and labeled by start/end date range.
- [x] 5.3 Render archived cards in each group with readonly title, priority, content indicator, and resolved tag labels.
- [x] 5.4 Add readonly archived-card detail viewing with created date, archived date, labelled priority and tags, rich-text content, and Copy Markdown.
- [x] 5.5 Display empty completed work-cycle groups clearly when a cycle contains zero archived cards.
- [x] 5.6 Resolve history tag labels from current tags when the tag exists and from archived snapshots when the tag was deleted.
- [x] 5.7 Keep board and history card chips visually stable with consistent single-line tag and priority pill heights.

## 6. Tests And Verification

- [x] 6.1 Add UI tests for configuring the completed column and preserving that setting through rename/delete flows.
- [x] 6.2 Add UI tests for completing work with cards, confirming cancellation, and verifying active Done cards move to History.
- [x] 6.3 Add UI tests for completing an empty work cycle and rendering the empty history group.
- [x] 6.4 Add UI tests for History tag rename and deleted-tag snapshot fallback behavior.
- [x] 6.5 Add persistence tests proving work-cycle metadata and history survive reload and optional database hydration.
- [x] 6.6 Run the project test suite and build/type-check commands.
- [x] 6.7 Compare related sidebar, dialog, select, and card controls for UI/UX consistency before finishing.
- [x] 6.8 Add UI tests for completed-card metadata labels, rich-text rendering, and Copy Markdown.
