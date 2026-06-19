## Why

Card content editing already supports a useful Tiptap-based Markdown workflow, but several common rich-editing actions are either missing, exposed as separate toolbar buttons, or still rely on browser prompts. This change improves the editor so task tracking, links, images, headings, lists, and alignment feel consistent with the rest of Flowboard's Base UI controls.

## What Changes

- Add task list support to card content so users can create checklist items and toggle completed items inside the editor.
- Replace browser prompt-based link and image URL entry with Base UI surfaces that match existing dialog, popover, field, and toolbar patterns.
- Add contextual link actions so users can inspect a link, edit it, open it in a new page, or remove it after selecting/clicking linked text.
- Add contextual image actions so selected inserted images can be edited, opened, or removed from a consistent editor surface.
- Replace separate heading buttons with a heading dropdown that supports paragraph plus heading levels 1 through 4.
- Replace separate list buttons with a list dropdown that supports bullet, ordered, and task lists.
- Add a text alignment dropdown for left, center, right, and justify alignment.
- Move undo and redo to the start of the rich text toolbar and add hover tooltips for toolbar controls.
- Make toolbar selected states track the live editor cursor/selection for headings, lists, links, bold, and other formatting marks.
- Fix or verify bold formatting so toolbar active state, rendered content, and Markdown persistence agree.
- Preserve existing Markdown editing, copy-to-Markdown, pasted/dropped image, undo, redo, and keyboard-accessible toolbar behavior.

## Capabilities

### New Capabilities
- `card-content-rich-editing`: Rich card content editing behavior for task lists, contextual link/image editing, heading/list/alignment controls, bold rendering, and Markdown persistence.

### Modified Capabilities
- None.

## Impact

- Affected code:
  - `src/components/CardContentEditor/index.tsx`
  - `src/components/CardContentEditor/CardContentEditor.css`
  - card dialog/editor tests in `src/App.test.tsx`
- Dependencies:
  - Existing Tiptap packages support task lists through `@tiptap/extension-list`.
  - Text alignment requires adding `@tiptap/extension-text-align`.
  - Existing Base UI primitives should be reused for popovers, dialogs, selects, fields, toolbar integration, and accessible popup behavior.
- Storage and compatibility:
  - Existing card content remains Markdown-backed.
  - Task lists should persist as Markdown checkboxes (`- [ ]` / `- [x]`).
  - Alignment needs an explicit persistence strategy because standard Markdown does not represent text alignment.
