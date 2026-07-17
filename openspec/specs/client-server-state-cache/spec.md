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

### Requirement: Client preserves unsurfaced data during legacy full-board saves

The system SHALL prevent summary-first board state from overwriting persisted
data that the bootstrap query intentionally did not load while legacy
full-board saves are still in use.

#### Scenario: Legacy save follows summary bootstrap

- **WHEN** an authenticated board edit triggers the legacy full-board save path
  after the board was loaded from bootstrap summaries
- **THEN** the client preserves rich active-card content that has not been
  detail-hydrated
- **AND** it preserves completed work history that was not included in bootstrap
- **AND** it does not submit empty placeholder content or empty history as if
  those values were user edits

#### Scenario: Legacy safety snapshot is needed

- **WHEN** the client cannot prove it has complete rich content and history for
  a legacy full-board save
- **THEN** it loads or reuses a complete legacy board snapshot before submitting
  the merged full-board save

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
