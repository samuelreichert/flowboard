# card-content-rich-editing Specification

## Purpose
Defines rich card content editing behavior and visual affordances for active editor elements.

## Requirements
### Requirement: Selected images show an active outline
The system SHALL show a visible non-layout-shifting active outline for images selected inside the rich text editor.

#### Scenario: User selects an image
- **WHEN** the user clicks or keyboard-selects an image rendered inside the card content editor
- **THEN** the selected image displays a visible outline or focus treatment indicating it is the active editor element
- **AND** the contextual image actions remain available for the selected image

#### Scenario: User changes selection away from an image
- **WHEN** the editor selection moves from the image to text or another block
- **THEN** the selected-image outline is removed from the previously selected image
