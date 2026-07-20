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

### Requirement: Card content supports task lists

The system SHALL allow users to create, edit, check, and uncheck task list items inside the card content editor.

#### Scenario: User creates a task list from the toolbar

- **WHEN** the user chooses task list from the editor list control
- **THEN** the current block becomes a task list item with an interactive checkbox

#### Scenario: User toggles task completion

- **WHEN** the user checks or unchecks a task list item in the editor
- **THEN** the card content is updated to reflect the new completion state

#### Scenario: Task list persists as Markdown

- **WHEN** the user saves or copies card content containing checked and unchecked task items
- **THEN** the Markdown represents checked items with `- [x]` and unchecked items with `- [ ]`

### Requirement: Card content exposes contextual link actions

The system SHALL provide a contextual link surface for linked text that allows the user to inspect, edit, open, and remove the link.

#### Scenario: User selects linked text

- **WHEN** the cursor or selection is inside linked text
- **THEN** the editor shows a contextual surface containing the current link target and available link actions

#### Scenario: User opens a link

- **WHEN** the user activates the open action from the contextual link surface
- **THEN** the system opens the link target in a new page using safe external-link behavior

#### Scenario: User edits a link

- **WHEN** the user updates the URL from the contextual link surface
- **THEN** the linked text keeps its selection range and uses the updated URL

#### Scenario: User removes a link

- **WHEN** the user activates the remove action from the contextual link surface
- **THEN** the text remains in the editor and no longer has link formatting

### Requirement: Link and image URL entry uses Flowboard UI

The system SHALL use Flowboard/Base UI popup or dialog controls for link and image URL entry instead of browser prompt or alert dialogs.

#### Scenario: User creates a link

- **WHEN** the user activates the editor link control with text selected
- **THEN** the system presents a Flowboard-styled URL entry surface for applying the link

#### Scenario: User inserts an image URL

- **WHEN** the user activates the editor image URL control
- **THEN** the system presents a Flowboard-styled URL entry surface for inserting the image

#### Scenario: User cancels URL entry

- **WHEN** the URL entry surface is dismissed without applying
- **THEN** the card content remains unchanged

### Requirement: Card content exposes contextual image actions

The system SHALL provide a contextual image surface for selected image nodes that allows the user to inspect, edit, open, and remove the image.

#### Scenario: User selects an inserted image

- **WHEN** the user clicks an image rendered inside the editor
- **THEN** the editor selects the image node
- **AND** the editor shows contextual actions for editing, opening, and removing the image

#### Scenario: User opens an image

- **WHEN** the user activates the open action from the contextual image surface
- **THEN** the system opens the image source in a new page using safe external-link behavior

#### Scenario: User edits an image URL

- **WHEN** the user updates the URL from the contextual image surface
- **THEN** the selected image keeps its position and uses the updated URL

#### Scenario: User removes an image

- **WHEN** the user activates the remove action from the contextual image surface
- **THEN** the selected image is removed from the editor content

### Requirement: Formatting groups use dropdown controls

The system SHALL expose heading, list, and alignment formatting as accessible dropdown controls in the editor toolbar.

#### Scenario: Dropdown triggers stay compact

- **WHEN** the editor toolbar is rendered
- **THEN** the heading, list, and alignment dropdown triggers show only an icon and dropdown arrow in the closed toolbar state
- **AND** option text labels are shown inside the open dropdown menus

#### Scenario: Default formatting states are visually neutral

- **WHEN** the current selection is regular paragraph text, not inside a list, and uses default left alignment
- **THEN** the heading, list, and alignment dropdown triggers do not show the selected purple active state

#### Scenario: Non-default formatting states are visibly selected

- **WHEN** the current selection uses a heading, list type, or non-left alignment
- **THEN** the corresponding dropdown trigger shows the selected purple active state and the icon for the selected option

#### Scenario: Toolbar state follows the editor selection

- **WHEN** the cursor or selection moves between paragraphs, headings, list items, links, and bold text
- **THEN** the toolbar selected states update to match the formatting at the current selection

#### Scenario: User chooses a heading level

- **WHEN** the user chooses paragraph or heading level 1 through 4 from the heading control
- **THEN** the current block changes to the selected text style

#### Scenario: List menu contains list actions only

- **WHEN** the user opens the list dropdown
- **THEN** the menu offers bullet list, ordered list, and task list
- **AND** the menu does not offer a "No list" option

#### Scenario: User chooses a list type

- **WHEN** the user chooses bullet list, ordered list, or task list from the list control
- **THEN** the current block changes to the selected list type

#### Scenario: User chooses text alignment

- **WHEN** the user chooses left, center, right, or justify from the alignment control
- **THEN** the selected paragraph or heading uses that alignment

#### Scenario: Toolbar remains keyboard accessible

- **WHEN** the user navigates the editor formatting controls with keyboard input
- **THEN** the dropdown controls expose accessible names and popup behavior consistent with the rest of the toolbar

### Requirement: Rich text toolbar controls are discoverable

The system SHALL expose hover tooltips for rich text toolbar controls while preserving compact icon-only toolbar layout.

#### Scenario: User hovers a formatting button

- **WHEN** the user hovers a rich text toolbar button
- **THEN** a Flowboard-styled tooltip appears with the button action name

#### Scenario: User hovers a dropdown trigger

- **WHEN** the user hovers a rich text toolbar dropdown trigger
- **THEN** a Flowboard-styled tooltip appears with the current selected option label

#### Scenario: Undo and redo are first

- **WHEN** the rich text toolbar is rendered
- **THEN** undo and redo appear as the first toolbar controls

### Requirement: Rich text toolbar groups related controls

The system SHALL visually group rich text toolbar controls so compact icon-first editing remains scannable.

#### Scenario: Toolbar controls are grouped by editing purpose

- **WHEN** the rich text toolbar is rendered
- **THEN** undo and redo, text style, inline formatting, list and alignment, block formatting, insert actions, and copy actions are visually grouped or separated
- **AND** the grouping does not remove existing toolbar commands

#### Scenario: Lower-frequency formatting may move into a compact menu

- **WHEN** the toolbar surface cannot comfortably show all lower-frequency formatting actions
- **THEN** the system may place lower-frequency commands in a compact formatting menu
- **AND** each moved command remains keyboard accessible and exposes an accessible name

#### Scenario: Common formatting remains fast

- **WHEN** the toolbar is rendered on desktop
- **THEN** common text, list, link, and image actions remain directly available or reachable through the existing compact dropdown patterns

### Requirement: Rich formatting persists consistently

The system SHALL keep editor active states, rendered content, saved Markdown, and copied Markdown consistent for supported rich formatting.

#### Scenario: Bold formatting is visible and serialized

- **WHEN** the user applies bold formatting to text
- **THEN** the editor visibly renders the text as bold
- **AND** copied or saved Markdown serializes the text as bold Markdown

#### Scenario: Existing Markdown content remains compatible

- **WHEN** a card with existing Markdown links, lists, code, headings, or images is opened in the editor
- **THEN** the editor preserves the content when saved or copied without unrelated formatting changes

#### Scenario: Alignment survives reopening

- **WHEN** the user applies alignment to a paragraph or heading and reopens the card
- **THEN** the same paragraph or heading retains the selected alignment

#### Scenario: Image paste and drop continue to work

- **WHEN** the user pastes or drops an image file into the editor
- **THEN** the image is inserted and saved with the existing Markdown data URL behavior
