## 1. Localization Foundation

- [x] 1.1 Add language preference/resolution types and helpers for `system`, `en`, and `pt-BR`.
- [x] 1.2 Persist language preference locally with a `flowboardLanguagePreference` storage key and safe storage fallbacks.
- [x] 1.3 Resolve browser language from `navigator.languages`/`navigator.language`, mapping Portuguese browser locales to `pt-BR` and unsupported locales to `en`.
- [x] 1.4 Add English and Brazilian Portuguese message catalogs with compile-time key coverage.
- [x] 1.5 Add translation/date/count helper functions for static labels, interpolated text, plural-sensitive text, priority labels, and date formatting.
- [x] 1.6 Add unit tests for validation, storage fallback, browser-language resolution, fallback language behavior, and catalog shape coverage.

## 2. App State and Settings

- [x] 2.1 Add language preference and resolved language to app state, actions, reducer initialization, and controller return values.
- [x] 2.2 Update the document root `lang` attribute when resolved language changes.
- [x] 2.3 Provide localization context or hook access from the app shell to child components.
- [x] 2.4 Add a Settings language control with an automatic browser-language option that shows the currently resolved language, plus English and Português (Brasil) options.
- [x] 2.5 Persist manual Settings changes locally and restore the saved language preference after reload.

## 3. UI Copy Migration

- [x] 3.1 Localize app shell navigation, account menu, workspace headings, route-owned dialog labels, not-found/auth/loading states, and status messages.
- [x] 3.2 Localize Settings, profile dialog, confirmation dialogs, tag manager, board controls, and completed-work controls.
- [x] 3.3 Localize card composer labels, placeholders, metadata controls, validation messages, and disabled reasons.
- [x] 3.4 Localize card dialogs, content editor controls, empty states, priority labels, tag selection UI, and created-date labels.
- [x] 3.5 Localize completed-work history labels, empty states, archived-card dialogs, date ranges, and count-based copy.
- [x] 3.6 Preserve user-generated card, column, tag, profile, and route-path values exactly as stored.

## 4. Verification

- [x] 4.1 Update existing tests that assert English UI text to use the active locale or explicit English setup.
- [x] 4.2 Add integration coverage for Portuguese browser auto-detection on first load.
- [x] 4.3 Add integration coverage for manual language switching in Settings and reload persistence.
- [x] 4.4 Add regression coverage that invalid saved language preferences fall back to browser/English behavior.
- [x] 4.5 Run typecheck and relevant unit tests.
- [x] 4.6 Visually inspect desktop, mobile, collapsed sidebar, Settings, dialogs, selects/popovers, light theme, and dark theme with Portuguese strings.
