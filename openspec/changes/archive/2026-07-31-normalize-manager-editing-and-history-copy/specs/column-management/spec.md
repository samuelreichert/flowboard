## MODIFIED Requirements

### Requirement: User reorders columns in the management dialog

The system SHALL allow users to reorder columns from the Manage columns dialog
without board-surface column drag-and-drop. Desktop rows SHALL expose every
reorder command as a direct separated icon action; smartphone rows SHALL expose
the same commands through one accessible column-actions menu.

#### Scenario: User moves a column up

- **WHEN** the user activates Move up for a column that is not first in the
  dialog list
- **THEN** the system moves that column one position earlier in the board order
- **AND** the board displays the column one position further left

#### Scenario: User moves a column down

- **WHEN** the user activates Move down for a column that is not last in the
  dialog list
- **THEN** the system moves that column one position later in the board order
- **AND** the board displays the column one position further right

#### Scenario: User moves a column to the top

- **WHEN** the user activates Move to top for a column that is not first in the
  dialog list
- **THEN** the system moves that column to the first board position
- **AND** the board displays the column as the left-most column

#### Scenario: User moves a column to the bottom

- **WHEN** the user activates Move to bottom for a column that is not last in
  the dialog list
- **THEN** the system moves that column to the last board position
- **AND** the board displays the column as the right-most column

#### Scenario: Desktop rows expose all reorder commands directly

- **WHEN** Manage columns is viewed above the smartphone breakpoint
- **THEN** Move to top, Move up, Move down, and Move to bottom are direct icon
  actions in each column row
- **AND** the actions are visually separated from one another
- **AND** unavailable movement commands remain visible and disabled at dialog
  edges

#### Scenario: Smartphone rows expose the same commands through a menu

- **WHEN** Manage columns is viewed at or below the smartphone breakpoint
- **THEN** a column row exposes one accessible Column actions menu trigger
- **AND** its menu contains Move to top, Move up, Move down, and Move to
  bottom in the same command order as desktop
- **AND** unavailable movement commands remain visible and disabled at dialog
  edges

### Requirement: User performs column actions in the management dialog

The system SHALL provide inline rename, delete, and add-column entry points
from the Manage columns dialog while preserving the existing column validation
and save behavior.

#### Scenario: User starts renaming a column from Manage columns

- **WHEN** the user activates Rename for a column row
- **THEN** that row replaces its summary with a focused inline column-title
  input
- **AND** no column rename mutation is sent until the user commits a valid
  title

#### Scenario: User saves or cancels an inline column rename

- **WHEN** the user commits a valid column title with Enter or by moving focus
  away from a valid inline input
- **THEN** the system saves the renamed column using the existing validation
  rules
- **AND** when the user presses Escape while editing, the original title is
  restored without a column rename mutation

#### Scenario: User deletes a column from Manage columns

- **WHEN** the user starts deleting a column from the Manage columns dialog
- **THEN** the system requires confirmation before deleting the column and its
  cards

#### Scenario: User adds a column from Manage columns

- **WHEN** the user activates the add-column entry point in Manage columns
- **THEN** the system opens the add-column flow
- **AND** the existing board-level Add another column affordance remains
  available

#### Scenario: User returns to Manage columns after adding a column

- **WHEN** the user adds a column from the Manage columns dialog
- **THEN** the system returns to the Manage columns dialog after the column is
  created
- **AND** the newly created column appears in the dialog list

#### Scenario: Destructive column action remains lower emphasis

- **WHEN** the Manage columns dialog lists columns
- **THEN** Delete follows a visual separator after non-destructive actions and
  uses the existing destructive visual treatment
- **AND** activating Delete still uses the existing confirmation flow

#### Scenario: Smartphone column menu preserves non-reorder actions

- **WHEN** a user opens a Column actions menu at the smartphone breakpoint
- **THEN** the menu also exposes Rename and Delete for that column
- **AND** Delete is separated from the non-destructive commands
