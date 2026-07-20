## Context

Flowboard has a mature Base UI foundation: standard dialogs use `DialogShell`,
single-value choices use `Select`, rich content uses `Toolbar`, and several
forms use `Field`. The remaining gaps are composite controls that recreate
roles and focus behavior with native elements: the account menu, two tag
listboxes, the segmented control, editor hints, mobile sidebar, and three
ordinary fields. The dependency parent branch upgrades Base UI to 1.6.

The change must preserve board/card/tag mutation behavior, localization,
existing component styling, desktop navigation, and the separate toast work.

## Goals / Non-Goals

**Goals:**

- Make interaction semantics come from the matching Base UI primitive rather
  than hand-applied ARIA roles or event logic.
- Preserve all existing account, tag, settings, history, composer, editor,
  profile, and sign-in workflows.
- Give mobile navigation modal focus, Escape, outside-dismissal, and scroll
  behavior while keeping the desktop sidebar static.
- Keep shared behavior and styling in reusable primitives.

**Non-Goals:**

- Change persistence endpoints, mutation contracts, data models, or routes.
- Add search, asynchronous filtering, or a new tag-management workflow.
- Replace native file selection, Tiptap BubbleMenu behavior, or drag-and-drop.
- Add, alter, or migrate toast notifications.

## Decisions

### Use Base UI Menu items for account commands

Replace the manually role-wired account buttons with `Menu.Item` and the
divider with `Menu.Separator`. Keep the controlled menu state only where the
account workflow still needs it; menu-item selection owns normal close and
keyboard behavior.

Alternative considered: retain native buttons with `role="menuitem"`. This
keeps keyboard focus and dismissal behavior as application responsibility and
does not use the existing menu primitive fully.

### Create one multi-tag select around Base UI Select

Create a shared `TagMultiSelect` composed from controlled `Select.Root
multiple`, trigger, portal, positioner, popup, list, items, and indicators.
It accepts selected tag IDs, emits the next ID list, and renders the existing
inline tag-creation `Field` after the selectable list. Card-dialog callers
derive the one assignment change needed by their existing resource mutation;
composer callers store the returned list in draft state.

`Select` is preferred over `Combobox` because the current workflow begins
with a compact summary trigger and a finite list, not a searchable text input.
If search becomes a product requirement, the shared API can be backed by
`Combobox multiple` without changing callers.

Alternative considered: migrate each existing custom listbox independently.
That would duplicate popup composition, selected styling, create-tag handling,
and keyboard tests.

### Use ToggleGroup for exclusive segmented state

Refactor the shared segmented control to controlled `ToggleGroup` and
`Toggle` items. Its adapter ignores an empty next value so existing theme and
history-layout controls always retain one active value. CSS moves from local
button assumptions to Base UI pressed/disabled data state while preserving the
current visual selection indicator.

Alternative considered: retain `Button` plus `aria-pressed`. It is valid
markup, but leaves group-level selection and keyboard interaction outside the
primitive intended for this pattern.

### Use Base UI Tooltip for editor hints

Replace `ToolbarHint` with a reusable tooltip composition using `Tooltip.Root`,
trigger, portal, positioner, and popup. Keep the editor-specific portal target
to avoid dialog clipping. Disabled toolbar controls use a non-disabled wrapper
as the trigger so their label remains available.

Alternative considered: improve the custom hover label. That still requires
the application to reproduce tooltip focus, dismissal, positioning, and
accessibility behavior.

### Split static sidebar content from modal mobile navigation

Extract reusable sidebar content from its outer layout. Keep the desktop
sidebar as a static `<aside>`, and render the mobile version inside a
controlled modal `Drawer.Root` with portal, backdrop, viewport, popup, title,
and close control. The existing `mobileSidebarOpen` state remains the source of
truth; `onOpenChange` writes back to it, so navigation and route actions retain
their current close behavior. The header opener composes with the drawer
trigger where possible.

Alternative considered: wrap the always-rendered sidebar in a drawer. Desktop
and mobile require different containment and positioning, so that approach
would make desktop navigation modal or duplicate accessibility state.

### Expand Field composition without changing form ownership

Use `Field.Root`, label, control, description/error wiring for profile display
name and magic-link email. Render the composer textarea through `Field.Control`
with a textarea element so the existing label/error relationship is owned by
the field. Continue using local controlled React state and native form
submission/validation; do not introduce a form library. Leave the avatar file
input native.

Alternative considered: introduce Base UI Form or React Hook Form. Neither is
necessary for the small controlled forms and would expand the scope beyond
interaction alignment.

## Risks / Trade-offs

- [Risk] Multi-select changes could close after every tag or change the
  existing assign/unassign request sequence. → Mitigation: control open state,
  derive only the changed IDs for existing-card mutations, and cover creation,
  selection, deselection, outside dismissal, and composer reset tests.
- [Risk] Drawer migration could duplicate sidebar landmarks or leave hidden
  controls focusable. → Mitigation: render exactly one visible navigation
  surface per breakpoint and verify focus, Escape, outside click, and desktop
  collapse behavior.
- [Risk] Tooltip triggers on disabled buttons may not receive pointer events.
  → Mitigation: use a wrapper trigger and test hover/focus for enabled and
  disabled editor commands.
- [Risk] Base UI data attributes alter CSS selectors. → Mitigation: update the
  shared control CSS once and verify light/dark plus compact/mobile states.

## Migration Plan

1. Start the implementation branch from the dependency-update PR branch and
   target that PR as its base.
2. Implement shared, low-risk menu/toggle/tooltip/field primitives first.
3. Replace both tag callers through the shared multi-select, then migrate the
   mobile drawer after sidebar content is separated.
4. Run focused behavior tests, typecheck, React Doctor, and desktop/mobile
   visual checks before opening the stacked implementation PR.
5. After the dependency PR merges, retarget or rebase the implementation PR
   onto `main`.

Rollback is a normal UI-only revert. No data migration, API rollback, or toast
change is required.

## Open Questions

- None blocking. Search/filtering remains intentionally deferred; the first
  multi-select release preserves the current finite-list tag picker.
