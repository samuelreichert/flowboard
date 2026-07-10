## Why

Flowboard's current UI is visually polished but still centered on a full-screen board background, with hardcoded light colors and limited room for future navigation. The next product direction is a quieter, ChatGPT-inspired app shell that supports future pages, clear theme behavior, and a more focused board workspace.

## What Changes

- Introduce a responsive app shell with a collapsible desktop sidebar, compact icon rail when collapsed, and drawer-style navigation on mobile.
- Move board-level actions into the sidebar so global navigation and board commands share one predictable command surface.
- Move Flowboard branding into quieter sidebar/header chrome instead of a prominent board hero title.
- Add an app-level theme preference with `system`, `light`, and `dark` options, surfaced from the sidebar footer.
- Replace hardcoded component colors with theme-aware surface, text, border, focus, and state tokens.
- Remove board background image/color customization from the primary product experience.
- Apply hover/focus disclosure to secondary controls such as card handles and column overflow menus, while preserving keyboard and touch accessibility.
- Remove the top-right board actions menu from the board header.
- Preserve existing board, column, card, tag, drag-and-drop, dialog, and local-first storage behavior.
- **BREAKING**: Existing saved board background selections will no longer drive the visible app background once the new shell is implemented.

## Capabilities

### New Capabilities

- `app-shell-theme`: Covers the responsive sidebar shell, app-level theme preference, theme persistence, light/dark/system behavior, and theme-aware UI surfaces.

### Modified Capabilities

- `board-actions-menu`: Removes the top-right board actions menu and moves board-level tools such as tag management and clear board into the sidebar.
- `board-ui-affordance`: Updates board action affordance requirements so the top-right board tools remain discoverable without owning global appearance controls.
- `base-ui-alignment`: Removes the requirement for an accessible background picker popup and preserves Base UI accessibility expectations for remaining popups, menus, fields, selects, and dialogs.

## Impact

- Affected UI shell and styling: `src/App.tsx`, `src/App.css`, `src/index.css`, component CSS files, and shared button/icon/menu/dialog styling.
- Affected board appearance code: background style calculation, background picker usage, background image/color CSS branches, and any background-related storage reads used only for presentation.
- Affected persistence: add theme preference storage; keep existing board data compatible even if saved background values are ignored.
- Affected specs: add `app-shell-theme`; update `board-actions-menu`, `board-ui-affordance`, and `base-ui-alignment`.
- No new backend API is required.
