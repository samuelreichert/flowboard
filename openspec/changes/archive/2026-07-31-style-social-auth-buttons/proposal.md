## Why

The social sign-in controls are currently visually indistinguishable from ordinary Flowboard buttons and do not identify their providers with icons. Aligning their presentation with familiar Google and Apple sign-in patterns will make the available authentication choices faster to recognize while preserving the app's established interface.

## What Changes

- Add recognizable Google and Apple provider icons to their respective social OAuth controls.
- Apply provider-specific visual treatments: a light Google control with a multicolor Google mark, and a black Apple control with white icon and label.
- Keep existing Flowboard geometry, accessibility behavior, localized labels, dark-theme support, loading feedback, OAuth enablement rules, and Apple configuration guidance intact.
- Add coverage for the provider markers and ensure the social-auth behavior remains unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `social-oauth-login`: Social provider choices must present recognizable provider branding while retaining their existing availability and sign-in behavior.

## Impact

- Affected UI: `src/app/AuthGate.tsx` and `src/app/AuthGate.css`.
- Affected tests: `src/app/AuthGate.test.tsx`.
- May add local, accessibility-safe provider icon assets or components; no OAuth, API, database, or configuration behavior changes are expected.
