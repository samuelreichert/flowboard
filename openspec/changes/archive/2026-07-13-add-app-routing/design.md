## Context

Flowboard is a React/Vite single-page app with a state-driven shell. The current app reducer owns `currentView`, dialog booleans own board settings and tag management, each active card owns its own detail dialog state, and the History view owns archived-card detail state. This makes the browser URL independent of what the user is viewing.

The app now also supports Supabase-authenticated sessions and authenticated board persistence. When Supabase is configured, signed-out users see the auth entry point before board data can load. Current OAuth redirects return to the app origin, which would lose a copied route such as `/board/cards/:cardId` or `/history/cycles/:cycleId/cards/:cardId`.

The static server, Vercel configuration, and PWA fallback already serve the SPA for nested paths, so this change can focus on client route ownership and auth redirect preservation.

## Goals / Non-Goals

**Goals:**

- Introduce canonical, copyable URLs for board, history, tags, board settings, active card details, archived card details, sign-in, and auth callback flows.
- Make route state the source of truth for page selection and route-addressable dialogs.
- Preserve requested internal destinations through Supabase OAuth and magic-link sign-in.
- Resolve active and archived card routes after board data loads, including missing-resource states.
- Keep the current local-first/static mode usable when Supabase is not configured.

**Non-Goals:**

- Add multi-board selection UI.
- Replace the authenticated board API or introduce per-card API endpoints.
- Change board/card/tag/history persistence schemas unless required for route resolution.
- Make archived cards editable.
- Build sharing permissions between different users.

## Decisions

### Use React Router in library mode

Use React Router as a client-side routing dependency in the existing Vite SPA. The first implementation should use library/declarative routing primitives or an equivalent lightweight `createBrowserRouter` setup without adopting React Router framework mode.

Rationale: Flowboard already has its data layer, auth session handling, persistence messages, and Vite setup. The routing need is URL/state coordination, nested parameters, active navigation, back/forward handling, and direct-load behavior. Framework mode would add more architectural surface than this change needs.

Alternatives considered:

- Hand-rolled `window.history` integration: avoids a dependency, but recreates params, active links, nested route matching, and back/forward behavior.
- React Router framework mode: powerful, but unnecessary while Flowboard is not moving data loading/actions into route modules.

### Keep app routes canonical and auth routes transitional

Canonical app routes:

```text
/board
/history
/tags
/settings
/board/cards/:cardId
/history/cycles/:cycleId/cards/:cardId
```

Auth routes:

```text
/sign-in
/auth/callback
```

`/` should resolve to `/board`. Unknown paths should render a recoverable not-found state with a way back to `/board`.

Rationale: Users should save app destinations, not auth callback URLs. `/auth/callback` exists to settle the Supabase session and return to a safe internal destination.

### Render route-owned management surfaces responsively

`/tags` and `/settings` should keep the board as the base workspace. They should render as dialogs on larger screens and as full-page management surfaces on mobile viewports. `/board/cards/:cardId` should render the board and open the active card dialog for that card. `/history/cycles/:cycleId/cards/:cardId` should render history and open the archived card dialog for that archived snapshot.

Closing a route-owned dialog navigates to its base route:

- active card closes to `/board`
- archived card closes to `/history`
- tags closes to `/board`
- settings closes to `/board`

Rationale: This preserves the current UI model while making the URL the owner of what is open. Browser back should naturally close dialogs that were opened through navigation.

### Treat deleted active card links as missing

When an active card link cannot be resolved from the active board after board data loads, show a missing-card state. Do not search completed work history for an archived snapshot with the same original card ID.

Rationale: `/board/cards/:cardId` identifies an active board card. Falling through to history would make a stale active-board URL silently change meaning.

### Preserve deep links in the visible URL while signed out

When Supabase is configured and a signed-out user opens a protected app route, keep the requested URL visible and render the auth entry point in place. `/sign-in` remains available for explicit sign-in, but protected-route deep links should not be rewritten to `/sign-in?next=...` just to show the auth screen.

Rationale: The copied link remains honest and recognizable. After the session becomes valid, the same route can resolve without needing to restore a separate route stack.

### Use `/auth/callback` with a safe internal next destination

OAuth and magic-link requests should redirect to `/auth/callback` with a preserved internal destination. The destination must be same-origin/internal before navigation. If the destination is missing or invalid, the callback navigates to `/board`.

Rationale: Supabase redirect targets must be allow-listed, and callback handling must avoid open redirects. A single internal callback route gives both OAuth and magic-link flows the same post-auth return behavior.

### Redirect signed-in users away from sign-in

When a signed-in user opens `/sign-in`, navigate to a safe internal `next` destination when one is present. Otherwise navigate to `/board`.

Rationale: Signed-in users should not remain on an authentication entry point, and explicit sign-in links can still complete a preserved intended destination.

### Resolve board data before route targets

Active card and archived card routes should wait for board hydration/authenticated board loading before deciding whether a card or cycle is missing. Missing active cards should show the board with a recoverable message. Missing archived cycles or archived cards should show history with a recoverable message.

Rationale: During authenticated loading, route targets are temporarily unknown. Treating that transient state as not found would create flicker and false errors.

### Defer explicit board IDs

Initial canonical routes should target the currently loaded/default board. The implementation should avoid naming assumptions that prevent future `/boards/:boardId/...` routes, but multi-board route structure is out of scope for this change.

Rationale: The current client loads `/api/boards/default` and has no board picker. Adding board IDs to every route now would imply product behavior that the UI does not yet expose.

## Risks / Trade-offs

- Protected deep links can appear as signed-out pages with app URLs in the address bar → Keep auth copy clear and avoid implying data loaded before authentication.
- Route-owned dialogs require moving dialog state out of deeply nested components → Introduce small lookup/controller helpers so `Columns`, `Card`, and `HistoryView` do not duplicate route parsing.
- Active card links can become stale after deletion or archival → Provide recoverable missing-resource states and navigate close actions back to the base page.
- Auth redirects can become open redirects if `next` accepts arbitrary URLs → Only allow same-origin path/search/hash values and fall back to `/board`.
- Future multi-board routes may need a route migration → Keep route constants and helpers centralized so `/boards/:boardId` can be added without hunting literals.
- Browser back behavior may conflict with existing modal close behavior → Route-owned dialogs should close by navigation, while non-route confirmation dialogs remain local UI state.

## Migration Plan

1. Add the routing dependency and wrap the existing app shell in the router.
2. Centralize route constants, route generation helpers, and safe next-destination parsing.
3. Convert sidebar navigation and route-addressable dialogs to route-owned behavior.
4. Add active and archived card route resolution after board hydration.
5. Update Supabase OAuth and magic-link redirect handling to use `/auth/callback`.
6. Add tests for direct route loads, protected deep links, callbacks, back/forward behavior, missing route targets, and static/local mode.
7. Verify production/static direct loads still fall back to the SPA for nested routes.

Rollback can remove the router wrapper and restore local reducer/dialog navigation because no persisted data migration is required.

## Open Questions

None.
