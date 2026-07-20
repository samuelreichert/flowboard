## MODIFIED Requirements

### Requirement: Completion can include a post-confirmation animation
The system SHALL show a full-page post-confirmation acknowledgement after work completion when motion is available, and the persisted completion behavior SHALL NOT depend on the animation.

#### Scenario: Completion animation runs
- **WHEN** the user confirms completing work and motion is available
- **THEN** the system displays a full-page completion acknowledgement with accessible completion text
- **AND** the acknowledgement uses a longer, deliberate sequence that visually communicates completed work being gathered, archived, and followed by a fresh cycle
- **AND** the completion still archives the configured cards, updates history, and starts the next work cycle

#### Scenario: Completion animation is unavailable
- **WHEN** animation is disabled, interrupted, or unsupported
- **THEN** the completion still archives the configured cards, updates history, and starts the next work cycle
- **AND** the system still provides non-animation completion acknowledgement text when possible

#### Scenario: User prefers reduced motion
- **WHEN** the user confirms completing work while reduced-motion preferences are active
- **THEN** the system avoids large transform-heavy motion
- **AND** the system presents a low-motion completion acknowledgement with accessible completion text

#### Scenario: Legacy completion pulse is removed
- **WHEN** the user confirms completing work
- **THEN** the system does not show the previous small fast floating completion pulse
