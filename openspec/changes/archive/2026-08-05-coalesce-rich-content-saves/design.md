## Context

The Tiptap editor emits Markdown on every document-changing transaction. The card dialog immediately forwards each emitted value through `saveExistingCard`, which updates local board state and starts the existing authenticated active-card mutation. Because the mutation payload contains the complete rich document, ordinary typing can generate many large concurrent requests against a write limit shared with other board operations.

This change is constrained to the editor/card-dialog autosave producer. The active-card mutation, optimistic cache handlers, API route, request and response shapes, server validation, and persistence repository remain unchanged. Existing title, priority, column, and tag edits must also keep their current immediate behavior.

## Goals / Non-Goals

**Goals:**

- Keep editor rendering and dialog-local content updates immediate while coalescing durable content saves behind a 750 ms idle window.
- Retain the latest pending document and flush it once when the user leaves the editor or dialog, the page becomes hidden, or the producer unmounts.
- Preserve current active-card mutation behavior and persistent failure feedback.
- Cover timing and teardown behavior deterministically with fake timers.

**Non-Goals:**

- Mutation ordering.
- Server payload changes.
- Revisions.
- Offline writes.
- Image storage.
- Automatic retry, conflict detection, or cross-device reconciliation.

## Decisions

### Keep coalescing in a focused dialog autosave producer

Add a focused rich-content coalescer beside the existing card-dialog autosave logic. A content change updates dialog state and the latest-values ref immediately, then replaces the pending content ref and resets one named 750 ms timer. The coalescer invokes the existing `saveExistingCard` function only when the timer expires or a flush trigger occurs.

This placement reduces only content production and does not change how TanStack Query schedules or applies mutations. Putting debounce logic in `useFlowboardCardMutations` was rejected because it would affect non-editor callers, blur the boundary with same-card mutation serialization, and make metadata behavior harder to preserve.

### Keep only the latest pending document

The producer stores a single latest content value rather than a list of editor transactions. A flush atomically clears the timer and takes the pending value before invoking the existing save path, so blur, close, visibility, and unmount events occurring together cannot send duplicates. A later editor transaction creates a new pending value and idle window.

The save input may include the current valid dirty title using the controller's existing piggyback behavior. Title dirty state is cleared only when the queued save is actually flushed, not when content is merely buffered.

### Flush at explicit lifecycle boundaries

The producer flushes pending content on:

- focus leaving the composite card-content editor;
- card-dialog close, before changing route/dialog open state;
- `visibilitychange` when `document.visibilityState` becomes `hidden`;
- producer cleanup during unmount.

The editor boundary filters bubbled blur events whose related focus target remains inside the editor wrapper. This prevents toolbar navigation from being treated as leaving the editing surface. Dialog close remains an explicit trigger so Escape, backdrop dismissal, and route-driven closure do not depend on browser focus ordering.

`beforeunload`, `sendBeacon`, and a new unload-specific endpoint are rejected. Visibility loss provides an earlier opportunity to use the unchanged authenticated mutation path, while unload durability would require different transport and offline-write guarantees.

### Preserve immediate non-content saves and the current API contract

Title blur, priority, column, and tag actions continue to call `saveExistingCard` immediately and do not consume or postpone pending content. A content flush still reaches the current active-card `PATCH` mutation and uses its existing optimistic cache, success merge, rollback, and persistent error-toast behavior. No API client, server route, response projection, or database code changes are required.

Within this boundary, “not silently dropped” means the latest buffered document is handed to the existing mutation path before the buffer is cleared and any failed request remains visibly reported as not durably saved. Retaining or retrying a failed write after rollback, dialog teardown, or reload is an offline-write capability and remains excluded.

## Risks / Trade-offs

- [Board state outside the open dialog can trail the editor by up to 750 ms] → Update dialog-local state synchronously and flush on every exit boundary.
- [Several lifecycle signals can fire for one exit] → Make flush idempotent by taking and clearing the single pending value before invoking save.
- [Toolbar focus changes can look like editor blur] → Observe the composite editor boundary and ignore focus transitions that remain inside it.
- [Unmount cleanup can capture stale values or callbacks] → Store the latest content, title state, and save callback in refs used by a stable flush function.
- [Older active-card responses can still overwrite newer optimistic state] → Do not change response ordering here; cover it in the independent `serialize-same-card-mutations` change.
- [A browser may terminate network activity after page teardown] → Flush on visibility loss before teardown and avoid claiming unload/offline durability.

## Migration Plan

No data or API migration is required. Ship the client-only producer change with focused tests; rollback consists of restoring immediate content forwarding. Existing stored cards and clients remain compatible throughout.

## Open Questions

None. The 750 ms interval is an internal named constant and can be tuned in a later measured change without altering the API contract.
