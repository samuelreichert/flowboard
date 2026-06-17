## Context

Flowboard is currently a single-screen local-first board. The viewport background is user-configurable through color/image background settings, and many component colors are hardcoded directly in CSS. Existing UI primitives already use Base UI for accessible dialogs, menus, popovers, fields, selects, and tooltips, so this change can modernize the shell and theme system without replacing the interaction primitives.

The target direction is a ChatGPT-like product shell: quieter branding, a collapsible left sidebar, a central work area, app-level theme controls, and secondary controls that stay out of the way until hover or focus. The user has explicitly accepted removing the background feature to simplify the new theme model.

## Goals / Non-Goals

**Goals:**
- Introduce a future-ready app shell with expanded, collapsed, and mobile drawer sidebar states.
- Move theme selection to the sidebar footer with `system`, `light`, and `dark` options.
- Make the board workspace calmer and centered within the app shell while preserving existing board workflows.
- Replace hardcoded visual colors with CSS custom properties for light and dark themes.
- Remove visible board background customization from the product experience.
- Apply hover/focus disclosure to secondary card, column, and board controls without reducing keyboard or touch accessibility.

**Non-Goals:**
- Add multiple boards, authentication, account menus, or real settings pages.
- Change board storage semantics for columns, cards, tags, priorities, content, or drag-and-drop order.
- Redesign the rich-content editor behavior beyond theme and surface alignment.
- Add new external design system dependencies.
- Delete legacy background data from existing browser storage in the initial implementation.

## Decisions

### Use a root app shell around the existing board

The implementation will wrap the existing board in an app shell with a sidebar region and a main workspace region. Desktop supports expanded and collapsed sidebar states; collapsed desktop keeps an icon-only rail. Mobile uses a collapsible drawer pattern so the board remains the primary visible surface.

Alternatives considered:
- Keep the current full-screen board and only restyle components. This would not support future pages or ChatGPT-like navigation.
- Add only a top navigation bar. This would be simpler but less aligned with the intended future page structure.

### Store theme as an app-level preference

Theme will be independent of board state and saved under a new app preference key. `system` resolves from `prefers-color-scheme`, while `light` and `dark` force the corresponding theme. The resolved theme should be reflected on the app root with an attribute or class that drives CSS tokens.

Alternatives considered:
- Store theme inside the board state. This would wrongly treat theme as board data and complicate future pages.
- Keep theme only in memory. This would make the user reselect their preference every session.

### Replace background customization with theme tokens

The visible app background will come from theme tokens rather than saved board background values. Legacy background data can remain readable and valid in storage for compatibility, but it should not drive the rendered app shell. Background picker UI and background menu entries should be removed from the main experience.

Alternatives considered:
- Keep images and add dark overlays. This preserves customization but creates contrast and complexity problems across cards, dialogs, and sidebars.
- Convert background images into subtle decorative accents. This keeps some personality but delays the move to a clean product shell.

### Use CSS custom properties before component rewrites

Theme work should begin by defining semantic tokens for app background, sidebar, workspace, cards, dialogs, borders, muted text, primary action, danger action, focus rings, hover states, and shadows. Existing component CSS should then consume these tokens. This keeps the change broad but controlled.

Alternatives considered:
- Replace all CSS with a new component abstraction. This would risk unnecessary churn.
- Add dark-mode overrides next to every hardcoded color. This would work initially but make future UI work brittle.

### Hide secondary controls with hover and focus affordances

Secondary controls such as drag handles and overflow menus should be visually quieter by default on pointer-capable desktop layouts, then reveal on hover or `focus-within`. Touch layouts should keep essential controls reachable without depending on hover.

Alternatives considered:
- Hide controls only on cards. This is safer but less visually coherent.
- Hide controls everywhere without touch exceptions. This would harm mobile and accessibility.

## Risks / Trade-offs

- Background removal disappoints users who liked visual personalization -> Treat this as an intentional product direction and keep legacy data compatible in case a future appearance system reintroduces accents.
- Broad CSS token migration may miss a component state -> Audit all component CSS colors and verify light, dark, focus, hover, dialog, menu, editor, and drag states.
- Hover-only controls can become undiscoverable -> Use hover, focus, and mobile/touch fallbacks; keep destructive actions behind explicit menus and confirmations.
- Sidebar state can reduce usable board width -> Provide collapsed desktop rail and mobile drawer behavior; keep horizontal board scrolling contained inside the workspace.
- System theme changes can happen while the app is open -> Subscribe to `prefers-color-scheme` changes when theme preference is `system`.

## Migration Plan

1. Add app shell and theme preference state without changing board data shape.
2. Introduce theme CSS tokens for light and dark themes.
3. Move current board content into the app shell workspace and tune desktop/mobile layout.
4. Replace background-driven rendering with token-driven app surfaces.
5. Remove background picker UI from board actions and app chrome.
6. Apply hover/focus disclosure to secondary controls and verify keyboard/touch access.
7. Run tests and build; manually inspect representative light, dark, system, desktop, collapsed-sidebar, and mobile states.

Rollback strategy: keep changes isolated to app shell, styling, and preference storage. Existing board data remains compatible because columns, cards, tags, and old background values are not destructively migrated.

## Open Questions

- Should collapsed/expanded sidebar state persist across sessions or reset per load?
- Should the sidebar include placeholder future navigation items immediately, or only current features such as Board, Tags, and Appearance?
- Should old background storage keys remain indefinitely or be removed in a later cleanup change?
