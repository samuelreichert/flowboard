## Why

The current board gives each column the same visual treatment as a card: a filled, bordered, rounded panel. That competes with the cards—the movable units that actually represent work—and leaves the board less scanable and less premium than the intended Flowboard character.

This is the right time to establish a consistent surface hierarchy across the board and shell: calm structural containers, clearly elevated work items, and compact controls that feel intentional rather than decorative.

## What Changes

- Make board columns structural and flat: remove their persistent card-like surface treatment and distinguish adjacent columns through measured whitespace and header alignment rather than persistent dividing lines.
- Reserve white raised surfaces, borders, and low elevation for cards; retain a temporary, clear drop-state treatment during card drag-and-drop.
- Refine the light app shell into a muted navigation rail beside a near-white workspace canvas, with one deliberate bordered and softly shadowed workspace boundary rather than repeated rounded panels.
- Standardize icon-only actions as circular controls with shared geometry, while keeping text actions visually distinct.
- Define an explicit three-level elevation model for cards, overlays, and dialogs; columns and ordinary layout containers remain flat.

## Capabilities

### New Capabilities

- `board-surface-hierarchy`: The board visually distinguishes flat structural columns from elevated work cards while preserving card creation, overflow, and drag-and-drop workflows.

### Modified Capabilities

- `app-shell-theme`: The app shell gains an explicit sidebar-to-workspace surface relationship and shared circular icon-control geometry.
- `shared-ui-primitives`: Reusable icon-only controls and overlay surfaces use the refined shape and elevation roles.

## Impact

- Affected code: `src/components/Columns/Columns.css`, `src/components/Column/Column.css`, card styles, app-shell/layout styles, and shared button/overlay primitives.
- No API, database, routing, or dependency changes are expected.
- Visual validation will cover populated and empty columns, drag-over, horizontal overflow, keyboard focus, open menus, desktop, and mobile layouts in light and dark themes.
