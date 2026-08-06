# Architecture and API Remediation Roadmap

This roadmap turns the July 2026 architecture review into small, independently
mergeable changes. Each numbered item is intended to become exactly one
OpenSpec change and one pull request.

## How to use this roadmap

Start every change from `main`. To explore an item without implementing it, use:

> Use the `openspec-explore` skill. Read
> `openspec/roadmaps/architecture-api-remediation.md` and explore item
> `<change-slug>`. Do not implement it. Keep the scope to one independent PR,
> validate the proposed boundary against the current code, and finish with a
> recommendation about whether to run `openspec-propose` for that exact change.

If exploration confirms the boundary, create the OpenSpec change with the exact
slug in this file. The proposal must repeat the item's exclusions so the PR does
not quietly absorb adjacent work.

## Parallel-work contract

Every item below must satisfy all of these rules:

- It must work when merged into the baseline without any other roadmap PR.
- It must not import, call, or assume a contract introduced by another roadmap
  item.
- It owns one observable problem, its tests, and any required spec delta.
- Existing API behavior remains compatible unless the same PR updates every
  in-repository caller.
- Database work must update and test both supported providers when applicable.
- If exploration discovers a prerequisite, do not add that prerequisite to the
  PR. Narrow the change or move it to the deferred section.
- Shared-file merge conflicts are possible, but they are not dependencies. The
  later merge must rebase and preserve both independently tested behaviors.

Baseline used for this plan: `bf771ea04c93c40c39eb5a26accb8f4b5310778c`.

## Parallel PR queue

### 01. `coalesce-rich-content-saves`

**Problem:** Every editor transaction can send the entire card document. Fast
typing therefore creates repeated large requests and responses, can reach the
API rate limit, and wastes mobile bandwidth.

**PR boundary:** Change only the editor/autosave producer. Coalesce content
changes behind a short idle window, keep the latest unsaved document, and flush
on blur, dialog close, page visibility loss, and unmount. Keep the current
authenticated API contract unchanged.

**Acceptance checks:**

- Continuous typing produces at most one content request per idle window.
- The final document is flushed when the user leaves the editing surface.
- Save failure remains visible and the last local edit is not silently dropped.
- Fake-timer tests cover typing bursts, flushes, and teardown.

**Likely specs:** `card-content-rich-editing`, `client-server-state-cache`.

**Explicitly excludes:** mutation ordering, server payload changes, revisions,
offline writes, and image storage.

### 02. `serialize-same-card-mutations`

**Problem:** Mutations for one card can run concurrently, allowing an older
response to land after a newer one and overwrite newer client state.

**PR boundary:** Change only card mutation scheduling and result application.
Give mutations for the same card a shared serial scope or equivalent queue while
allowing different cards to save concurrently. Do not add debouncing.

**Acceptance checks:**

- Only one mutation for a given card is in flight at a time.
- Mutations for different cards remain parallel.
- Success and rollback handlers cannot apply an older result over a newer one.
- Existing request and response shapes remain unchanged.

**Likely specs:** `client-server-state-cache`, `card-content-rich-editing`.

**Explicitly excludes:** save-frequency reduction, server-side conflict
detection, and cross-device reconciliation.

### 03. `return-compact-card-move-results`

**Problem:** Moving a card returns fields such as full rich content and then
invalidates the bootstrap query, causing an avoidable full-board download.

**PR boundary:** Make the move result contain only the authoritative placement
and board version needed by the client. Update the in-repository API client and
optimistic cache handling in the same PR, and remove the unconditional
post-success bootstrap refetch. Preserve the existing ordering algorithm.

**Acceptance checks:**

- A successful move needs one request and no follow-up bootstrap request.
- The move response does not contain card content.
- Both same-column and cross-column moves converge to server placement.
- Error rollback and board-version handling remain covered.

**Likely specs:** `authenticated-board-api`, `client-server-state-cache`,
`card-board-movement`, `structured-board-persistence`.

**Explicitly excludes:** sparse ordering, virtualization, and general response
projection changes.

### 04. `sequence-created-tag-assignment`

**Problem:** Creating a tag and assigning it to a card are separate dependent
mutations that can currently race.

**PR boundary:** Make the create-and-assign UI workflow await successful tag
creation before sending assignment. Use the existing endpoints and keep
unrelated tag operations parallel.

**Acceptance checks:**

- Assignment is never requested before creation succeeds.
- Creation failure leaves the card unchanged and shows the existing error path.
- Double submit cannot create duplicate assignment requests.
- Existing tag creation without assignment still behaves as before.

**Likely specs:** `board-tag-management`, `client-server-state-cache`.

**Explicitly excludes:** a new compound endpoint, schema changes, and global
mutation serialization.

### 05. `verify-supabase-jwts-locally`

**Problem:** Each authenticated board request calls the remote Supabase user
endpoint before doing application work, adding latency and an external request
to every API operation.

**PR boundary:** Verify supported asymmetric Supabase access tokens with claims
and cached JWKS locally. Retain a safe explicit fallback for configurations that
cannot be verified locally, and preserve the existing request-principal shape.

**Acceptance checks:**

- Supported production tokens do not require a remote user lookup per request.
- Expired, malformed, wrong-issuer, and wrong-audience tokens are rejected.
- Unsupported signing configuration follows the documented safe fallback.
- No token, claims, or personal data is logged.

**Likely specs:** `supabase-auth`, `server-architecture`.

**Explicitly excludes:** profile provisioning, authorization-policy changes,
session caching, and route response changes.

### 06. `make-profile-provisioning-idempotent`

**Problem:** Profile provisioning reads and then creates, so concurrent
first-use requests can race and surface an avoidable uniqueness error.

**PR boundary:** Replace profile read-then-create with one idempotent database
operation or conflict-safe transaction. Preserve profile fields and API output.

**Acceptance checks:**

- Concurrent provisioning for one owner yields one profile and no failed caller.
- Existing profiles are not reset or overwritten.
- SQLite and Postgres behavior is tested.
- No board-provisioning behavior changes.

**Likely specs:** `supabase-auth`, `authenticated-board-api`.

**Explicitly excludes:** default-board creation, authentication verification,
and profile editing.

### 07. `make-default-board-provisioning-idempotent`

**Problem:** Default project/board provisioning is also read-then-create, so
parallel first-load requests can create duplicate defaults.

**PR boundary:** Make default project and board creation concurrency-safe for
one owner. Add only the minimum invariant or transaction required to identify a
single default; preserve the single-board product behavior.

**Acceptance checks:**

- Concurrent bootstrap calls resolve to the same default board.
- Existing owners keep their current default board.
- SQLite and Postgres migrations and concurrency tests are included if schema
  enforcement is selected.
- Profile provisioning is treated as existing behavior, not rewritten.

**Likely specs:** `structured-board-persistence`,
`authenticated-board-api`.

**Explicitly excludes:** multi-board UX, project navigation, and profile
provisioning.

### 08. `probe-board-version-on-return`

**Problem:** With focus refetch disabled and no realtime or polling, another tab
or device can change a board while the current tab remains stale indefinitely.

**PR boundary:** Add a lightweight authenticated board-version probe. On
visibility return and network reconnect, compare the remote version with the
cached bootstrap version and invalidate bootstrap only when they differ.

**Acceptance checks:**

- The probe response is a small fixed-size shape.
- An unchanged version does not download bootstrap again.
- A changed version triggers one bootstrap refresh.
- There is no background polling and no global focus-refetch policy change.

**Likely specs:** `authenticated-board-api`, `client-server-state-cache`.

**Explicitly excludes:** realtime subscriptions, optimistic concurrency,
presence, and merge/conflict UI.

### 09. `persist-bounded-read-query-cache`

**Problem:** The PWA describes local-first behavior, but authenticated board
reads live only in memory. A refresh or short outage immediately loses the last
usable view.

**PR boundary:** Persist a bounded, identity-scoped read cache for bootstrap,
profile, and recently opened card details. Rehydrate it before revalidation and
clear it on sign-out or identity change. Treat it as a cache, not a board
database.

**Acceptance checks:**

- A previously loaded board can render during a temporary read outage.
- Successful reconnect revalidation replaces stale cached data.
- Cache size, age, and allowed query keys are explicitly bounded.
- Mutations, tokens, completed-history pages, and error objects are not
  persisted.

**Likely specs:** `client-server-state-cache`, `offline-pwa-readiness`.

**Explicitly excludes:** offline mutation queues, conflict resolution,
localStorage board persistence, and service-worker API caching.

### 10. `bound-inline-card-images`

**Problem:** Pasted images are encoded into the rich document with no
image-specific size limit. Base64 expansion can make cards unsavable and makes
every later content save expensive.

**PR boundary:** Validate image type, decoded byte size, and resulting document
budget before accepting a pasted or dropped inline image. Reuse the existing
error presentation and continue rendering previously stored inline images.

**Acceptance checks:**

- Oversized or unsupported images are rejected before conversion or save.
- Accepted images cannot push the document past the server content limit.
- Rejection explains the limit without clearing editor content.
- Existing cards containing base64 images still open and render.

**Likely specs:** `card-content-rich-editing`.

**Explicitly excludes:** object storage, upload endpoints, migration of existing
images, and changing the general card-content limit.

### 11. `use-gapped-card-sort-orders`

**Problem:** Integer positions are dense, so a move can update every card in a
range. Large columns turn one drag into O(n) database writes.

**PR boundary:** Keep integer storage and the current move API, but allocate
orders with gaps and update only the moved card when a gap exists. Rebalance one
destination column only when its gap space is exhausted.

**Acceptance checks:**

- Normal same-column and cross-column moves update the moved card only.
- A deterministic rebalance preserves exact visible order.
- Repeated inserts eventually rebalance safely.
- Existing dense data is accepted without a one-time migration.

**Likely specs:** `structured-board-persistence`, `card-board-movement`.

**Explicitly excludes:** move response changes, column ordering, fractional
string ranks, and UI cache changes.

### 12. `virtualize-large-active-columns`

**Problem:** Every active card is rendered at once. Large boards increase mount
time, memory use, and drag latency until the interface feels unreliable.

**PR boundary:** Window cards within active columns behind the existing column
and card interfaces. Preserve keyboard navigation, the active dragged item, drop
targets, and accessible item counts.

**Acceptance checks:**

- A fixture with thousands of cards mounts only a bounded visible subset.
- Scrolling and drag/drop work across the beginning and end of a long column.
- Keyboard access and screen-reader position information remain correct.
- Small-board markup and behavior remain unchanged.

**Likely specs:** `board-ui-affordance`, `card-board-movement`.

**Explicitly excludes:** API pagination, completed-history rendering, ordering
algorithm changes, and visual redesign.

### 13. `instrument-board-api-boundaries`

**Problem:** The API has rate limiting but lacks route-level evidence about
latency, response bytes, error rates, and which operations are transferring too
much data.

**PR boundary:** Add structured boundary telemetry around authenticated board
routes: request ID, normalized route, method, status, duration, and serialized
response byte count. Emit through the existing deployment logging surface.

**Acceptance checks:**

- Successes, validation failures, authentication failures, and server errors are
  measured consistently.
- Route templates are logged instead of user-controlled paths.
- Tokens, content, names, email addresses, and raw owner/card IDs are absent.
- Tests assert the telemetry schema and redaction.

**Likely specs:** `vercel-observability`, `server-architecture`.

**Explicitly excludes:** a new monitoring vendor, dashboards, database query
tracing, alert policy, and performance behavior changes.

### 14. `make-single-board-api-boundary-explicit`

**Problem:** Persistence models projects and multiple boards while the client,
query keys, and most authenticated routes implicitly operate on one default
board. That ambiguity makes future navigation, authorization, and caching
changes easy to implement incorrectly.

**PR boundary:** Declare and enforce the current single-default-board contract.
Remove or isolate unused client-visible project-list surface, name default-board
queries explicitly, and document the future migration seam without adding
multi-board behavior.

**Acceptance checks:**

- Every active board query clearly targets the authenticated owner's default
  board.
- No unused API surface suggests that arbitrary project selection is supported.
- Authorization remains owner-scoped.
- A future board ID can be introduced without redefining today's contract.

**Likely specs:** `authenticated-board-api`, `structured-board-persistence`,
`client-server-state-cache`.

**Explicitly excludes:** a project switcher, multiple-board creation, URL
selection, schema removal, and data migration.

## Suggested priority

The items remain independent; priority is about impact, not merge order.

1. Immediate transfer and correctness: 01, 02, 03, 04.
2. Request latency and first-use reliability: 05, 06, 07.
3. Staleness and resilience: 08, 09, 10.
4. Scale and diagnosis: 11, 12, 13.
5. Future architecture clarity: 14.

## Deferred because they are not parallel-safe small PRs

These findings are real, but pretending they are independent would create risky
or overlapping changes. Explore them only after the parallel queue has landed:

- **Cross-device optimistic concurrency and conflict UI.** This needs a coherent
  revision contract, client serialization behavior, and product decisions about
  merging or rejecting stale rich-content edits.
- **One authoritative client state model.** Removing the reducer, storage memory
  cache, or query-cache duplication is a migration program across most
  mutations, not a one-point PR.
- **True offline writes.** An outbox depends on idempotency keys, conflict rules,
  identity boundaries, and replay UX.
- **External image/object storage.** Upload lifecycle, authorization, cleanup,
  local development behavior, and migration of existing documents need a
  coordinated design.
- **Server-side board pagination.** It changes bootstrap, drag/drop, completed
  work, cache keys, and offline behavior together.

Each deferred topic should receive its own OpenSpec exploration before it is
split into a sequenced roadmap.
