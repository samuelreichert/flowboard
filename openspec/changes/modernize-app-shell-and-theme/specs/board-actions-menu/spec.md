## MODIFIED Requirements

### Requirement: Board actions are available from a top-right menu

The system SHALL provide a single top-right board actions menu for board-level actions that are specific to the current board.

#### Scenario: User opens board actions

- **WHEN** a user activates the top-right board actions control
- **THEN** the system displays menu entries for tag management and clearing the board when clearing is available
- **AND** the system does not display background settings or app-level theme controls in the board actions menu

## REMOVED Requirements

### Requirement: Background settings remain accessible
**Reason**: Board background customization is being removed from the primary product experience and replaced by app-level light, dark, and system theme controls in the sidebar footer.
**Migration**: Existing saved board background values remain compatible but no longer drive the visible app background. Users should use the sidebar footer theme control for appearance changes.
