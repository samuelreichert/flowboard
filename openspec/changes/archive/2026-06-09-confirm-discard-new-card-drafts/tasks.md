## 1. Draft State And Close Guard

- [x] 1.1 Add a `CardDialog` helper that treats a new-card draft as dirty when `title.trim()`, `content.trim()`, or `selectedTagIds.length` is non-empty.
- [x] 1.2 Replace the new-card dialog's direct `onOpenChange` wiring with a guarded handler that intercepts close requests for dirty drafts.
- [x] 1.3 Keep empty new-card drafts closing immediately for Escape, Cancel, close button, and outside-dismiss requests.
- [x] 1.4 Ensure priority-only changes on new-card drafts do not trigger the dirty draft confirmation.

## 2. Discard Confirmation Flow

- [x] 2.1 Add discard confirmation state to `CardDialog` for new-card drafts.
- [x] 2.2 Render an in-dialog confirmation for dirty draft discard using copy that clearly states the unsaved card content will be lost.
- [x] 2.3 Keep the card dialog open and preserve draft values when the user cancels the discard confirmation.
- [x] 2.4 Close the discard confirmation and card dialog without creating a card when the user confirms discard.
- [x] 2.5 Reset discard confirmation, tag dropdown, tag creation, and validation state when the card dialog fully closes.

## 3. Existing Behavior Preservation

- [x] 3.1 Preserve existing-card autosave behavior and close behavior without adding discard confirmation to existing cards.
- [x] 3.2 Preserve inline board tag creation semantics so discarding a card draft does not remove board-level tags created from the card dialog.
- [x] 3.3 Preserve successful new-card creation through the Create button, including title/content trimming and selected tag assignments.

## 4. Verification

- [x] 4.1 Add tests that empty new-card drafts close with Escape and Cancel without confirmation or card creation.
- [x] 4.2 Add tests that title, content, and selected-tag drafts each show discard confirmation on close attempts.
- [x] 4.3 Add tests that cancelling discard returns to the new-card dialog with draft values intact.
- [x] 4.4 Add tests that confirming discard closes the new-card dialog and does not create a card.
- [x] 4.5 Add tests that priority-only new-card drafts close without discard confirmation.
- [x] 4.6 Add a regression test that existing-card edits still autosave and close without discard confirmation.
- [x] 4.7 Run the project test suite and typecheck.
