## 1. Interaction Coverage

- [x] 1.1 Add or update tests that assert board cards no longer expose a dedicated drag-handle button.
- [x] 1.2 Add or update tests that assert a plain click on the title, metadata, and card background opens the card details.
- [x] 1.3 Add or update tests that assert selecting title text does not open the card or move it.
- [x] 1.4 Add or update tests that preserve card reorder and cross-column move behavior.
- [x] 1.5 Add or update tests that preserve moving a card through the card details column selector.

## 2. Card Drag Source

- [x] 2.1 Remove the dedicated card drag-handle element and associated ref from the card component.
- [x] 2.2 Register the card element as the drag source without a visible drag handle.
- [x] 2.3 Ensure desktop drag gestures from card background, priority pills, and tag pills move the card.
- [x] 2.4 Preserve existing drop-target registration, closest-edge feedback, and reorder behavior.

## 3. Click And Selection Handling

- [x] 3.1 Make the card surface handle plain click-to-open behavior.
- [x] 3.2 Allow card title text selection on the board.
- [x] 3.3 Suppress card opening after a title text-selection gesture.
- [x] 3.4 Ensure drag gestures do not trigger card opening on drop.

## 4. Styling And Feedback

- [x] 4.1 Remove drag-handle styles and layout spacing from card CSS.
- [x] 4.2 Update card cursor and hover/focus states so desktop users can discover card dragging without a handle.
- [x] 4.3 Preserve existing dragging and drop-indicator visual feedback.
- [x] 4.4 Confirm mobile tap-to-open behavior remains unchanged and no mobile board drag behavior is added.

## 5. Verification

- [x] 5.1 Run the relevant unit/component test suite.
- [x] 5.2 Run type checking.
- [x] 5.3 Manually verify desktop card click, drag, title selection, and drop-position feedback in the browser.
- [x] 5.4 Manually verify assistive technology/control listings no longer include a separate drag-handle button.
