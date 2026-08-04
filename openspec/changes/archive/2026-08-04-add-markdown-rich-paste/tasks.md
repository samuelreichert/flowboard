## 1. Markdown paste integration

- [x] 1.1 Add a reusable supported-Markdown detection helper for plain-text clipboard content.
- [x] 1.2 Add a Tiptap/ProseMirror paste extension that declines file and HTML clipboard content, parses supported plain-text Markdown through the configured Markdown manager, and inserts it at the active selection.
- [x] 1.3 Compose the Markdown paste extension into the card content editor without changing existing image-file paste/drop behavior.
- [x] 1.4 Route pasted Markdown through the established image normalization and URL-safety rules before rich-content insertion.

## 2. Regression coverage

- [x] 2.1 Add focused tests for converting Flowboard-style Markdown headings, inline formatting, links, lists, task lists, quotes, and code into rich editor nodes.
- [x] 2.2 Add tests that pasted Markdown replaces the active selection and round-trips through saved/copied Markdown.
- [x] 2.3 Add tests confirming ordinary plain text, image-file paste, and rich-HTML clipboard paste retain their existing behavior.
- [x] 2.4 Add tests that unsafe pasted link and image schemes do not create active unsafe nodes.

## 3. Verification

- [x] 3.1 Run the focused card content editor test suite and typecheck.
- [x] 3.2 Perform a browser smoke check of Copy Markdown followed by paste into a card on desktop and mobile viewports.

## 4. Clipboard HTML mirror correction

- [x] 4.1 Allow supported plain-text Markdown with a text-equivalent, non-semantic HTML clipboard mirror to use the rich Markdown paste path while preserving semantic rich-HTML paste behavior.
- [x] 4.2 Cover the mirrored clipboard case and rerun focused editor verification.

## 5. Markdown priority correction

- [x] 5.1 Give supported plain-text Markdown priority over any accompanying clipboard HTML while retaining image-file and non-Markdown rich-HTML handling.
- [x] 5.2 Add a regression test for the reported heading, list, inline-code, and bold payload with an inline-formatted HTML clipboard representation; rerun verification.
