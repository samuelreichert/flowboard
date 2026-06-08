## 1. Data Model And Persistence

- [x] 1.1 Add priority and tag types to the shared board model.
- [x] 1.2 Extend cards with `priority` and `tagIds`, and extend board state with `tags`.
- [x] 1.3 Update localStorage validation and migration so existing cards receive Medium priority and empty tag assignments.
- [x] 1.4 Update board-state migration so existing boards receive an empty board tag list.
- [x] 1.5 Update server-side normalization and validation for priorities, card tag IDs, and board tags.
- [x] 1.6 Ensure background, column, card, and tag changes persist through the existing board save flow.

## 2. Card Metadata Editing

- [x] 2.1 Add a priority selector to the card dialog for new and existing cards.
- [x] 2.2 Persist priority changes immediately for existing cards and on create for new cards.
- [x] 2.3 Add a multi-select tag dropdown to the card dialog.
- [x] 2.4 Support selecting and deselecting existing board tags for a card.
- [x] 2.5 Add inline tag creation at the end of the dropdown with Enter-to-save behavior.
- [x] 2.6 Validate inline tag creation for non-empty and case-insensitive unique names.
- [x] 2.7 Select newly created inline tags for the current card.

## 3. Board Tag Management

- [x] 3.1 Add a tag manager surface for board-level tags.
- [x] 3.2 Add tag creation with non-empty and case-insensitive uniqueness validation.
- [x] 3.3 Add tag rename behavior that preserves tag identity and card assignments.
- [x] 3.4 Add tag removal for unused tags.
- [x] 3.5 Add confirmation before removing tags assigned to cards.
- [x] 3.6 Remove confirmed deleted tag IDs from every card that references them.

## 4. Board Actions Menu

- [x] 4.1 Replace separate top-right board action buttons with a single board actions menu.
- [x] 4.2 Move background settings entry into the board actions menu while preserving existing background behavior.
- [x] 4.3 Add a tag management entry to the board actions menu.
- [x] 4.4 Move clear-board access into the board actions menu while preserving confirmation behavior.
- [x] 4.5 Keep the menu responsive and keyboard-accessible on desktop and mobile.

## 5. Card Display And Styling

- [x] 5.1 Display each card's priority in a compact scannable form on the board.
- [x] 5.2 Display assigned card tags on the board without overwhelming narrow cards.
- [x] 5.3 Style priority, tag, dropdown, manager, and menu controls consistently with the existing Flowboard UI.

## 6. Verification

- [x] 6.1 Add tests for legacy card and board metadata migration.
- [x] 6.2 Add tests for priority selection and persistence.
- [x] 6.3 Add tests for assigning, deselecting, and inline-creating card tags.
- [x] 6.4 Add tests for tag manager create, rename, remove, and in-use confirmation behavior.
- [x] 6.5 Add tests for the board actions menu entries and preserved clear-board/background behavior.
- [x] 6.6 Run the project test suite and typecheck.
