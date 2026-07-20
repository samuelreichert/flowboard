## MODIFIED Requirements

### Requirement: Dialog composition is reusable and accessible

The system SHALL provide a reusable standard dialog composition for non-alert Flowboard dialogs while preserving Base UI dialog semantics, focus behavior, visible titles, optional descriptions, close affordances, action affordances, and responsive popup sizing.

#### Scenario: Standard dialog renders through shared shell

- **WHEN** a standard Flowboard dialog is rendered through the shared dialog composition
- **THEN** it exposes a dialog title, optional description, themed backdrop, viewport, popup surface, close affordance when applicable, and caller-provided body/actions

#### Scenario: Card detail dialog uses consistent non-alert dialog composition

- **WHEN** the card detail dialog is rendered
- **THEN** its close affordance and popup surface match the standard non-alert dialog treatment
- **AND** card-level actions remain discoverable without requiring users to scroll past the editor

#### Scenario: Dialog actions stay visible when content scrolls

- **WHEN** a non-alert dialog contains enough body content to scroll
- **THEN** primary or destructive dialog-level actions remain consistently reachable through the dialog composition
- **AND** the action area does not cover editable content without spacing compensation

#### Scenario: Alert dialogs remain semantically separate

- **WHEN** a destructive confirmation requires alert-dialog semantics
- **THEN** the system uses alert dialog semantics rather than the standard dialog composition
