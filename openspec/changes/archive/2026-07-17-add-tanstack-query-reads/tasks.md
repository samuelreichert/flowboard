## 1. Dependencies And Provider

- [x] 1.1 Add TanStack Query dependencies for React queries and selective cache persistence.
- [x] 1.2 Create a shared query client with bounded `staleTime`, `gcTime`, and window-focus behavior.
- [x] 1.3 Wrap the React app in a single query provider.
- [x] 1.4 Add authenticated cache cleanup on sign-out and authenticated user changes.

## 2. Query Keys And Read Hooks

- [x] 2.1 Add a centralized query key module for profile, board bootstrap, and active card detail.
- [x] 2.2 Add a profile query hook that calls the existing profile API wrapper.
- [x] 2.3 Add a board bootstrap query hook that calls `fetchBoardBootstrap`.
- [x] 2.4 Add an active card detail query hook that calls `fetchActiveCardDetail` only when a card id is available.
- [x] 2.5 Add selective persisted-cache setup for profile, bootstrap, and recently opened active card detail queries only.

## 3. Profile Read Integration

- [x] 3.1 Replace the custom profile read effect with the profile query hook.
- [x] 3.2 Preserve the current session-derived profile fallback while the profile query is pending or unavailable.
- [x] 3.3 Update or invalidate the profile query cache after profile save succeeds.
- [x] 3.4 Add or update tests for profile query success, pending fallback, save cache update, and sign-out cleanup.

## 4. Board Bootstrap Integration

- [x] 4.1 Convert `BoardBootstrapResponse` into the board surface state used by columns, cards, tags, background, and active work-cycle UI.
- [x] 4.2 Replace authenticated full-board initial load with the bootstrap query for the active board surface.
- [x] 4.3 Preserve existing recoverable unavailable/loading states when the bootstrap query fails.
- [x] 4.4 Keep local SQLite no-Supabase mode using the same bootstrap query path.
- [x] 4.5 Add or update tests proving bootstrap renders columns, card summaries, tags, background, and active work-cycle state without rich content or history.

## 5. Active Card Detail Integration

- [x] 5.1 Load active card rich content with the active card detail query when a card dialog or direct active-card route opens.
- [x] 5.2 Show summary title, priority, and tags while card detail content is loading.
- [x] 5.3 Merge loaded card detail into the dialog state without treating pending content as an empty user edit.
- [x] 5.4 Preserve missing-card route behavior for missing or inaccessible active card detail.
- [x] 5.5 Add or update card dialog and route tests for click-open, direct route, loading detail, loaded rich content, and missing detail.

## 6. Legacy Full-Board Save Safety

- [x] 6.1 Add a temporary safety path for legacy full-board saves that detects summary-backed board state.
- [x] 6.2 Load or reuse a complete legacy board snapshot before a legacy full-board save when rich content or history is not fully hydrated.
- [x] 6.3 Merge current board surface edits into the complete snapshot before calling the legacy full-board `PUT`.
- [x] 6.4 Add tests proving legacy saves after bootstrap do not wipe unhydrated card content or completed work history.

## 7. Validation And Documentation

- [x] 7.1 Update `RUNNING_MODES.md` if the local/authenticated read-mode matrix changes.
- [x] 7.2 Run focused tests for query hooks, profile behavior, board routes, card dialog, and route handling.
- [x] 7.3 Run `npm run typecheck`.
- [x] 7.4 Run `rtk npx react-doctor@latest --verbose --scope changed` before PR.
