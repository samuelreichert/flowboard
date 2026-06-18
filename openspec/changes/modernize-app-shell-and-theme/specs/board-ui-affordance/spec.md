## MODIFIED Requirements

### Requirement: Board actions use sidebar commands

The system SHALL expose board-level actions from sidebar commands rather than a compact top-right trigger.

#### Scenario: Board header is quiet

- **WHEN** the board is displayed
- **THEN** the board header does not show a top-right board actions trigger
- **AND** sidebar commands remain available for board-level tools

#### Scenario: Sidebar clear board command is available

- **WHEN** the board has one or more columns
- **THEN** the sidebar exposes a clear board command with an accessible name
- **AND** activating it opens the existing clear board confirmation flow
