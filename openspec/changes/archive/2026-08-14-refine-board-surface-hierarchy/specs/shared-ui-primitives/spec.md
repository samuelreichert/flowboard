## ADDED Requirements

### Requirement: Shared primitives express bounded elevation roles
The system SHALL provide shared visual roles for flat structural containers, raised work-item surfaces, and overlay surfaces. Component styles SHALL not introduce additional arbitrary shadow tiers for those roles.

#### Scenario: User opens an overlay from a raised card
- **WHEN** a menu, popover, or dialog opens from a board card or workspace control
- **THEN** the overlay is visually above the card
- **AND** the card remains visually above the flat workspace and lane structure

#### Scenario: User compares structural containers and cards
- **WHEN** the sidebar, workspace, board lane, and card are visible together
- **THEN** structural containers remain flat
- **AND** only the card uses the shared raised work-item treatment

### Requirement: Icon-only controls are reusable circular actions
The system SHALL provide a shared primitive or shared styling contract for icon-only actions that separates their square/circular target geometry from text-bearing button and chip styles.

#### Scenario: A new icon-only action uses the shared contract
- **WHEN** a component adds an icon-only action control
- **THEN** it can use the shared circular geometry, visual states, and focus treatment without duplicating local shape or padding rules
