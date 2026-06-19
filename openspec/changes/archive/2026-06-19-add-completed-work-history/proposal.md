## Why

Flowboard currently lets completed cards accumulate in an active Done-style column or be permanently removed when clearing the board. This makes it hard to reset active work without losing a useful record of delivered work for retros, 1:1s, and personal output review.

## What Changes

- Add a board-level `Complete work` action that archives the configured completed column into a dated completed-work history group and immediately starts a new work cycle.
- Add a sidebar `History` view for browsing readonly completed work grouped by recorded work-cycle date ranges.
- Add a board settings dialog where the user chooses which column counts as completed work and where destructive board reset lives outside primary navigation.
- Persist active work-cycle metadata, completed work-cycle history, archived card snapshots, and completed-column selection as part of the existing board state.
- Allow completing an empty work cycle after explicit confirmation, saving an empty history entry.
- Preserve tag context in history by using current tag names when a tag still exists and archived tag-name snapshots when a tag has been deleted.
- Show archived card details with created/archived dates, labelled priority and tag rows, readonly rich-text content, and a Copy Markdown action.
- Migrate existing boards by initializing the active work cycle and, when possible, inferring a completed column from an existing `Done` column.

## Capabilities

### New Capabilities

- `completed-work-history`: Completing a work cycle, archiving completed-column cards, browsing readonly history grouped by date range, and configuring the completed column.

### Modified Capabilities

- None.

## Impact

- `src/board/types.ts`, `src/board/validation.ts`, and related tests for board-state shape, normalization, and migration.
- `src/storage/index.ts` and optional `/api/board` persistence because the full board payload will include work-cycle and history data.
- `src/App.tsx`, sidebar navigation, and workspace rendering for the `Complete work`, `History`, and board settings surfaces.
- Shared card chip and dialog title styling so board cards, completed-card history, and dialogs remain visually consistent.
- Column/card update flows that remove archived cards from the configured completed column while preserving other active columns.
- New UI tests covering completed-column configuration, completion confirmations, readonly rich history details, empty-cycle completion, markdown copy, and tag rename/delete display behavior.
