## 1. Toast foundation

- [x] 1.1 Add a Flowboard-owned toast module that composes Base UI Toast Provider, Portal, Viewport, Root, Content, Title, Description, and Close with a typed notification API.
- [x] 1.2 Implement deduplication and update/dismiss behavior for notifications that represent the same logical operation.
- [x] 1.3 Add shared Flowboard toast styles for severity variants, desktop and compact viewport placement, focus states, theme tokens, safe-area spacing, stacking, and reduced motion.
- [x] 1.4 Add English and Brazilian Portuguese toast labels and any new notification copy, including the close-control accessible label.

## 2. Persistence-feedback migration

- [x] 2.1 Mount the shared toast provider and viewport at the application level outside clipping workspace layout.
- [x] 2.2 Migrate authenticated board saving, complete-board loading, and bootstrap failure feedback to the shared toast API with one transient saving status and persistent errors.
- [x] 2.3 Migrate card and board mutation failure feedback to persistent, deduplicated error toasts.
- [x] 2.4 Remove the standalone `app__persistence-status` render path and its obsolete styling after all migrated feedback is covered.
- [x] 2.5 Preserve inline auth, profile, dialog, editor, and form validation feedback plus the completed-work acknowledgement without routing them through toasts.

## 3. Verification

- [x] 3.1 Add focused tests for variant rendering, localized dismissal, lifecycle duration, persistent errors, and duplicate-operation replacement.
- [x] 3.2 Add or update app-level tests for successful background saves, failed board/card mutations, and unavailable-board notifications.
- [x] 3.3 Verify keyboard behavior, no focus stealing, light and dark themes, reduced motion, dialogs, desktop viewport, and mobile viewport.
- [x] 3.4 Run the relevant test suite, typecheck, and visual/browser verification; address actionable findings.
