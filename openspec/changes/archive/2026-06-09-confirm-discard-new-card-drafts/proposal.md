## Why

Users can currently dismiss a new-card dialog after typing a title, adding content, or selecting tags, which silently loses the unsaved card draft. This is especially easy to do with Escape because empty drafts should close quickly, while meaningful drafts need a safeguard.

## What Changes

- Add discard confirmation when closing a new-card dialog that contains draft title text, content, or selected tags.
- Keep Escape, Cancel, close button, and outside-dismiss behavior fast for empty new-card drafts.
- Let users cancel the confirmation to continue editing the draft.
- Let users confirm the discard to close the new-card dialog without creating a card.
- Keep existing-card dialogs unchanged because existing cards autosave edits today.
- Treat priority-only changes on a new card as non-content for this confirmation.
- Preserve the current board-level inline tag creation behavior; discarding a card draft clears its selected tag assignment but does not remove any board tags that were created globally.

## Capabilities

### New Capabilities

- `card-draft-discard-confirmation`: New-card draft close behavior, including dirty-state detection and confirmation before discarding unsaved draft content.

### Modified Capabilities

None.

## Impact

- `src/components/CardDialog`: Dirty-draft detection, guarded close handling, and discard confirmation for new cards.
- `src/components/CardDialog`: Reuse existing dialog styling and destructive-action treatment for the discard prompt.
- `src/components/Column`: Continue opening new-card dialogs through the existing add-card state.
- `src/App.test.tsx`: Tests for empty Escape close, dirty title/content/tag confirmation, cancellation, and confirmed discard.
- No storage, API, data model, or migration changes are expected.
