# board-ui-affordance Specification

## Purpose
TBD - created by archiving change improve-project-readiness-and-pwa. Update Purpose after archive.
## Requirements
### Requirement: Board actions use a clear settings affordance
The system SHALL expose board-level actions from a compact top-right trigger whose visual affordance communicates board settings or board tools rather than generic overflow.

#### Scenario: Board actions trigger is visible
- **WHEN** the board is displayed
- **THEN** the system shows a top-right icon trigger for board-level actions
- **AND** the trigger has an accessible name for opening board actions or board settings

#### Scenario: Board actions menu opens
- **WHEN** the user activates the board actions trigger
- **THEN** the system displays the board actions menu with background settings, tag management, and clear board when clearing is available

### Requirement: Board action affordance remains discoverable
The system SHALL provide a discoverable label or tooltip for icon-only board action controls.

#### Scenario: User identifies icon-only board trigger
- **WHEN** the user focuses or hovers the top-right board actions trigger
- **THEN** the system communicates the trigger purpose as board actions or board settings

### Requirement: Existing board actions remain protected
The system SHALL preserve existing confirmation and availability behavior for destructive board actions.

#### Scenario: Clear board remains confirmation-gated
- **WHEN** the user chooses clear board from the board actions menu
- **THEN** the system asks for confirmation before deleting columns and cards
  
#### Scenario: Clear board is hidden when unavailable
- **WHEN** the board has no columns
- **THEN** the system does not offer clear board as an available menu action

