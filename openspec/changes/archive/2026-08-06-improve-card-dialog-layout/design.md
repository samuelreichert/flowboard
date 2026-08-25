## Context

`DialogShell` currently gives dialogs a 480px maximum width, while individual
surfaces add unrelated width overrides. The card dialog is an exception at
720px, but its 24px padding leaves a 672px editor canvas. It also places a
sticky footer containing only Delete card below three vertically stacked
metadata fields and a 300px-minimum editor. This concentrates secondary and
destructive controls in the most space-constrained editing surface.

The application already has an accessible Base UI menu pattern with a visible
danger item and confirmation-gated destructive actions. The card dialog will
reuse that pattern.

## Goals / Non-Goals

**Goals:**

- Establish a shared, semantic width vocabulary for dialogs.
- Give standard dialogs a defined 600px width and the card editor an 800px
  writing surface while keeping existing viewport gutters.
- Reduce the vertical footprint of card metadata and remove the permanent
  Delete card footer.
- Keep deletion deliberate, discoverable, keyboard accessible, and protected
  by the existing confirmation flow.
- Keep long card content to one dialog-level scroll surface rather than adding
  a scrollable editor nested inside another scrollable dialog.

**Non-Goals:**

- Changing card persistence, autosave behavior, or delete confirmation copy.
- Reworking rich-text commands, editor serialization, or metadata values.
- Making every dialog full-screen or changing the mobile route-management
  presentation.
- Introducing a visual redesign outside the shared dialog and card-editor
  surfaces.

## Decisions

### Use semantic dialog size variants

`DialogShell` will expose `compact`, `default`, and `wide` size variants. The
default is `default`, so callers without an explicit size use a 600px dialog.
The shared CSS will express the selected width through a custom property and
constrain it with the existing `calc(100vw - 48px)` viewport gutter.

| Size | Width | Intended use |
| --- | ---: | --- |
| `compact` | 480px | Confirmations and focused single-purpose prompts |
| `default` | 600px | Settings, management, and standard forms |
| `wide` | 800px | Card editing and content-heavy surfaces |

Existing one-off sizing rules for standard shell dialogs will migrate to these
variants. Route-management's mobile full-screen treatment remains a
route-specific layout exception. `ConfirmDialog`, which does not use
`DialogShell`, will explicitly retain the compact size class.

**Alternative considered:** retain 480px as the shell default and add only a
card width override. This would preserve the ambiguity that caused the
inconsistent dialog widths and would leave normal form dialogs unnecessarily
narrow.

### Put card deletion in header actions

`DialogShell` will accept an optional header action slot beside its close
button. `CardDialog` will render an ellipsis-triggered actions menu in that
slot, with Delete card as the final danger-styled item. Selecting it invokes
the existing delete confirmation state and confirmation dialog.

The sticky `actions` footer and the delete-only footer component will be
removed. Save errors will remain visible in the card-dialog body so autosave
feedback is not lost when the footer disappears.

**Alternative considered:** hide the existing footer until hover. This still
creates a reserved footer region, makes a destructive action visually tied to
editing, and is less predictable for keyboard users.

### Compact card metadata above the editor

The column and priority controls will share a two-column metadata grid in the
wide card dialog. Tags will use the full row so multi-select content can grow
without squeezing either control. At the mobile breakpoint the grid returns to
a single column. Labels and existing accessible names remain available.

The editor remains part of the dialog's single scrolling content area. Its
minimum writing height will be reduced enough that common card content fits in
the initial viewport after metadata compaction; long content continues to
scroll at the dialog boundary.

**Alternative considered:** put all metadata behind a collapsed Properties
section. It would save more space, but would make routine card organization
less visible and add an extra interaction to common edits.

## Risks / Trade-offs

- [A wider default can make focused prompts feel too broad] → Assign
  `compact` explicitly to confirmation and single-input dialogs.
- [A header menu can make Delete card less immediately visible] → Use the
  existing ellipsis pattern, a danger-styled menu item, and the existing
  confirmation dialog.
- [Very long content must still scroll somewhere] → Keep exactly one
  dialog-level scroll surface and avoid a second editor scrollbar.
- [Metadata controls may wrap in translated or narrow layouts] → Use a
  responsive one-column layout at the mobile breakpoint and preserve the
  existing viewport gutters.

## Migration Plan

1. Add the size API and shared CSS width tokens while retaining responsive
   viewport constraints.
2. Migrate existing shell dialogs and confirmation dialogs to semantic sizes.
3. Move the card action, compact metadata, and remove the sticky footer.
4. Verify dialog widths, menu keyboard behavior, deletion confirmation,
   autosave feedback, and desktop/mobile scroll states.

Rollback consists of reverting the UI-only change; no stored data or API
migration is involved.

## Open Questions

None. The selected widths are compact 480px, default 600px, and wide 800px.
