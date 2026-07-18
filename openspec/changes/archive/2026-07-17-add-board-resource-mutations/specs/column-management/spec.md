## ADDED Requirements

### Requirement: Column management persists through column resource mutations

The system SHALL persist normal column management operations through focused
column resource mutations instead of the legacy full-board save bridge.

#### Scenario: User adds a column

- **WHEN** the user saves a valid new column from the board or Manage columns
  dialog
- **THEN** the client submits a column create mutation
- **AND** the column appears in the board using the mutation result
- **AND** the client does not submit a legacy full-board save for that column
  creation

#### Scenario: User renames a column

- **WHEN** the user saves a valid column rename
- **THEN** the client submits a column rename mutation
- **AND** the column title updates using the mutation result
- **AND** the client does not submit a legacy full-board save for that rename

#### Scenario: User reorders columns

- **WHEN** the user moves a column from the Manage columns dialog or column
  action menu
- **THEN** the client submits a column move mutation
- **AND** the board displays the returned column order
- **AND** the client does not submit a legacy full-board save for that reorder

#### Scenario: User deletes a column

- **WHEN** the user confirms deleting a column
- **THEN** the client submits a column delete mutation
- **AND** the column and its active cards are removed from the board using the
  mutation result
- **AND** the client does not submit a legacy full-board save for that deletion

#### Scenario: User deletes configured completed column

- **WHEN** the user deletes the column configured as completed work
- **THEN** the completed-column setting is cleared from the board state using
  the mutation result
- **AND** completing work requires the user to choose a completed column again
