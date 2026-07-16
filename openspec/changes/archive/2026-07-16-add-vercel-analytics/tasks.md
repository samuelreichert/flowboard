## 1. Dependencies and Root Instrumentation

- [x] 1.1 Install `@vercel/analytics` and `@vercel/speed-insights` as production dependencies.
- [x] 1.2 Import `Analytics` from `@vercel/analytics/react` at the React root.
- [x] 1.3 Import `SpeedInsights` from `@vercel/speed-insights/react` at the React root.
- [x] 1.4 Render both components beside `<App />` so all Flowboard routes can be measured.

## 2. Deployment Security Headers

- [x] 2.1 Update `vercel.json` `script-src` to allow Vercel's analytics script source without adding broad script permissions.
- [x] 2.2 Update `vercel.json` `connect-src` to allow Vercel's analytics and vitals reporting endpoint without broadening other connection sources.
- [x] 2.3 Confirm existing CSP directives and non-CSP security headers remain in place.

## 3. Vercel Project Configuration

- [ ] 3.1 Enable Web Analytics for the Vercel project through the dashboard or Vercel CLI after the project exists.
- [ ] 3.2 Enable Speed Insights for the Vercel project through the dashboard or Vercel CLI after the project exists.
- [ ] 3.3 Confirm the deployed project has Vercel-managed analytics routes available after the next deployment.

## 4. Documentation

- [x] 4.1 Update README deployment guidance with the Web Analytics and Speed Insights setup.
- [x] 4.2 Document the dashboard or CLI enablement steps.
- [x] 4.3 Document the preview validation checklist, including CSP and dashboard receipt checks.

## 5. Validation

- [x] 5.1 Run `npm run typecheck`.
- [x] 5.2 Run `npm run test:run`.
- [x] 5.3 Run `npm run build`.
- [ ] 5.4 Deploy a Vercel preview.
- [ ] 5.5 Open the preview and confirm there are no analytics-related CSP violations in the browser console.
- [ ] 5.6 Confirm analytics script and vitals/reporting network requests succeed and are not rewritten to the SPA shell.
- [ ] 5.7 Confirm Vercel Web Analytics receives page views.
- [ ] 5.8 Confirm Speed Insights receives vitals after traffic is generated.
