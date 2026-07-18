## ADDED Requirements

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
