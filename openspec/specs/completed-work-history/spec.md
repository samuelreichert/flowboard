## Purpose

Track how Flowboard configures completed work, archives completed cards into
work-cycle history, and displays those archived snapshots.

## Requirements
### Requirement: Board stores work-cycle history
The system SHALL persist the active work-cycle start date, configured completed column, and completed work-cycle history as part of the board state.

#### Scenario: Existing board is migrated with a Done column
- **WHEN** a stored board without work-cycle history contains a column titled `Done`
- **THEN** the system initializes the configured completed column to that column
- **AND** the system initializes the active work-cycle start date from the oldest card creation date in that column when one exists

#### Scenario: Existing board is migrated without a Done column
- **WHEN** a stored board without work-cycle history does not contain a column titled `Done`
- **THEN** the system initializes the configured completed column as unset
- **AND** the system initializes the active work-cycle start date to the current date

#### Scenario: Board is reloaded with history
- **WHEN** a user reloads the application after completed work has been archived
- **THEN** the active work-cycle metadata and completed work-cycle history remain available

### Requirement: User configures the completed column
The system SHALL provide a board settings dialog where the user selects which current board column represents completed work.

#### Scenario: User chooses completed column
- **WHEN** a user selects a column in board settings as the completed column
- **THEN** the system saves that column as the configured completed column

#### Scenario: Configured completed column is renamed
- **WHEN** the configured completed column is renamed
- **THEN** the system keeps that column selected as the completed column

#### Scenario: Configured completed column is deleted
- **WHEN** the configured completed column is deleted
- **THEN** the system clears the completed-column setting

#### Scenario: User clears board from settings
- **WHEN** the user opens board settings on a board with columns
- **THEN** the system exposes Clear board as a destructive settings action that still requires confirmation

### Requirement: User completes work from the board
The system SHALL expose a board-level `Complete work` command that archives the configured completed column after confirmation.

#### Scenario: User completes work with completed cards
- **WHEN** the user activates `Complete work` and the configured completed column contains one or more cards
- **THEN** the system asks the user to confirm archiving those cards and starting a new work cycle

#### Scenario: User confirms completing work with completed cards
- **WHEN** the user confirms completing work with one or more cards in the configured completed column
- **THEN** the system creates a completed work-cycle history entry containing readonly snapshots of those cards
- **AND** the system removes those cards from the active completed column
- **AND** the system starts a new active work cycle using the completion date as the new start date

#### Scenario: User cancels completing work
- **WHEN** the user cancels the `Complete work` confirmation
- **THEN** the system leaves the active board, active work cycle, and history unchanged

#### Scenario: User completes work without a configured completed column
- **WHEN** the user activates `Complete work` without a configured completed column
- **THEN** the system prevents completion and directs the user to configure a completed column in board settings

### Requirement: Empty work cycles can be completed
The system SHALL allow the user to complete a work cycle with no completed cards only after explicit confirmation.

#### Scenario: User attempts to complete empty work
- **WHEN** the user activates `Complete work` and the configured completed column contains zero cards
- **THEN** the system asks the user to confirm completing an empty work cycle

#### Scenario: User confirms empty work completion
- **WHEN** the user confirms completing an empty work cycle
- **THEN** the system creates a completed work-cycle history entry with zero archived cards
- **AND** the system starts a new active work cycle using the completion date as the new start date

### Requirement: History displays completed work by work-cycle date range
The system SHALL provide a separate History view that groups completed work by recorded work-cycle date range.

#### Scenario: User opens history
- **WHEN** the user opens the History view from the sidebar
- **THEN** the system displays completed work-cycle groups using each group's start date and end date

#### Scenario: History group contains archived cards
- **WHEN** a completed work-cycle group contains archived cards
- **THEN** the system lists the archived cards in that group with their saved title, content availability, priority, and tags

#### Scenario: History group is empty
- **WHEN** a completed work-cycle group contains zero archived cards
- **THEN** the system displays the group without active-board cards

#### Scenario: User opens archived card details
- **WHEN** a user opens an archived card from History
- **THEN** the system displays the archived card snapshot as readonly rich content
- **AND** the system displays created date near the title and archived date in the detail metadata
- **AND** the system displays priority and tags as separate labelled rows
- **AND** the system provides a Copy Markdown action for the archived card content

#### Scenario: History card metadata is visually stable
- **WHEN** History or board cards render priority and tag chips with long labels
- **THEN** the chips keep a consistent single-line height and truncate overflowing text instead of changing row height

### Requirement: History preserves tag context
The system SHALL store tag snapshots on archived cards and resolve history tag labels from current board tags when possible.

#### Scenario: Archived card tag still exists
- **WHEN** History displays an archived card with a tag ID that still exists in the board tag list
- **THEN** the system displays the current board tag name for that tag

#### Scenario: Archived card tag was renamed
- **WHEN** History displays an archived card with a tag ID whose board tag has been renamed after archival
- **THEN** the system displays the renamed board tag name

#### Scenario: Archived card tag was deleted
- **WHEN** History displays an archived card with a tag ID that no longer exists in the board tag list
- **THEN** the system displays the archived tag snapshot name for that tag

### Requirement: Completion can include a post-confirmation animation
The system MAY show a brief playful animation after work completion has been confirmed, but the persisted completion behavior SHALL NOT depend on the animation.

#### Scenario: Completion animation runs
- **WHEN** the user confirms completing work and the system shows an animation
- **THEN** the completion still archives the configured cards, updates history, and starts the next work cycle

#### Scenario: Completion animation is unavailable
- **WHEN** animation is disabled, interrupted, or unsupported
- **THEN** the completion still archives the configured cards, updates history, and starts the next work cycle

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
