## Context

Flowboard now uses a lean bootstrap read model, active-card resource mutations,
and non-card board resource mutations. The remaining everyday aggregate paths
are work-cycle completion and History loading: opening History calls the legacy
complete-board endpoint, and confirming completion builds a full board state on
the client before submitting it through the legacy full-board save bridge.

History can grow without bound, and archived cards can contain rich content.
Loading all completed cycles and all archived rich content just to render the
History page would recreate the same scaling bottleneck that bootstrap already
avoids for active cards.

## Goals / Non-Goals

**Goals:**

- Persist work-cycle completion through a focused server command.
- Archive completed cards, card metadata, rich content, and tag snapshots in one
  transaction scoped to the resolved principal's main board.
- Return lean completion results that update bootstrap and history summary
  caches without reconstructing or saving a full board aggregate.
- Read completed history through paginated/windowed summary queries.
- Read archived-card rich content through a separate detail query when a user
  opens a History card.
- Preserve current visible completion, History list, archived-card dialog, and
  direct archived route behavior.
- Remove completion/history dependence on `/api/boards/default` and
  `/api/boards/:id`.

**Non-Goals:**

- Do not remove the legacy full-board endpoints yet; clear-board and emergency
  compatibility paths remain for the final cleanup slice.
- Do not add projects, multiple boards, collaboration, real-time updates, or
  empty-cycle completion UI changes.
- Do not change the active-board bootstrap response to include completed
  history.
- Do not load all archived rich content in the History list response.

## Decisions

### Add explicit work-cycle endpoints

Use focused routes:

- `POST /api/board/work-cycle/complete`
- `GET /api/board/work-cycles/history`
- `GET /api/board/work-cycles/:cycleId/cards/:cardId`

Rationale: completion is a domain command that archives data and starts a new
cycle, while history reads are read models. Keeping them separate prevents the
completion endpoint from becoming another full-board replacement path.

Alternative considered: `PATCH /api/board/work-cycle` with an action payload.
That would be smaller on paper but less explicit, harder to validate, and more
likely to accumulate unrelated work-cycle actions over time.

### Return history summaries separately from archived-card detail

The history list endpoint returns completed-cycle metadata and card summaries:
identifiers, title, created/archived dates, priority, tag identifiers, tag
snapshots, and `hasContent`. It does not return archived rich content. The
archived-card detail endpoint returns the same card identity/metadata plus
content.

Rationale: the History list needs enough data to scan and route, but rich
archived content can dominate payload size over time. This mirrors the active
card summary/detail split.

Alternative considered: return complete archived cards in history list. That
preserves today's in-memory shape, but it makes History slower as archive size
grows and undermines the lean read-model architecture.

### Use bounded history pagination from the first endpoint

`GET /api/board/work-cycles/history` accepts a bounded `limit` and optional
cursor. The first implementation can render the initial page and expose a
"more" path when needed, while tests keep ordering deterministic.

Rationale: this keeps the API contract scalable even before a user has enough
history to need pagination UI polish.

Alternative considered: load all completed cycles and add pagination later.
That would be faster to wire but would knowingly ship the next bottleneck.

### Complete work on the server from current structured rows

The server validates the active completed-column setting, selects active cards
in that column with tag assignments and board tag names, inserts a completed
cycle and archived card/tag snapshot rows, deletes the archived active cards and
their active card-tag rows, advances the active work-cycle start date, and
increments board version in one transaction.

Rationale: the server has the authoritative structured state and can archive
without trusting a client-supplied board aggregate. This avoids data loss from
summary-backed client state and keeps ownership checks central.

Alternative considered: client sends the completed cards in the command body.
That would be closer to the current code, but it duplicates server state,
increases payload size, and risks archiving stale or tampered data.

### Keep client board cache and history cache separate

Completion updates the bootstrap cache by removing archived active card
summaries and merging the returned active work-cycle/board version. It updates
or invalidates the first history page cache with the returned archived cycle
summary. Archived-card detail caches are keyed by cycle/card identity.

Rationale: bootstrap, history list, and archived-card detail have different
lifetimes and payload sizes. Separate keys prevent a History read from becoming
required for active board rendering.

Alternative considered: store completed cycles back in the legacy board cache
and keep passing `completedWorkCycles` through app state. That would reduce UI
rewiring but preserve the old aggregate shape.

## Risks / Trade-offs

- [Risk] Completion is transactional and touches several tables. -> Mitigation:
  repository tests cover active-card cleanup, archived snapshot preservation,
  tag snapshots, active work-cycle advancement, and board version increment.
- [Risk] Direct archived-card routes need both route resolution and detail
  loading. -> Mitigation: history summary query resolves the route target and
  archived-card detail query fills rich content, with existing missing-state
  behavior preserved.
- [Risk] Pagination can change perceived History completeness. -> Mitigation:
  default to a practical first-page size, expose deterministic ordering/cursor
  metadata, and keep "load more" behavior scoped to History.
- [Risk] Completion optimistic updates can diverge if the server rejects the
  command. -> Mitigation: snapshot bootstrap/history caches and rollback on
  error; preserve the existing persistence error messaging.
- [Risk] Clear board still uses the legacy full-board bridge after this slice.
  -> Mitigation: document that clear-board/legacy endpoint removal is the final
  cleanup slice.

## Migration Plan

1. Add repository functions and route contracts behind the existing auth/local
   principal resolution.
2. Add client API helpers and query hooks while keeping existing UI behavior.
3. Rewire completion and History reads to resource endpoints.
4. Run focused server/client tests, typecheck, React Doctor, and OpenSpec
   validation.
5. Update `RUNNING_MODES.md` to show only clear-board/cleanup as the remaining
   legacy bridge user.

Rollback is straightforward while the legacy endpoints remain: the UI can be
switched back to the complete-board bridge if the new completion/history route
has a production issue.
