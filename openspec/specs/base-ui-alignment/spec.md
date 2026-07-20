# base-ui-alignment Specification

## Purpose
Defines alignment between Base UI primitives and Flowboard interaction patterns.

## Requirements
### Requirement: Composite interactions use matching Base UI primitives
The system SHALL use Base UI primitives for account-menu commands, multi-value
tag selection, exclusive segmented controls, editor tooltips, and practical
non-dialog text fields instead of recreating those primitive semantics with
manual roles or interaction handlers.

#### Scenario: User activates an account command
- **WHEN** an authenticated user opens the sidebar account menu and selects
  profile, Settings, or Log out
- **THEN** the command is exposed as a keyboard-operable menu item
- **AND** the menu dismisses according to Base UI menu behavior

#### Scenario: User changes a segmented value
- **WHEN** a user chooses a theme preference or history layout from a
  segmented control
- **THEN** exactly one value is active
- **AND** the control exposes grouped exclusive-selection semantics

#### Scenario: User discovers an editor command
- **WHEN** a user hovers or focuses a compact editor toolbar command or
  dropdown trigger
- **THEN** a positioned tooltip exposes the command or selected-option label
- **AND** the compact toolbar layout remains unchanged

#### Scenario: User enters ordinary form text
- **WHEN** a user enters profile display name, magic-link email, or composer
  text
- **THEN** the control remains associated with its visible label and relevant
  validation or help text through field semantics

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
