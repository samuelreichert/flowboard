## Context

Cards currently render as an `article` containing a small drag-handle button and a separate card-body button. Atlassian Pragmatic Drag and Drop registers the whole card element as the draggable element, but only the handle starts the drag. The card body opens the card dialog on click.

The target UX removes the visible move handle for desktop use. The board card should feel like the movement surface while still allowing the user to click anywhere to open details and drag-select the title text when they need to copy it. Mobile drag-and-drop is intentionally deferred because mobile board movement will use a separate columns-as-tabs design and card-dialog movement flow.

## Goals / Non-Goals

**Goals:**
- Let desktop users initiate card movement from the card surface without using a dedicated move handle.
- Preserve plain click-to-open behavior across the full card.
- Preserve title text selection on the board and prevent a selection gesture from opening or moving the card.
- Keep display-only priority and tag pills as part of the click/drag card surface.
- Maintain existing card reorder and cross-column move behavior.
- Keep a non-pointer movement path available through the card dialog's column selector.

**Non-Goals:**
- Add mobile board drag-and-drop.
- Add keyboard-first precise board reordering.
- Make tags or priority pills interactive.
- Change card storage, APIs, or persistence behavior.
- Introduce a new drag-and-drop library.

## Decisions

### Use the card element as the drag source, with no visible drag handle

Register the card element with Pragmatic Drag and Drop without a dedicated handle so a drag can begin from the card surface. This keeps the existing drag/drop architecture and reorder logic while removing the small target that slows down frequent card movement.

Alternatives considered:
- Keep the existing handle and only make it more visible. This preserves precision but does not solve the daily-use speed problem.
- Add a larger invisible handle region. This reduces visual clutter but creates a hidden interaction model and still competes with click/open behavior.

### Give title text selection priority over card drag and open

The title text should remain selectable on the board. Drag attempts that originate as title text selection should not start a card drag, and releasing after selecting text should not open the card. A plain click on the title still opens the card.

Alternatives considered:
- Make every pixel draggable. This is fastest for movement but blocks the user's desired title text selection.
- Require a modifier key to select text. This preserves full-card dragging but makes a basic text-selection action too hidden and fragile.

### Treat the remaining card display area as both clickable and draggable

The card background, content icon area, priority pill, and tag pills are display-only surfaces. A plain click opens the card, while a drag gesture moves the card. This preserves the simple "click anywhere to open" mental model while making movement fast.

Alternatives considered:
- Make only the background draggable and exclude metadata. This protects future interactivity, but the user confirmed tags and priority are display-only.
- Add a separate card action menu for copy/move affordances. This adds UI surface area after the goal of removing the handle.

### Keep accessibility scope focused on existing non-pointer move access

The card dialog already allows moving a card to another column without dragging. This change should preserve that path but does not need to add precise keyboard reorder commands on the board.

Alternatives considered:
- Add keyboard reorder controls now. This would be more complete, but it expands the scope beyond removing the drag handle and changing pointer UX.

### Explicitly exclude mobile board drag behavior

Mobile drag-and-drop should not be solved as part of this change. The future mobile board design will remove horizontal column scrolling, show columns as tabs, and move cards through the opened card flow.

Alternatives considered:
- Tune touch long-press drag in the same change. This risks designing against a mobile layout that is expected to change.

## Risks / Trade-offs

- Accidental drag while trying to open a card -> Rely on the drag library's pointer movement threshold and test click-to-open against drag gestures.
- Selecting title text opens the card on mouseup -> Suppress card opening when a text selection gesture has occurred.
- Title area no longer starts card movement -> Accept this as the necessary trade-off to preserve title selection.
- Removing the handle reduces visible discoverability -> Use cursor and dragging visual states on desktop to communicate that cards can be moved.
- Keyboard users cannot precisely reorder cards on the board -> Preserve the existing dialog-based column move path and leave board keyboard reorder as future scope.
