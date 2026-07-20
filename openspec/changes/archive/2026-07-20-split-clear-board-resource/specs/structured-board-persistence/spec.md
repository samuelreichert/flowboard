## ADDED Requirements

### Requirement: Structured persistence supports operation-level active-board clear

The system SHALL clear the active board with focused relational writes instead
of replacing the full board aggregate.

#### Scenario: Active board is cleared

- **WHEN** a resolved principal clears their main board
- **THEN** the system deletes active card-tag assignment rows for active cards
  in that board
- **AND** deletes active card rows in that board
- **AND** deletes active column rows in that board
- **AND** clears the active work-cycle completed-column setting for that board
- **AND** it does not rewrite unrelated board data

#### Scenario: Clear preserves durable non-active-board data

- **WHEN** a resolved principal clears their main board
- **THEN** the system preserves board tag rows, board metadata rows, completed
  work-cycle rows, archived card snapshot rows, archived tag snapshot rows,
  project rows, owner rows, and profile rows

#### Scenario: Clear-board is owner scoped

- **WHEN** the system clears active board rows for a resolved principal
- **THEN** only rows reachable from that principal's main board are deleted or
  updated

#### Scenario: Clear-board is idempotent for empty active boards

- **WHEN** a resolved principal clears an active board that has no active
  columns or active cards
- **THEN** the system leaves the active board empty
- **AND** does not create default columns or mutate unrelated records

### Requirement: Operation-level active-board clear updates board version

The system SHALL advance the board version when a clear-board command changes
persisted active-board state.

#### Scenario: Clear-board command succeeds

- **WHEN** an active-board clear operation is committed
- **THEN** the board version increments in the same transaction as the active
  row deletion and active work-cycle normalization
- **AND** the API can return the updated version to the client

#### Scenario: Clear-board command is rejected

- **WHEN** a clear-board command fails authentication or ownership checks
- **THEN** active board rows are not deleted
- **AND** the board version does not increment
