## ADDED Requirements

### Requirement: Composer resets non-destination metadata after submit

The system SHALL reset transient composer metadata after card creation while preserving the selected destination column for repeated capture.

#### Scenario: Non-default metadata resets after submit

- **WHEN** the user creates a card with non-default priority or one or more tags selected
- **THEN** the composer resets priority to Medium
- **AND** the composer clears selected tags
- **AND** the selected destination column remains unchanged

#### Scenario: Default metadata remains quiet after submit

- **WHEN** the user creates a card with Medium priority and no selected tags
- **THEN** the composer clears the draft without showing an extra metadata notice

## MODIFIED Requirements

### Requirement: Composer handles invalid and empty states

The system SHALL prevent invalid card creation and communicate why capture is unavailable or incomplete.

#### Scenario: User submits empty draft

- **WHEN** the composer input is empty or contains only whitespace
- **THEN** the system does not create a card
- **AND** the composer communicates that a card title is required

#### Scenario: Board has no columns

- **WHEN** the board has no columns
- **THEN** the composer does not allow card creation
- **AND** the system provides a visible add-column control that opens the same add-column flow as the board empty state

#### Scenario: User has an unsent draft

- **WHEN** the composer contains unsent text or selected metadata
- **THEN** the system preserves the draft while the user interacts with board controls in the same board session
