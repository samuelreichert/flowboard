## 1. Theme Preference Foundation

- [x] 1.1 Add app-level theme preference types and storage helpers for `system`, `light`, and `dark`.
- [x] 1.2 Resolve `system` theme from `prefers-color-scheme` and react to system theme changes while the app is open.
- [x] 1.3 Apply the resolved theme to the app root through a stable class or data attribute.
- [x] 1.4 Add tests for theme preference validation, persistence, and system resolution where practical.

## 2. App Shell Layout

- [x] 2.1 Introduce a root app shell with sidebar, main workspace, and board content regions.
- [x] 2.2 Add desktop sidebar expanded and collapsed states with an accessible toggle.
- [x] 2.3 Keep collapsed desktop navigation and app-level controls available as accessible icon controls.
- [x] 2.4 Add mobile drawer behavior for the sidebar without permanently reducing board workspace width.
- [x] 2.5 Move Flowboard branding into quiet sidebar or header chrome.

## 3. Sidebar Navigation And Theme Control

- [x] 3.1 Add current board navigation items to the sidebar using icon-and-label rows in expanded mode.
- [x] 3.2 Add icon-only navigation treatment for collapsed mode with accessible names and tooltips where needed.
- [x] 3.3 Add the `system`, `light`, and `dark` theme selector to the sidebar footer.
- [x] 3.4 Ensure the sidebar footer theme selector remains reachable in expanded, collapsed, and mobile drawer states.

## 4. Background Feature Removal

- [x] 4.1 Stop applying saved board background image or color values to the app background.
- [x] 4.2 Remove background settings from the board actions menu.
- [x] 4.3 Remove background picker UI from the rendered product experience.
- [x] 4.4 Keep existing board data with background values readable so old saved boards remain usable.
- [x] 4.5 Remove or isolate unused background-specific styling branches after the app shell owns the visible background.

## 5. Theme Tokens And Component Styling

- [x] 5.1 Define semantic CSS custom properties for app, sidebar, workspace, card, dialog, popup, input, border, text, focus, hover, danger, and shadow tokens.
- [x] 5.2 Convert app shell, board, button, icon button, menu, tooltip, and add-column styling to theme tokens.
- [x] 5.3 Convert column, card, tag, priority, drag, and drop-indicator styling to theme tokens.
- [x] 5.4 Convert dialog, select, popover, tag manager, and background-removal-adjacent styling to theme tokens.
- [x] 5.5 Convert rich-content editor styling to theme tokens while preserving existing editor behavior.

## 6. Hover, Focus, And Touch Affordances

- [x] 6.1 Make secondary card controls visually quiet by default on pointer-capable desktop layouts.
- [x] 6.2 Make secondary column and board controls visually quiet by default on pointer-capable desktop layouts.
- [x] 6.3 Reveal hidden secondary controls on hover and `focus-within` without causing layout shift.
- [x] 6.4 Preserve touch and mobile access to essential controls without relying on hover.
- [x] 6.5 Verify destructive actions remain explicit and confirmation-gated.

## 7. Verification

- [x] 7.1 Run the existing automated test suite.
- [x] 7.2 Run a production build.
- [x] 7.3 Manually inspect light, dark, and system theme behavior.
- [x] 7.4 Manually inspect expanded sidebar, collapsed sidebar, and mobile drawer layouts.
- [x] 7.5 Manually inspect board scrolling, dialogs, menus, selects, tooltips, editor controls, drag handles, and hover/focus states for readability and overflow.
