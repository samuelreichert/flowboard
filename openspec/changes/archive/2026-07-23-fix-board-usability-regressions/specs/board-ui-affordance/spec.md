## MODIFIED Requirements

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
