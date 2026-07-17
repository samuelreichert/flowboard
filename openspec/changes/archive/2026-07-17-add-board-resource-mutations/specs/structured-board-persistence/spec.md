## ADDED Requirements

### Requirement: Structured persistence supports operation-level column writes

The system SHALL persist active column create, rename, reorder, and delete
operations with focused relational writes instead of replacing the full board
aggregate.

#### Scenario: Active column is created

- **WHEN** a resolved principal creates a column in their main board
- **THEN** the system inserts the column row and updates only ordering rows
  needed to place the new column
- **AND** it does not rewrite unrelated cards, tags, work-cycle rows, or
  completed history rows

#### Scenario: Active column is renamed

- **WHEN** a resolved principal renames a column in their main board
- **THEN** the system updates that column row
- **AND** it does not rewrite unrelated board data

#### Scenario: Active column is reordered

- **WHEN** a resolved principal moves a column within their main board
- **THEN** the system updates only ordering rows needed to preserve
  deterministic column order
- **AND** it does not rewrite cards, tags, rich card content, work-cycle rows,
  or completed history rows

#### Scenario: Active column is deleted

- **WHEN** a resolved principal deletes a column from their main board
- **THEN** the system deletes that active column, its active cards, and active
  card-tag assignment rows
- **AND** it clears the completed-column setting when it referenced the deleted
  column
- **AND** it does not delete archived snapshots or unrelated board data

### Requirement: Structured persistence supports operation-level tag writes

The system SHALL persist board tag create, rename, delete, assign, and unassign
operations with focused relational writes instead of replacing the full board
aggregate.

#### Scenario: Board tag is created

- **WHEN** a resolved principal creates a tag in their main board
- **THEN** the system inserts the tag row
- **AND** it does not rewrite unrelated columns, cards, work-cycle rows, or
  completed history rows

#### Scenario: Board tag is renamed

- **WHEN** a resolved principal renames a tag in their main board
- **THEN** the system updates that tag row
- **AND** active cards and archived snapshots that reference the tag remain
  associated with the same tag identity

#### Scenario: Board tag is deleted

- **WHEN** a resolved principal deletes a tag from their main board
- **THEN** the system deletes the tag row and active card-tag assignment rows
  for that tag
- **AND** it does not delete active cards, columns, work-cycle rows, or archived
  tag snapshots

#### Scenario: Active card tag assignment changes

- **WHEN** a resolved principal assigns or unassigns one tag on one active card
  in their main board
- **THEN** the system changes only the affected active card-tag assignment row
- **AND** it does not rewrite the card row, unrelated card-tag rows, or
  unrelated board data

### Requirement: Structured persistence supports operation-level board settings writes

The system SHALL persist board background and active work-cycle setting changes
with focused relational writes instead of replacing the full board aggregate.

#### Scenario: Board background is updated

- **WHEN** a resolved principal changes the background of their main board
- **THEN** the system updates the board metadata row
- **AND** it does not rewrite columns, cards, tags, work-cycle history, or rich
  card content

#### Scenario: Completed-column setting is updated

- **WHEN** a resolved principal changes the active work-cycle completed-column
  setting for their main board
- **THEN** the system updates the active work-cycle row
- **AND** it does not complete work, archive cards, or rewrite completed history

### Requirement: Operation-level non-card board writes update board version

The system SHALL advance the board version when a column, tag, board settings,
work-cycle settings, or card-tag assignment mutation changes persisted board
state.

#### Scenario: Non-card board mutation succeeds

- **WHEN** a column, tag, board settings, work-cycle settings, or card-tag
  assignment operation is committed
- **THEN** the board version increments in the same transaction as the change
- **AND** the API can return the updated version to the client

#### Scenario: Non-card board mutation is rejected

- **WHEN** a non-card board mutation fails validation or ownership checks
- **THEN** the board version does not increment
