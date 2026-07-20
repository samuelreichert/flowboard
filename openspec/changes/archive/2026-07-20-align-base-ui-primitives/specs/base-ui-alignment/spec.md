## ADDED Requirements

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
