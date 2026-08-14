## 1. Surface and control foundations

- [x] 1.1 Audit the current shell, column, card, overlay, and icon-button styles; map them to the existing semantic surface/elevation tokens and add only a minimal structural-separator token if evidence requires one.
- [x] 1.2 Consolidate comparable icon-only action controls behind shared circular geometry, hover, and focus styling without changing accessible names or text-button/chip geometry.
- [x] 1.3 Apply the restrained sidebar-to-workspace relationship at the app-shell level and confirm that cards remain visually above it in both themes.

## 2. Flat board lanes and raised cards

- [x] 2.1 Remove the persistent filled, bordered, rounded panel treatment from board columns while retaining stable lane width, aligned headers, and intentional spacing between lanes.
- [x] 2.2 Preserve card raised-surface treatment as the sole persistent board elevation and verify card hover/focus/drag styles remain spatially stable.
- [x] 2.3 Refine empty-lane, drag-over, and add-column treatments so they are clear, accessible, and transient without recreating a permanent column panel.
- [x] 2.4 Verify column-header actions remain discoverable through pointer hover, keyboard focus, and touch layouts after the visual restructure.
- [x] 2.5 Preserve horizontal overflow, scroll rail, composer clearance, and mobile horizontal board behavior with flat lanes.

## 3. Visual and interaction verification

- [x] 3.1 Capture and inspect populated, empty, drag-over, add-column, and horizontal-overflow board states in light and dark themes at desktop width.
- [x] 3.2 Capture and inspect the board, circular icon controls, composer, focused header action, and open menu at the mobile breakpoint; confirm no clipping or reduced touch target.
- [x] 3.3 Check contrast for required lane boundaries, icon-only actions, drag/drop indicators, and focus rings against their adjacent surfaces.
- [x] 3.4 Run lint, typecheck, relevant automated UI tests, and `git diff --check`; address regressions or document intentional visual expectation updates.

## 4. Feedback refinement

- [x] 4.1 Remove the persistent sidebar and brand-icon borders while preserving the workspace canvas boundary.
- [x] 4.2 Remove persistent full-height lane dividers and preserve column orientation through whitespace and aligned headers.
- [x] 4.3 Keep compact icon-button keyboard focus visible within the control boundary so it does not extend into or appear clipped by a header.

## 5. Typography and shell-token refinement

- [x] 5.1 Add a shared 15px, Noto Sans 500 structural-title role and apply it only to board column titles.
- [x] 5.2 Use one semantic neutral token for the sidebar and the app canvas surrounding the workspace in both themes.
- [x] 5.3 Add one perceptible, restrained shared workspace-shadow token to the desktop canvas while preserving the flatter card-to-canvas elevation hierarchy and the edge-to-edge mobile layout.
