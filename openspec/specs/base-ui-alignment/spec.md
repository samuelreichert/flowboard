# base-ui-alignment Specification

## Purpose
TBD - created by archiving change improve-project-readiness-and-pwa. Update Purpose after archive.
## Requirements
### Requirement: Background picker uses popup semantics
The system SHALL implement the board background picker with a Base UI popup primitive that manages positioning, outside-click dismissal, Escape dismissal, and focus behavior.

#### Scenario: Background picker opens from board actions
- **WHEN** the user selects background settings from the board actions menu
- **THEN** the system opens the background picker as an accessible popup surface

#### Scenario: Background picker dismisses predictably
- **WHEN** the background picker is open and the user presses Escape or clicks outside the popup
- **THEN** the system closes the background picker without changing the selected background

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

