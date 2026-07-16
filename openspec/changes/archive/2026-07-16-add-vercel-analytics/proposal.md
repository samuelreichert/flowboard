## Why

Flowboard is deployed on Vercel but does not currently collect Vercel Web Analytics page views or Speed Insights vitals. The app also uses a strict Content Security Policy, so adding instrumentation requires a deliberate CSP update that permits only the Vercel analytics script and reporting endpoints needed for those products.

## What Changes

- Add `@vercel/analytics` and `@vercel/speed-insights` as app dependencies.
- Render Vercel's React `Analytics` and `SpeedInsights` components at the app root so all routes and page views can be measured.
- Update the Vercel deployment CSP to allow the Vercel analytics script source and vitals reporting endpoint while preserving the existing restrictions for other sources.
- Document the Vercel Analytics and Speed Insights setup, enablement, and verification steps in the README.
- Track Vercel project dashboard or CLI enablement as deployment configuration that must be confirmed after the project exists.

## Capabilities

### New Capabilities
- `vercel-observability`: Defines Vercel Web Analytics and Speed Insights runtime instrumentation, deployment enablement, CSP support, and validation.

### Modified Capabilities
- `project-readme-presentation`: README deployment guidance includes analytics setup and verification.

## Impact

- Affected runtime: app root React render tree.
- Affected dependencies: production npm dependencies and lockfile.
- Affected deployment configuration: `vercel.json` security headers.
- Affected documentation: README deployment/setup guidance.
- Affected validation: typecheck, unit tests, production build, Vercel preview smoke test, dashboard data receipt.
