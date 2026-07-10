## Why

The current card creation flow opens a full dialog, which makes quick capture feel like filling out a traditional form instead of adding an idea directly to the board. A global board composer can make card creation faster, calmer, and more familiar while preserving the full card dialog for review and editing after creation.

## What Changes

- Add a global sticky composer to the board view for creating cards without opening the full card dialog.
- Replace the column-local create-card dialog entry point with a board-level capture experience that keeps board context visible.
- Use one primary multiline input that starts as a one-line field and grows as the user writes.
- Parse the first line of the composer input as the card title and any following text as the card content.
- Provide compact metadata controls around the input for destination column, priority, and tags.
- Allow card creation from `Cmd+Enter` / `Ctrl+Enter` and from a compact icon submit button.
- Keep the existing full card dialog available for opening, reviewing, editing, moving, tagging, reprioritizing, and deleting cards after creation.
- Preserve fast capture on desktop and adapt the composer to a reachable mobile bottom layout without making it feel like a hidden complex form.

## Capabilities

### New Capabilities

- `card-composer`: Global board card creation through a compact sticky composer with multiline title/content capture, metadata selection, keyboard submission, accessible controls, mobile behavior, and draft states.

### Modified Capabilities

- None.

## Impact

- Affected UI: board workspace layout, columns/card creation entry points, card creation controls, mobile board layout, empty board states.
- Affected logic: card creation state, title/content parsing, default metadata selection, draft handling, validation, and keyboard behavior.
- Affected persistence: existing board storage for cards, priorities, and tag assignments should continue to be used without data model changes.
- Affected accessibility: composer input labeling, metadata popovers/selects, keyboard shortcuts, focus order, validation messaging, and live feedback after card creation.
