## Why

Flowboard users need column order to feel like a first-class board customization, not a fragile side effect of migrations or storage order. Reordering should be deliberate and accessible without introducing column drag-and-drop that could conflict with the existing card drag-and-drop model.

## What Changes

- Add a sidebar-level `Manage columns` command for global board column management.
- Add a Manage columns dialog that lets users reorder, rename, delete, and add columns from one place.
- Preserve the existing board-level add-column affordance.
- Add quick column movement commands to each column actions menu: `Move left`, `Move right`, `Move to first`, and `Move to last`.
- Keep unavailable movement commands visible but disabled at the relevant edges.
- Preserve the configured completed column silently when its visual order changes.
- Persist column order as canonical per-user board state.
- Do not introduce column drag-and-drop on the board surface.

## Capabilities

### New Capabilities
- `column-management`: Defines column management, ordering, rename/delete/add entry points, and board-menu movement behavior.

### Modified Capabilities
- `board-ui-affordance`: Sidebar board actions include the global Manage columns entry point.
- `structured-board-persistence`: Persisted board state preserves user-defined column order across reloads and authenticated structured persistence.

## Impact

- Affected UI: sidebar board actions, column action menus, column management dialog, existing add/rename/delete column flows.
- Affected state: board column ordering and completed-column configuration.
- Affected persistence: local storage board state and authenticated structured board records.
- Affected tests: column reorder behavior, disabled movement states, dialog actions, completed-column preservation, and persistence round-trips.
