## Why

Flowboard already exports card content as Markdown, but pasting that Markdown back into a card treats it as literal text. Users cannot round-trip content between the rich editor and Markdown without manually recreating formatting.

## What Changes

- Convert supported plain-text Markdown pasted into a card content editor into rich editor content at the active selection.
- Preserve existing image-file paste behavior and normal browser handling of rich HTML clipboard content.
- Keep pasted content compatible with the existing Markdown persistence and Copy Markdown workflow, including safe image and link handling.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `card-content-rich-editing`: Card content gains Markdown-to-rich-content paste conversion that round-trips the editor's supported Markdown formatting.

## Impact

- Affects the Tiptap card content editor's paste integration and focused editor tests.
- Reuses the installed Tiptap Markdown extension and existing Markdown/image URL normalization helpers; no storage migration, API change, or new dependency is expected.
