# column-management Specification

## Purpose

Defines board column management workflows and constraints.
## Requirements
### Requirement: User manages columns from a board-level dialog

The system SHALL provide a Manage columns dialog for board-level column management.

#### Scenario: User opens Manage columns from the sidebar

- **WHEN** the user activates the Manage columns sidebar command
- **THEN** the system opens a Manage columns dialog
- **AND** the dialog lists the current board columns in their visual order

#### Scenario: User manages an empty board

- **WHEN** the user opens Manage columns on a board with no columns
- **THEN** the system shows an empty state
- **AND** the system provides an add-column entry point

### Requirement: User reorders columns in the management dialog

The system SHALL allow users to reorder columns from the Manage columns dialog without board-surface column drag-and-drop.

#### Scenario: User moves a column up

- **WHEN** the user activates Move up for a column that is not first in the dialog list
- **THEN** the system moves that column one position earlier in the board order
- **AND** the board displays the column one position further left

#### Scenario: User moves a column down

- **WHEN** the user activates Move down for a column that is not last in the dialog list
- **THEN** the system moves that column one position later in the board order
- **AND** the board displays the column one position further right

#### Scenario: User moves a column to the top

- **WHEN** the user activates Move to top for a column that is not first in the dialog list
- **THEN** the system moves that column to the first board position
- **AND** the board displays the column as the left-most column

#### Scenario: User moves a column to the bottom

- **WHEN** the user activates Move to bottom for a column that is not last in the dialog list
- **THEN** the system moves that column to the last board position
- **AND** the board displays the column as the right-most column

#### Scenario: Reorder controls are disabled at dialog edges

- **WHEN** a column is first or last in the dialog list
- **THEN** movement controls that would move the column past that edge remain visible
- **AND** those unavailable controls are disabled

### Requirement: User performs column actions in the management dialog

The system SHALL provide rename, delete, and add-column entry points from the Manage columns dialog.

#### Scenario: User renames a column from Manage columns

- **WHEN** the user starts renaming a column from the Manage columns dialog
- **THEN** the system uses the existing column rename validation and save behavior

#### Scenario: User deletes a column from Manage columns

- **WHEN** the user starts deleting a column from the Manage columns dialog
- **THEN** the system requires confirmation before deleting the column and its cards

#### Scenario: User adds a column from Manage columns

- **WHEN** the user activates the add-column entry point in Manage columns
- **THEN** the system opens the add-column flow
- **AND** the existing board-level Add another column affordance remains available

### Requirement: User moves columns from column action menus

The system SHALL provide quick horizontal movement commands from each column action menu.

#### Scenario: User moves a column left

- **WHEN** the user activates Move left for a column that is not left-most
- **THEN** the system moves that column one position left on the board

#### Scenario: User moves a column right

- **WHEN** the user activates Move right for a column that is not right-most
- **THEN** the system moves that column one position right on the board

#### Scenario: User moves a column to first

- **WHEN** the user activates Move to first for a column that is not left-most
- **THEN** the system moves that column to the left-most board position

#### Scenario: User moves a column to last

- **WHEN** the user activates Move to last for a column that is not right-most
- **THEN** the system moves that column to the right-most board position

#### Scenario: Movement commands are disabled at board edges

- **WHEN** a column is left-most or right-most on the board
- **THEN** movement commands that would move the column past that edge remain visible
- **AND** those unavailable commands are disabled

### Requirement: Completed-column configuration survives reorder

The system SHALL preserve completed-column configuration when columns are reordered.

#### Scenario: User reorders the completed column

- **WHEN** the user moves the configured completed column to a different board position
- **THEN** the system keeps the same column configured as completed
- **AND** completing work still archives cards from that column

### Requirement: Board-surface column drag remains unavailable

The system SHALL NOT introduce board-surface column drag-and-drop as part of column management.

#### Scenario: User interacts with a column header on the board

- **WHEN** the user drags or swipes from a column header on the board surface
- **THEN** the system does not reorder columns through that gesture
- **AND** card drag-and-drop behavior remains unchanged

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
