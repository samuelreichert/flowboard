# card-content-rich-editing Specification

## Purpose

Defines rich card content editing behavior and visual affordances for active editor elements.

## Requirements

### Requirement: Rich text entry preserves focus during local synchronization

The system SHALL preserve the active rich-text editor focus and selection while locally originated content changes are synchronized through card autosave.

#### Scenario: User types multiple characters

- **WHEN** the user types successive characters in an active card content editor
- **THEN** the editor retains focus after each local content update
- **AND** the entered text accumulates in the active editor and persisted card content

#### Scenario: User creates a paragraph

- **WHEN** the user presses Enter in an active card content editor
- **THEN** the editor inserts a paragraph break according to its existing Tiptap behavior
- **AND** focus remains in the editor for continued text entry

#### Scenario: Editor receives distinct external content

- **WHEN** an open editor receives content that differs from its locally emitted canonical content
- **THEN** the editor updates to the external content without recursively emitting another local autosave update

### Requirement: Rich-content autosave coalesces rapid editor changes

The system SHALL update the active editor immediately while coalescing successive rich-content changes behind a short idle window and retaining the latest pending document.

#### Scenario: User types continuously within one idle window

- **WHEN** the user produces multiple rich-content editor transactions without allowing the idle window to expire
- **THEN** the system does not submit a content save during the active typing burst
- **AND** the editor continues to display every local change with its focus and selection preserved
- **AND** the system submits one content save containing the latest document after the idle window expires

#### Scenario: User resumes editing before the idle window expires

- **WHEN** a rich-content save is pending and the user makes another content change before the idle window expires
- **THEN** the system replaces the pending document with the latest content
- **AND** restarts the idle window without submitting the superseded document

#### Scenario: Separate editing bursts reach separate idle windows

- **WHEN** the user completes one editing burst, allows its idle save to be submitted, and later starts another burst
- **THEN** the system submits at most one content save for each completed idle window

### Requirement: Pending rich content flushes when leaving the editing lifecycle

The system SHALL submit the latest pending rich-content document once before the user leaves an existing card's editing lifecycle.

#### Scenario: Focus leaves the content editor

- **WHEN** rich content is pending and focus moves outside the composite content editor
- **THEN** the system immediately submits the latest pending document
- **AND** cancels the pending idle timer

#### Scenario: Focus moves within the content editor

- **WHEN** rich content is pending and focus moves between controls inside the composite content editor
- **THEN** the system keeps the content pending for the current idle window

#### Scenario: User closes the card dialog

- **WHEN** rich content is pending and the card dialog begins closing
- **THEN** the system submits the latest pending document before changing the dialog or route open state

#### Scenario: Page becomes hidden

- **WHEN** rich content is pending and the document visibility state changes to hidden
- **THEN** the system immediately submits the latest pending document through the normal autosave path

#### Scenario: Autosave producer unmounts

- **WHEN** rich content remains pending as the autosave producer unmounts
- **THEN** the system submits the latest pending document during teardown

#### Scenario: Multiple flush signals occur for one pending document

- **WHEN** blur, dialog close, visibility loss, or unmount signals occur after one of those signals has already flushed the pending document
- **THEN** the system does not submit that document again

### Requirement: Non-content card autosave remains immediate

The system SHALL keep existing title, priority, column, and tag save actions immediate while rich content is pending.

#### Scenario: User changes card metadata while content is pending

- **WHEN** a rich-content document is pending and the user changes a non-content card field
- **THEN** the system submits the non-content change through its existing immediate path
- **AND** retains the latest rich-content document until its own idle window or flush trigger

### Requirement: Paragraph formatting uses an editable-text icon

The system SHALL use the Lucide `TextCursorInput` icon for the regular paragraph formatting option and trigger.

#### Scenario: User views regular paragraph formatting

- **WHEN** the editor selection is a regular paragraph
- **THEN** the paragraph formatting trigger displays `TextCursorInput`
- **AND** the paragraph option remains accessible by its localized paragraph label

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

### Requirement: Card content converts pasted Markdown into rich content

The system SHALL convert supported plain-text Markdown pasted into an active card content editor into the equivalent rich editor content at the current selection.

#### Scenario: User pastes Flowboard-exported Markdown

- **WHEN** a user copies supported rich card content with Copy Markdown and pastes that plain-text Markdown into an active card content editor
- **THEN** the pasted content is rendered as equivalent rich content rather than literal Markdown syntax
- **AND** headings, emphasis, links, lists, task lists, blockquotes, inline code, code blocks, and supported images retain their supported editor semantics

#### Scenario: Markdown replaces the selected range

- **WHEN** the user pastes supported Markdown while text or rich content is selected in an active card content editor
- **THEN** the parsed rich content replaces the selected range
- **AND** the editor selection moves to the end of the inserted content according to its standard insertion behavior

#### Scenario: Pasted Markdown persists and copies consistently

- **WHEN** a user pastes supported Markdown into a card and saves or copies the card content
- **THEN** the card persists the inserted content through the existing Markdown storage flow
- **AND** Copy Markdown produces semantically equivalent supported Markdown

#### Scenario: Plain text without supported Markdown remains plain text

- **WHEN** a user pastes plain text that does not contain supported Markdown syntax
- **THEN** the editor retains its normal plain-text paste behavior

#### Scenario: Image-file and non-Markdown rich-HTML paste behavior remains intact

- **WHEN** a user pastes image files or clipboard content whose plain text does not contain supported Markdown into a card content editor
- **THEN** the Markdown paste conversion does not intercept that clipboard content
- **AND** the existing image-file and native rich-HTML paste behavior remains available

#### Scenario: Markdown takes priority over accompanying clipboard HTML

- **WHEN** a clipboard item contains supported plain-text Markdown and an accompanying HTML representation, including inline HTML formatting
- **THEN** the editor converts the Markdown into equivalent rich content
- **AND** the HTML representation does not add source-specific paragraph spacing or leave Markdown structural markers literal

#### Scenario: Pasted Markdown preserves URL safety

- **WHEN** pasted Markdown contains an unsupported link or image URL scheme
- **THEN** the editor does not create an active unsafe link or image node from that URL
- **AND** supported URLs continue to render with the existing editor behavior
### Requirement: Rich content keeps the latest local edit while saves settle

The system SHALL keep the newest locally emitted rich card content visible and
pending while earlier saves for the same card succeed or fail.

#### Scenario: Earlier content save succeeds

- **WHEN** an earlier content mutation succeeds while a newer local content
  mutation for the same card is pending
- **THEN** the editor continues to show the newer local content
- **AND** the older response does not replace that content in the active-card
  detail cache

#### Scenario: Earlier content save fails

- **WHEN** an earlier content mutation fails while a newer local content
  mutation for the same card is pending
- **THEN** the client presents the existing persistence failure state
- **AND** the newer local content remains visible and pending for its ordered
  save attempt

#### Scenario: Content saves are serialized without coalescing

- **WHEN** multiple content mutations have already been submitted for one card
- **THEN** the client sends them in submission order with at most one in flight
- **AND** this ordering behavior does not debounce or discard a submitted
  content mutation
