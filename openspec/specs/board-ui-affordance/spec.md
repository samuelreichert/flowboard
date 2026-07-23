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

#### Scenario: Sidebar manage columns command is available

- **WHEN** the board is displayed
- **THEN** the sidebar exposes a Manage columns command with an accessible name
- **AND** activating it opens the Manage columns dialog

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

### Requirement: Empty board setup uses a primary board action

The system SHALL guide desktop users through first-column creation from the board surface when the active board has no columns.

#### Scenario: Empty board shows first-column setup

- **WHEN** the board workspace is displayed with zero columns
- **THEN** the board surface displays an empty state with a primary create-first-column action
- **AND** activating the action opens the existing add-column flow

#### Scenario: Empty board composer points to the same setup flow

- **WHEN** the board workspace has zero columns and the composer is visible
- **THEN** the composer remains unavailable for card creation
- **AND** its add-column affordance opens the same add-column flow as the board empty state

### Requirement: Desktop column overflow is visually intentional

The system SHALL make horizontal board overflow and the trailing add-column affordance read as intentional desktop behavior and SHALL provide direct mouse access to overflowing columns.

#### Scenario: Columns overflow horizontally

- **WHEN** the board has enough columns that the column list overflows horizontally on desktop
- **THEN** the board shows a subtle overflow affordance and a visible horizontal scrollbar
- **AND** the add-column affordance remains reachable without appearing broken or unintentionally clipped

#### Scenario: Mouse wheel moves an overflowing board

- **WHEN** the pointer is over an overflowing desktop column list and a mouse wheel supplies vertical movement
- **THEN** the board consumes the movement only while it can scroll horizontally in that direction
- **AND** the column list moves horizontally

#### Scenario: Board reaches a horizontal boundary

- **WHEN** the overflowing column list is already at the horizontal start or end in the requested direction
- **THEN** the board does not consume further translated wheel movement
- **AND** normal ancestor scrolling remains available

#### Scenario: Add-column affordance fits without overflow

- **WHEN** the current desktop viewport can fit the existing columns and add-column affordance
- **THEN** the add-column affordance appears fully within the visible board area
