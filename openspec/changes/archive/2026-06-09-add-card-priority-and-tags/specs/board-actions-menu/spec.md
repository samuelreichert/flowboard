## ADDED Requirements

### Requirement: Board actions are available from a top-right menu

The system SHALL provide a single top-right board actions menu for board-level actions.

#### Scenario: User opens board actions

- **WHEN** a user activates the top-right board actions control
- **THEN** the system displays menu entries for background settings, tag management, and clearing the board when clearing is available

### Requirement: Background settings remain accessible

The system SHALL keep the existing board background selection behavior accessible from the board actions menu.

#### Scenario: User changes background from menu

- **WHEN** a user opens background settings from the board actions menu and chooses a background
- **THEN** the selected background is applied and persisted as before

### Requirement: Tag management opens from board actions

The system SHALL allow users to open tag management from the board actions menu.

#### Scenario: User opens tag manager

- **WHEN** a user selects tag management from the board actions menu
- **THEN** the system displays controls to create, edit, and remove board tags

### Requirement: Clear board remains confirmation-gated

The system SHALL preserve the existing clear-board confirmation behavior when clear board is moved into the board actions menu.

#### Scenario: User chooses clear board from menu

- **WHEN** a user selects clear board from the board actions menu
- **THEN** the system asks for confirmation before deleting columns and cards
