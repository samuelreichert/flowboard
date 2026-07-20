# board-tag-management Specification

## Purpose
TBD - created by archiving change add-card-priority-and-tags. Update Purpose after archive.
## Requirements
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

### Requirement: Board maintains reusable tags

The system SHALL maintain a board-level list of reusable tags independent of individual cards.

#### Scenario: Board loads without tags

- **WHEN** a board state does not include a tag list
- **THEN** the system treats the board as having an empty tag list

#### Scenario: Tag is renamed

- **WHEN** a user renames an existing tag
- **THEN** cards referencing that tag display the new tag name without losing the tag assignment

### Requirement: User can create board tags

The system SHALL allow users to create board tags from the tag manager.

#### Scenario: User creates a unique tag

- **WHEN** a user enters a non-empty unique tag name in the tag manager
- **THEN** the system saves the tag to the board tag list

#### Scenario: User creates a duplicate tag

- **WHEN** a user enters a tag name that already exists, ignoring case
- **THEN** the system rejects the tag and displays a validation error

### Requirement: User can edit board tags

The system SHALL allow users to edit the display name of an existing board tag.

#### Scenario: User saves a valid rename

- **WHEN** a user changes a tag name to a non-empty unique value
- **THEN** the system updates the tag name and preserves its identity

#### Scenario: User clears a tag name

- **WHEN** a user attempts to save an empty tag name
- **THEN** the system rejects the change and keeps the original tag name

### Requirement: User can remove board tags

The system SHALL allow users to remove board tags from the board tag list.

#### Scenario: User removes an unused tag

- **WHEN** a user removes a tag that is not assigned to any card
- **THEN** the tag is removed from the board tag list

#### Scenario: User removes a tag assigned to cards

- **WHEN** a user confirms removal of a tag assigned to one or more cards
- **THEN** the tag is removed from the board tag list and from every card that referenced it

#### Scenario: User cancels removal of an assigned tag

- **WHEN** a user cancels removal of a tag assigned to one or more cards
- **THEN** the tag remains in the board tag list and card assignments remain unchanged

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
