## 1. Shared Select Primitive

- [x] 1.1 Create a reusable `DialogSelect` component for single-value dialog selects with shared trigger, value, popup, item, and selected-indicator structure.
- [x] 1.2 Migrate the card column select in `CardDialog` to `DialogSelect` while preserving value changes and labels.
- [x] 1.3 Migrate the card priority select in `CardDialog` to `DialogSelect` while preserving priority labels.
- [x] 1.4 Migrate the completed-column select in `BoardSettingsDialog` to `DialogSelect` while preserving unset-column behavior.
- [x] 1.5 Remove duplicated select composition markup that is no longer used.

## 2. Card Metadata Primitives

- [x] 2.1 Create reusable `PriorityBadge`, `TagChip`, and `CardMetadata` primitives using the existing card metadata class names.
- [x] 2.2 Move priority label formatting into the shared metadata primitive layer.
- [x] 2.3 Migrate board card metadata rendering to the shared primitives without changing visible priority, tag, or overflow output.
- [x] 2.4 Migrate completed-work history card metadata rendering to the shared primitives while preserving created-date display.
- [x] 2.5 Migrate archived-card detail priority and tag chips to shared primitives where appropriate.

## 3. Empty State Primitives

- [x] 3.1 Create centered `EmptyState` and compact `InlineEmptyState` primitives.
- [x] 3.2 Migrate completed-work history's no-cycles state to `EmptyState`.
- [x] 3.3 Migrate inline empty messages for tag manager, tag dropdown, board settings, history cycles, history details, and related helper messages to `InlineEmptyState` where it preserves layout.
- [x] 3.4 Remove duplicated empty-state CSS that is fully replaced by the shared primitives.

## 4. Dialog Shell Primitive

- [x] 4.1 Create a reusable `DialogShell` for standard Base UI dialogs with shared backdrop, viewport, popup, header, title, optional description, close affordance, body, and actions slots.
- [x] 4.2 Migrate `BoardSettingsDialog` to `DialogShell`.
- [x] 4.3 Migrate `TagManagerDialog` to `DialogShell`.
- [x] 4.4 Migrate `ColumnRenameDialog` to `DialogShell`.
- [x] 4.5 Migrate `ContentDialog` to `DialogShell` or keep it specialized with a documented reason if the wrapper makes the prompt flow less clear.
- [x] 4.6 Migrate the completed-work archived-card detail dialog to `DialogShell`.
- [x] 4.7 Leave `ConfirmDialog` on AlertDialog semantics and keep any alert-like destructive branches explicit.

## 5. Editor Asset Bubble Primitive

- [x] 5.1 Create a reusable `EditorAssetBubble` presentation component for URL display, edit form, validation error, cancel/apply actions, and edit/open/remove actions.
- [x] 5.2 Migrate the contextual link bubble to `EditorAssetBubble` while preserving link visibility rules and editor commands.
- [x] 5.3 Migrate the contextual image bubble to `EditorAssetBubble` while preserving image selection rules and editor commands.
- [x] 5.4 Remove duplicated link/image bubble presentation markup and any obsolete CSS.

## 6. Verification

- [x] 6.1 Run focused tests or app-level tests covering dialog workflows, card metadata display, completed-work history, tag management, and editor link/image actions.
- [x] 6.2 Run `npm run test:run`.
- [x] 6.3 Run `npm run build`.
- [x] 6.4 Manually inspect the affected UI patterns in light and dark themes if a dev server is available.
- [x] 6.5 Review the final diff to confirm the refactor did not change storage, API, service worker, or board-state semantics.
