## Why

Flowboard now has several visually related controls implemented independently, which makes small UI fixes easy to apply in one place and miss in another. Consolidating repeated dialog, select, metadata, editor bubble, and empty-state patterns will reduce styling drift while preserving the current product behavior.

## What Changes

- Add reusable shared UI primitives for common Flowboard component patterns:
  - dialog shell/header/action structure
  - dialog select controls
  - priority badges, tag chips, and card metadata rows
  - contextual editor asset bubbles for links and images
  - empty-state and inline empty-message treatments
- Refactor existing call sites to use those primitives without changing board data, card data, persistence, routing, or visible workflows.
- Preserve current Base UI accessibility behavior for dialogs, selects, popovers, fields, and editor surfaces.
- Keep component-specific layout differences as explicit props or local wrappers rather than duplicating full implementations.

## Capabilities

### New Capabilities
- `shared-ui-primitives`: Covers reusable UI primitives for repeated Flowboard dialog, select, metadata, editor bubble, and empty-state patterns.

### Modified Capabilities
- None.

## Impact

- Affected UI components:
  - `src/components/BoardSettingsDialog`
  - `src/components/CardDialog`
  - `src/components/ColumnRenameDialog`
  - `src/components/ContentDialog`
  - `src/components/HistoryView`
  - `src/components/TagManagerDialog`
  - `src/components/Card`
  - `src/components/CardContentEditor/EditorBubbleMenus.tsx`
- Affected styling:
  - shared dialog/select styles in `src/components/ContentDialog/ContentDialog.css`
  - card metadata styles in `src/components/Card/Card.css`
  - history, tag manager, and editor CSS where component-specific empty states or bubbles are currently defined
- Affected tests:
  - existing app-level interaction tests in `src/App.test.tsx`
  - targeted tests may be added or adjusted for shared primitives where practical
- Related existing capabilities remain behaviorally unchanged:
  - `base-ui-alignment`
  - `card-metadata`
  - `completed-work-history`
- No data migration, new dependencies, API changes, or storage changes are expected.
