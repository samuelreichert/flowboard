## 1. Extension Setup and Persistence

- [x] 1.1 Add the required Tiptap extension dependency for text alignment.
- [x] 1.2 Register task list, task item, and text alignment extensions in the card content editor.
- [x] 1.3 Verify task list Markdown parsing and serialization for checked and unchecked items.
- [x] 1.4 Verify text alignment round-trips through the current Markdown pipeline.
- [x] 1.5 Add a focused Markdown alignment adapter if the default pipeline drops alignment attributes.

## 2. Toolbar Controls

- [x] 2.1 Replace separate heading buttons with an accessible heading dropdown for paragraph and heading levels 1 through 4.
- [x] 2.2 Replace separate bullet and ordered list buttons with an accessible list dropdown for bullet, ordered, and task lists.
- [x] 2.3 Add an accessible alignment dropdown for left, center, right, and justify.
- [x] 2.4 Preserve existing undo, redo, copy Markdown, quote, inline code, code block, bold, italic, and strike controls.
- [x] 2.5 Update editor toolbar styling so dropdown controls match existing toolbar sizing, spacing, active state, and disabled state patterns.
- [x] 2.6 Polish dropdown triggers to use icon-only closed states with chevrons and labels only in open menus.
- [x] 2.7 Remove the list dropdown's "No list" option and keep default paragraph/list/alignment states visually neutral.
- [x] 2.8 Use distinct icons for center alignment and justify alignment.
- [x] 2.9 Move undo and redo to the first toolbar positions.
- [x] 2.10 Add hover tooltips for rich text toolbar buttons and dropdown triggers.
- [x] 2.11 Make toolbar selected states react to cursor and selection changes.

## 3. Link and Image URL UI

- [x] 3.1 Replace link creation prompt with a Base UI URL entry surface that preserves existing URL normalization behavior.
- [x] 3.2 Add a contextual link surface for selected linked text with URL display, edit, open, and remove actions.
- [x] 3.3 Implement safe link opening from the contextual surface.
- [x] 3.4 Replace image URL prompt with a Base UI URL entry surface.
- [x] 3.5 Ensure canceling link or image URL entry leaves card content unchanged.
- [x] 3.6 Add a contextual image surface for selected images with edit, open, and remove actions.

## 4. Rendering and Editor Styling

- [x] 4.1 Add task list and task item CSS for readable spacing, checkbox alignment, and nested content.
- [x] 4.2 Fix or verify bold rendering so bold text is visibly distinct inside the editor surface.
- [x] 4.3 Add alignment CSS coverage if required by the selected TextAlign persistence approach.
- [x] 4.4 Check mobile toolbar wrapping so dropdown labels and controls do not overlap.

## 5. Tests and Verification

- [x] 5.1 Add tests for creating task lists, toggling checkboxes, and copied/saved Markdown output.
- [x] 5.2 Add tests for heading, list, and alignment dropdown commands.
- [x] 5.3 Add tests for link creation, contextual edit, open action wiring, and removal.
- [x] 5.4 Add tests for image URL insertion through the new Base UI surface.
- [x] 5.5 Add regression coverage for existing Markdown links, lists, code, headings, images, paste/drop image behavior, undo, redo, and copy Markdown.
- [x] 5.6 Run typecheck and the relevant test suite.
- [x] 5.7 Run a browser smoke check of the card content editor across desktop and mobile viewport widths.
- [x] 5.8 Verify compact dropdown triggers, active states, and list menu options in a browser smoke check.
- [x] 5.9 Add regression coverage for toolbar active state changes as the editor selection moves.
- [x] 5.10 Add regression coverage for rich text toolbar hover tooltips.
- [x] 5.11 Add regression coverage for contextual image actions and saved image Markdown reopening as a rendered image.
