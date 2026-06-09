## Context

Flowboard uses a shared `CardDialog` for creating new cards and editing existing cards. Existing cards autosave changes as the user edits title, content, column, priority, and tags, while new cards keep local draft state until the user submits the form.

The card dialog is a Base UI dialog controlled by the parent column's `addCardOpen` state for new cards. The current `onOpenChange` path closes immediately for Escape, close button, Cancel, and outside dismissal. The app already has a reusable `ConfirmDialog` built with Base UI AlertDialog for destructive confirmations such as deleting cards, columns, board data, and in-use tags.

## Goals / Non-Goals

**Goals:**

- Protect meaningful unsaved new-card drafts from accidental dismissal.
- Preserve fast Escape and Cancel behavior for empty new-card drafts.
- Use the existing confirmation dialog pattern for visual and interaction consistency.
- Keep dirty detection local to `CardDialog`, where the new-card draft state already lives.
- Cover title text, content, and selected tags as draft content.

**Non-Goals:**

- Do not add undo or draft persistence after the user confirms discard.
- Do not change existing-card autosave behavior.
- Do not treat a priority-only change as draft content.
- Do not make board-level inline tag creation transactional with card creation.
- Do not change the card, board, storage, or server data models.

## Decisions

### Guard close requests inside `CardDialog`

Wrap the dialog's `onOpenChange` with a local close handler. When Base UI requests `open = false`, the handler checks whether the dialog is creating a new card and whether the draft is dirty. Empty drafts delegate directly to the parent `onOpenChange(false)`, while dirty drafts open a discard confirmation instead of closing the card dialog.

Rationale: The dirty state depends on `title`, `content`, and `selectedTagIds`, all of which already live in `CardDialog`. Keeping the guard there avoids pushing draft state into `Column` or adding a cross-component draft manager.

Alternative considered: Handle dirty close in `Column` by passing more state upward. This would blur ownership because `Column` does not currently know about the unsaved title, editor content, or tag selections.

### Define dirty new-card drafts by user-authored content

A new-card draft is dirty when `title.trim()` is non-empty, `content.trim()` is non-empty, or `selectedTagIds.length > 0`. Priority-only changes remain non-dirty because Medium is the default metadata value and priority is not part of the requested content-loss safeguard.

Rationale: The user explicitly named tags, title, and content. This maps directly to the content that would be lost if no card is created.

Alternative considered: Compare the entire form to its initial values, including priority and selected column. That would be stricter, but it makes an otherwise empty draft feel harder to dismiss after lightweight metadata changes.

### Use an in-dialog discard confirmation state

Render a discard confirmation state inside the existing card dialog popup instead of opening a second modal. Confirming discard closes the card dialog. Cancelling discard returns the popup to the draft form with the unsaved values still in component state.

Rationale: The app's reusable `ConfirmDialog` is an AlertDialog, and nesting it inside the already-open card dialog can leave the underlying dialog inaccessible after cancellation. Keeping the confirmation inside the same controlled dialog avoids nested modal focus/inert conflicts while preserving the existing visual styling and destructive-action treatment.

Alternative considered: Reuse `ConfirmDialog` directly. That matches other destructive confirmations visually but introduces nested modal behavior for a case that needs to return to an open draft form.

### Leave inline-created board tags in place

If a user creates a board tag inside a new-card draft and then discards the draft, the selected tag assignment is discarded with the card draft, but the board-level tag remains.

Rationale: Current inline tag creation writes to board tags immediately, and board tags are global reusable vocabulary. Reverting tag creation on card discard would require tracking which tags were created during a draft and deciding whether to remove them only if unused.

Alternative considered: Defer new tag persistence until card creation. This would make card discard fully transactional, but it is broader than the requested confirmation behavior and risks changing established tag semantics.

## Risks / Trade-offs

- Confirmation state can obscure draft fields while active -> Keep draft values in `CardDialog` state and test that cancelling confirmation restores the form with those values intact.
- Tiptap content may produce formatting-only markdown that is not visually obvious -> Use the editor's markdown string as the source of truth and trim whitespace for dirty detection.
- The tag dropdown can be open when the user attempts to close the card dialog -> Let the guarded card close path own the final decision, and ensure discard confirmation state resets when the card dialog fully closes.
- Inline-created tags remain after draft discard -> Document this as intentional board-level behavior and cover card assignment clearing in tests.

## Migration Plan

No migration is required. The change only affects local dialog behavior and does not alter persisted board data.
