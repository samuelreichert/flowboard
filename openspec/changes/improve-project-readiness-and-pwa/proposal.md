## Why

Flowboard has gained richer board metadata and actions, but the project needs a clearer action affordance, stronger Base UI alignment, and better public-facing documentation before the next round of polish. The app is already local-first, so this is also the right moment to make offline behavior explicit and reliable as a Progressive Web App.

## What Changes

- Replace the top-right board actions trigger with a clearer icon-only affordance that communicates board settings/tools instead of generic overflow.
- Continue the Base UI audit by moving remaining custom popup, select, field, and toolbar interactions toward appropriate Base UI primitives.
- Add a real application screenshot to the README so GitHub visitors can understand Flowboard at a glance.
- Expand README content so it reflects current capabilities, storage modes, and offline/PWA expectations.
- Record the README review automation as skipped for this change per user request.
- Add PWA support so the static app shell and bundled assets work offline after installation or first successful load.
- Define how offline localStorage behavior interacts with the optional local SQLite API, including reconnect/retry expectations.

## Capabilities

### New Capabilities

- `board-ui-affordance`: Covers the top-right board actions trigger and visible action affordances.
- `base-ui-alignment`: Covers migration of eligible custom UI controls to appropriate Base UI primitives while preserving accessibility and behavior.
- `project-readme-presentation`: Covers README screenshots and user-facing project documentation.
- `readme-pr-review`: Covers the skipped README freshness review scope for future consideration.
- `offline-pwa-readiness`: Covers PWA install/offline behavior and local-first persistence expectations.

### Modified Capabilities

None.

## Impact

- `src/App.tsx` and `src/App.css`: top-right board action trigger and related styling.
- `src/components/BackgroundPicker`: Base UI Popover migration for background settings.
- `src/components/CardDialog`: Base UI Select and Field migration for card metadata and form fields.
- `src/components/ContentDialog`, `src/components/ColumnRenameDialog`, and `src/components/TagManagerDialog`: Base UI Field/Input alignment where practical.
- `src/components/CardContentEditor`: Base UI Toolbar migration for editor formatting controls.
- `vite.config.ts`, `src/main.tsx`, `index.html`, and `public/`: PWA manifest, service worker registration, install icons, and cached assets.
- `src/storage/index.ts`: offline/reconnect handling for optional API persistence if needed.
- `README.md` and `public/flowboard-screenshot.png`: screenshot and documentation updates.
- `package.json` and lockfile: PWA tooling.
