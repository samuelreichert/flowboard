## Context

Card content is edited in a Tiptap editor and persisted as Markdown. The existing Copy Markdown action writes plain Markdown to the clipboard, while editor initialization parses saved Markdown into rich nodes. Its paste handling is currently reserved for image files, so Markdown copied from Flowboard or another text source is inserted literally rather than recreated as rich content.

The installed Tiptap Markdown extension exposes parsing for Markdown-to-document conversion. The editor also has Markdown normalization and URL-safety helpers that make images render safely and preserve the existing content contract.

## Goals / Non-Goals

**Goals:**

- Make supported plain-text Markdown pasted into card content render immediately as the equivalent rich content.
- Let Markdown copied from Flowboard round-trip through paste, persistence, reopening, and Copy Markdown without losing supported semantics.
- Preserve existing image-file paste behavior and native rich-HTML paste for clipboard text that is not Markdown.
- Reuse the current Markdown parser and URL safety rules without changing the persisted data model.

**Non-Goals:**

- Adding a Markdown source-editing mode, import dialog, or new toolbar action.
- Broadening Flowboard's supported Markdown feature set beyond the editor's existing extensions.
- Converting arbitrary rich-text clipboard HTML into Markdown.
- Migrating saved card content or changing server/storage APIs.

## Decisions

### Add an editor-level plain-text Markdown paste extension

The card editor will compose a small Tiptap/ProseMirror paste extension alongside its existing extensions. The extension will inspect `text/plain` only when the clipboard does not carry files or HTML, identify text containing supported Markdown syntax, parse it through the configured Tiptap Markdown manager, and insert the parsed document at the current selection. Returning a handled paste result prevents raw Markdown text from being inserted after the rich nodes.

This keeps paste semantics within Tiptap, where selection replacement and editor transactions already belong, rather than intercepting React's outer paste event and reimplementing editor selection behavior.

Alternatives considered:

- Parse every outer React paste event. Rejected because it would interfere with existing file paste behavior and bypass Tiptap's native clipboard flow.
- Replace the full document with the parsed Markdown. Rejected because paste must follow the normal editor convention of inserting at the cursor or replacing the selected range.
- Add a visible "Paste Markdown" action. Rejected because the clipboard contents are sufficient to make ordinary paste work naturally.

### Prefer supported Markdown over accompanying clipboard HTML

The Markdown handler will decline image-file clips so the existing `FileHandler` image insertion path remains authoritative. For a supported Markdown `text/plain` payload, it will parse Markdown even when the clipboard also has an HTML representation. Sources can add inline HTML such as `<code>` while retaining literal Markdown headings and list markers; letting HTML take precedence in that case leaves those structural markers raw and can insert source-specific extra paragraph spacing. Clipboard text that does not indicate supported Markdown retains native rich-HTML paste behavior.

Alternatives considered:

- Prefer native HTML whenever it is present. Rejected because sources commonly provide an HTML representation alongside literal Markdown and may add inline formatting to only part of the payload. That loses the structural Markdown conversion users expect.

### Normalize and validate Markdown before parsing

Pasted Markdown will pass through the same image normalization used when opening saved card content before being parsed. Existing supported URL rules remain the source of truth: unsafe image sources become inert text, and unsafe links must not result in active link nodes. Parsed supported content then relies on the same Tiptap extensions that serialize card content for persistence and Copy Markdown.

Alternatives considered:

- Parse raw Markdown directly. Rejected because existing image Markdown has a normalization path required for reliable image-node round-tripping and URL sanitization.
- Add a second Markdown parser. Rejected because it risks differences between loading, pasting, and exporting content.

## Risks / Trade-offs

- [Markdown detection can mistake literal syntax for formatting] → Limit conversion to recognizable supported Markdown patterns and leave ordinary plain text to the native paste behavior.
- [Paste extensions can compete with image handling or browser HTML paste] → Explicitly decline file clips, give supported plain-text Markdown priority, and cover both Markdown-with-HTML and native rich-HTML regression paths in focused tests.
- [Markdown parsing can produce content unsupported by the editor schema] → Use the configured Markdown manager and existing editor extensions, and test the supported formatting set.
- [Unsafe URLs could enter via pasted Markdown] → Reuse centralized image and link safety validation, with regression tests for unsafe schemes.

## Migration Plan

No migration or deployment sequencing is required. The behavior is client-only and uses the existing Markdown storage format. Rollback consists of removing the paste extension; existing card content remains valid Markdown and existing file/HTML paste behavior remains intact.

## Open Questions

None.
