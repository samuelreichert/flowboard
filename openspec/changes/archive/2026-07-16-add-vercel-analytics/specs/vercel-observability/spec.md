## ADDED Requirements

### Requirement: App renders Vercel analytics collectors
The system SHALL render Vercel Web Analytics and Speed Insights collectors at the React app root.

#### Scenario: App root starts
- **WHEN** the React app root is rendered
- **THEN** the system renders Vercel Web Analytics instrumentation
- **AND** the system renders Vercel Speed Insights instrumentation
- **AND** both collectors are available across Flowboard routes

#### Scenario: User navigates through Flowboard routes
- **WHEN** the user visits supported Flowboard routes
- **THEN** Vercel Web Analytics can collect page-view measurements for those routes
- **AND** Vercel Speed Insights can collect web-vitals measurements for those route visits

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
