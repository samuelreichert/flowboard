## MODIFIED Requirements

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

## ADDED Requirements

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
