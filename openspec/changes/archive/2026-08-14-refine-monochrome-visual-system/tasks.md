## 1. Token foundation

- [x] 1.1 Inventory the current semantic and component-local color, shadow, and selected-state values, documenting the light/dark contrast pairs that must change.
- [x] 1.2 Define the neutral light and dark token scale for canvas, base/raised/overlay surfaces, foreground roles, borders, hover, selection, focus, solid-control foreground, backdrop, and elevation.
- [x] 1.3 Replace the generic teal primary and purple selected-state tokens with monochrome hierarchy roles and the shared ink-blue link/focus/selection accent; retain other non-neutral tokens only for destructive/error feedback.
- [x] 1.4 Remove or migrate component-local visual literals so shared tokens remain the sole source of presentation values.

## 2. Hierarchy and shared primitives

- [x] 2.1 Apply the neutral canvas, surface, border, and elevation tiers to the app shell, sidebar, board workspace, columns, cards, and composer.
- [x] 2.2 Establish the card as the reference raised surface with restrained default and hover/focus elevation.
- [x] 2.3 Apply the shared transient-surface treatment to standard dialogs, menus, selects, editor popovers, tooltips, and toasts.
- [x] 2.4 Align hover, selected, disabled, active-navigation, and keyboard-focus states across shared controls, using ink blue only for selection and focus.

## 3. Semantics and typography hierarchy

- [x] 3.1 Replace colored low/medium/high priority treatments with labelled monochrome severity treatments in light and dark themes.
- [x] 3.2 Verify destructive and error treatments retain explicit text/icon cues and accessible contrast.
- [x] 3.3 Confirm compact menus and selects render at 13px while card composition and rich-text editing remain at 15px across all shared implementations.
- [x] 3.4 Audit menus, selects, and editor popovers beside their invoking content to ensure popup typography and elevation do not overpower the content.

## 4. Accessibility and visual verification

- [x] 4.1 Measure normal-size essential text and solid-control foreground/background pairs in both themes; resolve any pair below 4.5:1.
- [x] 4.2 Verify keyboard focus contrast and state visibility for buttons, icon controls, fields, menus, selects, cards, and sidebar navigation.
- [x] 4.3 Capture and review light/dark screenshots for board, card composer/editor, open column menu, dialog, dropdown/tag picker, settings, toast, and tooltip.
- [x] 4.4 Verify empty, focused, disabled, long single-line, multiline, popup-near-edge, desktop, mobile, and reduced-motion-relevant states.
- [x] 4.5 Run lint, typecheck, targeted browser/e2e checks, and a final diff review.

## 5. Motion refinement

- [x] 5.1 Remove spatial transform feedback from card hover while retaining border and elevation feedback.
- [x] 5.2 Verify cards remain spatially stable on hover and preserve transform feedback during drag.

## 6. App-shell tonal hierarchy

- [x] 6.1 Make the light sidebar a softer gray neutral than the near-white workspace while preserving white card elevation.
- [x] 6.2 Verify the sidebar/workspace tonal hierarchy in the local preview.
