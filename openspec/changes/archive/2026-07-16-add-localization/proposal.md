## Why

Flowboard currently renders all application chrome, controls, validation messages, and empty states in English. The MVP needs to support English and Brazilian Portuguese, choose the initial language automatically from the browser, and let users override that choice from Settings. Keeping the preference local for the first version avoids account/profile schema churn while still preserving the user's chosen language across reloads on the same browser.

## What Changes

- Add an app localization capability with English and Brazilian Portuguese message catalogs.
- Resolve the active language from a local language preference, defaulting to browser language detection when the preference is `system`.
- Persist manual language preference locally in browser storage and restore it on reload.
- Add a language control inside the existing Settings dialog so users can switch between automatic browser language, English, and Brazilian Portuguese; the automatic option shows the currently resolved language.
- Localize Flowboard-owned UI text across app shell, navigation, settings, dialogs, board/composer controls, empty states, validation messages, auth copy, priority labels, and history/date labels.
- Keep user-generated content such as card titles, card content, column titles, tag names, and profile names unchanged.
- Format dates and language-sensitive labels using the resolved app language.

## Capabilities

### New Capabilities

- `app-localization`: Defines supported languages, browser-language resolution, local preference persistence, settings-based language switching, and translated app UI behavior.

### Modified Capabilities

- `app-shell-theme`: Settings gains a language preference control alongside existing Appearance controls while theme behavior remains unchanged.

## Impact

- Frontend localization infrastructure: new typed locale/preference helpers, message catalogs, formatting helpers, and provider/hook wiring.
- App state/controller: add language preference and resolved language state parallel to existing theme preference behavior.
- Settings UI: add a language selector in the Settings dialog, preserving local persistence and route-owned dialog behavior.
- UI copy migration: replace hardcoded Flowboard-owned strings in visible app surfaces with localized messages and pluralized/date-aware formatters.
- Tests: add unit coverage for language validation, browser-language resolution, local persistence, and integration coverage for automatic language selection plus manual Settings switching.
- Non-impact: no profile, board, Prisma, authenticated API, or Supabase storage changes for the MVP.
