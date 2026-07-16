## MODIFIED Requirements

### Requirement: Settings dialog consolidates app and board settings

The system SHALL expose Settings from the sidebar account menu and group app appearance controls, language controls, and board-specific controls in a single Settings dialog.

#### Scenario: User opens Settings from account menu

- **WHEN** the user activates Settings in the account menu
- **THEN** the system opens a Settings dialog
- **AND** the dialog includes an Appearance section for theme preference
- **AND** the dialog includes a language preference control
- **AND** the dialog includes a Board section for completed-column selection and clear-board access

#### Scenario: Board settings nav item is removed

- **WHEN** the sidebar navigation is displayed
- **THEN** the system presents workspace navigation without a Board settings nav item
- **AND** board settings remain reachable from the Settings dialog

#### Scenario: Completed work needs board configuration

- **WHEN** the user tries to complete work without a completed column configured
- **THEN** the system directs the user to Settings where the Board section provides completed-column selection
