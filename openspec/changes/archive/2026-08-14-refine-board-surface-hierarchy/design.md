## Context

The monochrome visual-system change established neutral tokens, a soft-gray sidebar, an almost-white workspace, and card/overlay shadow tokens. The board still applies a subtle filled surface, border, and large radius to every `.column`, while each card is also white, bordered, rounded, and elevated. This creates two competing container levels where the work item needs to be the primary visible object.

The desired product language combines Linear's flat, dense board structure with the calm surfaces and controlled depth found in Codex and ChatGPT. The change is visual only: existing column management, card drag-and-drop, keyboard access, persistence, and responsive behavior remain intact.

## Goals / Non-Goals

**Goals:**

- Make columns easy to scan as distinct board lanes without making them raised panels.
- Make cards the sole persistent raised unit within a board lane.
- Give the sidebar, workspace, cards, overlays, and dialogs clear and limited surface/elevation roles.
- Make circular icon-only actions visually and interactively consistent.
- Preserve accessible state disclosure in light and dark themes.

**Non-Goals:**

- Replacing the Kanban workflow with a list/table layout or copying Linear's UI pixel-for-pixel.
- Changing column widths, ordering rules, card data, composer placement, persistence, or routing.
- Applying large corner radii, shadows, or circular styling to text-bearing controls indiscriminately.
- Introducing a new brand color, glass effect, or animation system.

## Decisions

### Columns become flat lanes, cards remain raised work units

The persistent `.column` surface will lose its filled background, enclosing border, and container radius. A header, a stable lane width, and generous spacing between lanes will preserve orientation; there will be no persistent full-height divider. Cards retain the existing raised-surface token, border, and card shadow.

This aligns the visual model with the data model: a column organizes work; a card is work. Retaining card-like columns was considered, but rejected because it makes the board visually nested and weakens scanability. A full-height divider was rejected after visual review because it overstates the column boundary; measured whitespace and header alignment retain orientation more quietly.

### Show stronger lane feedback only for meaningful transient states

An empty lane and a drag-over lane will retain clear drop affordances. Those affordances use the existing ink-blue interaction token and a bounded dashed/filled treatment only while the state is active; they do not recreate a permanent column panel. Column header actions remain discoverable on focus, hover, and touch layouts.

### Limit elevation to three semantic levels

The existing token system will be expressed as a fixed hierarchy: flat structural surfaces (sidebar/workspace/columns), low elevation (cards and the composer), and overlay elevation (menus, popovers, dialogs). The workspace boundary uses a restrained border and single soft shadow as the app-shell relationship, remaining below card elevation; no nested workspace/card-like column treatment is introduced.

Heavy, ambient shadows were considered but rejected because they make a productivity board feel decorative and interfere with the requested restrained character.

### Establish circular icon-control geometry as a reusable primitive

Icon-only triggers will use one square target with `border-radius: 50%`, shared neutral default/hover/focus states, and no text-chip padding. Desktop targets will be visually compact while mobile/touch layouts preserve a 44px minimum interaction area. Text-bearing actions retain their existing button or menu-item geometry.

Making every action pill-shaped was considered but rejected: a text label and a glyph-only action communicate different interaction density and should remain distinguishable.

### Keep the shell contrast understated but intentional

The sidebar remains the softer gray navigation rail without an enclosing border; the workspace stays near-white with one inset boundary and a perceptible but restrained shared workspace shadow. The ink-blue accent remains reserved for focus, selection, links, and active transient board states. Icon focus uses an inset ring so the visible keyboard indicator does not extend beyond a compact header control.

## Risks / Trade-offs

- [Flat columns can become difficult to distinguish in a large board] → Preserve lane widths, header alignment, and measured gaps; verify scanning with populated and empty lanes.
- [Circular icon controls can reduce tap targets when made visually compact] → Separate visual diameter from touch target and verify at the mobile breakpoint.
- [A more pronounced app-shell boundary can compete with cards] → Keep the shell boundary below card elevation and compare populated/empty boards in both themes.
- [Drag feedback can be weakened by removing the lane panel] → Preserve an explicit ink-blue empty/drop indicator and verify keyboard and pointer drag flows.

## Migration Plan

1. Map the existing column panel styles to flat-lane tokens and introduce any minimal separator token needed by the new role.
2. Consolidate icon-only button geometry in the shared primitive, then migrate matching triggers without changing their accessible names or behavior.
3. Apply the shell boundary only after the flat board and card hierarchy are established.
4. Verify populated, empty, drag-over, overflow, focus, open-menu, desktop, mobile, light, and dark states; run lint, typecheck, and relevant UI tests.
5. Roll back by reverting the styling/primitive commit; no data migration or API rollback is required.

## Open Questions

- None. Visual review selected spacing and header alignment instead of a continuous lane divider.
