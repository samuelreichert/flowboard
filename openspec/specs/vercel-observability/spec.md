# vercel-observability Specification

## Purpose
Define how Flowboard uses Vercel Web Analytics and Speed Insights while preserving strict deployment security headers.

## Requirements
### Requirement: App renders Vercel analytics collectors
The system SHALL render Vercel Web Analytics and Speed Insights collectors through one shared URL privacy control that prevents sensitive route data from being transmitted.

#### Scenario: App root starts
- **WHEN** the React app root is rendered
- **THEN** the system renders Vercel Web Analytics instrumentation
- **AND** the system renders Vercel Speed Insights instrumentation
- **AND** both collectors use the same telemetry privacy control

#### Scenario: User navigates through ordinary Flowboard routes
- **WHEN** the user visits a supported Flowboard route without a credential-bearing authentication callback
- **THEN** Vercel Web Analytics can collect page-view measurements for the route
- **AND** Vercel Speed Insights can collect web-vitals measurements for the route
- **AND** transmitted event URLs contain neither a query string nor a fragment

#### Scenario: Authentication callback still contains parameters
- **WHEN** an observability event is produced for `/auth/callback` while its URL contains a query string or fragment
- **THEN** the shared privacy control suppresses the event
- **AND** neither collector transmits the callback URL

### Requirement: Telemetry URL privacy fails closed
The system SHALL remove query strings and fragments from observability event URLs and SHALL discard events whose URLs cannot be safely parsed.

#### Scenario: Ordinary route contains query or fragment data
- **WHEN** Web Analytics or Speed Insights prepares an event for a parseable non-callback URL containing query parameters or a fragment
- **THEN** the shared privacy control returns the event with the same origin and pathname
- **AND** the returned event URL contains no query string or fragment
- **AND** unrelated event fields are preserved

#### Scenario: Collector provides a malformed URL
- **WHEN** the shared privacy control receives an event with a URL it cannot parse safely
- **THEN** the control returns no event
- **AND** the collector does not transmit the malformed value

#### Scenario: Future telemetry integration is added
- **WHEN** Flowboard adds another browser telemetry collector that can observe page URLs
- **THEN** that collector uses the same shared telemetry privacy control before sending events

### Requirement: Deployment CSP permits only required Vercel analytics origins
The system SHALL update the deployed Content Security Policy only as needed for Vercel Web Analytics and Speed Insights.

#### Scenario: Browser loads analytics script
- **WHEN** the deployed app loads the Vercel analytics script
- **THEN** the CSP allows the trusted Vercel analytics script origin
- **AND** the CSP keeps script execution restricted to self and that analytics origin
- **AND** the CSP does not add `unsafe-inline` for this analytics integration

#### Scenario: Browser reports analytics and vitals
- **WHEN** Vercel Web Analytics or Speed Insights sends measurements
- **THEN** the CSP allows the trusted Vercel vitals reporting endpoint
- **AND** the CSP keeps connections restricted to self and that reporting endpoint

#### Scenario: Security headers remain strict
- **WHEN** the Vercel deployment headers are evaluated
- **THEN** existing non-analytics CSP directives remain present
- **AND** existing non-CSP security headers remain present

### Requirement: Vercel project analytics products are enabled
The Vercel project SHALL have Web Analytics and Speed Insights enabled before analytics receipt is considered complete.

#### Scenario: Web Analytics is enabled
- **WHEN** Web Analytics is enabled through Vercel dashboard or CLI
- **THEN** the deployed project provides Vercel-managed analytics collection routes after the next deployment

#### Scenario: Speed Insights is enabled
- **WHEN** Speed Insights is enabled through Vercel dashboard or CLI
- **THEN** the deployed project provides Vercel-managed speed-insights collection routes after the next deployment

### Requirement: Preview validation confirms analytics delivery
The system SHALL validate the analytics integration in a deployed Vercel preview.

#### Scenario: Preview app loads with CSP
- **WHEN** the preview deployment is opened in a browser
- **THEN** the browser console shows no analytics-related CSP violations

#### Scenario: Preview sends analytics traffic
- **WHEN** preview traffic visits the app
- **THEN** analytics and vitals network requests succeed
- **AND** Vercel-managed analytics routes are not served as the SPA `index.html`

#### Scenario: Vercel dashboard receives data
- **WHEN** preview or production traffic has generated measurements
- **THEN** Vercel Web Analytics shows received page-view data
- **AND** Vercel Speed Insights shows received vitals data
