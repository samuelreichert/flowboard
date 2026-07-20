## Why

Flowboard already uses Base UI for many dialogs, selects, menus, and editor
controls, but several composite interactions still recreate the library's
selection, menu, tooltip, field, and modal-navigation behavior manually. Base
UI 1.6 is now the dependency baseline, making this the right time to complete
the accessible-primitive alignment without changing board data or toast UI.

## What Changes

- Replace manually role-wired account-menu actions with Base UI menu items and
  separators.
- Replace the composer and card-dialog custom tag listboxes with one reusable,
  Base UI-backed multi-select tag control while retaining inline tag creation.
- Rebuild the shared exclusive segmented control with Base UI toggle-group
  semantics for theme and history layout selection.
- Replace custom editor hover hints with Base UI tooltips while keeping the
  compact toolbar layout.
- Replace the CSS-only mobile sidebar/backdrop with a modal Base UI drawer that
  owns dismissal, focus, and background interaction behavior.
- Align the remaining profile, sign-in, and composer text controls with the
  existing Base UI field composition, retaining native file selection and the
  current controlled-state logic.
- Do not add or change toast notifications; that work remains explicitly out
  of scope.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `base-ui-alignment`: Expand the required Base UI mapping to menus, tag
  selection, segmented controls, tooltips, and practical non-dialog fields.
- `app-shell-theme`: Strengthen mobile navigation from visual drawer behavior
  to modal drawer behavior with predictable keyboard dismissal and focus.
- `board-tag-management`: Require accessible multi-tag selection while
  preserving tag creation and assignment persistence.

## Impact

- Affects `App`, app-shell/sidebar components and CSS, tag picker components,
  the shared segmented control, editor toolbar controls, and profile, auth, and
  composer fields.
- Adds no persistence, server API, schema, or toast-notification changes.
- Uses the Base UI 1.6 primitives already supplied by the dependency-update
  parent branch.
