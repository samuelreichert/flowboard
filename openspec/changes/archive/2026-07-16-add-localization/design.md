## Context

Flowboard is a React app with app-level state managed through `useAppController`, `appReducer`, and typed app state/actions. Theme preference is already local-first: `src/theme.ts` validates and persists the preference in `localStorage`, app initialization resolves it, and Settings exposes a segmented control for system/light/dark.

The current UI text is mostly hardcoded across app shell, dialogs, board controls, composer controls, history, auth, profile, and validation paths. User-entered board data is also visible in the UI, but it must remain unchanged by localization.

## Goals / Non-Goals

**Goals:**

- Support English and Brazilian Portuguese for Flowboard-owned UI text.
- Default to automatic browser-language resolution.
- Let users manually switch language from Settings.
- Persist language preference locally across reloads.
- Keep language preference out of authenticated profile, board state, and backend persistence for the MVP.
- Keep translation keys typed enough that missing locale entries are caught during development.
- Reuse existing Settings, DialogSelect/SegmentedControl, app controller, and local-storage patterns where practical.
- Format dates and pluralized/count-based labels through locale-aware helpers.

**Non-Goals:**

- Translate user-generated content such as cards, columns, tags, profile names, or uploaded/editor content.
- Add account-level preference sync or cross-device language persistence.
- Add more languages beyond English and Brazilian Portuguese.
- Introduce a large i18n framework unless the implementation discovers a clear need.
- Localize server logs, database values, API route paths, or developer-only test data.
- Add runtime translation downloads or remote catalog management.

## Decisions

### Language preference mirrors theme preference

Add a small localization module with supported languages and local preference helpers:

- `LanguagePreference`: `system | en | pt-BR`
- `ResolvedLanguage`: `en | pt-BR`
- `DEFAULT_LANGUAGE_PREFERENCE`: `system`
- local storage key: `flowboardLanguagePreference`

`system` resolves from `navigator.languages` when available, then `navigator.language`, falling back to English. `pt-BR` resolves directly to Brazilian Portuguese; all other `pt-*` browser locales also resolve to Brazilian Portuguese for the MVP because Portuguese support is represented by the Brazilian catalog. Unsupported locales resolve to English.

Alternatives considered:

- Persist only explicit languages and treat missing storage as browser language. This is smaller but gives users no visible way to return to automatic behavior after choosing a manual language.
- Sync language through profile data. This is useful later, but it adds backend/API scope unrelated to the MVP.

### Use local typed catalogs before adopting an i18n dependency

Implement local message catalogs as TypeScript modules, with English as the source catalog and Brazilian Portuguese required to satisfy the same key shape. Expose a small translator or hook that returns resolved strings and formatters. Prefer named formatter functions for interpolated, pluralized, and date-sensitive strings instead of ad hoc string replacement throughout components.

Alternatives considered:

- Add a full i18n dependency. This may be warranted later for complex plural rules, extraction workflows, or many locales, but the MVP has two bundled languages and can remain dependency-light.
- Store translations in JSON only. JSON is easy to inspect but less helpful for typed formatter functions and compile-time key coverage.

### Settings owns language switching

The existing Settings dialog should add a language control in the Appearance section or an adjacent Language section. The control should expose:

- Browser language with the currently resolved language visible in the option label
- English
- Português (Brasil)

Changing the control updates app state immediately, persists the preference locally, updates `document.documentElement.lang`, and re-renders visible UI in the selected language. Route-owned Settings behavior for `/settings` remains unchanged.

Alternatives considered:

- Put language in the account menu. Settings is already where app-level preferences live, and the request specifically names the settings dialog.
- Add a standalone onboarding prompt. This is unnecessary for the MVP because automatic browser language handles first run.

### Localize app-owned text, not user-owned data

The localization layer should cover Flowboard-owned labels, buttons, aria labels, empty states, validation messages, auth/status copy, priority labels, and date/count labels. User-generated values remain literal, including board column names, card titles/content, tag names, profile display names, email addresses, and route path display.

Dynamic messages should be centralized so pluralization and variable placement are correct in both languages. Examples include completed-card counts, tag usage counts, archived-card counts, and complete-work confirmation copy.

### Locale-aware formatting follows resolved language

Date/time formatters that currently use `undefined` locale should accept or derive the resolved language. Existing display style can remain similar, but the locale parameter should be explicit so Portuguese users see browser-native Portuguese date formatting.

## Risks / Trade-offs

- Hardcoded strings are spread across many components -> Implement in focused passes, starting with shared catalogs and high-traffic surfaces, then sweep remaining Flowboard-owned strings with tests.
- Portuguese strings may be longer than English -> Verify Settings, dialogs, sidebar labels, composer controls, buttons, mobile width, and popovers for wrapping/clipping.
- Typed catalogs can become noisy if every string is deeply nested -> Keep catalog grouping by product surface and extract helpers for count/date messages.
- Some strings originate in helper modules rather than components -> Pass the translation/locale dependency explicitly where needed instead of importing UI state into domain helpers.
- Tests that assert English text will need updates -> Prefer role/label assertions using the active locale and add targeted Portuguese assertions for user-visible switching behavior.

## Migration Plan

1. Add localization types, message catalogs, local preference persistence, browser-language resolution, and unit tests.
2. Extend app state/actions/controller with language preference and resolved language, mirroring theme preference flow.
3. Add a translation provider or hook at the app shell boundary and update `document.documentElement.lang` when the resolved language changes.
4. Add the Settings language control and verify the preference persists across reloads.
5. Replace hardcoded Flowboard-owned strings in app shell, Settings, dialogs, board/composer controls, auth, profile, tag management, card dialogs, and history with localized messages.
6. Update date/count/priority formatting to use locale-aware helpers.
7. Add or update tests for English default, Portuguese browser auto-detection, manual language switching, reload persistence, fallback behavior, and key UI surfaces in Portuguese.
8. Perform visual checks for desktop, collapsed sidebar, mobile, Settings open, popovers/selects open, long Portuguese strings, light theme, and dark theme.

Rollback can remove the Settings language control and leave the app on the English catalog while keeping user board data intact. Local storage entries for language preference can be ignored safely.
