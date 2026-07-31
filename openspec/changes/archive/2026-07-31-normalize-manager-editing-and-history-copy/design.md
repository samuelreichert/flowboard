## Context

The Tag manager already edits names inline, while Manage columns opens a second
rename dialog and splits column commands between direct icons and an overflow
menu. The archived-card dialog places its text-labeled Markdown copy action in
the metadata toolbar instead of next to the readonly content it copies.

The application already has Base UI dialogs, menus, tooltips, a shared
icon-button treatment, focused tag/column resource mutations, and a `640px`
mobile breakpoint. The API accepts tag names up to 40 characters, whereas the
tag-manager input currently permits 60.

## Goals / Non-Goals

**Goals:**

- Make tag and column rename interactions follow one inline-edit contract.
- Make all column commands directly discoverable on desktop without losing a
  compact, accessible smartphone layout.
- Keep all existing reorder, confirmation, mutation, routing, and dialog-return
  behavior intact.
- Place archived Markdown copy feedback at the content surface without relying
  on a tooltip as the only accessible result signal.
- Establish one source of truth for client/server tag-name length limits.

**Non-Goals:**

- Changing column creation, board-surface column menus, board column drag and
  drop, persistence APIs, or stored data.
- Adding bulk tag/column operations, drag-to-reorder in the manager, or undo.
- Changing the active-card content-editor Copy Markdown control.

## Decisions

### Inline manager-row editing

Both managers will keep their names in the row and replace the row summary
with a focused input when Rename is activated. Enter validates and commits,
Escape restores the original name, and a valid blur commits. Empty or duplicate
values do not persist and preserve the original entity name. This keeps the
existing tag interaction's low-friction editing model while removing the
nested column dialog and its on-every-keystroke persistence.

The shared presentation will be a manager action-group/row primitive or a
small shared composition built from the existing `IconButton` treatment. It
will own action spacing, separators, focus treatment, and destructive styling;
each manager retains its own entity metadata, validation, and mutation
callbacks. A fully generic manager component was rejected because column
reordering and tag-usage confirmation would obscure more behavior than it
would actually share.

### Responsive column-action source and presentation

Each column will expose one declarative action list: move to first, move
previous, move next, move to last, rename, and delete. Desktop renders that
list as six labeled icon buttons with visual separators; unavailable move
commands remain present and disabled at the list edges. Delete follows a
separator and keeps its destructive visual treatment and confirmation.

At the existing smartphone breakpoint (`max-width: 640px`), the icon rail is
not rendered or focusable. A single `Column actions for <title>` menu trigger
is rendered instead, using the same action list in the same order, text menu
labels, icons, disabled states, and a divider before Delete. This preserves
feature parity without requiring horizontal scrolling or a too-dense action
row. Rendering from one action definition prevents desktop and mobile commands
from drifting.

Tags retain their compact direct Rename/Delete icon rail at every width because
it has only two actions. It uses the same shared spacing and separator
treatment as desktop columns.

### Content-anchored archived Markdown copy

The archived-card copy action will move inside the readonly content container
as an icon-only, top-right floating control. Its Base UI tooltip is a concise
visible label: `Copy Markdown` by default and `Copied` for a short timeout
after a successful clipboard write. The button itself retains the stable,
action-based accessible name `Copy Markdown`; a visually hidden polite status
announces successful copy for assistive technology.

The action renders only when archived content exists. Clipboard failures do not
show a false success state. The tooltip is portaled so it is not clipped by the
scrolling content surface, and the floating control remains reachable while
that surface scrolls.

### Shared validation boundaries

Export tag-name and column-title maximums from a pure board-domain module that
both the client controls and authenticated route normalization can import. Set
the tag manager's create and inline-edit inputs to the API-supported
40-character maximum; preserve the existing 80-character column-title limit.
This removes the current client/API disagreement without changing accepted API
values.

### Localization and verification

All newly visible menu, tooltip, status, and validation copy will use the
existing localized message catalog. Tests will cover direct desktop actions,
the mobile-only menu and its disabled commands, inline edit keyboard/validation
behavior, deletion confirmation, copy success/failure feedback, and narrow
viewport behavior.

## Risks / Trade-offs

- [Six desktop icons can make a row visually busy] → Separators group the
  actions, Delete is visually lower-emphasis, and the full rail only appears
  where width supports it.
- [Duplicate desktop/menu markup could create duplicate tab stops] → Render
  only the applicable responsive action surface with `display: none` on the
  inactive surface, and test keyboard reachability at both breakpoints.
- [Blur can accidentally commit a rename] → Preserve Escape cancellation,
  validate before every commit, and keep invalid changes from persisting.
- [Clipboard permissions can fail] → Change success feedback only after
  `writeText` resolves; preserve the copy action for a retry.
- [Floating controls can obscure or be clipped by content] → Reserve the
  control's interaction layer, use a dialog-level tooltip portal, and verify
  long content at desktop and mobile widths.

## Migration Plan

No data migration is required. Deploy the client interaction changes and the
shared validation constants together; existing tag and column mutations retain
their endpoints and payloads. Rollback consists of restoring the previous
client presentations; stored board, history, and API data remain compatible.

## Open Questions


None.
