## ADDED Requirements

### Requirement: Client reads completed history through query cache

The system SHALL load completed work-cycle history through TanStack Query
instead of loading a full board snapshot.

#### Scenario: User opens History

- **WHEN** the user opens the History view
- **THEN** the client requests completed history summaries with a stable history
  query key
- **AND** renders completed work-cycle groups from the history summary cache
- **AND** does not request `/api/boards/default` solely to display History

#### Scenario: User loads more completed history

- **WHEN** the completed history summary response indicates more cycles are
  available
- **THEN** the client can request the next history page using the returned
  cursor
- **AND** merges the next page without duplicating existing cycles

### Requirement: Client hydrates archived card details on demand

The system SHALL load rich archived-card content through an archived-card detail
query only when an archived card is opened.

#### Scenario: User opens archived card

- **WHEN** the user opens an archived card from History
- **THEN** the client requests archived-card detail with a stable key containing
  the cycle identifier and archived card identifier
- **AND** the archived-card dialog can render summary metadata while rich
  content is loading
- **AND** the dialog fills rich content from the archived-card detail query when
  it resolves

#### Scenario: User opens direct archived card route

- **WHEN** the user opens `/history/cycles/:cycleId/cards/:cardId` directly
- **THEN** the client resolves the archived card summary from the completed
  history query
- **AND** loads rich archived content from the archived-card detail query

#### Scenario: Archived card detail is missing

- **WHEN** the archived-card detail query returns not found for the requested
  cycle or card
- **THEN** the client uses the existing missing archived-card route behavior
  without revealing whether the card belongs to another user

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
