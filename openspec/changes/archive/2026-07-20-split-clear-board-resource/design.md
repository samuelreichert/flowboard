## Context

Flowboard now has lean bootstrap reads, active-card resource mutations,
non-card board resource mutations, and work-cycle history resources. Clear
board is the remaining normal user action that still clears local state and then
persists through the legacy full-board save bridge.

That bridge exists for compatibility, but it is the architecture we are trying
to leave behind: client-owned aggregate writes, broad payloads, and safety
snapshot behavior that gets more expensive as boards and history grow.

## Goals / Non-Goals

**Goals:**

- Persist clear-board through one focused authenticated command.
- Clear active columns, active cards, and active card-tag assignments using
  structured relational writes.
- Normalize active work-cycle state after columns are removed.
- Preserve board background, board tags, completed history, profile, project,
  and unrelated board metadata.
- Update TanStack Query bootstrap/detail caches so the UI shows the empty active
  board without a full-board save.
- Preserve the existing confirmation-gated sidebar clear-board experience.
- Remove normal clear-board dependence on `/api/boards/:id`.

**Non-Goals:**

- Do not remove legacy `/api/boards/default` or `/api/boards/:id` endpoints in
  this slice.
- Do not add multiple-board, project-management, collaboration, real-time, or
  undo/restore behavior.
- Do not change tag management, completed history, or background settings.
- Do not introduce a separate board reset template or default-column recreation
  flow.

## Decisions

### Add one explicit clear-board command

Use `POST /api/board/clear` for the destructive board-level command. The
request body is empty; ownership, board identity, and current active-board rows
come from the resolved principal's main board on the server.

Rationale: clear board is not a resource update to a single column/card. It is a
board command, and making it explicit avoids sending a replacement board
aggregate just to express "delete active board rows".

Alternative considered: `DELETE /api/board/columns`. That is technically close
to the data being removed, but it reads like a collection delete endpoint and
does not make the work-cycle normalization behavior obvious.

### Keep the response lean and cache-oriented

The response returns `boardVersion`, empty `columns`, the normalized
`activeWorkCycle`, and the deleted active card identifiers. It does not return
tags, background, history, project data, owner identifiers, or rich content.

Rationale: the client already has tags/background/history in their own queries
or state. The mutation only needs enough information to update bootstrap and
clear active-card detail caches.

Alternative considered: return a full bootstrap payload. That would be simple
to merge but would read extra data that the command does not change.

### Clear active board rows transactionally

The repository operation deletes active card-tag assignment rows, active cards,
and active columns for the resolved principal's main board in one transaction.
It clears the active work-cycle completed-column setting because no active
column can remain valid after a full active-board clear. It increments board
version in the same transaction.

Rationale: this preserves current visible behavior while avoiding stale
completed-column references and preventing unrelated board data rewrites.

Alternative considered: delete only columns and rely on cascading behavior. That
works only if every environment has the same constraints enabled and makes it
harder to return deleted card identifiers for cache cleanup.

### Treat "already empty" as a successful idempotent clear

Submitting clear board against an already empty active board returns the current
empty active board state and does not need to fail. The operation still returns
a board version according to repository behavior, but it MUST NOT recreate
columns or delete unrelated data.

Rationale: destructive confirmation already happened on the client, and retrying
after a network edge should be harmless from the user's perspective.

Alternative considered: reject empty clears. That adds UI edge handling without
protecting additional data.

### Update query caches instead of local aggregate persistence

The clear-board mutation snapshots the bootstrap cache and active-card detail
caches for rollback. On success, it replaces bootstrap columns with `[]`, merges
the returned active work-cycle and board version, removes active-card detail
queries for deleted cards, and does not call the legacy full-board save path.

Rationale: this keeps the client aligned with the server-state cache model and
avoids reconstructing rich card content or history during a destructive action.

Alternative considered: continue using `updateStorage([])` followed by
`persistAuthenticatedBoard`. That is the current bottleneck and keeps the final
legacy cleanup blocked.

## Risks / Trade-offs

- [Risk] The clear operation deletes several active-board tables. -> Mitigation:
  repository tests cover affected row deletion, unrelated data preservation,
  active work-cycle normalization, and board version behavior.
- [Risk] Cache rollback can leave stale active-card detail if only bootstrap is
  restored. -> Mitigation: snapshot and remove affected active-card detail
  queries alongside the bootstrap cache.
- [Risk] Empty-board idempotency can obscure a duplicated click. -> Mitigation:
  UI remains confirmation-gated and the result is the same empty active board.
- [Risk] Legacy endpoints still exist after this slice. -> Mitigation: document
  them as compatibility-only and reserve deletion for the final cleanup PR.

## Migration Plan

1. Add server DTOs, route handling, and repository clear operation behind the
   existing resolved-principal helpers.
2. Add client API helper and TanStack Query mutation/cache helper.
3. Rewire clear board to call the mutation after the existing confirmation.
4. Add focused server, client API, hook, and UI regression tests.
5. Update `RUNNING_MODES.md` so clear board is no longer listed as a legacy
   bridge user.
6. Run targeted tests, typecheck, React Doctor, and OpenSpec validation.

Rollback is straightforward while the legacy bridge remains: the UI can be
temporarily switched back to the old full-board persistence call if the new
command has a production issue.
