## Why

Moving cards is a daily, high-frequency board action, and the current small drag handle makes that action slower and more precise than it needs to be. The board should let users move cards directly from the card surface while preserving the fast click-to-open behavior and allowing title text selection.

## What Changes

- Remove the dedicated visible card drag handle from the board card UI.
- Make the desktop card surface initiate card movement when dragged from non-title display areas.
- Keep a plain click anywhere on the card opening the card details.
- Allow users to select card title text on the board; a title text-selection gesture must not open the card or move it.
- Keep priority and tag pills as display-only card content that participates in click-to-open and drag-to-move behavior.
- Leave mobile board drag-and-drop out of scope; mobile movement will continue through the opened card until a separate mobile board design is implemented.

## Capabilities

### New Capabilities
- `card-board-movement`: Defines how users open, drag, reorder, and move cards from the board surface while preserving title text selection and non-pointer movement access.

### Modified Capabilities

## Impact

- Affected UI: board card component, card styling, card drag/drop registration, and card open interaction handling.
- Affected behavior: desktop pointer interactions for card opening, card dragging, and title text selection.
- Affected tests: card open behavior, drag handle removal, reorder/move behavior, and title-selection suppression of card opening.
- No new runtime dependencies are expected.
- No storage, API, or data model changes are expected.
