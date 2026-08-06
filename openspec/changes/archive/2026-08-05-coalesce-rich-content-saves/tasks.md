## 1. Rich-Content Autosave Producer

- [x] 1.1 Add a focused rich-content autosave producer with a named 750 ms idle interval, latest-document replacement, stable callback refs, and an idempotent flush operation.
- [x] 1.2 Update the card dialog controller so editor changes update local state immediately, queue only rich-content persistence, preserve valid dirty-title piggybacking at flush time, and leave non-content saves immediate.
- [x] 1.3 Wire composite-editor blur, dialog close, hidden-document visibility change, and unmount to flush pending content without treating focus movement inside the editor toolbar as an exit.
- [x] 1.4 Verify repeated lifecycle signals cannot dispatch the same pending document twice.

## 2. Autosave and Integration Coverage

- [x] 2.1 Add fake-timer tests proving a typing burst sends no early content request, resets the idle timer, and sends exactly the latest document once after the interval.
- [x] 2.2 Add fake-timer lifecycle tests covering external blur, internal editor focus movement, dialog close, visibility loss, unmount teardown, and duplicate flush signals.
- [x] 2.3 Add regression coverage proving title, priority, column, and tag saves remain immediate while content is pending and the eventual content flush uses the existing active-card update payload rather than a legacy board save.
- [x] 2.4 Add or update failure-path coverage proving a rejected flushed mutation retains the existing rollback behavior and persistent not-durably-saved notification.

## 3. Validation

- [x] 3.1 Run the focused card-dialog, card-content-editor, and active-card mutation test suites and resolve regressions without changing mutation ordering.
- [x] 3.2 Run lint and typecheck, then confirm no API client, server route, database, revision, offline-write, or image-storage code changed.
