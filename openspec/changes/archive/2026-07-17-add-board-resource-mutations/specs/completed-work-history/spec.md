## ADDED Requirements

### Requirement: Completed-column configuration persists through work-cycle settings mutation

The system SHALL persist completed-column configuration through a focused
work-cycle settings mutation without completing work or rewriting completed
history.

#### Scenario: User chooses completed column from board settings

- **WHEN** the user selects a valid current board column as the completed column
- **THEN** the client submits a work-cycle settings mutation
- **AND** the active work-cycle completed-column setting updates from the
  mutation result
- **AND** the client does not submit a legacy full-board save for that setting
  change

#### Scenario: User clears completed column from board settings

- **WHEN** the user clears the completed-column setting
- **THEN** the client submits a work-cycle settings mutation with a null
  completed-column value
- **AND** the active work-cycle completed-column setting updates from the
  mutation result
- **AND** the client does not submit a legacy full-board save for that setting
  change

#### Scenario: Work completion behavior remains unchanged

- **WHEN** the user confirms completing work
- **THEN** the system continues to archive cards, update completed history, and
  start the next active work cycle according to the existing completion
  behavior
