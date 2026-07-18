## ADDED Requirements

### Requirement: Board tag management persists through tag resource mutations

The system SHALL persist normal board tag management operations through focused
tag resource mutations instead of the legacy full-board save bridge.

#### Scenario: User creates a board tag

- **WHEN** the user saves a valid new tag from the tag manager or card surface
- **THEN** the client submits a tag create mutation
- **AND** the tag appears in board tag lists using the mutation result
- **AND** the client does not submit a legacy full-board save for that tag
  creation

#### Scenario: User renames a board tag

- **WHEN** the user saves a valid tag rename
- **THEN** the client submits a tag rename mutation
- **AND** active cards display the renamed tag through the mutation result
- **AND** the client does not submit a legacy full-board save for that rename

#### Scenario: User deletes a board tag

- **WHEN** the user confirms deleting a board tag
- **THEN** the client submits a tag delete mutation
- **AND** active cards no longer display that tag assignment
- **AND** the client does not submit a legacy full-board save for that deletion

### Requirement: Card tag assignment persists through card-tag resource mutations

The system SHALL persist existing active-card tag assignment changes through
focused card-tag resource mutations.

#### Scenario: User assigns a tag to an existing active card

- **WHEN** the user selects an existing board tag on an existing active card
- **THEN** the client submits a card-tag assign mutation
- **AND** the card summary and detail caches include that tag assignment
- **AND** the client does not submit a legacy full-board save for that
  assignment

#### Scenario: User removes a tag from an existing active card

- **WHEN** the user deselects a board tag on an existing active card
- **THEN** the client submits a card-tag unassign mutation
- **AND** the card summary and detail caches no longer include that tag
  assignment
- **AND** the client does not submit a legacy full-board save for that
  unassignment

#### Scenario: User creates a new card with initial tags

- **WHEN** the user creates a new card with selected tag identifiers
- **THEN** the card create mutation persists the initial tag assignments
- **AND** the client does not issue separate card-tag assignment mutations for
  the unsaved draft before the card exists
