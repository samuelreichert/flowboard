## Context

PR 1 added lean authenticated read endpoints:

- `GET /api/board/bootstrap` returns board metadata, columns, active card
  summaries, tags, and active work-cycle state.
- `GET /api/board/cards/:cardId` returns rich content for one active card.

The React app is still a Vite SPA using `react-router` for URL state, not Remix
or React Router loaders/actions. Authenticated board reads currently flow
through `useAuthenticatedBoardSync`, `fetchAuthenticatedDefaultBoard`, and the
legacy full-board response. Authenticated profile reads use a custom
`useEffect` and local state. Normal writes still call the legacy full-board
`PUT /api/boards/:id` path.

TanStack Query v5 uses one `QueryClientProvider`, explicit `queryKey` values,
and `useQuery` query functions for server state. Its persistence plugins can
hydrate successful queries from browser storage when configured with a
persister, `maxAge`, and `gcTime`. User-owned cached data must be cleared on
logout or user changes.

## Goals / Non-Goals

**Goals:**

- Add TanStack Query as the app's authenticated server-state read layer.
- Keep query keys centralized and small.
- Use the lean bootstrap endpoint to render the authenticated board surface.
- Load rich active-card content only when a card detail is opened.
- Cache profile, bootstrap, and recently opened card details across reloads.
- Preserve existing board behavior while legacy full-board writes still exist.
- Keep local SQLite no-Supabase mode working through the same API shapes.

**Non-Goals:**

- Do not add new history endpoints in this PR.
- Do not replace card, column, tag, board settings, work-cycle, or history
  mutations.
- Do not remove `/api/boards/default`, `/api/boards/:id`, or legacy full-board
  `PUT` yet.
- Do not move to React Router loaders/actions or Remix-style data APIs.
- Do not persist the entire board, all history details, or every old card detail
  indefinitely in browser storage.

## Decisions

### Use TanStack Query for server reads, not router loaders

Flowboard already uses React Router as a declarative SPA router. TanStack Query
fits the migration because it can be introduced around existing components and
later expanded to mutations without changing route architecture.

Alternative considered: React Router loaders/actions. That would create a larger
routing migration before the API migration is complete.

### Create a single app-level query client

Add a provider near `src/main.tsx` or the top-level app shell so profile,
bootstrap, and card-detail hooks share one cache. Defaults should be
conservative:

- `staleTime`: short enough to refresh naturally, long enough to avoid immediate
  reload churn.
- `gcTime`: at least as long as persisted cache `maxAge` when persistence is
  enabled.
- `refetchOnWindowFocus`: disabled unless a later product decision wants
  auto-refresh behavior.

Alternative considered: local query clients per feature. That would fragment
cache invalidation and make logout cleanup harder.

### Keep query keys centralized

Create a small query key module, for example:

```ts
export const queryKeys = {
  profile: ['profile'] as const,
  board: {
    bootstrap: ['board', 'bootstrap'] as const,
    card: (cardId: string) => ['board', 'cards', cardId] as const,
  },
};
```

Do not add history query keys until history has focused endpoints.

Alternative considered: inline query keys in components. That increases the
chance of cache misses and inconsistent invalidation in later mutation PRs.

### Bootstrap drives the board surface

Authenticated board loading should request `GET /api/board/bootstrap` through
TanStack Query and adapt it into the board surface state needed by columns,
cards, tags, background, and active work-cycle UI. Bootstrap card summaries must
not invent rich content.

Card content indicators should rely only on fields available in bootstrap. If
the existing bootstrap response does not expose "has content", this PR should
not show the content icon based on placeholder content; it can add a lean
boolean in a follow-up API adjustment only if the UI needs that signal.

Alternative considered: keep full-board reads as the primary board source. That
would not solve bootstrap payload growth or reload speed.

### Card detail hydrates on demand

When an active card dialog opens from click or direct route, use
`GET /api/board/cards/:cardId` through `useQuery`. The dialog should show the
summary title/metadata immediately when available, then fill rich content when
the detail query resolves.

The card-detail query is disabled until a card id is available. Missing or
cross-owner cards keep the existing missing-card route behavior.

Alternative considered: preload every card detail after bootstrap. That rebuilds
the full-board payload over many requests and defeats the purpose of lean
bootstrap.

### Profile reads move to TanStack Query

Profile display should use `GET /api/profile` through a query hook and keep the
existing session-derived fallback while the query is pending or unavailable.
Profile save can remain as the current imperative call in this PR, but it must
update or invalidate the profile query after success.

Alternative considered: leave profile outside TanStack Query. That would keep a
second custom server-state pattern for no product benefit.

### Persist only small successful queries

If query persistence is enabled in this PR, use TanStack Query's persistence
packages with a sync storage persister and dehydration filter. Persist only:

- `['profile']`
- `['board', 'bootstrap']`
- successful `['board', 'cards', cardId]` entries within the configured cache
  age

Use a cache buster string for schema changes and clear persisted user-owned
queries on sign-out or authenticated user change.

Alternative considered: persist the whole query cache. That can store large
history/card content data and recreates the old browser-database problem.

### Guard legacy full-board writes

Until resource mutations replace the full-board `PUT`, any save that starts from
summary-first bootstrap data must preserve server data that bootstrap did not
load:

- rich content for active cards that have not been detail-hydrated
- completed work history

The safest bridge is to load the legacy full-board snapshot lazily before the
first legacy full-board save that cannot prove it has complete content/history,
merge the user's current surface changes into that snapshot, then submit the
merged full state. This keeps initial reads lean while avoiding destructive
full-board saves.

Alternative considered: put empty strings into `BoardCard.content` for
bootstrap cards and continue saving normally. That risks wiping rich card
content and completed history.

## Risks / Trade-offs

- Summary data can overwrite rich data if old save code is reused blindly ->
  legacy full-board saves must merge with a complete snapshot before `PUT`.
- Query persistence can leak one user's cached board to the next session on a
  shared browser -> clear query cache and persisted cache on sign-out/user
  change; do not persist owner identifiers.
- A first legacy save after bootstrap may need one full-board read -> acceptable
  temporary bridge until card/resource mutation PRs remove full-board writes.
- Direct card routes can render before detail data arrives -> keep the existing
  loading/missing target behavior and only declare missing after the detail query
  resolves.
- Persisted cache can become stale -> use short `staleTime`, bounded `maxAge`,
  and normal query refetch on mount after hydration.

## Migration Plan

1. Add TanStack Query dependencies and provider.
2. Add query key and query hook modules.
3. Move profile read to a query hook and update cache after profile save.
4. Move authenticated board bootstrap read to a query hook and adapt the lean
   response into the board surface.
5. Move active-card detail opening to a query hook.
6. Add selective persisted cache if payload size stays small in tests.
7. Add the legacy full-board save guard before any summary-backed state can call
   `PUT /api/boards/:id`.
8. Verify authenticated tests, route tests, card dialog tests, profile tests,
   typecheck, and React Doctor.

Rollback is straightforward: remove the provider/hooks usage and return
`useAuthenticatedBoardSync`/`useAuthenticatedProfile` to their previous
imperative reads while keeping the PR 1 API endpoints available.

## Open Questions

- Should the bootstrap response include a lean `hasContent` boolean for board
  card content indicators, or should the icon disappear until detail is opened?
  The current PR should avoid loading rich content just to support that icon.
- Should persisted card detail cache use a shorter max age than bootstrap?
  A single global max age is simpler; separate ages are possible if detail cache
  grows too quickly.
