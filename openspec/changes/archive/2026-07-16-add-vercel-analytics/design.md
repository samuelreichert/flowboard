## Context

Flowboard is a Vite React app that renders through `src/main.tsx`, wraps the application in `React.StrictMode`, and uses React Router inside `src/App.tsx`. The deployment is a static Vercel build configured by `vercel.json`, including a catch-all SPA rewrite and a strict Content Security Policy:

- `script-src 'self'`
- `connect-src 'self'`

Vercel Web Analytics and Speed Insights require package-level React components plus project-level enablement in Vercel. Current Vercel documentation says Web Analytics uses `@vercel/analytics/react`, Speed Insights uses `@vercel/speed-insights/react`, and enabling the products adds Vercel-managed routes under `/_vercel/insights/*` and `/_vercel/speed-insights/*` after deployment.

The sibling `samuelreichert.com` project provides a local precedent for the CSP hosts:

- `https://va.vercel-scripts.com` for analytics scripts.
- `https://vitals.vercel-insights.com` for analytics and vitals reporting connections.

## Goals / Non-Goals

**Goals:**
- Instrument Flowboard with Vercel Web Analytics page-view collection.
- Instrument Flowboard with Vercel Speed Insights vitals collection.
- Keep instrumentation global across Flowboard routes.
- Allow only the Vercel script and reporting origins needed by the collectors.
- Preserve existing CSP restrictions for default, font, form, frame, image, object, style, and upgrade directives.
- Document Vercel dashboard or CLI enablement and post-deployment validation.
- Verify that the deployed preview does not produce CSP violations and sends analytics/vitals requests successfully.

**Non-Goals:**
- Do not add custom product analytics events.
- Do not add user-level tracking or user identity metadata.
- Do not add non-Vercel analytics providers.
- Do not add backend observability, logs, tracing, or OpenTelemetry.
- Do not relax CSP with broad hosts, wildcard sources, or `unsafe-inline` for this work.
- Do not require analytics to run in local development.

## Decisions

### Render collectors at the React root

The instrumentation should be imported in `src/main.tsx` and rendered beside `<App />` inside `React.StrictMode`.

Alternatives considered:
- Render inside `src/App.tsx`: viable, but it couples instrumentation to the application router and feature code.
- Render inside each routed view: rejected because it duplicates instrumentation and risks incomplete route coverage.
- Create a dedicated observability wrapper component: deferred because the current integration is two passive root components with no shared logic.

### Keep CSP changes narrow

The deployment CSP should keep the current directives and only extend:

- `script-src 'self' https://va.vercel-scripts.com`
- `connect-src 'self' https://vitals.vercel-insights.com`

This preserves the existing posture while allowing Vercel's analytics script and metrics reporting endpoint. The change should not add `unsafe-inline`, wildcard hosts, or unrelated Vercel domains.

Alternatives considered:
- Use a broader Vercel host allowlist: rejected because the requirement is only Web Analytics and Speed Insights.
- Add `unsafe-inline`: rejected because the collectors do not require it for Flowboard's Vite build.
- Remove CSP for preview validation: rejected because the goal is to support analytics without weakening headers.

### Treat dashboard enablement as deployment configuration

The code PR can add packages, components, headers, and documentation, but Web Analytics and Speed Insights must also be enabled on the Vercel project through the dashboard or CLI. This should be tracked in tasks and README guidance rather than hidden in application code.

Vercel CLI commands to consider after the project exists:

- `vercel project web-analytics <project-name>`
- `vercel project speed-insights <project-name>`

Dashboard enablement remains acceptable if CLI access is unavailable.

### Validate managed routes and CSP together

Flowboard has a catch-all SPA rewrite from `/(.*)` to `/index.html`. Because Vercel creates managed analytics routes after enablement and deployment, preview validation should confirm analytics and speed-insights requests are handled by Vercel rather than rewritten to the SPA shell.

Validation should check:

- Browser console has no CSP violations.
- Analytics script request succeeds.
- Analytics/vitals reporting request succeeds.
- `/_vercel/insights/*` and `/_vercel/speed-insights/*` requests are not served as `index.html`.
- Vercel dashboard receives page views and vitals after preview traffic.

## Risks / Trade-offs

- CSP could still block analytics if Vercel package hostnames change -> Validate in a deployed preview and keep README instructions clear for future updates.
- The catch-all rewrite could mask managed Vercel routes -> Verify network responses on the preview after analytics products are enabled.
- Dashboard data may lag after deployment -> Treat receipt of page views and vitals as an asynchronous deployment validation step.
- Root instrumentation may run during local dev and tests -> Vercel packages are designed to be passive outside production, but tests and builds should verify no runtime assumptions break.
- Adding dependencies increases bundle/runtime surface -> Keep imports limited to official Vercel React entry points and avoid custom analytics code.
