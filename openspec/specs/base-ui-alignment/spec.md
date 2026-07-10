# base-ui-alignment Specification

## Purpose
Defines alignment between Base UI primitives and Flowboard interaction patterns.

## Requirements
### Requirement: Single-choice card metadata uses accessible selects
The system SHALL expose card column and priority controls as accessible single-choice select controls.

#### Scenario: User changes card priority
- **WHEN** the user chooses a different priority in the card dialog
- **THEN** the system saves the selected priority and displays it after the card dialog is reopened

#### Scenario: User moves card with column select
- **WHEN** the user chooses a different column in the card dialog
- **THEN** the system moves the card to the selected column and preserves the card metadata

### Requirement: Dialog form fields expose labels and validation through form primitives
The system SHALL use accessible field semantics for practical dialog text inputs and validation messages.

#### Scenario: Required dialog field reports validation
- **WHEN** the user submits or edits a dialog field with invalid content
- **THEN** the system associates the validation message with the relevant field

### Requirement: Editor controls use toolbar semantics
The system SHALL expose rich-content formatting controls as a toolbar with keyboard-accessible toolbar buttons.

#### Scenario: User navigates editor formatting controls
- **WHEN** the user focuses the card content formatting controls
- **THEN** the system presents them as a toolbar with individual controls for formatting commands
