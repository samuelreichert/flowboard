## Context

Card creation currently starts inside each column through a `Create card` button that opens the full card dialog. That dialog already supports title, rich content, destination column, priority, tags, validation, and post-creation editing, but it feels heavier than the fast capture moment the board needs.

The existing board data model already stores cards with `title`, `content`, `priority`, and `tagIds`, and card creation already accepts a `columnId`. This change should therefore introduce a new creation surface without changing card persistence or removing the full card dialog.

## Goals / Non-Goals

**Goals:**

- Provide a global sticky composer on the board view for fast card creation.
- Keep the board visible while creating a card.
- Make one growing input the primary interaction.
- Parse the first line as the card title and remaining lines as content.
- Let users choose destination column, priority, and tags from compact metadata controls.
- Support both keyboard submission and an accessible compact icon submit button.
- Preserve the full card dialog for card review and editing after creation.
- Adapt cleanly to mobile with reachable controls and no clipped keyboard layout.

**Non-Goals:**

- Add AI-assisted card generation.
- Replace the full card dialog for reviewing or editing existing cards.
- Add a dedicated capture page as the primary creation path.
- Add a new card data model, persistence layer, or migration.
- Add full rich-text formatting controls inside the composer.

## Decisions

### Use a global sticky board composer

The composer will live in the board view, visually anchored to the bottom of the workspace. It should remain available while the user scans columns, so card capture happens in context.

Alternatives considered:

- **Separate capture page:** calmer and spacious, but removes the user from the board context and makes quick capture feel indirect.
- **Column-local dialog:** already exists, but repeats the heavier form-based interaction this change is meant to replace.
- **Floating modal or sheet on desktop:** focused, but still feels like a dialog instead of direct board capture.

### Keep the composer input plain and multiline

The composer input should be a textarea-style control that starts one line tall and expands up to a capped height. It should accept plain text and Markdown-like text, then pass the body portion into the existing `content` field.

Alternatives considered:

- **Embed the TipTap rich editor in the composer:** powerful, but risks turning fast capture into a compact version of the full dialog.
- **Use separate title and content fields:** explicit, but recreates the traditional form feel.

### Parse title and content from one input

On submit, the composer should treat the first non-empty line as the title and all following text as content. Leading empty lines should not create an empty title. Remaining body text should preserve user-entered line breaks after normal trimming.

This makes fast capture natural:

```text
Call Megan about launch copy
Need final headline options before Friday.
Include the pricing page note.
```

becomes:

```text
title: Call Megan about launch copy
content: Need final headline options before Friday.
         Include the pricing page note.
```

### Put metadata in compact controls around the input

Destination column should always be visible because a global composer needs a target. Priority and tags should be compact controls that remain discoverable but visually secondary to the input.

Defaults:

- Column defaults to the last selected composer column when available, otherwise the first board column.
- Priority defaults to Medium.
- Tags default to none.

The controls should reuse the app's accessible select/popover patterns where practical.

### Use explicit submit actions

The composer should submit with `Cmd+Enter` on macOS, `Ctrl+Enter` on other keyboard contexts, and an accessible icon button. Plain `Enter` should insert a new line because multiline content is a core part of the composer.

The icon button should have an accessible name such as `Add card`. The visual glyph can be a send/up-arrow style icon or a plus icon, with a preference for an upward/send arrow when text is present because it communicates submission rather than opening another creation surface.

### Keep dialog behavior for existing cards

After a card is created, opening the card from the board should use the existing full card dialog. Existing edit behavior, including metadata edits, rich content editing, delete confirmation, and moving cards between columns, should remain intact.

## Risks / Trade-offs

- Sticky bottom layout can cover board content or fight horizontal column scrolling → reserve composer space in the board layout, test desktop and mobile scroll behavior, and keep the composer width constrained.
- The metadata controls could make the composer feel busy → keep destination column visible, collapse tags to a concise summary, and avoid labels that turn the surface into a grid form.
- Users may expect Enter to submit because some modern tools do that → make multiline behavior consistent, show the keyboard hint near the submit action, and use `Cmd+Enter` / `Ctrl+Enter` for explicit submission.
- Empty boards have no valid destination column → disable capture and provide a clear path to add the first column.
- Mobile keyboards can obscure the composer → use dynamic viewport/safe-area aware positioning and cap composer height.
- Title parsing could surprise users with leading blank lines or pasted content → define first non-empty line as the title and preserve subsequent lines as content.

## Migration Plan

No stored data migration is required. The implementation should add the composer creation path, route card creation through the existing board update/storage flow, and then retire or de-emphasize the column-local new-card dialog entry point. Rollback is possible by removing the composer entry point and restoring the column-local create-card button behavior.

## Open Questions

- Should the global focus shortcut be added now, and if so should it be `/`, `c`, or another key that avoids conflicts with text editing?
- Should a successful create show a lightweight confirmation, focus the new card, or simply clear the composer and leave focus ready for the next card?
