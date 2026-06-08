## ADDED Requirements

### Requirement: Pull requests receive README freshness review
The repository SHALL provide an automated pull request check that evaluates whether README updates are needed for the changed files.

#### Scenario: PR changes user-facing behavior without README update
- **WHEN** a pull request changes user-facing app behavior, setup instructions, deployment behavior, storage behavior, or offline behavior without changing the README
- **THEN** the automated check reports that the README may need an update

#### Scenario: PR changes README with user-facing behavior
- **WHEN** a pull request changes user-facing behavior and includes a README update
- **THEN** the automated check reports the README as updated or asks for specific follow-up only when the update appears incomplete

### Requirement: README review keeps humans in control
The repository SHALL avoid automatically committing AI-generated README edits during pull request review.

#### Scenario: AI identifies missing documentation
- **WHEN** the automated README review identifies likely missing documentation
- **THEN** the system reports the finding for a human to review instead of modifying files automatically

### Requirement: README review configuration is documented
The repository SHALL document any secrets, permissions, or provider configuration required by the README freshness check.

#### Scenario: Maintainer configures workflow
- **WHEN** a maintainer reads the README or workflow notes
- **THEN** the required configuration for enabling the automated README review is clear
