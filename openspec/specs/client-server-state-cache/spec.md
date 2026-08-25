# client-server-state-cache Specification

## Purpose

Defines the client-side server-state cache used for authenticated Flowboard
reads so reloads are faster without making browser storage a board database.
## Requirements
### Requirement: Client provides a shared server-state query cache

The system SHALL provide one shared TanStack Query client for authenticated
server-state reads across the Flowboard React app.

#### Scenario: App renders with query provider

- **WHEN** the React app starts
- **THEN** profile, board bootstrap, and active card detail hooks can read and
  update server-state through the same query client

#### Scenario: Query defaults are bounded

- **WHEN** the query client is created
- **THEN** it uses bounded stale and garbage-collection settings suitable for
  reload-friendly board reads
- **AND** it does not refetch on every window focus by default

### Requirement: Client uses stable query keys for Flowboard reads

The system SHALL define stable, centralized query keys for authenticated
Flowboard server-state reads.

#### Scenario: Profile query key is used

- **WHEN** the client reads the authenticated profile
- **THEN** it uses the `['profile']` query key

#### Scenario: Board bootstrap query key is used

- **WHEN** the client reads the main board bootstrap
- **THEN** it uses the `['board', 'bootstrap']` query key

#### Scenario: Active card detail query key is used

- **WHEN** the client reads rich detail for an active card
- **THEN** it uses the `['board', 'cards', cardId]` query key

### Requirement: Client reads authenticated profile through query cache

The system SHALL load authenticated profile display data through TanStack Query
while preserving the current session-derived fallback behavior.

#### Scenario: Profile query succeeds

- **WHEN** an authenticated user's profile query succeeds
- **THEN** account menu, account trigger, and profile dialog identity use the
  returned Flowboard-owned profile data

#### Scenario: Profile query is pending

- **WHEN** the authenticated profile query has not resolved yet
- **THEN** the client can show the existing session-derived profile fallback

#### Scenario: Profile save succeeds

- **WHEN** the authenticated user saves profile changes
- **THEN** the profile query cache is updated or invalidated so subsequent
  profile views show the saved data

### Requirement: Client reads board surface through lean bootstrap query

The system SHALL use the main board bootstrap query as the authenticated board
surface read model.

#### Scenario: Bootstrap query succeeds

- **WHEN** the authenticated board bootstrap query succeeds
- **THEN** the board surface renders board background, columns, active card
  summaries, board tags, and active work-cycle state from the bootstrap payload
- **AND** it does not require completed history or rich card content to render
  the active board surface

#### Scenario: Bootstrap query is unavailable

- **WHEN** the authenticated board bootstrap query fails because the network or
  API is unavailable
- **THEN** the client presents a recoverable unavailable state instead of
  clearing user data

#### Scenario: Local development bootstrap succeeds

- **WHEN** Flowboard runs against the local SQLite API without Supabase browser
  configuration
- **THEN** the same bootstrap query path can hydrate the local board surface

### Requirement: Client hydrates active card details on demand

The system SHALL load rich active-card content through the active-card detail
query only when a card detail view is requested.

#### Scenario: User opens active card

- **WHEN** the user opens an active card from the board
- **THEN** the client requests `['board', 'cards', cardId]`
- **AND** the card dialog can show summary title and metadata while rich content
  is loading
- **AND** the dialog fills rich content from the detail query when it resolves

#### Scenario: User opens direct active card route

- **WHEN** the user opens `/board/cards/:cardId` directly
- **THEN** the client resolves the card summary from board bootstrap and loads
  rich content from the active-card detail query

#### Scenario: Active card detail is missing

- **WHEN** the active-card detail query returns not found for the requested card
- **THEN** the client uses the existing missing active-card route behavior
  without revealing whether the card belongs to another user

### Requirement: Client persists only small authenticated query results

The system SHALL persist only bounded, successful, user-owned query results that
improve reload speed without recreating a browser board database.

#### Scenario: Persisted cache is restored

- **WHEN** the user reloads the app within the configured cache age
- **THEN** successful profile, board bootstrap, and recently opened active-card
  detail queries can hydrate from persisted cache before refetching

#### Scenario: Large or unsupported queries exist

- **WHEN** the query cache contains history detail, mutation state, failed
  queries, or unsupported large data
- **THEN** those entries are excluded from persisted cache

### Requirement: Client clears user-owned query cache on identity changes

The system SHALL isolate authenticated query cache contents across sign-out and
authenticated user changes.

#### Scenario: User signs out

- **WHEN** an authenticated user signs out
- **THEN** the client clears user-owned query cache and persisted query data

#### Scenario: Authenticated user changes

- **WHEN** the app observes a different authenticated user than the user whose
  data is cached
- **THEN** the client clears stale user-owned query cache before loading the new
  user's data

### Requirement: Client mutates active cards through TanStack Query

The system SHALL use TanStack Query mutations for normal active-card create,
update, move, and delete flows.

#### Scenario: User creates a card from the composer

- **WHEN** the user saves a valid card draft from the board composer
- **THEN** the client submits a card create mutation
- **AND** optimistically adds the card summary to the board bootstrap cache
- **AND** does not submit a legacy full-board save for that card creation

#### Scenario: User edits card fields

- **WHEN** the user changes an active card's title, content, priority, or tags
  from the card dialog
- **THEN** the client submits a card update mutation
- **AND** updates the active card detail cache and board bootstrap summary cache
- **AND** does not submit a legacy full-board save for that card edit

#### Scenario: User moves a card

- **WHEN** the user moves an active card by drag/drop or by changing its column
  in the card dialog
- **THEN** the client submits a card move mutation
- **AND** optimistically reorders the card in the board bootstrap cache
- **AND** does not submit a legacy full-board save for that card move

#### Scenario: User deletes a card

- **WHEN** the user deletes an active card
- **THEN** the client submits a card delete mutation
- **AND** optimistically removes the card from the board bootstrap cache
- **AND** removes or invalidates that card's active detail cache
- **AND** does not submit a legacy full-board save for that card deletion

### Requirement: Coalesced rich content uses existing active-card mutations

The system SHALL hand each flushed rich-content document to the existing authenticated active-card update mutation without changing its API contract, optimistic cache behavior, or persistence feedback.

#### Scenario: Pending content is flushed

- **WHEN** the rich-content autosave producer flushes a pending document
- **THEN** the client submits one existing active-card update mutation containing the latest pending content
- **AND** does not submit a legacy full-board save or use a new content endpoint

#### Scenario: Flushed content mutation succeeds

- **WHEN** a flushed rich-content mutation succeeds
- **THEN** the client applies the returned card and board version through the existing active-card success path

#### Scenario: Flushed content mutation fails

- **WHEN** a flushed rich-content mutation fails
- **THEN** the client applies the existing active-card rollback behavior
- **AND** displays the existing persistent not-durably-saved feedback
- **AND** does not report the pending document as successfully saved

### Requirement: Client rolls back failed active-card mutations

The system SHALL preserve user-visible consistency when an active-card mutation
fails.

#### Scenario: Card mutation fails after optimistic update

- **WHEN** a card create, update, move, or delete mutation fails after the
  client has updated cache optimistically
- **THEN** the client restores the previous bootstrap and card-detail cache
  snapshot for the affected data
- **AND** the client exposes the existing unsaved or unavailable persistence
  state instead of treating the change as durably saved

#### Scenario: Card mutation succeeds after optimistic update

- **WHEN** a card create, update, move, or delete mutation succeeds
- **THEN** the client merges the returned card fields and board version into
  affected query caches
- **AND** the client invalidates only exact affected queries when a refetch is
  needed for correctness

### Requirement: Client mutates non-card board resources through TanStack Query

The system SHALL use TanStack Query mutations for normal column, tag, board
settings, and work-cycle settings edit flows.

#### Scenario: User changes columns

- **WHEN** the user creates, renames, reorders, or deletes a board column
- **THEN** the client submits a column resource mutation
- **AND** updates the board bootstrap cache with the returned column/order
  changes
- **AND** does not submit a legacy full-board save for that column edit

#### Scenario: User changes board tags

- **WHEN** the user creates, renames, or deletes a board tag
- **THEN** the client submits a tag resource mutation
- **AND** updates the board bootstrap cache with the returned tag and affected
  card summary changes
- **AND** does not submit a legacy full-board save for that tag edit

#### Scenario: User changes one active card tag assignment

- **WHEN** the user assigns or unassigns one tag on an existing active card
- **THEN** the client submits a card-tag assignment resource mutation
- **AND** updates the board bootstrap cache and the affected active card detail
  cache when present
- **AND** does not submit a legacy full-board save for that tag assignment

#### Scenario: User changes board background

- **WHEN** the user changes the board background setting
- **THEN** the client submits a board settings mutation
- **AND** updates the board bootstrap cache with the returned settings
- **AND** does not submit a legacy full-board save for that setting edit

#### Scenario: User changes completed-column setting

- **WHEN** the user changes or clears the completed-column setting
- **THEN** the client submits a work-cycle settings mutation
- **AND** updates the board bootstrap cache with the returned active work-cycle
  settings
- **AND** does not submit a legacy full-board save for that setting edit

### Requirement: Client rolls back failed non-card board mutations

The system SHALL preserve user-visible consistency when a non-card board
resource mutation fails.

#### Scenario: Non-card mutation fails after optimistic update

- **WHEN** a column, tag, board settings, work-cycle settings, or card-tag
  assignment mutation fails after the client has updated cache optimistically
- **THEN** the client restores the previous bootstrap and affected card-detail
  cache snapshots
- **AND** the client exposes the existing unsaved or unavailable persistence
  state instead of treating the change as durably saved

#### Scenario: Non-card mutation succeeds after optimistic update

- **WHEN** a column, tag, board settings, work-cycle settings, or card-tag
  assignment mutation succeeds
- **THEN** the client merges returned resource fields, affected card summaries,
  and board version into affected query caches
- **AND** the client invalidates only exact affected queries when a refetch is
  needed for correctness

### Requirement: Client reads completed history through query cache

The system SHALL load completed work-cycle history through TanStack Query
instead of loading a full board snapshot and SHALL derive its primary
presentation from resolved query data rather than a normalized empty
collection.

#### Scenario: User opens History

- **WHEN** the user opens the History view
- **THEN** the client requests completed history summaries with a stable history
  query key
- **AND** renders completed work-cycle groups from the history summary cache
- **AND** does not request `/api/boards/default` solely to display History

#### Scenario: Initial history query is unresolved

- **WHEN** the history query has no resolved data and its initial request is
  pending
- **THEN** the client exposes an initial loading state
- **AND** does not normalize the unresolved resource into a successful empty
  collection

#### Scenario: Initial history query fails

- **WHEN** the history query has no resolved data and reaches an error state
- **THEN** the client exposes a retryable initial error state
- **AND** a retry action refetches the history query

#### Scenario: History query resolves empty

- **WHEN** the history query successfully resolves with zero completed cycles
- **THEN** the client exposes a confirmed empty state

#### Scenario: Cached history refetches

- **WHEN** resolved history query data exists and a background refetch is
  pending or fails
- **THEN** the client preserves the resolved data as the primary state
- **AND** exposes background progress or failure separately from the primary
  state

#### Scenario: User loads more completed history

- **WHEN** the completed history summary response indicates more cycles are
  available
- **THEN** the client can request the next history page using the returned
  cursor
- **AND** merges the next page without duplicating existing cycles

#### Scenario: Next history page fails

- **WHEN** a next-page history request fails after one or more pages are
  resolved
- **THEN** the client preserves all resolved pages
- **AND** exposes a next-page error that can retry the same pagination
  operation

### Requirement: Client hydrates archived card details on demand

The system SHALL load rich archived-card content through an archived-card detail
query when an archived card is opened or directly addressed by route
identifiers, and SHALL distinguish pending, not-found, and transient failure
states.

#### Scenario: User opens archived card

- **WHEN** the user opens an archived card from History
- **THEN** the client requests archived-card detail with a stable key containing
  the cycle identifier and archived card identifier
- **AND** the archived-card dialog can render summary metadata while rich
  content is loading
- **AND** unresolved rich content is represented as loading rather than empty
  content
- **AND** the dialog fills rich content from the archived-card detail query when
  it resolves

#### Scenario: User opens direct archived card route

- **WHEN** the user opens `/history/cycles/:cycleId/cards/:cardId` directly
- **THEN** the client requests archived-card detail with a stable key containing
  the route cycle and card identifiers
- **AND** the detail request does not depend on the requested summary being
  present in the currently loaded history page
- **AND** the client renders the complete archived card returned by the detail
  query

#### Scenario: Archived card detail is missing

- **WHEN** the archived-card detail query returns not found for the requested
  cycle or card
- **THEN** the client uses the existing missing archived-card route behavior
  without revealing whether the card belongs to another user
- **AND** the client does not automatically classify other failure statuses as
  missing

#### Scenario: Archived card detail fails transiently

- **WHEN** the archived-card detail query fails for a reason other than not
  found
- **THEN** the client exposes a retryable archived-card detail error
- **AND** retry refetches the detail query using the same stable key

### Requirement: Client mutates work-cycle completion through TanStack Query

The system SHALL use a TanStack Query mutation for confirming work-cycle
completion.

#### Scenario: User confirms completing work

- **WHEN** the user confirms completing work with cards in the configured
  completed column
- **THEN** the client submits a work-cycle completion command
- **AND** removes archived active card summaries from the board bootstrap cache
- **AND** updates active work-cycle state and board version from the mutation
  result
- **AND** adds or invalidates the affected completed history summary cache
- **AND** does not submit a legacy full-board save for completion

#### Scenario: Completion mutation fails after optimistic update

- **WHEN** the completion mutation fails after the client has updated cache
  optimistically
- **THEN** the client restores previous bootstrap and history cache snapshots
- **AND** exposes the existing unsaved or unavailable persistence state instead
  of treating the completion as durably saved

#### Scenario: Completion mutation succeeds after optimistic update

- **WHEN** the completion mutation succeeds
- **THEN** the client merges the returned active work-cycle state, archived
  cycle summary, deleted active card identifiers, and board version into
  affected query caches
- **AND** invalidates only exact affected queries when a refetch is needed for
  correctness

### Requirement: Client no longer needs legacy safety snapshots for history

The system SHALL stop using complete-board safety snapshots for normal
completion and History reads once work-cycle resource endpoints are available.

#### Scenario: History follows summary bootstrap

- **WHEN** the authenticated board is loaded from lean bootstrap summaries and
  the user opens History
- **THEN** the client reads completed history through the history query
- **AND** does not load a complete legacy board snapshot to recover history

#### Scenario: Completion follows summary bootstrap

- **WHEN** the authenticated board is loaded from lean bootstrap summaries and
  the user completes work
- **THEN** the client submits the completion command without first loading a
  complete legacy board snapshot
- **AND** does not submit placeholder active-card content or empty history as a
  full-board save

### Requirement: Client mutates clear board through TanStack Query

The system SHALL use a TanStack Query mutation for confirmed clear-board
actions.

#### Scenario: User confirms clear board

- **WHEN** the user confirms clear board
- **THEN** the client submits a clear-board command mutation
- **AND** replaces board bootstrap columns with an empty list
- **AND** merges the returned active work-cycle state and board version into the
  board bootstrap cache
- **AND** removes or invalidates active-card detail caches for deleted cards
- **AND** does not submit a legacy full-board save for clear board

#### Scenario: Clear-board mutation fails after optimistic update

- **WHEN** a clear-board mutation fails after the client has updated cache
  optimistically
- **THEN** the client restores the previous bootstrap cache snapshot
- **AND** restores or invalidates affected active-card detail cache snapshots
- **AND** exposes the existing unsaved or unavailable persistence state instead
  of treating the clear as durably saved

#### Scenario: Clear-board mutation succeeds after optimistic update

- **WHEN** a clear-board mutation succeeds
- **THEN** the client merges the returned empty active-board resources and board
  version into affected query caches
- **AND** invalidates only exact affected queries when a refetch is needed for
  correctness

### Requirement: Client no longer needs legacy safety snapshots for clear board

The system SHALL stop using complete-board safety snapshots for normal
clear-board actions once the clear-board resource command is available.

#### Scenario: Clear board follows summary bootstrap

- **WHEN** the authenticated board is loaded from lean bootstrap summaries and
  the user clears the board
- **THEN** the client submits the clear-board command without first loading a
  complete legacy board snapshot
- **AND** does not submit placeholder rich card content or empty history as a
  full-board save

### Requirement: Client has no legacy full-board persistence bridge

The system SHALL keep authenticated board reads and writes on TanStack Query
bootstrap, detail, history, and resource mutation paths without using
complete-board network persistence.

#### Scenario: Authenticated app starts

- **WHEN** the authenticated app initializes its board surface
- **THEN** it hydrates state from the board bootstrap query and related detail
  queries
- **AND** it does not call a legacy complete-board read helper

#### Scenario: Authenticated board changes

- **WHEN** the user creates, edits, moves, deletes, completes, clears, or
  reconfigures board resources
- **THEN** the client submits the matching resource mutation
- **AND** it does not call a legacy complete-board save helper

#### Scenario: Browser storage updates

- **WHEN** in-memory or browser-backed board state is updated after resource
  cache changes
- **THEN** the storage layer does not mirror that update through a full-board
  remote persistence request
### Requirement: Client serializes mutations for the same active card

The system SHALL run authenticated mutations that primarily target one active
card through a shared serial execution boundary keyed by card identifier while
allowing mutations for different cards to execute concurrently.

#### Scenario: Multiple mutation types target one card

- **WHEN** create, update, move, delete, tag-assignment, or tag-unassignment
  operations are submitted for the same card before earlier operations settle
- **THEN** the client starts at most one request for that card at a time
- **AND** it starts the remaining requests in submission order

#### Scenario: Mutations target different cards

- **WHEN** mutations for two different cards are ready to execute
- **THEN** neither card waits for the other card's serial queue
- **AND** both requests may remain in flight concurrently

#### Scenario: Earlier same-card mutation fails

- **WHEN** an in-flight card mutation fails while later mutations for that card
  are queued
- **THEN** the client exposes the existing persistence failure state
- **AND** the next queued request is allowed to start

### Requirement: Client reconciles ordered card mutation results

The system SHALL derive the visible cached state of an actively mutating card
from its latest confirmed state plus all later pending optimistic operations in
submission order.

#### Scenario: Older success settles after a newer optimistic edit

- **WHEN** a card mutation succeeds while a later optimistic mutation for the
  same card is pending
- **THEN** the client merges the successful operation into confirmed state
- **AND** reapplies the later optimistic operation so the older result does not
  replace newer title, content, priority, tag, or placement state

#### Scenario: Older mutation fails after a newer optimistic edit

- **WHEN** a card mutation fails while a later optimistic mutation for the same
  card is pending
- **THEN** the client removes only the failed operation from the optimistic
  sequence
- **AND** rebuilds the affected card from confirmed state plus the remaining
  pending operations

#### Scenario: One card rolls back while another card changes

- **WHEN** a mutation for one card fails after another card has been changed
- **THEN** rollback updates only the failed card's summary, detail, and placement
- **AND** it preserves the other card's optimistic or confirmed cache state

#### Scenario: Different-card results contain different board versions

- **WHEN** concurrent mutations for different cards settle with board versions
  in an order different from their numeric order
- **THEN** the cached board version remains the greatest version already
  observed
- **AND** an older result cannot decrease it
