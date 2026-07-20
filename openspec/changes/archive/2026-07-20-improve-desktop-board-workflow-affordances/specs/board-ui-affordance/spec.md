## ADDED Requirements

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

The system SHALL make horizontal board overflow and the trailing add-column affordance read as intentional desktop behavior.

#### Scenario: Columns overflow horizontally

- **WHEN** the board has enough columns that the column list overflows horizontally on desktop
- **THEN** the board shows a subtle overflow affordance such as edge treatment, scroll padding, or equivalent visual cue
- **AND** the add-column affordance remains reachable without appearing broken or unintentionally clipped

#### Scenario: Add-column affordance fits without overflow

- **WHEN** the current desktop viewport can fit the existing columns and add-column affordance
- **THEN** the add-column affordance appears fully within the visible board area
