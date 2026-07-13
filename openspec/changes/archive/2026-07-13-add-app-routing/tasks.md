## 1. Routing Foundation

- [x] 1.1 Add React Router as the client routing dependency and update package lockfiles.
- [x] 1.2 Add centralized route constants and path builders for board, history, tags, settings, active cards, archived cards, sign-in, and auth callback routes.
- [x] 1.3 Add safe internal destination parsing for auth callback `next` values and fallback to `/board`.
- [x] 1.4 Wrap the app in the router and resolve `/` to the board destination.
- [x] 1.5 Add an unknown-route state with a path back to `/board`.

## 2. Shell Navigation

- [x] 2.1 Convert sidebar destination controls to route navigation while preserving icons, labels, active state, and mobile drawer close behavior.
- [x] 2.2 Derive Board and History workspace selection from the current route instead of local-only `currentView` state.
- [x] 2.3 Render Tags and Board settings as route-owned dialogs on large screens and full-page surfaces on mobile viewports.
- [x] 2.4 Make route-owned dialog close actions navigate to their base route.
- [x] 2.5 Keep local-only confirmation dialogs, such as clear board and complete work, out of the route map.

## 3. Active Card Routes

- [x] 3.1 Add board-state lookup helpers for finding an active card by ID and its owning column.
- [x] 3.2 Convert card open actions to navigate to `/board/cards/:cardId`.
- [x] 3.3 Render the active card dialog from the route target after board data is available.
- [x] 3.4 Navigate to `/board` when the active card dialog closes.
- [x] 3.5 Show a recoverable missing-card state when an active card route target cannot be found after board data loads.

## 4. Archived Card Routes

- [x] 4.1 Add history lookup helpers for finding a completed work cycle and archived card by route IDs.
- [x] 4.2 Convert archived card open actions in History to navigate to `/history/cycles/:cycleId/cards/:cardId`.
- [x] 4.3 Render the archived readonly card dialog from the route target after board data is available.
- [x] 4.4 Navigate to `/history` when the archived card dialog closes.
- [x] 4.5 Show a recoverable missing-archive state when the requested completed cycle or archived card cannot be found after board data loads.

## 5. Auth Routes

- [x] 5.1 Add `/sign-in` behavior that shows the auth entry point for signed-out users and redirects signed-in users to a safe destination or `/board`.
- [x] 5.2 Add `/auth/callback` behavior that waits for Supabase session recognition and then navigates to a safe internal destination or `/board`.
- [x] 5.3 Preserve protected route destinations when a signed-out user opens an authenticated app route.
- [x] 5.4 Update OAuth sign-in requests to use `/auth/callback` with the preserved internal destination.
- [x] 5.5 Update magic-link sign-in requests to use `/auth/callback` with the preserved internal destination.
- [x] 5.6 Ensure unsafe, external, malformed, or missing callback destinations fall back to `/board`.

## 6. Verification

- [x] 6.1 Add unit or component tests for route constants, path builders, and safe destination parsing.
- [x] 6.2 Add app tests for direct loads of `/board`, `/history`, `/tags`, and `/settings`, including mobile and large-screen presentation for route-owned management surfaces.
- [x] 6.3 Add app tests for direct loads, close behavior, and missing states for active card routes.
- [x] 6.4 Add app tests for direct loads, close behavior, and missing states for archived card routes.
- [x] 6.5 Add auth tests for OAuth and magic-link redirect targets preserving internal destinations.
- [x] 6.6 Add auth callback tests for valid destinations and unsafe destination fallback.
- [x] 6.7 Verify nested client routes load through the local development server and production/static fallback.
- [x] 6.8 Run the relevant typecheck and test suite.
