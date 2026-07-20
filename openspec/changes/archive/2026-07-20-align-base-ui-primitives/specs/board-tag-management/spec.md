## ADDED Requirements

### Requirement: Card tag selection uses accessible multi-select semantics
The system SHALL expose existing board tags through accessible multi-select
controls in both the composer and active-card dialog while retaining inline tag
creation and the existing assignment persistence behavior.

#### Scenario: User assigns and removes tags in card detail
- **WHEN** a user opens the card tag selector and selects or deselects one or
  more existing tags
- **THEN** the control exposes selected state and keyboard option navigation
- **AND** the client preserves the existing focused card-tag assignment or
  unassignment mutations

#### Scenario: User creates and selects a tag from card surfaces
- **WHEN** a user enters a valid new tag name from the composer or card dialog
- **THEN** the system creates the board tag through the existing tag mutation
- **AND** the new tag becomes selected in that surface

#### Scenario: User dismisses a tag selector
- **WHEN** a user presses Escape or activates outside the open tag selector
- **THEN** the selector closes without changing unconfirmed creation text
