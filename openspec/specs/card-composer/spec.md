# card-composer Specification

## Purpose

Defines the global board card composer used for fast card capture without opening the full card dialog.

## Requirements

### Requirement: Board exposes a global card composer

The system SHALL provide a global sticky composer on the board view for creating cards while keeping the board visible.

#### Scenario: Composer appears on board view

- **WHEN** the user views the board
- **THEN** the system displays a card composer anchored near the bottom of the board workspace
- **AND** the composer remains visually associated with the board rather than a separate page or modal dialog

#### Scenario: Composer is not shown on non-board views

- **WHEN** the user views history or another non-board workspace view
- **THEN** the system does not display the board card composer

### Requirement: Composer captures title and content from one input

The system SHALL use one primary multiline input for card capture and derive the card title and content from that input.

#### Scenario: User creates a title-only card

- **WHEN** the user enters one non-empty line and submits the composer
- **THEN** the system creates a card whose title is that line
- **AND** the card content is empty

#### Scenario: User creates a card with content

- **WHEN** the user enters multiple lines and submits the composer
- **THEN** the system creates a card whose title is the first non-empty line
- **AND** the system stores text after the title line as the card content

#### Scenario: Input grows with content

- **WHEN** the user types beyond one line
- **THEN** the composer input grows to show additional content up to a bounded height
- **AND** the board layout remains usable without overlapping required controls

### Requirement: Composer supports compact card metadata

The system SHALL allow the user to choose destination column, priority, and tags from compact composer metadata controls before creating a card.

#### Scenario: User chooses destination column

- **WHEN** the user selects a destination column in the composer and submits a valid draft
- **THEN** the system creates the card in the selected column

#### Scenario: User chooses priority

- **WHEN** the user selects a priority in the composer and submits a valid draft
- **THEN** the created card stores the selected priority
- **AND** the board displays that priority on the card

#### Scenario: User chooses tags

- **WHEN** the user selects one or more tags in the composer and submits a valid draft
- **THEN** the created card stores those tag assignments
- **AND** the board displays the selected tags according to existing card metadata display behavior

#### Scenario: User accepts metadata defaults

- **WHEN** the user submits a valid draft without changing metadata controls
- **THEN** the system creates the card in the default destination column
- **AND** the card uses Medium priority
- **AND** the card has no tags

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

### Requirement: Composer submits with keyboard and icon controls

The system SHALL let users create cards from the composer with explicit keyboard and button submission controls.

#### Scenario: User submits with keyboard shortcut

- **WHEN** the composer input contains a valid draft and the user presses `Cmd+Enter` or `Ctrl+Enter`
- **THEN** the system creates the card
- **AND** the composer draft is cleared for another capture

#### Scenario: User submits with icon button

- **WHEN** the composer input contains a valid draft and the user activates the composer submit icon button
- **THEN** the system creates the card
- **AND** the button exposes an accessible name that communicates adding or creating a card

#### Scenario: User presses Enter

- **WHEN** the composer input is focused and the user presses `Enter` without the command or control modifier
- **THEN** the system inserts a line break instead of submitting the card

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

### Requirement: Composer remains accessible and mobile usable

The system SHALL keep the composer keyboard accessible, screen-reader understandable, and usable on small screens.

#### Scenario: User navigates composer by keyboard

- **WHEN** the user tabs through the composer
- **THEN** focus moves through the input, metadata controls, and submit control in a logical order
- **AND** each control has an accessible name or label

#### Scenario: User opens metadata controls

- **WHEN** the user opens a composer metadata select or popover
- **THEN** the control supports keyboard selection, Escape dismissal, and outside-click dismissal according to the app's popup patterns

#### Scenario: User creates a card on mobile

- **WHEN** the user focuses the composer on a small screen
- **THEN** the composer remains reachable above the on-screen keyboard
- **AND** the metadata controls and submit control remain visible or reachable without horizontal clipping

### Requirement: Full card dialog remains available after creation

The system SHALL continue to use the full card dialog for reviewing and editing cards after they are created.

#### Scenario: User opens a created card

- **WHEN** the user opens a card created through the composer
- **THEN** the system opens the full card dialog for that card
- **AND** the dialog shows the created title, content, priority, tags, and column

#### Scenario: User edits a created card

- **WHEN** the user changes a composer-created card in the full card dialog
- **THEN** the system persists those edits using the existing card editing behavior
