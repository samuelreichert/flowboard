## Context

The current codebase has several modules whose file size reflects mixed responsibility rather than only natural complexity:

- `useAppController.ts` mixes auth, profile, board persistence, local hydration, theme/favicon effects, sidebar/dialog state, tag commands, completed-work commands, and derived app view state.
- `CardContentEditor/index.tsx` mixes editor extension/schema setup, Markdown/HTML serialization, URL validation, file handling, editor lifecycle, toolbar state, link/image popover state, bubble-menu interactions, viewer rendering, and editor rendering.
- `App.tsx` mixes auth gate UI, redirect UI, 404 UI, route parsing decisions, navigation side effects, shell composition, and route-owned dialog behavior.
- `Columns/index.tsx` mixes local board state, storage writes, column/card CRUD, card move commands, drag/drop monitor wiring, active-card route lookup, and board rendering.
- `storage/index.ts` mixes localStorage access, remote API writes, hydration, migration, normalization, and public storage facade behavior.
- `App.css` mixes design tokens, app shell, auth, not-found, sidebar, profile avatar, buttons, menus, settings, profile dialog, completion pulse, and history styles.
- `App.test.tsx` mirrors this coupling by testing nearly every feature from one large suite.

The refactor should preserve behavior while creating modules that have one clear reason to change.

## Goals / Non-Goals

**Goals:**

- Preserve all current user workflows, storage formats, routes, auth behavior, cloud save/import behavior, visual output, and accessibility semantics.
- Extract responsibilities in small, reviewable phases with tests after each high-risk phase.
- Keep modules aligned to feature boundaries: app shell, auth, profile, board state, tags, composer, card dialog, editor, history, storage, and styling.
- Centralize repeated validation and command logic where duplicate behavior already exists.
- Reduce controller/component prop surfaces where possible by grouping related state/actions behind focused hooks or controller objects.
- Split broad test coverage into focused suites without losing regression coverage.

**Non-Goals:**

- Redesign the app UI or change the product workflow.
- Replace React, Base UI, Tiptap, Supabase, Prisma, or the existing storage model.
- Convert all state management to a new external store.
- Rewrite every component for stylistic consistency unrelated to responsibility boundaries.
- Change route names, localStorage keys, authenticated API contracts, or persisted card Markdown.

## Decisions

### Split `useAppController` into focused app-level hooks

Create focused hooks/services around the responsibilities currently bundled in `useAppController`:

- `useAuthSession` owns Supabase session bootstrapping, auth state changes, magic link/social sign-in, and sign-out.
- `useAuthenticatedBoardSync` owns authenticated board load, local-board import into an empty cloud board, save status, and authenticated board persistence.
- `useAuthenticatedProfile` owns profile load/save state, avatar upload/removal coordination, and profile errors.
- `useAppThemeEffects` owns system-theme subscription, theme preference writes, document theme, and favicon updates.
- `useBoardController` or `useBoardActions` owns board-level commands currently exposed through the app controller: sync, clear board, update tags, delete tag, choose completed column, open/confirm completed work.
- Keep a thin `useAppController` facade permanently, but restrict it to composition and adaptation. It may call focused hooks, group related state/actions, and provide a stable app-shell contract to route composition. It must not own domain mutations, network calls, storage writes, document/window effects, or large derived workflows directly.

Keep `appReducer` for UI shell state unless a smaller reducer split naturally falls out of the extraction. The initial goal is responsibility separation, not a state-management rewrite.

This keeps `RoutedApp` focused on route decisions and shell composition. If `RoutedApp` consumed all focused hooks directly, it would likely become the new mega-controller. The facade is acceptable because its single responsibility is app-level wiring.

Alternative considered: replace the app controller with React context or an external store. Rejected because the current problem is responsibility mixing, and introducing a new state architecture would increase scope and risk.

Alternative considered: remove the facade and let `RoutedApp` consume `useAuthSession`, `useAuthenticatedBoardSync`, `useAuthenticatedProfile`, `useAppThemeEffects`, and board action hooks directly. Rejected because route composition would then accumulate the same cross-feature responsibilities currently concentrated in `useAppController`.

### Move board mutations out of `Columns`

Extract pure board commands for column and card operations:

- create, rename, delete columns
- create, edit, move, delete cards
- reorder cards from drag/drop targets
- derive active-card route targets

The `Columns` component should render columns, wire drag/drop monitor callbacks to board commands, and delegate persistence through a controller callback. It should not directly own localStorage writes or encode every board mutation inline.

Use pure helpers where possible so card/column behavior can be tested without rendering the full app.

Board command helpers should live under `src/board`, not under `src/components/Columns`. The commands describe board domain behavior and are already adjacent to domain modules such as `completedWork.ts`, `routeLookup.ts`, and `validation.ts`. Keeping them under `Columns` would imply the behavior belongs to one presentation component and would make reuse by app-level controllers, dialogs, tests, and future views harder.

Alternative considered: keep mutations in `Columns` and only split rendering components. Rejected because persistence and mutation logic are the more important coupling risk.

Alternative considered: keep board commands under `src/components/Columns` until the boundary stabilizes. Rejected because the boundary is already clear: column/card mutations are board domain rules, while `Columns` should render and wire interactions.

### Split the content editor by editor boundaries

Break `CardContentEditor/index.tsx` into modules such as:

- `editorMarkdown.ts` for Markdown normalization, HTML escaping/rendering helpers, and alignment/image serialization concerns.
- `editorExtensions.ts` for Tiptap extension configuration and rich paragraph/heading extensions.
- `editorCommands.ts` for heading/list/alignment/link/image command helpers and URL validation.
- `useCardContentEditor.ts` for editable Tiptap lifecycle and value synchronization.
- `useCardContentInteractions.ts` for copy status, URL popovers, link/image bubble state, selection refs, file paste/drop, and window/clipboard interactions.
- `CardContentViewer.tsx` for readonly rendering.
- Keep `EditorToolbar`, `EditorBubbleMenus`, and `EditorAssetBubble` as presentation components, with further extraction of toolbar popover forms if needed.

The split should preserve Markdown as the storage boundary and keep URL validation behavior unchanged.

Alternative considered: rewrite the editor around Tiptap JSON or a custom document model. Rejected because the current behavior and tests are Markdown-oriented.

### Split app route shell from auth and fallback screens

Move `AuthGate`, `AuthRedirect`, `NotFoundView`, and route-gate helper logic out of `App.tsx`. Keep `App.tsx` as the `BrowserRouter` entry and a thin `RoutedApp` composition layer or move route orchestration into an `AppRoutes` module.

Route-owned settings and tag-manager close behavior should remain explicit and tested. The refactor should make route decisions easier to test without rendering the full shell.

Alternative considered: introduce a full route config framework. Rejected because the existing route helpers already provide enough structure.

### Split storage into local, remote, and migration modules

Separate `src/storage/index.ts` into modules with narrower reasons to change:

- local board cache access and localStorage key handling
- remote board API write/hydration queue for the optional `VITE_BOARD_API_URL`
- board-state migration and normalization helpers
- public facade functions that preserve existing imports during migration

Avoid changing public function names in the first pass unless call sites are updated in the same small step. Keep storage tests focused on the public facade and add helper-level tests for migration/persistence behavior where useful.

Alternative considered: introduce repository classes or dependency injection everywhere. Rejected because a module split and pure helpers should give most of the benefit with less ceremony.

### Centralize repeated tag validation and tag commands

Tag name trimming, duplicate detection, creation, rename validation, and tag removal from cards are implemented across tag manager, composer, card dialog, and app controller. Add board/tag helpers that:

- validate tag names consistently
- create tag objects with injected ID generation where tests benefit
- rename tags immutably
- remove tag references from board columns

UI components can still own their local error display and editing state, but validation rules should have one source of truth.

Alternative considered: extract one shared tag picker for every tag UI. Rejected for this change because each surface has different interaction needs; validation/commands are the duplication risk.

### Move CSS toward feature ownership

Keep global tokens in `App.css` or a dedicated global stylesheet, but move feature-specific blocks into nearby component CSS files:

- app shell/sidebar/persistence status under app shell ownership
- auth and not-found styles near extracted auth/fallback views
- settings/profile/history styles near their components
- profile avatar styles near `ProfileAvatar`
- shared button and menu styles under shared primitive stylesheets, not in `App.css`

Make CSS moves after component ownership is clarified to avoid churn. Use visual checks for sidebar, auth gate, route-owned dialogs, profile dialog, history, editor, and mobile states.

Shared button/menu CSS should move to shared primitive ownership, for example `src/components/Button/Button.css` and `src/components/Menu/Menu.css`, or a single shared primitive stylesheet if wrapper components are not introduced immediately. The important boundary is that `.button`, `.button--primary`, `.button--subtle`, `.button--danger`, `.menu-popup`, `.menu-item`, and menu danger/separator styles no longer live in app-shell CSS.

Alternative considered: convert to CSS modules. Rejected because this is not needed to establish ownership and would increase review size.

### Split the broad app test suite by feature

Do not aggressively split `App.test.tsx` before production boundaries exist. In the first implementation pass, leave broad integration coverage in place while adding focused tests for newly extracted pure helpers and hooks. Then, as each production responsibility moves to an owned module, move the matching tests in the same phase.

In practical terms, "not aggressive first" means:

- keep existing app-level tests available as the safety net while refactoring production code
- add new focused tests for extracted board commands, tag helpers, storage helpers, and editor helper modules as they appear
- move only the tests whose production owner is already extracted
- keep a small final app-shell smoke suite for cross-feature wiring

The end state should split `App.test.tsx` into focused suites, for example:

- `app/auth-routing.test.tsx`
- `app/routes.test.tsx` or expand existing route tests
- `components/CardComposer/CardComposer.test.tsx`
- `components/CardDialog/CardDialog.test.tsx`
- `components/CardContentEditor/CardContentEditor.test.tsx`
- `components/TagManagerDialog/TagManagerDialog.test.tsx`
- `components/HistoryView/HistoryView.test.tsx`
- `board/boardCommands.test.ts`
- storage tests remain under `src/storage`

Prefer shared test helpers for common render/setup, but avoid one giant helper file that becomes a new dumping ground.

Alternative considered: keep one integration suite and add unit tests only. Rejected because the current integration suite is already hard to navigate and mirrors production coupling.

Alternative considered: split `App.test.tsx` completely before production refactors. Rejected because that would create large test churn before module ownership is clear and could weaken the safety net during behavior-preserving refactors.

## Risks / Trade-offs

- [Risk] Behavior-preserving refactors can accidentally change route-owned dialog close behavior. Mitigation: keep route-focused tests before and after the `App.tsx` split.
- [Risk] Extracting board commands can change persistence timing or active work-cycle normalization. Mitigation: test pure command output and run storage/app integration coverage after moving persistence calls.
- [Risk] Editor extraction can disturb Tiptap selection, link/image popovers, image paste/drop, or Markdown round-tripping. Mitigation: preserve existing tests before moving code and run focused editor tests after each extraction.
- [Risk] Splitting CSS can cause subtle visual regressions. Mitigation: move styles by component ownership, preserve class names where possible, and verify desktop/mobile/light/dark states.
- [Risk] A facade that preserves old imports can hide incomplete extraction. Mitigation: keep temporary facade modules thin and add follow-up tasks to remove unused compatibility exports.
- [Risk] Splitting tests can lose integration confidence. Mitigation: keep a small smoke-level app-shell integration suite plus focused feature suites.

## Migration Plan

1. Add tests or preserve current tests around the highest-risk behaviors before extraction.
2. Extract pure helpers first: board commands, tag validation, storage migration helpers, editor URL/Markdown helpers.
3. Extract controller hooks while keeping the top-level app controller facade stable.
4. Split large UI components after their logic is isolated.
5. Move CSS only after component ownership is clear.
6. Split tests by feature once production boundaries exist.
7. Remove obsolete compatibility code and unused exports after all call sites are migrated.

No user data migration is required. Rollback is a normal code revert because persisted schemas, route contracts, API contracts, and environment variables are unchanged.

## Open Questions

- None. The original architectural questions are resolved in the decisions above.
