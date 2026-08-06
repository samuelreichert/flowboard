## Why

Every rich-content editor transaction currently sends the entire card document, so normal typing can create repeated large requests, waste mobile bandwidth, and exhaust the authenticated write rate limit. Content autosave needs to preserve the latest local document while reducing request frequency and still flushing promptly when the user leaves the editing surface.

## What Changes

- Coalesce successive rich-content changes behind a short, named idle window while keeping only the latest pending document.
- Flush pending rich content when focus leaves the editor surface, the card dialog closes, the page becomes hidden, or the editor autosave producer unmounts.
- Keep non-content card edits on their existing immediate-save path.
- Preserve the existing authenticated card-update request and response contract, optimistic cache behavior, and persistent save-failure feedback.
- Add fake-timer coverage for typing bursts, lifecycle flushes, duplicate-flush prevention, teardown, and failure visibility.
- Explicitly exclude mutation ordering, server payload changes, revisions, offline writes, and image storage.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `card-content-rich-editing`: Define coalesced rich-content autosave cadence, latest-document retention, and lifecycle flush behavior without disrupting editor focus or unrelated card edits.
- `client-server-state-cache`: Require flushed rich-content changes to use the existing active-card mutation path and preserve the current visible persistence-failure behavior.

## Impact

- Affects the card content editor boundary, card dialog controller/autosave producer, and their focused tests.
- Does not change authenticated API routes, payload shapes, server persistence, database schemas, dependencies, or general card mutation scheduling.
- Keeps metadata edits immediate and leaves same-card mutation serialization to the independent `serialize-same-card-mutations` roadmap change.
