## 1. Shared Dialog And Menu Foundations

- [x] 1.1 Extend the shared dialog composition to support scroll-resilient dialog action areas without changing alert dialog semantics.
- [x] 1.2 Align the card detail dialog with the shared non-alert dialog close and surface treatment.
- [x] 1.3 Add or update tests for card detail close behavior and persistent access to card-level actions with long editor content.

## 2. Empty Board And Column Overflow

- [x] 2.1 Add a desktop board empty state for zero-column boards with a primary create-first-column action.
- [x] 2.2 Wire the empty-state action and disabled composer add-column affordance to the same add-column dialog flow.
- [x] 2.3 Refine desktop column-list overflow styling so horizontal overflow is visible and the add-column affordance does not read as clipped.
- [x] 2.4 Add or update tests for zero-column setup and multi-column overflow/add-column reachability.

## 3. Composer Metadata Reset

- [x] 3.1 Reset non-destination composer metadata after successful submit.
- [x] 3.2 Remove retained-metadata notice and manual reset affordance from the composer.
- [x] 3.3 Ensure submit restores Medium priority and clears tags while preserving the selected destination column.
- [x] 3.4 Add or update composer tests for automatic metadata reset and default metadata silence.

## 4. Column Management Density

- [x] 4.1 Replace equal-weight Manage Columns row actions with a hierarchy that keeps Move up and Move down visible.
- [x] 4.2 Move lower-frequency Move to top, Move to bottom, and delete into a secondary row action surface while preserving disabled edge states.
- [x] 4.3 Preserve rename, add-column, and delete confirmation workflows from the Manage Columns dialog.
- [x] 4.4 Add or update Manage Columns tests for visible movement, secondary movement, destructive confirmation, and keyboard access.

## 5. Toolbar And Account Polish

- [x] 5.1 Add visual grouping to the rich text toolbar without removing existing commands or accessible labels.
- [x] 5.2 If lower-frequency toolbar commands move into a compact menu, preserve keyboard access and command state behavior.
- [x] 5.3 Refine local-mode sidebar footer behavior so Settings opens directly or appears in an anchored menu with local identity context.
- [x] 5.4 Add or update tests for toolbar grouping/accessibility and local-mode account footer behavior.

## 6. Verification

- [x] 6.1 Run targeted unit/component tests for composer, columns, Manage Columns, CardDialog, toolbar, and AppShell/sidebar behavior.
- [x] 6.2 Run typecheck and the standard test suite.
- [x] 6.3 Perform desktop visual verification for empty board, three-plus-column overflow, composer retained metadata, long card detail content, Manage Columns row actions, toolbar grouping, Settings, and local-mode sidebar footer states.
- [x] 6.4 Run React Doctor on changed scope before opening or updating a pull request.
