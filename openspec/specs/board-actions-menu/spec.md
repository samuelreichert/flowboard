# board-actions-menu Specification

## Purpose
Defines where board-level actions are exposed and how destructive board actions are protected.

## Requirements
### Requirement: Board actions are available from the sidebar

The system SHALL provide board-level actions from the sidebar rather than from a top-right board actions menu.

#### Scenario: User uses sidebar board actions

- **WHEN** a user views the sidebar
- **THEN** the system displays tag management as a sidebar command
- **AND** the system displays clear board as a sidebar command when clearing is available
- **AND** the board header does not display a top-right board actions menu

### Requirement: Tag management opens from sidebar board actions

The system SHALL allow users to open tag management from the sidebar board actions.

#### Scenario: User opens tag manager

- **WHEN** a user selects tag management from the sidebar
- **THEN** the system displays controls to create, edit, and remove board tags

### Requirement: Clear board remains confirmation-gated

The system SHALL preserve the existing clear-board confirmation behavior when clear board is exposed from the sidebar.

#### Scenario: User chooses clear board from the sidebar

- **WHEN** a user selects clear board from the sidebar
- **THEN** the system asks for confirmation before deleting columns and cards
