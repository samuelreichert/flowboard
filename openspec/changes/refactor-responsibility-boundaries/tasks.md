## 1. Baseline And Safety Nets

- [x] 1.1 Review the current behavior covered by `src/App.test.tsx`, `src/storage/offline.test.ts`, `src/board/validation.test.ts`, and editor-related tests to identify coverage that must survive the refactor.
- [x] 1.2 Add or preserve focused regression tests for auth route gating, route-owned settings/tags close behavior, board CRUD, tag deletion from cards, completed-work flow, editor Markdown round-tripping, image paste/drop, and storage hydration.
- [x] 1.3 Record the current high-risk file list and intended destination modules in a short refactor checklist so implementation can proceed in small commits.

## 2. Extract Board And Tag Domain Helpers

- [x] 2.1 Create pure board command helpers under `src/board` for create/rename/delete column, create/edit/move/delete card, clear board, and reorder-card operations.
- [x] 2.2 Move active-card route-target derivation or related board lookup helpers behind reusable functions where `Columns` and routing code need them.
- [x] 2.3 Create shared tag helpers for trim/duplicate validation, create tag, rename tag, and remove a tag from all cards.
- [x] 2.4 Update `Columns`, `CardDialog`, `CardComposer`, `TagManagerDialog`, and app controller code to use the shared board/tag helpers without changing UI behavior.
- [x] 2.5 Add unit tests for board commands and tag helpers, including duplicate tag names, empty tag names, card moves across columns, and tag removal from assigned cards.

## 3. Split Storage Responsibilities

- [x] 3.1 Move localStorage key handling, read/write helpers, and local cache updates into a local storage module.
- [x] 3.2 Move optional database API hydration/write queue behavior into a remote persistence module.
- [x] 3.3 Move board-state migration and normalization helpers into a migration or persistence-normalization module while preserving existing public behavior.
- [x] 3.4 Keep a public storage facade that preserves current imports during the first pass.
- [x] 3.5 Update storage tests to cover the facade and any newly extracted migration/remote/local helper behavior.

## 4. Split App Controller Responsibilities

- [x] 4.1 Extract Supabase auth session state, magic-link sign-in, social sign-in, and sign-out into a focused auth hook.
- [x] 4.2 Extract authenticated board load/import/save status and persistence into a focused board-sync hook.
- [x] 4.3 Extract authenticated profile load/save/avatar behavior into a focused profile hook.
- [x] 4.4 Extract theme preference, system-theme subscription, document theme, and favicon side effects into a focused theme-effects hook.
- [x] 4.5 Extract board action handlers for tags, clearing, completed-column selection, and completed-work confirmation into a focused board action hook.
- [x] 4.6 Keep `useAppController` as a permanent thin composition facade that groups focused hooks for `RoutedApp`, with no direct domain mutations, network calls, storage writes, or document/window effects.
- [x] 4.7 Run auth, profile, board sync, theme, and completed-work tests after each extraction group.

## 5. Split App Routing And Shell Composition

- [x] 5.1 Move `AuthGate` into an auth-focused component module with its local form state intact.
- [x] 5.2 Move `AuthRedirect`, `NotFoundView`, `getLocationDestination`, and `shouldRenderAuthGate` into route/shell-focused modules.
- [x] 5.3 Keep `App.tsx` as the router entry and make `RoutedApp` or an extracted `AppRoutes` module responsible only for route composition.
- [x] 5.4 Preserve route-owned management behavior for settings and tag manager dialogs.
- [x] 5.5 Verify root redirect, sign-in/auth-callback behavior, protected routes, unknown routes, active-card routes, and archived-card routes.

## 6. Split Board Rendering Components

- [x] 6.1 Update `Columns` to consume board command helpers and delegate persistence through a narrow callback or controller.
- [x] 6.2 Extract column-list rendering, active-card missing state, add-column dialog ownership, and drag/drop monitor wiring if they remain mixed after board command extraction.
- [x] 6.3 Extract reusable card drag/drop behavior from `Card` into a hook while preserving selection guards and route navigation behavior.
- [x] 6.4 Keep `Column` focused on column rendering, menu/dialog ownership, and card list composition.
- [x] 6.5 Verify card creation, editing, deletion, moving via modal, DnD reorder, column rename/delete, and active-card route behavior.

## 7. Split Card Composer And Dialog Responsibilities

- [x] 7.1 Move composer tag creation/validation to shared tag helpers while keeping composer UI state local.
- [x] 7.2 Split `ComposerMetaControls` into smaller column select, priority select, and tag picker modules if the file remains difficult to scan.
- [x] 7.3 Split `useCardDialogController` into focused hooks or helpers for autosave, title editing, tag creation/selection, delete confirmation, and derived labels.
- [x] 7.4 Ensure card dialog and composer continue sharing validation rules without sharing inappropriate UI state.
- [x] 7.5 Verify composer keyboard submit, inline tag creation, selected column/priority/tags, card autosave, delete confirmation, and title fallback behavior.

## 8. Split Rich Content Editor Responsibilities

- [x] 8.1 Move Markdown normalization, HTML escaping/rendering, and alignment/image serialization helpers into an editor Markdown module.
- [x] 8.2 Move Tiptap extension setup and rich paragraph/heading extensions into an editor extensions module.
- [x] 8.3 Move URL normalization/validation and editor command helpers for headings, lists, alignment, links, and images into command/helper modules.
- [x] 8.4 Move editable Tiptap lifecycle/value synchronization into `useCardContentEditor`.
- [x] 8.5 Move copy status, popover state, bubble-menu state, selection refs, file paste/drop, clipboard, and external open behavior into `useCardContentInteractions`.
- [x] 8.6 Move readonly rendering into a dedicated `CardContentViewer` module.
- [x] 8.7 Split `EditorToolbar` popover form sections or toolbar primitives if the toolbar remains too broad after editor logic moves out.
- [x] 8.8 Verify Markdown copy, links, code, lists, task lists, heading/alignment, image file drop/paste, image URL insert/edit/remove, toolbar active states, and hover tooltips.

## 9. Split History And Completed-Work Presentation

- [x] 9.1 Extract history sorting, route-target resolution, selected-card derivation, tag-name resolution, and copy-status behavior into helpers or a focused hook.
- [x] 9.2 Split history cycle/card list rendering from archived-card detail dialog rendering.
- [x] 9.3 Keep completed-work domain behavior in `src/board/completedWork.ts` and use presentation modules only for rendering/detail interactions.
- [x] 9.4 Verify empty history, missing archived card routes, grid/list layout switching, archived detail metadata, and Markdown copy.

## 10. Split CSS Ownership

- [x] 10.1 Keep global design tokens in a global stylesheet.
- [x] 10.2 Move auth-gate and not-found styles near their extracted components.
- [x] 10.3 Move app shell/sidebar/persistence status styles near app shell components.
- [x] 10.4 Move profile avatar/profile dialog, settings, completion pulse, and history styles near their owning components.
- [x] 10.5 Move shared `.button` and `.menu-*` styles out of `App.css` into shared primitive CSS ownership, such as `src/components/Button/Button.css` and `src/components/Menu/Menu.css` or an equivalent shared primitive stylesheet.
- [x] 10.6 Preserve class names where practical to reduce visual churn, and remove obsolete global blocks only after migrated components render correctly.
- [x] 10.7 Visually verify desktop, mobile, light theme, dark theme, sidebar collapsed/expanded, route dialogs, profile dialog, history detail, and editor surfaces.

## 11. Split Tests By Feature

- [x] 11.1 Keep `App.test.tsx` mostly intact during the first production refactor phases so it remains the integration safety net.
- [x] 11.2 Add focused tests next to newly extracted pure helpers and hooks as they are created, starting with board commands, tag helpers, storage helpers, and editor helper modules.
- [ ] 11.3 Extract shared render/setup/test helper utilities only when at least two moved test suites need them, and avoid creating a large catch-all helper module.
- [ ] 11.4 Move auth and route tests into focused app route/auth suites after auth and route modules are extracted.
- [ ] 11.5 Move composer, card dialog, tag manager, history, editor, board command, and storage tests into feature-owned suites as each production owner is extracted.
- [ ] 11.6 Keep a small app-shell integration smoke suite for cross-feature wiring.
- [ ] 11.7 Run the full suite after each test split to confirm no coverage was lost.

## 12. Verification

- [x] 12.1 Run `npm run test:run`.
- [x] 12.2 Run `npm run build`.
- [x] 12.3 Run `npm run format:check` or format touched files.
- [x] 12.4 For UI-affecting phases, run a local dev server and inspect key responsive states before calling the refactor complete.
- [ ] 12.5 Review the final diff to confirm no route names, storage keys, API payloads, auth flows, persisted Markdown, or visible workflows changed unintentionally.
