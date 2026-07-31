## 1. Shared manager foundations

- [x] 1.1 Export the tag-name and column-title maximums from a pure shared
      board-domain module; consume them from client inputs and authenticated route
      validation.
- [x] 1.2 Add or extend the shared manager action-rail presentation so direct
      icon actions have consistent sizing, separators, focus treatment, and
      destructive styling.
- [x] 1.3 Use the existing localized labels required by the responsive
      column-actions menu and archived Markdown-copy feedback.

## 2. Tag management normalization

- [x] 2.1 Update tag-manager create and inline-edit inputs to the shared
      API-compatible tag-name limit.
- [x] 2.2 Preserve focused inline tag editing with Enter commit, Escape cancel,
      valid blur commit, and non-persisting empty or duplicate values.
- [x] 2.3 Render tag Rename and Remove through the shared separated icon-action
      rail without changing usage-aware removal confirmation or tag mutations.
- [x] 2.4 Add tag-manager coverage for action accessibility, keyboard rename
      behavior, invalid names, and maximum-length input.

## 3. Responsive column management

- [x] 3.1 Replace the nested column-rename dialog workflow with focused inline
      editing that uses existing column validation and mutation callbacks.
- [x] 3.2 Define the six column commands once and render all of them as direct
      separated icon actions above the smartphone breakpoint, retaining disabled
      edge commands and destructive delete confirmation.
- [x] 3.3 Render only a `Column actions` menu at or below the smartphone
      breakpoint, deriving its reorder, rename, delete, icons, disabled states,
      and destructive divider from the same column-action definitions.
- [x] 3.4 Verify the add-column return-to-manager workflow and completed-column
      configuration remain intact after rename and reorder changes.
- [x] 3.5 Add responsive component coverage for desktop icon actions, the
      smartphone menu, keyboard operation, inline rename, edge states, and delete
      confirmation.

## 4. Archived Markdown copy action

- [x] 4.1 Move the archived-card Markdown copy control from metadata into a
      top-right floating icon action on the readonly content surface.
- [x] 4.2 Add an accessible tooltip that changes from `Copy Markdown` to
      `Copied` only after a successful clipboard write, plus a polite success
      announcement and safe retry behavior after clipboard failure.
- [x] 4.3 Hide the archived-card copy action when no archived content exists
      and ensure the floating control and tooltip are not clipped by scrolling
      content or the dialog viewport.
- [x] 4.4 Update history tests for clipboard success, failure, temporary copied
      feedback, empty content, and icon-only accessible naming.

## 5. Verification

- [x] 5.1 Run focused tag, column, history, localization, and server-route test
      suites; fix regressions.
- [x] 5.2 Run the full test suite and typecheck.
- [x] 5.3 Verify desktop and smartphone visual states for manager rows,
      keyboard focus, open mobile menu, long names, empty content, and the
      floating copy tooltip.
