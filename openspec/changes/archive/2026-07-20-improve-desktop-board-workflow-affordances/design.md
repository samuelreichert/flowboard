## Context

Flowboard already has the core primitives needed for this work: a board-scoped column list, a sticky card composer, shared dialog/select primitives, sidebar account controls, and rich text toolbar components. The UX findings point to gaps in how those pieces are composed on desktop rather than gaps in persistence, routing, or backend architecture.

The current board always appends the add-column placeholder inside the horizontally scrolling column list. The composer is disabled when no columns exist and can open the add-column flow, but the board itself does not present a strong first-run setup state. Composer submission clears only the draft, preserving destination column, priority, and tags for batch entry. Card detail uses a custom Base UI dialog composition instead of the shared DialogShell, and Manage Columns exposes all row actions with equal weight.

## Goals / Non-Goals

**Goals:**

- Make empty-board setup obvious from the board surface and composer.
- Keep the add-column affordance legible when desktop boards overflow horizontally.
- Preserve fast batch capture while making retained composer metadata visible and resettable.
- Make card and column actions easier to find without increasing visual density.
- Align dialog close and action treatments through shared primitives where practical.
- Keep local-mode account behavior honest while making Settings feel anchored.

**Non-Goals:**

- No board data model, API, auth, or persistence changes.
- No mobile redesign; desktop is the target scope.
- No AI history digest, generated work-cycle title, or completed-history storage change.
- No new editor formatting features beyond toolbar grouping and discoverability.
- No board-surface column drag-and-drop.

## Decisions

### Empty board uses a board-surface setup state

Use a board-level empty state when there are no columns. It should present one primary "Create first column" action that opens the existing add-column dialog. The composer remains visible but disabled, and its add-column affordance opens the same dialog.

Alternative considered: hide the composer until a column exists. That would simplify the empty board, but it weakens the user's understanding that the composer is the next step after creating a column.

### Horizontal overflow stays board-local

Keep the column list as the horizontal overflow owner, but make overflow visible through desktop edge treatment and ensure the add-column affordance is not mistaken for a clipped control. Prefer CSS-level overflow affordances and scroll padding before introducing a new sticky header action.

Alternative considered: move add-column entirely to a board header. That would make the control stable, but the app intentionally keeps the board header quiet and exposes board-level tools from the sidebar.

### Composer metadata remains batch-friendly with explicit reset

Keep current post-submit metadata persistence for rapid entry, but add a visible affordance after submission whenever non-default metadata is retained. The affordance should communicate what was kept and provide one-click reset to Medium priority and no tags while preserving the selected destination column.

Alternative considered: reset all metadata after every submit. That avoids stale metadata, but it removes useful batch-entry behavior and makes repeated capture noisier.

### Dense row actions move behind hierarchy, not removal

Manage Columns should keep up/down movement visible for scan-friendly reorder work. Lower-frequency actions such as move to top, move to bottom, and delete can move into a row action menu, with destructive confirmation unchanged. Rename can remain visible or move into the menu if the final row layout still gives it clear access.

Alternative considered: keep all existing icon buttons and rely on spacing only. That preserves direct access but does not solve the equal-weight density problem.

### Card detail action consistency comes from shared composition

Align card detail with shared dialog structure where feasible, including the close button treatment and a consistently visible action area. Because card detail contains a large editor, action placement should be resilient to scroll: either a sticky footer or a compact header action menu is acceptable as long as destructive and primary card-level actions are discoverable without scrolling.

Alternative considered: only restyle the current custom card dialog. That is lower-risk short term, but it leaves dialog behavior easier to drift from the rest of the app.

### Toolbar grouping is visual, not functional

The editor toolbar already has accessible labels and compact dropdowns. This change should group related controls visually and, if needed, move lower-frequency commands into a compact "More formatting" menu without removing keyboard access or existing command semantics.

Alternative considered: add text labels to all toolbar buttons. That would improve recognition but would conflict with the compact editor surface.

### Local mode may bypass a sparse account menu

When local mode only offers Settings and no profile or sign-out actions, the sidebar footer may open Settings directly or show a compact anchored menu with local identity context. Both preserve honest unauthenticated behavior; the implementation should choose the option that best fits collapsed and expanded sidebar states.

Alternative considered: keep the current sparse menu. That is technically correct, but it reads detached because there is no account-specific action in local mode.

## Risks / Trade-offs

- [Risk] Empty-state copy or visuals compete with the quiet board shell. -> Mitigation: use existing empty-state primitives and keep copy brief.
- [Risk] Overflow edge treatment hides content or complicates scrolling. -> Mitigation: verify three-plus-column desktop boards at common viewport widths and preserve native horizontal scrolling.
- [Risk] Metadata reset affordance adds noise to the composer. -> Mitigation: show it only when retained metadata differs from defaults or when tags are retained.
- [Risk] Moving column actions into a menu slows power users. -> Mitigation: keep one-step up/down movement visible and preserve top/bottom commands in the menu.
- [Risk] Sticky card dialog actions overlap editor content. -> Mitigation: give the editor content bottom padding and verify long-content scroll states.
- [Risk] Toolbar grouping changes keyboard order unexpectedly. -> Mitigation: keep logical group order and test toolbar keyboard navigation.
