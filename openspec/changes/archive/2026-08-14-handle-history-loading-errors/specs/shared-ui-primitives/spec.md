## ADDED Requirements

### Requirement: Remote data states share consistent treatments

The system SHALL provide reusable accessible presentation primitives for panel-level and inline remote-data loading and recoverable error states while keeping feature-specific copy and retry behavior explicit.

#### Scenario: Panel resource is loading

- **WHEN** a panel-level remote resource has no resolved data and is loading
- **THEN** the user sees the shared panel loading treatment
- **AND** the loading state exposes appropriate busy or status semantics to assistive technology

#### Scenario: Panel resource fails before resolving

- **WHEN** a panel-level remote resource fails without resolved data
- **THEN** the user sees the shared recoverable error treatment
- **AND** a caller-provided retry action is available
- **AND** the error state is exposed with appropriate alert semantics

#### Scenario: Secondary resource operation fails

- **WHEN** a background refresh, pagination request, or detail-content request fails while other resolved content remains usable
- **THEN** the shared inline error treatment preserves the usable content
- **AND** presents a caller-provided retry action near the failed operation

#### Scenario: Flowboard renders remote state copy

- **WHEN** a shared loading or error treatment is displayed
- **THEN** its feature-specific title, description, and action labels come from the resolved Flowboard localization catalog
