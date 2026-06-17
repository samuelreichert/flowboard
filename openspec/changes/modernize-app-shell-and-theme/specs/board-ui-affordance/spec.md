## MODIFIED Requirements

### Requirement: Board actions use a clear settings affordance
The system SHALL expose board-level actions from a compact top-right trigger whose visual affordance communicates board tools rather than global app appearance settings.

#### Scenario: Board actions trigger is visible
- **WHEN** the board is displayed
- **THEN** the system shows a top-right icon trigger for board-level actions
- **AND** the trigger has an accessible name for opening board actions or board tools

#### Scenario: Board actions menu opens
- **WHEN** the user activates the board actions trigger
- **THEN** the system displays the board actions menu with tag management and clear board when clearing is available
- **AND** the system does not display background settings or app-level theme controls in the board actions menu

### Requirement: Board action affordance remains discoverable
The system SHALL provide a discoverable label or tooltip for icon-only board action controls.

#### Scenario: User identifies icon-only board trigger
- **WHEN** the user focuses or hovers the top-right board actions trigger
- **THEN** the system communicates the trigger purpose as board actions or board tools
