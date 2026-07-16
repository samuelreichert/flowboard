## Why

Flowboard has several files that now carry multiple product and technical responsibilities in one place. The clearest example is `src/app/useAppController.ts`, but the same pattern appears in the rich text editor, app route shell, board columns, storage facade, global CSS, and app-level tests.

This makes changes harder to reason about because feature behavior, side effects, persistence, routing, view state, and presentation details are often coupled in the same module. Refactoring these boundaries will improve maintainability, reduce duplication, and make future changes safer without changing user-facing workflows.

## What Changes

- Split high-growth orchestrator modules into smaller hooks, services, reducers, and feature components with clearer single responsibilities.
- Move board mutation and persistence coordination out of presentational board components.
- Separate the rich content editor into editor schema/Markdown utilities, Tiptap lifecycle hooks, command/interactions hooks, viewer, toolbar, and bubble-menu presentation.
- Split app routing/auth-gate/shell composition from feature-specific UI in `App.tsx`.
- Separate storage concerns into local cache access, remote persistence, hydration, and migration/normalization boundaries.
- Move large global CSS sections closer to their component or feature owners while preserving existing design tokens and visual output.
- Split broad app-level tests into feature-focused suites that mirror the new module boundaries.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `app-routing`: Route parsing, protected-route decisions, redirects, and route-owned management surfaces remain behaviorally unchanged while app shell code is split into clearer modules.
- `app-shell-theme`: Theme preference, resolved theme, favicon updates, sidebar state, and shell styling remain behaviorally unchanged while controller and CSS ownership are separated.
- `supabase-auth`: Auth session loading, sign-in, sign-out, and profile identity behavior remain unchanged while auth controller logic is extracted from the main app controller.
- `user-profile`: Profile loading, avatar upload/removal, save errors, and profile dialog behavior remain unchanged while profile state/actions are separated.
- `authenticated-board-api`: Cloud board load/import/save behavior remains unchanged while persistence orchestration is isolated.
- `structured-board-persistence`: Local storage, remote board hydration, migrations, and normalization remain unchanged while storage modules are split by responsibility.
- `board-tag-management`: Tag creation, rename, delete, usage warnings, and tag assignment remain unchanged while shared tag validation and tag commands are centralized.
- `card-composer`: Composer draft, metadata selection, inline tag creation, and submit behavior remain unchanged while tag and meta-control logic is extracted.
- `card-board-movement`: Column/card CRUD, drag/drop reordering, modal card movement, and route-opened cards remain unchanged while board commands move out of `Columns`.
- `completed-work-history`: Work-cycle completion, history list/grid, archived-card routing, metadata display, and Markdown copy remain unchanged while history selection/detail logic is separated.
- `card-content-rich-editing`: Tiptap editor behavior, Markdown storage, image paste/drop, toolbar commands, URL validation, and contextual link/image actions remain unchanged while editor responsibilities are split.
- `shared-ui-primitives`: Existing shared primitives remain the preferred building blocks when splitting UI modules and CSS.

## Impact

- Highest-priority production files:
  - `src/app/useAppController.ts`
  - `src/components/CardContentEditor/index.tsx`
  - `src/App.tsx`
  - `src/components/Columns/index.tsx`
  - `src/storage/index.ts`
  - `src/App.css`
- Secondary production files:
  - `src/components/CardContentEditor/EditorToolbar.tsx`
  - `src/components/TagManagerDialog/index.tsx`
  - `src/components/CardComposer/index.tsx`
  - `src/components/CardComposer/ComposerMetaControls.tsx`
  - `src/components/CardDialog/useCardDialogController.ts`
  - `src/components/HistoryView/index.tsx`
  - `src/components/Card/index.tsx`
  - `src/board/validation.ts`
- Affected tests:
  - Split `src/App.test.tsx` into feature-focused suites.
  - Preserve or add focused coverage for auth routing, app shell, board commands, tag management, composer, card dialog, editor behavior, history, storage migration, and persistence.
- No stored board data migration, new dependencies, API contract changes, route changes, or visual redesign are expected.
