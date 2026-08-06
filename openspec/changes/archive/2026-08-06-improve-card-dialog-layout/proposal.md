## Why

The card editor presents a permanent destructive action and uses its available
height inefficiently, so ordinary card edits can feel cramped and scroll-heavy.
Dialog widths are also defined as one-off CSS overrides instead of a shared,
intentional system.

## What Changes

- Introduce semantic compact, default, and wide dialog sizes with a defined
  responsive width for each size.
- Make the standard dialog size suitable for ordinary forms while retaining a
  compact size for confirmations and focused single-purpose dialogs.
- Make the card editor use the wide dialog size and compact its editable card
  metadata so more writing space is visible initially.
- Move card deletion from the persistent dialog footer into an accessible
  header actions menu; retain the existing confirmation before deletion.
- Remove the card dialog's sticky destructive footer and avoid editor-specific
  nested scrolling for ordinary card content.

## Capabilities

### New Capabilities

- `dialog-layout`: Defines semantic dialog sizing and the focused card-editor
  layout and action model.

### Modified Capabilities

<!-- None. Existing card metadata, rich editing, and deletion confirmation
     requirements remain in effect; this change defines their dialog layout. -->

## Impact

- Affected components: `DialogShell`, `ContentDialog`, `ConfirmDialog`,
  `CardDialog`, and their shared styles and tests.
- Affected card-editor layout: metadata controls, header actions, and dialog
  height/scroll behavior.
- No data-model, persistence API, or dependency changes.
