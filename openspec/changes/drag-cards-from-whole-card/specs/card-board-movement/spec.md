## ADDED Requirements

### Requirement: Cards open from a plain click anywhere on the card
The system SHALL open the card details when the user performs a plain click on the board card surface.

#### Scenario: User clicks card title
- **WHEN** the user clicks a card title without selecting text or dragging
- **THEN** the system opens the card details for that card

#### Scenario: User clicks card metadata
- **WHEN** the user clicks a card priority pill or tag pill without dragging
- **THEN** the system opens the card details for that card

#### Scenario: User clicks card background
- **WHEN** the user clicks a non-title, non-metadata area of a card without dragging
- **THEN** the system opens the card details for that card

### Requirement: Cards move by dragging the card surface on desktop
The system SHALL allow desktop users to move cards by dragging the board card surface without using a dedicated visible drag handle.

#### Scenario: User drags a card within the same column
- **WHEN** the user drags a card from its card surface to a valid position in the same column
- **THEN** the system reorders the card to the indicated position

#### Scenario: User drags a card to another column
- **WHEN** the user drags a card from its card surface to a valid position in another column
- **THEN** the system moves the card to the indicated column and position

#### Scenario: User sees drop position feedback
- **WHEN** the user drags a card over another card
- **THEN** the system indicates whether the dragged card will be dropped before or after the target card

### Requirement: Card title text remains selectable
The system SHALL allow users to select card title text from the board without opening or moving the card as a side effect.

#### Scenario: User drag-selects title text
- **WHEN** the user drags across card title text to select it
- **THEN** the system selects the title text
- **AND** the system does not open the card details
- **AND** the system does not start moving the card

#### Scenario: User releases after title selection
- **WHEN** the user completes a title text-selection gesture
- **THEN** the system keeps the card details closed
- **AND** the card remains in its original position

### Requirement: Dedicated card drag handle is removed
The system SHALL remove the dedicated visible card drag handle from board cards.

#### Scenario: User views cards on the board
- **WHEN** the board displays one or more cards
- **THEN** the system does not show a dedicated drag handle control inside the cards

#### Scenario: Assistive technology reviews card controls
- **WHEN** assistive technology lists controls inside a board card
- **THEN** the system does not expose a separate drag-handle button for moving the card

### Requirement: Display-only metadata participates in card open and movement
The system SHALL treat card priority and tag pills as display-only card surface content for pointer interactions.

#### Scenario: User drags from a priority pill
- **WHEN** the user starts a desktop drag gesture from a card priority pill
- **THEN** the system moves the card according to the drag destination

#### Scenario: User drags from a tag pill
- **WHEN** the user starts a desktop drag gesture from a card tag pill
- **THEN** the system moves the card according to the drag destination

### Requirement: Mobile board drag-and-drop remains out of scope
The system SHALL NOT introduce mobile board drag-and-drop behavior as part of whole-card desktop dragging.

#### Scenario: User uses the board on a mobile viewport
- **WHEN** the user interacts with a card on a mobile viewport
- **THEN** the system preserves tap-to-open card behavior
- **AND** the system does not require mobile drag-and-drop to move cards

### Requirement: Non-pointer card movement remains available
The system SHALL preserve a non-pointer path for moving a card between columns through the card details.

#### Scenario: User changes card column in details
- **WHEN** the user opens a card and changes its column in the card details
- **THEN** the system moves the card to the selected column
