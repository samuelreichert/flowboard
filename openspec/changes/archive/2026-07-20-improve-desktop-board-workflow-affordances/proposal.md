## Why

Desktop board setup and daily capture currently ask users to connect related actions across separate parts of the app. Empty boards, horizontal column overflow, sticky composer metadata, dense dialog controls, and sparse local-mode account behavior all work individually, but together they make the board feel less guided and less predictable than the rest of Flowboard.

This change tightens those affordances so first-run setup, repeated card capture, and card or column management feel coherent without changing the underlying board data model.

## What Changes

- Add a stronger empty-board state that makes creating the first column the primary board action while keeping the composer aligned with the same add-column flow.
- Clarify the desktop horizontal column overflow pattern so the trailing add-column affordance does not read as clipped or broken on wider boards.
- Give composer metadata persistence an explicit affordance, either through a reset control or a brief kept-metadata confirmation with one-click reset.
- Make card-level actions in the card detail dialog consistently discoverable without requiring users to scroll past the editor.
- Reduce visual density in Manage Columns while preserving all current movement, rename, add, and delete capabilities.
- Refine rich-text toolbar grouping so common editor controls remain compact but easier to scan.
- Standardize dialog close/action composition across related non-alert dialogs.
- Improve local-mode account behavior so Settings feels anchored to the sidebar footer instead of a sparse detached menu.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `board-ui-affordance`: Add explicit empty-board setup guidance and clarify the desktop horizontal overflow/add-column affordance.
- `card-composer`: Add an explicit path from disabled composer state to column creation and make post-submit metadata persistence visible or resettable.
- `column-management`: Allow lower-frequency column actions to move into a row action menu while preserving quick movement and destructive confirmation behavior.
- `card-content-rich-editing`: Group rich-text toolbar controls more clearly while preserving compact icon-first editing.
- `shared-ui-primitives`: Extend shared dialog composition expectations to card detail and related non-alert dialogs so close/action treatments stay consistent.
- `user-profile`: Refine local-mode sidebar footer/account behavior while preserving honest unauthenticated state.

## Impact

- Affected UI components include the board column list, empty board surface, card composer, card detail dialog, rich-text toolbar, Manage Columns dialog, sidebar account menu, and shared dialog primitives.
- Affected specs include board affordances, composer behavior, column management, rich content editing, shared UI primitives, and user profile/account menu behavior.
- No API, storage schema, authentication, persistence, or dependency changes are expected.
