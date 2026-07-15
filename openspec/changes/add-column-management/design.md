## Context

Flowboard currently stores columns as ordered board state, renders them by `position`, and persists authenticated board columns through structured `sortOrder` records. Users can drag cards on the board, but columns are not draggable and currently cannot be reordered through the UI.

The new feature treats column order as canonical per-user board state. Column management should feel deliberate, work on mobile, and avoid ambiguity with existing card drag-and-drop.

## Goals / Non-Goals

**Goals:**
- Expose Manage columns as a sidebar-level board action.
- Provide a Manage columns dialog for reorder, rename, delete, and add-column entry points.
- Add horizontal quick-move commands to each column actions menu.
- Use vertical movement language inside the dialog and horizontal movement language on the board.
- Persist reordered columns through local storage and authenticated structured persistence.
- Preserve completed-column configuration by column ID without prompting when column order changes.
- Keep movement controls accessible to keyboard and assistive technology users.

**Non-Goals:**
- Do not add board-surface column drag-and-drop.
- Do not remove the existing board-level Add another column affordance.
- Do not introduce toast or undo behavior for reorder operations.
- Do not add workflow guardrails that force completed or done columns to the right.
- Do not introduce multi-board or collaborative ordering semantics beyond the current per-user board state.

## Decisions

### Use a Manage columns dialog as the primary reorder surface

The sidebar should open a global Manage columns dialog because column ordering is board-wide, not specific to a single column. The dialog should list columns vertically and expose vertical movement controls such as Move up, Move down, Move to top, and Move to bottom.

Alternatives considered:
- Board-surface column dragging: rejected because it could conflict with the established card drag-and-drop behavior.
- Only per-column menu commands: rejected because it is slower for larger reorganizations and hides the full column order.
- A position picker: deferred because simple movement controls are clearer and sufficient for the current product.

### Keep column action menus as quick horizontal shortcuts

Each column actions menu should include Move left, Move right, Move to first, and Move to last. These commands mirror the horizontal board layout and should be disabled, not hidden, when unavailable at the edges.

Alternatives considered:
- Hide unavailable commands: rejected because disabled commands make the command set stable and explain edge-state constraints.
- Use dialog language in board menus: rejected because "left/right" matches the visible board direction better than "up/down".

### Preserve completed-column identity by ID

Reordering columns must not change the configured completed column because the setting already tracks a column ID. The system should update visual order silently and keep completion behavior stable.

Alternatives considered:
- Prompt when the completed column moves: rejected because the behavior does not change.
- Infer completed column from right-most position: rejected because Flowboard is intentionally flexible and already supports explicit completed-column configuration.

### Normalize and persist column order consistently

Reorder operations should produce a single canonical column array order and positions that round-trip through both local storage and structured persistence. The implementation should avoid relying on incidental migration or creation order when reconstructing board state.

Alternatives considered:
- Store a separate order preference: rejected because current product state is one user per board and column order is board state.
- Keep only array order without positions: rejected because current types and persistence already include explicit ordering fields.

## Risks / Trade-offs

- Reorder state can drift if array order and position values disagree -> Normalize positions when applying reorder operations and verify persistence round-trips.
- The Manage columns dialog could duplicate existing column actions -> Reuse existing dialogs/validation where possible and keep one source of truth for add, rename, delete, and movement logic.
- Disabled commands may feel noisy on small menus -> Keep labels concise and group movement commands clearly.
- Mobile dialog rows can become crowded -> Use compact icon buttons with accessible labels and stable row sizing.
- Existing data affected by prior migration ordering may remain incorrect until the user reorders -> The feature provides a deliberate recovery path without attempting risky automatic inference.
