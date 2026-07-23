## ADDED Requirements

### Requirement: Sidebar compact controls share interaction geometry
The system SHALL render comparable sidebar controls with a consistent compact target, corner radius, hover treatment, and keyboard-focus treatment while preserving expanded account identity content.

#### Scenario: User compares collapsed sidebar controls
- **WHEN** the desktop sidebar is collapsed
- **THEN** the sidebar toggle, icon-only navigation controls, and account trigger use the same compact interaction geometry
- **AND** the avatar fits within that target without appearing larger than adjacent controls

#### Scenario: User hovers or focuses a sidebar control
- **WHEN** the user hovers or keyboard-focuses a sidebar toggle, navigation item, or account trigger
- **THEN** the control uses the shared sidebar hover or focus treatment
- **AND** the active navigation state remains visually distinct from hover
