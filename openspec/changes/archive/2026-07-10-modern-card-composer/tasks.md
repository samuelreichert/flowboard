## 1. Composer Foundation

- [x] 1.1 Extract or expose a board-level card creation handler that can create a card from `title`, `content`, `columnId`, `priority`, and `tagIds` without opening `CardDialog`
- [x] 1.2 Add a dedicated card composer component with local draft state for input text, selected column, selected priority, selected tags, validation error, and focused/expanded state
- [x] 1.3 Add a parser utility that derives the first non-empty line as `title` and the remaining text as `content`
- [x] 1.4 Add focused unit tests for title/content parsing, whitespace handling, and title-only drafts

## 2. Composer Controls

- [x] 2.1 Implement the growing multiline composer input with a one-line initial height and bounded expanded height
- [x] 2.2 Implement compact destination column selection with defaulting to the last selected valid column or first available column
- [x] 2.3 Implement compact priority selection defaulting to Medium
- [x] 2.4 Implement compact tag selection with selected-tag summaries and existing board tag assignments
- [x] 2.5 Implement the accessible icon submit button with a clear `Add card` accessible name
- [x] 2.6 Implement `Cmd+Enter` and `Ctrl+Enter` submission while preserving plain `Enter` as newline insertion

## 3. Board Integration

- [x] 3.1 Render the composer only on the board view, anchored near the bottom of the board workspace
- [x] 3.2 Route successful composer submissions through the existing board storage update flow
- [x] 3.3 Clear the text draft and reset validation after successful creation while keeping useful metadata defaults available for the next capture
- [x] 3.4 Remove or de-emphasize the column-local new-card dialog entry point so fast creation primarily happens through the global composer
- [x] 3.5 Preserve existing card opening and editing behavior through the full card dialog after composer-created cards appear on the board

## 4. Empty, Draft, and Error States

- [x] 4.1 Disable card creation when the board has no columns and provide a clear path to add a column first
- [x] 4.2 Prevent empty or whitespace-only draft submission and associate the validation message with the composer input
- [x] 4.3 Preserve an unsent composer draft while the user interacts with board controls during the same board session
- [x] 4.4 Handle deleted or unavailable selected columns by falling back to a valid destination column

## 5. Layout, Accessibility, and Mobile

- [x] 5.1 Style the composer as a calm sticky bottom surface that does not cover required board content or interfere with horizontal column scrolling
- [x] 5.2 Ensure keyboard focus order moves through input, metadata controls, and submit button logically
- [x] 5.3 Ensure metadata popovers/selects support keyboard selection, Escape dismissal, and outside-click dismissal
- [x] 5.4 Adapt the composer for small screens so the input, metadata controls, and submit button remain reachable above the on-screen keyboard
- [x] 5.5 Verify text wrapping, composer height limits, and no clipping or overlap at desktop and mobile breakpoints

## 6. Verification

- [x] 6.1 Add component or integration tests for title-only creation, title-plus-content creation, metadata creation, keyboard submission, and empty draft validation
- [x] 6.2 Add or update accessibility-oriented tests for labels, error association, and keyboard interaction where practical
- [x] 6.3 Run the project test suite
- [x] 6.4 Run a local visual smoke check for desktop and mobile board composer behavior
