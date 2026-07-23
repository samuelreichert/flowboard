## 1. Sidebar consistency

- [x] 1.1 Define sidebar-specific compact-control sizing and token-driven hover, active, focus, and radius styles without changing global icon-button behavior.
- [x] 1.2 Apply the compact-control contract to sidebar toggle, collapsed navigation, and collapsed account trigger; resize the small avatar to fit it.
- [x] 1.3 Add sidebar tests for collapsed control geometry/state classes and manually verify expanded, collapsed, light, dark, desktop, and mobile-drawer states.

## 2. Column-management dialog flow

- [x] 2.1 Simplify Add column state ownership so Manage columns remains open while its child add dialog is active.
- [x] 2.2 Remove success-only manager reopen state and preserve validation, mutation, and board-level add-column entry points.
- [x] 2.3 Extend column-management tests for add save, close, Escape/outside dismissal, focus return, and rename parity.

## 3. Composer tag trigger

- [x] 3.1 Pass explicit empty versus selected trigger state through the composer tag picker and shared tag select.
- [x] 3.2 Split icon-only and text-chip composer tag styles, removing DOM-shape-based `:has()` sizing and aligning the selected summary.
- [x] 3.3 Add regression tests for circular empty trigger, selected summary alignment, and clearing tags back to the empty state.

## 4. Rich-text editor interaction

- [x] 4.1 Replace the paragraph option and trigger icon with Lucide `TextCursorInput` while keeping localized labels and toolbar accessibility unchanged.
- [x] 4.2 Refine card-content synchronization to ignore echoed local editor output and preserve valid external hydration without recursive updates.
- [x] 4.3 Preserve editor focus and selection across local autosave content updates and paragraph creation.
- [x] 4.4 Add rich-text tests for multi-character typing, Enter, local autosave, distinct external content, and the selected paragraph icon.

## 5. Desktop board scrolling

- [x] 5.1 Restore a subtle native horizontal scrollbar for overflowing desktop columns while retaining the mobile treatment.
- [x] 5.2 Add a bounded wheel-to-horizontal-scroll handler that respects native horizontal input, zoom modifiers, overflow, and horizontal boundaries.
- [x] 5.3 Add tests for consumable wheel movement and boundary passthrough; visually verify desktop mouse, trackpad, and mobile scrolling.

## 6. Validation

- [x] 6.1 Restore/install the workspace test runtime if needed and run focused feature tests.
- [x] 6.2 Run typecheck and the relevant visual/browser verification for sidebar, dialogs, composer, editor, and board overflow.
- [x] 6.3 Review the final diff for token reuse, duplicate CSS, accessibility names, keyboard paths, and unintended persistence/API changes.
