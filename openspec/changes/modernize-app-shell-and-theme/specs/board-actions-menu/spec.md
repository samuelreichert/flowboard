## MODIFIED Requirements

### Requirement: Board actions are available from the sidebar

The system SHALL provide board-level actions from the sidebar rather than from a top-right board actions menu.

#### Scenario: User uses sidebar board actions

- **WHEN** a user views the sidebar
- **THEN** the system displays tag management as a sidebar command
- **AND** the system displays clear board as a sidebar command when clearing is available
- **AND** the board header does not display a top-right board actions menu

## REMOVED Requirements

### Requirement: Background settings remain accessible

**Reason**: Board background customization is being removed from the primary product experience and replaced by app-level light, dark, and system theme controls in the sidebar footer.
**Migration**: Existing saved board background values remain compatible but no longer drive the visible app background. Users should use the sidebar footer theme control for appearance changes.
