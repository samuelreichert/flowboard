## Why

Recent UI refactors regressed core desktop workflows: card content editing loses focus after the first keystroke, horizontal board overflow has no practical mouse affordance, and column-management dialogs behave inconsistently. The sidebar and composer also present mismatched control geometry that makes the interface feel less coherent.

## What Changes

- Normalize sidebar control geometry, hover treatment, focus treatment, and avatar sizing across expanded and collapsed desktop navigation.
- Keep Manage columns open behind both rename and add-column child dialogs, including when the add dialog is cancelled.
- Restore the compact circular empty tag trigger in the card composer and correctly align its selected-tag chip state.
- Replace the paragraph selector's `Pilcrow` icon with Lucide `TextCursorInput`.
- Preserve Tiptap editor focus, selection, multi-character entry, and Enter behavior while retaining legitimate external content synchronization.
- Make horizontally overflowing desktop boards discoverable and operable with a mouse through a visible scrollbar and wheel interaction that does not block normal page scrolling unnecessarily.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell-theme`: Sidebar navigation controls gain a consistent compact-control presentation.
- `shared-ui-primitives`: Nested non-alert dialog workflows preserve parent dialog context and focus return.
- `card-composer`: Tag-trigger compact and selected states are explicitly distinguished.
- `column-management`: Add-column launched from Manage columns preserves the manager context on completion and cancellation.
- `card-content-rich-editing`: Text entry and paragraph creation preserve the active editor selection while content is synchronized.
- `board-ui-affordance`: Desktop horizontal board overflow becomes directly discoverable and mouse-operable.

## Impact

- Affected client components include `AppSidebar`, `Sidebar`, `ProfileAvatar`, `Columns`, `ManageColumnsDialog`, `CardComposer`, `TagMultiSelect`, and `CardContentEditor`.
- CSS is consolidated around existing semantic tokens and radius values; no new application API, persistence schema, or dependency is required.
- Tests will cover dialog layering, composer tag geometry, rich-text focus/Enter behavior, and desktop board scrolling.
