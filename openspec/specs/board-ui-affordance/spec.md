# board-ui-affordance Specification

## Purpose
Defines board-level control affordances and action availability.

## Requirements
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

### Requirement: Existing destructive board actions remain protected
The system SHALL preserve existing confirmation and availability behavior for destructive board actions exposed from the sidebar.

#### Scenario: Clear board remains confirmation-gated
- **WHEN** the user chooses clear board from the sidebar
- **THEN** the system asks for confirmation before deleting columns and cards

#### Scenario: Clear board is hidden when unavailable
- **WHEN** the board has no columns
- **THEN** the system does not offer clear board as an available sidebar command
