## ADDED Requirements

### Requirement: Work completion persists through work-cycle command

The system SHALL persist normal work completion through a focused work-cycle
completion command instead of the legacy full-board save bridge.

#### Scenario: User confirms completing work with completed cards

- **WHEN** the user confirms completing work with one or more cards in the
  configured completed column
- **THEN** the client submits a work-cycle completion command
- **AND** the completed cards are archived into completed work history using the
  command result
- **AND** the cards are removed from the active board using the command result
- **AND** the next active work cycle starts using the command result
- **AND** the client does not submit a legacy full-board save for completion

#### Scenario: User cancels completing work

- **WHEN** the user cancels the `Complete work` confirmation
- **THEN** the client does not submit a work-cycle completion command
- **AND** the active board, active work cycle, and history remain unchanged

#### Scenario: User attempts completion when completion is unavailable

- **WHEN** the board has no configured completed column or the configured
  completed column contains no active cards
- **THEN** the system keeps completion unavailable according to the current
  board behavior
- **AND** the client does not submit a work-cycle completion command

### Requirement: History displays from completed-history resources

The system SHALL display completed work history from completed-history resource
queries instead of a complete board snapshot.

#### Scenario: User opens history

- **WHEN** the user opens the History view from the sidebar or `/history`
- **THEN** the system loads completed work-cycle summaries through the history
  resource endpoint
- **AND** displays completed work-cycle groups using each group's start date and
  end date
- **AND** the client does not request the legacy default-board endpoint solely
  to display history

#### Scenario: History group contains archived card summaries

- **WHEN** a completed work-cycle group contains archived card summaries
- **THEN** the system lists the archived cards in that group with their saved
  title, content availability, priority, and tags

#### Scenario: User opens archived card details

- **WHEN** a user opens an archived card from History
- **THEN** the system loads rich archived content through the archived-card
  detail resource endpoint
- **AND** displays the archived card snapshot as readonly rich content
- **AND** displays created date near the title and archived date in the detail
  metadata
- **AND** displays priority and tags as separate labelled rows
- **AND** provides a Copy Markdown action for the archived card content

### Requirement: Direct archived routes use history resources

The system SHALL resolve direct archived-card routes from completed-history
resources without loading a complete board snapshot.

#### Scenario: User opens direct archived card route

- **WHEN** the user opens `/history/cycles/:cycleId/cards/:cardId` directly
- **THEN** the system loads completed history summaries as needed to resolve the
  completed work cycle and archived card summary
- **AND** loads the archived card detail resource for rich content
- **AND** opens the matching archived card details

#### Scenario: Direct archived card route target is missing

- **WHEN** the user opens `/history/cycles/:cycleId/cards/:cardId` and the
  cycle or archived card cannot be found after history resources load
- **THEN** the system displays completed work history with the existing
  recoverable missing-archive state
- **AND** it does not open an unrelated archived card
