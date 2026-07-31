## Why

Tag and column management use different rename and action-discovery patterns,
which makes two closely related board-maintenance workflows feel inconsistent.
The archived-card Markdown action also competes with metadata instead of living
beside the readonly content it copies.

## What Changes

- Normalize tag and column renaming around focused inline editing in their
  respective management rows, with shared keyboard and validation behavior.
- Give tag and desktop column rows a consistent, separated icon-action rail;
  retain all column reorder, rename, and delete capabilities.
- On smartphone widths, replace the dense column icon rail with one accessible
  actions menu that contains the same commands, including a separated
  destructive delete action.
- Move the archived-card Copy Markdown control to an icon-only floating action
  in the readonly content surface. Its tooltip changes from `Copy Markdown` to
  `Copied` after a successful copy and the result is also announced accessibly.
- Align tag-manager client validation with the API's 40-character tag-name
  limit so a value accepted by the field is accepted by the mutation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `board-tag-management`: Define inline tag editing, action-rail behavior, and
  client validation consistent with tag persistence rules.
- `column-management`: Define responsive column action presentation and inline
  renaming while preserving all existing management commands.
- `completed-work-history`: Define the floating, accessible Markdown-copy
  action in archived-card details.

## Impact

- Affected client areas: `TagManagerDialog`, `ManageColumnsDialog`,
  `ColumnRenameDialog`, `HistoryView`, localization, and shared icon/tooltip
  styling.
- Existing focused tag and column resource mutations remain the persistence
  mechanism; no API contract, database schema, or dependency changes are
  required.
- Tests will cover inline editing, responsive desktop/mobile action discovery,
  copy success feedback, validation limits, and existing deletion/reorder
  behavior.
