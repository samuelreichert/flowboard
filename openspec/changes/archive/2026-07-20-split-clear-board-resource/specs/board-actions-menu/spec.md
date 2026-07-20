## ADDED Requirements

### Requirement: Clear board persists through clear-board command

The system SHALL persist confirmed clear-board actions through a focused
clear-board command instead of the legacy full-board save bridge.

#### Scenario: User confirms clear board from the sidebar

- **WHEN** a user selects clear board from the sidebar and confirms the action
- **THEN** the client submits the clear-board command
- **AND** the active board becomes empty using the command result
- **AND** board tags, board background, and completed history remain available
- **AND** the client does not submit a legacy full-board save for clear board

#### Scenario: User cancels clear board from the sidebar

- **WHEN** a user selects clear board from the sidebar and cancels the
  confirmation
- **THEN** the client does not submit the clear-board command
- **AND** the active board remains unchanged
