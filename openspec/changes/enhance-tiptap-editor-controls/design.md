## Context

Flowboard's card content editor is a Tiptap React editor embedded in the card dialog. It currently stores content as Markdown, supports StarterKit formatting, image insertion through pasted/dropped files or URL prompts, and exposes formatting commands through a Base UI toolbar.

The editor has several gaps: task lists are not enabled, link and image URL actions use `window.prompt`, linked text has no contextual open/edit/remove surface, headings and lists consume multiple toolbar buttons, alignment is unavailable, and bold appears active without a sufficiently visible content change. The app already uses Base UI Dialog, Popover, Select, Field, Menu, Tooltip, and Toolbar patterns elsewhere, so the editor should use those primitives rather than browser-native prompts.

## Goals / Non-Goals

**Goals:**
- Enable Tiptap task lists with interactive checkboxes and Markdown checkbox persistence.
- Replace link and image browser prompts with accessible Base UI surfaces.
- Add a contextual link surface for edit, open, and remove actions.
- Consolidate headings, lists, and alignment into compact dropdown controls.
- Ensure bold active state, rendered content, and Markdown output stay in sync.
- Preserve the existing Markdown-backed card content workflow and existing image paste/drop behavior.

**Non-Goals:**
- Replacing Tiptap or changing the card content editor to a full document model.
- Adding collaborative editing, comments, slash commands, tables, mentions, or drag-resizable images.
- Redesigning the surrounding card dialog beyond the editor controls needed for this change.
- Migrating all stored cards to a non-Markdown format.

## Decisions

### Use Tiptap extensions for editor semantics

Task lists should use the Tiptap list package's `TaskList` and `TaskItem` nodes, with nested task items enabled if it works cleanly with existing list behavior. Alignment should use `@tiptap/extension-text-align` configured for `heading` and `paragraph` nodes.

Alternatives considered:
- Hand-roll task checkbox Markdown transforms outside Tiptap. Rejected because Tiptap already provides task list nodes, checkbox rendering, commands, and Markdown handlers.
- Implement alignment with CSS-only toolbar state. Rejected because saved content must remain meaningful after closing and reopening the card.

### Keep Markdown as the storage boundary

The editor should continue reading and writing card content through Markdown. Task lists should serialize as `- [ ]` and `- [x]`. Bold should serialize as `**text**`.

Alignment requires extra care because CommonMark has no native alignment syntax. The implementation should first verify whether Tiptap Markdown plus TextAlign preserves aligned paragraph and heading attributes. If it does not, add a small, tested adapter that serializes aligned blocks as Markdown-compatible HTML and parses them back through Tiptap so alignment survives reopen and copy operations.

Alternatives considered:
- Switch card content to Tiptap JSON. Rejected for this change because existing cards, copy-to-Markdown, tests, and user workflows are Markdown-oriented.
- Drop alignment from persistence. Rejected because users expect the dropdown result to survive closing and reopening the card.

### Use Base UI surfaces for command UI

Toolbar dropdowns should use Base UI Select or Menu composed with Toolbar buttons, matching the existing project pattern for popup-trigger integration. URL entry should use Base UI Field inside a Popover or Dialog, not `window.prompt`.

Toolbar buttons and dropdown triggers should also compose Base UI Tooltip with the existing Toolbar primitives so compact icon-only controls remain discoverable on hover without adding visible text to the toolbar.

Alternatives considered:
- Continue using browser prompts for URL entry. Rejected because prompts are visually inconsistent, hard to validate inline, and do not match the rest of Flowboard.
- Build custom unstructured dropdowns. Rejected because Base UI already provides accessible popup, select, and keyboard behavior used elsewhere in the app.

### Match Tiptap-style compact toolbar controls

The heading, list, and alignment dropdown triggers should be compact icon-first controls with a chevron. Closed triggers should not show text labels in the toolbar; labels should appear inside the open dropdown menu and remain available through accessible names. Default/plain states should not show the purple selected state: paragraph, no active list, and left/default alignment remain visually unselected. Non-default states, such as a heading level, bullet/ordered/task list, or non-left alignment, should show the active purple state and use the icon for the selected option.

The list dropdown should contain only actionable list choices: bullet list, ordered list, and task list. There should be no "No list" option in the open menu. Returning to regular paragraph behavior can happen through the text style control or normal editor commands rather than a list-menu item.

Alternatives considered:
- Keep selected text labels visible in closed dropdown triggers. Rejected because the toolbar becomes wider and less like the Tiptap demo surface the user wants to mirror.
- Include a "No list" option in the list dropdown. Rejected because the closed trigger can represent the neutral list state without exposing a non-actionable menu choice.

### Use a contextual Tiptap BubbleMenu for links

When the selection or cursor is inside a link, the editor should show a contextual surface with the current URL and actions to edit, open in a new page, and remove the link. Link creation from the toolbar should still be available for selected text.

Alternatives considered:
- Set `openOnClick: true`. Rejected because it makes editing linked text harder and does not provide edit/remove affordances.
- Only provide toolbar buttons for link actions. Rejected because users need discoverable link actions while interacting with the link itself.

### Use reactive editor state for toolbar selection

Toolbar selected states should be derived through Tiptap's reactive editor-state subscription rather than reading `editor.isActive()` directly during React render. The toolbar must update when the cursor or selection moves between paragraphs, headings, lists, links, bold text, images, and other supported formatting.

Alternatives considered:
- Read `editor.isActive()` directly in JSX. Rejected because it can leave toolbar state stale after selection-only editor updates.
- Track selected toolbar state manually in DOM event handlers. Rejected because it duplicates Tiptap state and is easy to desynchronize.

### Use contextual image actions for selected image nodes

Inserted images should be selectable as Tiptap image nodes and should expose a contextual surface with edit, open, and remove actions, mirroring the link contextual surface. Link and image bubble menus should use distinct plugin keys so their visibility and positioning do not collide.

Saved image Markdown should reopen as a rendered image node. If Markdown image syntax arrives through a path that Tiptap parses as text or link-marked text, the editor may normalize standalone image Markdown to image-compatible HTML before handing it to Tiptap's parser.

Alternatives considered:
- Keep images editable only through the insertion toolbar. Rejected because existing images need discoverable edit/open/remove actions.
- Render a separate permanent image toolbar outside the editor. Rejected because image actions should stay contextual to selected image content.

### Keep link and image URL validation centralized

URL normalization and validation should remain close to the editor command handlers. The current behavior of adding `https://` to bare domains should be preserved for links and image URLs unless validation fails. Link opening must preserve `rel="noopener noreferrer"` and open external links safely.

## Risks / Trade-offs

- [Risk] Alignment may not round-trip through Tiptap Markdown by default. -> Mitigation: add explicit tests for aligned paragraph and heading persistence before relying on the extension, and implement an HTML fallback adapter only if needed.
- [Risk] Link BubbleMenu and Base UI popovers may compete for focus while the editor selection changes. -> Mitigation: keep edit forms controlled by explicit open state and restore/focus the editor only when applying a command.
- [Risk] Toolbar dropdowns could make keyboard navigation less predictable. -> Mitigation: compose Base UI popup triggers through Toolbar primitives and test accessible names and basic keyboard operation.
- [Risk] Task item checkbox clicks may update editor state without updating saved Markdown. -> Mitigation: cover checkbox toggling with a persistence test that reopens or copies Markdown after checking an item.
- [Risk] Bold may be functionally correct but visually subtle due to editor surface styling. -> Mitigation: verify generated Markdown and DOM marks, then add focused CSS for `strong`/`b` if the issue is visual.

## Migration Plan

No one-time data migration is expected. Existing Markdown cards should continue to load. Cards that use task lists should save as checkbox Markdown. Cards that use alignment should save using the selected alignment persistence strategy and must reopen with the same visual alignment.

Rollback is limited to reverting the editor code and dependency changes. Existing cards without new formatting remain compatible. Cards saved with aligned block HTML should still render as readable Markdown/HTML content if the alignment UI is later removed.

## Open Questions

- Should image URL editing apply only to newly inserted images in this change, or also expose a contextual edit/remove surface for existing selected images?
