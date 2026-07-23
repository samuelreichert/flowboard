## MODIFIED Requirements

### Requirement: User performs column actions in the management dialog
The system SHALL provide rename, delete, and add-column entry points from the Manage columns dialog while preserving the manager as the parent context for rename and add-column child dialogs.

#### Scenario: User renames a column from Manage columns
- **WHEN** the user starts renaming a column from the Manage columns dialog
- **THEN** the system uses the existing column rename validation and save behavior
- **AND** the Manage columns dialog remains open behind the rename dialog

#### Scenario: User deletes a column from Manage columns
- **WHEN** the user starts deleting a column from the Manage columns dialog
- **THEN** the system requires confirmation before deleting the column and its cards

#### Scenario: User adds a column from Manage columns
- **WHEN** the user activates the add-column entry point in Manage columns
- **THEN** the system opens the add-column flow above the still-open Manage columns dialog
- **AND** the existing board-level Add another column affordance remains available

#### Scenario: User cancels adding a column from Manage columns
- **WHEN** the user dismisses the add-column flow without saving
- **THEN** the Manage columns dialog remains open
- **AND** focus returns to its add-column entry point

#### Scenario: User returns to Manage columns after adding a column
- **WHEN** the user adds a column from the Manage columns dialog
- **THEN** the add-column dialog closes while Manage columns remains open
- **AND** the newly created column appears in the dialog list

#### Scenario: Destructive column action is lower emphasis
- **WHEN** the Manage columns dialog lists columns
- **THEN** the delete action remains available for each column without appearing as an equal-weight default row action
- **AND** activating delete still uses the existing confirmation flow
