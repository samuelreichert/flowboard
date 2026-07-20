## ADDED Requirements

### Requirement: Structured persistence supports operation-level work-cycle completion

The system SHALL complete work with focused relational writes instead of
replacing the full board aggregate.

#### Scenario: Work cycle is completed

- **WHEN** a resolved principal completes work for their main board
- **THEN** the system inserts one completed work-cycle row
- **AND** inserts archived card snapshot rows for active cards in the configured
  completed column
- **AND** inserts archived tag snapshot rows for each archived card tag
- **AND** deletes only the archived active cards and their active card-tag
  assignments
- **AND** updates the active work-cycle start date
- **AND** it does not rewrite unrelated columns, active cards, board tags,
  board settings, unrelated work-cycle history, or unrelated rich card content

#### Scenario: Completion preserves archived tag names

- **WHEN** a completed active card has assigned tags
- **THEN** the system stores tag snapshot names with the archived card
- **AND** future tag rename or delete operations do not remove the archived
  snapshot names

#### Scenario: Completion is rejected

- **WHEN** a resolved principal attempts to complete work without a configured
  completed column or without active cards in that column
- **THEN** the system does not insert completed-cycle rows
- **AND** it does not delete active cards or active card-tag rows
- **AND** it does not increment board version

### Requirement: Structured persistence reads completed history summaries

The system SHALL read completed work-cycle summaries from structured history
records without reconstructing the full board aggregate.

#### Scenario: Completed history summaries are read

- **WHEN** the system loads completed history summaries for a resolved principal
- **THEN** it reads completed work-cycle rows and archived card summary fields
  reachable from that principal's main board
- **AND** it does not read active board columns, active cards, or archived rich
  card content for the summary response

#### Scenario: Completed history summaries are paginated

- **WHEN** the system loads completed history summaries with a limit and cursor
- **THEN** it returns a deterministic bounded window ordered by completed-cycle
  end date and stable cycle identity

### Requirement: Structured persistence reads archived card detail separately

The system SHALL read rich archived card content through an archived-card detail
query scoped to the resolved principal's main board history.

#### Scenario: Archived card detail reads rich content

- **WHEN** the system loads archived card detail for a resolved principal
- **THEN** it reads the archived card from completed history records reachable
  from that principal's main board
- **AND** it returns the rich archived card content and archived metadata

#### Scenario: Archived card detail is owner scoped

- **WHEN** the requested completed cycle or archived card exists but is not
  reachable from the resolved principal's main board
- **THEN** the system does not return the archived card

### Requirement: Operation-level work-cycle completion updates board version

The system SHALL advance the board version when a work-cycle completion command
changes persisted board state.

#### Scenario: Work-cycle completion succeeds

- **WHEN** a work-cycle completion operation is committed
- **THEN** the board version increments in the same transaction as the archive
  and active-card cleanup
- **AND** the API can return the updated version to the client

#### Scenario: Work-cycle completion is rejected

- **WHEN** a work-cycle completion command fails validation or ownership checks
- **THEN** the board version does not increment
