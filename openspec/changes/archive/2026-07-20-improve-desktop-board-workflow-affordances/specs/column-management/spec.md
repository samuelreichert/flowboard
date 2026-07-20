## MODIFIED Requirements

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

#### Scenario: Primary reorder controls are visible

- **WHEN** the Manage columns dialog lists one or more columns
- **THEN** Move up and Move down remain visible row actions
- **AND** unavailable visible movement controls are disabled at dialog edges

#### Scenario: Secondary reorder controls are available from row actions

- **WHEN** the Manage columns dialog lists one or more columns
- **THEN** Move to top and Move to bottom remain available from each row through a secondary action surface
- **AND** unavailable secondary movement commands are disabled at dialog edges

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

#### Scenario: User returns to Manage columns after adding a column

- **WHEN** the user adds a column from the Manage columns dialog
- **THEN** the system returns to the Manage columns dialog after the column is created
- **AND** the newly created column appears in the dialog list

#### Scenario: Destructive column action is lower emphasis

- **WHEN** the Manage columns dialog lists columns
- **THEN** the delete action remains available for each column without appearing as an equal-weight default row action
- **AND** activating delete still uses the existing confirmation flow
