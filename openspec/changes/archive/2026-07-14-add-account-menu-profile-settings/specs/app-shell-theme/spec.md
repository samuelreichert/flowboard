## ADDED Requirements

### Requirement: Settings dialog consolidates app and board settings
The system SHALL expose Settings from the sidebar account menu and group app appearance controls with board-specific controls in a single Settings dialog.

#### Scenario: User opens Settings from account menu
- **WHEN** the user activates Settings in the account menu
- **THEN** the system opens a Settings dialog
- **AND** the dialog includes an Appearance section for theme preference
- **AND** the dialog includes a Board section for completed-column selection and clear-board access

#### Scenario: Board settings nav item is removed
- **WHEN** the sidebar navigation is displayed
- **THEN** the system presents workspace navigation without a Board settings nav item
- **AND** board settings remain reachable from the Settings dialog

#### Scenario: Completed work needs board configuration
- **WHEN** the user tries to complete work without a completed column configured
- **THEN** the system directs the user to Settings where the Board section provides completed-column selection

## MODIFIED Requirements

### Requirement: Theme preference supports system, light, and dark
The system SHALL allow the user to choose `system`, `light`, or `dark` as an app-level theme preference from the Settings dialog.

#### Scenario: Theme options are grouped horizontally
- **WHEN** the Settings dialog displays Appearance controls
- **THEN** the system presents `system`, `light`, and `dark` as a horizontal segmented control

#### Scenario: User chooses explicit light theme
- **WHEN** the user selects the light theme preference
- **THEN** the system applies the light theme to the app shell, board workspace, cards, dialogs, menus, popovers, inputs, and editor controls

#### Scenario: User chooses explicit dark theme
- **WHEN** the user selects the dark theme preference
- **THEN** the system applies the dark theme to the app shell, board workspace, cards, dialogs, menus, popovers, inputs, and editor controls

#### Scenario: User chooses system theme
- **WHEN** the user selects the system theme preference
- **THEN** the system resolves the active theme from the operating system or browser color scheme preference

#### Scenario: Theme preference persists
- **WHEN** the user changes the theme preference and reloads the app
- **THEN** the system restores the saved theme preference before rendering the final themed app state
