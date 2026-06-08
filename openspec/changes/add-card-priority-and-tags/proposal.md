## Why

Flowboard cards currently rely on title and rich content only, which makes it hard to scan urgency or group related work across columns. Adding priority and reusable tags gives users lightweight card metadata while keeping the board simple.

The top-right header actions are also starting to outgrow separate buttons. Consolidating them into a board menu creates room for tag management without crowding the main workspace.

## What Changes

- Add a card priority field with Low, Medium, and High options.
- Show priority on cards and allow it to be set from the card dialog.
- Add board-level tags that can be assigned to cards.
- Add a tag selector in the card dialog with selectable existing tags and an inline "create tag" action at the end of the dropdown.
- Allow users to type a new tag name in the dropdown and press Enter to save it.
- Add a top-right board menu that contains the existing board actions and opens tag management.
- Add tag management for creating, editing, and removing board tags.
- Persist priority and tag data locally and through the existing board API.
- Migrate existing cards to a default priority and no tags.

## Capabilities

### New Capabilities

- `card-metadata`: Card priority and tag assignment behavior, including creation of tags from the card dialog.
- `board-tag-management`: Board-level tag management behavior for creating, editing, and removing reusable tags.
- `board-actions-menu`: Consolidated top-right board menu behavior for board actions.

### Modified Capabilities

None.

## Impact

- `src/types.ts`: Board/card/tag type definitions.
- `src/storage/index.ts`: Local storage validation, migration, and persistence for card metadata and board tags.
- `server/index.mjs`: API validation and normalization for the expanded board state.
- `src/App.tsx` and `src/App.css`: Top-right board menu and tag management entry point.
- `src/components/CardDialog`: Priority selector and tag dropdown with inline tag creation.
- `src/components/Card`: Card metadata display.
- Tests covering migration, card metadata editing, tag creation/assignment, tag management, and board menu behavior.
