## ADDED Requirements

### Requirement: Structured persistence supports operation-level active card writes

The system SHALL persist active card create, update, move, and delete operations
with focused relational writes instead of replacing the full board aggregate.

#### Scenario: Active card is created

- **WHEN** a resolved principal creates an active card in a board column they
  own
- **THEN** the system inserts the active card row and active card-tag assignment
  rows required for that card
- **AND** it does not rewrite unrelated columns, cards, tags, work-cycle rows,
  or completed history rows

#### Scenario: Active card fields are updated

- **WHEN** a resolved principal updates an active card's title, content,
  priority, or tag assignments
- **THEN** the system updates that card row and its active card-tag assignment
  rows
- **AND** it does not rewrite unrelated board data

#### Scenario: Active card is moved

- **WHEN** a resolved principal moves an active card within or across columns
  in their main board
- **THEN** the system updates that card's column and ordering information
- **AND** it updates only ordering rows needed to preserve deterministic order
  for the affected column set
- **AND** it does not rewrite unrelated columns, tags, rich card content,
  work-cycle rows, or completed history rows

#### Scenario: Active card is deleted

- **WHEN** a resolved principal deletes an active card from their main board
- **THEN** the system deletes that active card and its active card-tag
  assignment rows
- **AND** it does not delete archived snapshots or unrelated board data

### Requirement: Operation-level card writes update board version

The system SHALL advance the board version when an active-card mutation changes
persisted board state.

#### Scenario: Card mutation succeeds

- **WHEN** an active card create, update, move, or delete operation is committed
- **THEN** the board version increments in the same transaction as the card
  change
- **AND** the API can return the updated version to the client

#### Scenario: Card mutation is rejected

- **WHEN** an active-card mutation fails validation or ownership checks
- **THEN** the board version does not increment
