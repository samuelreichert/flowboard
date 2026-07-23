## ADDED Requirements

### Requirement: Nested standard dialogs preserve parent context
The system SHALL preserve an open parent standard dialog while a child standard dialog is active and SHALL return focus to the originating parent control when the child closes.

#### Scenario: User cancels a nested dialog
- **WHEN** a user dismisses a child standard dialog through its close control, Escape key, or outside press
- **THEN** the parent dialog remains open
- **AND** focus returns to the parent control that opened the child dialog

#### Scenario: User saves from a nested dialog
- **WHEN** a user saves valid data from a child standard dialog
- **THEN** the child dialog closes
- **AND** the parent dialog remains open with the updated child data visible
