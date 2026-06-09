## 1. Board Actions Affordance

- [x] 1.1 Replace the top-right `Ellipsis` board actions trigger with a clearer settings/tools lucide icon.
- [x] 1.2 Convert the board actions trigger to an icon-only control with a stable accessible name.
- [x] 1.3 Add or reuse a tooltip so the icon-only board actions trigger is discoverable on hover and focus.
- [x] 1.4 Preserve existing board actions menu entries and clear-board availability behavior.
- [x] 1.5 Update board actions tests for the new trigger affordance and preserved menu behavior.

## 2. Base UI Alignment

- [x] 2.1 Refactor `BackgroundPicker` from a custom conditional dialog panel to Base UI `Popover`.
- [x] 2.2 Preserve background picker outside-click, Escape, close button, color, image preset, and URL behaviors.
- [x] 2.3 Refactor card dialog Column and Priority native selects to Base UI `Select`.
- [x] 2.4 Refactor practical dialog text inputs and validation messages to Base UI `Field` / `Field.Control`.
- [x] 2.5 Refactor card content editor formatting controls to Base UI `Toolbar` / `Toolbar.Button`.
- [x] 2.6 Capture Base UI consistency follow-up in project rules instead of keeping a separate docs audit file.
- [x] 2.7 Update tests for background picker, card selects, validation messages, and editor toolbar behavior.

## 3. PWA Offline Readiness

- [x] 3.1 Add PWA tooling and configure the Vite build to generate a service worker and web app manifest.
- [x] 3.2 Add required PWA install icons and include existing bundled assets in the offline-ready app shell.
- [x] 3.3 Register the service worker from the app entry point with predictable update behavior.
- [x] 3.4 Ensure failed `/api/board` hydration keeps existing local browser storage intact.
- [x] 3.5 Ensure failed `/api/board` writes do not block local board edits or clear local state.
- [x] 3.6 Add tests for API-unavailable local-first behavior where practical.
- [x] 3.7 Verify a production build can reload the app shell offline after first load.

## 4. README Presentation

- [x] 4.1 Create a representative seeded board state for screenshot capture.
- [x] 4.2 Capture a durable product screenshot showing columns, cards, priorities, tags, background, and the board actions trigger.
- [x] 4.3 Store the screenshot under `public/` with a stable filename.
- [x] 4.4 Update README feature overview to include current Flowboard capabilities.
- [x] 4.5 Update README setup, storage, deployment, and offline/PWA sections.
- [x] 4.6 Add the screenshot near the top of README with useful alt text.

## 5. PR README Review Automation

- [x] 5.1 Skip pull request workflow creation per user request.
- [x] 5.2 Skip AI README freshness review step per user request.
- [x] 5.3 Skip workflow reporting implementation per user request.
- [x] 5.4 Skip workflow configuration documentation per user request.
- [x] 5.5 Skip missing-configuration fallback implementation per user request.

## 6. Final Verification

- [x] 6.1 Run typecheck.
- [x] 6.2 Run the test suite.
- [x] 6.3 Run a production build.
- [x] 6.4 Manually inspect the updated app at desktop and mobile widths.
- [x] 6.5 Manually verify README screenshot rendering and offline/PWA behavior.
