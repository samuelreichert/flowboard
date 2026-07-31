## 1. Provider presentation

- [x] 1.1 Add a typed, decorative local SVG icon component for the existing Google and Apple social-auth provider IDs.
- [x] 1.2 Add centralized theme tokens for the provider-specific Google and Apple control colors, including any dark-theme overrides needed to preserve contrast.
- [x] 1.3 Update `AuthGate` to render the matching provider icon and a provider-specific button modifier without changing request callbacks, labels, enablement, or disabled guidance.
- [x] 1.4 Style the provider variants in `AuthGate.css` to retain Flowboard's control dimensions, focus ring, disabled/loading behavior, and responsive layout while applying the reference-inspired Google and Apple treatments.

## 2. Automated coverage

- [x] 2.1 Extend the AuthGate tests to verify that each provider control renders its matching decorative icon while preserving its accessible name and current OAuth callback behavior.
- [x] 2.2 Cover the disabled Apple and loading-provider states to confirm their existing behavior remains intact after the presentation update.

## 3. Verification

- [x] 3.1 Run the affected AuthGate tests, lint, and TypeScript checks.
- [x] 3.2 Visually verify the signed-out auth screen at desktop and mobile widths in light and dark themes, including focused, disabled, and opening states.
