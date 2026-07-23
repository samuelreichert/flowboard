## ADDED Requirements

### Requirement: Composer tag trigger distinguishes empty and selected states
The system SHALL render the composer tag trigger as a fixed circular icon control when no tags are selected and as a correctly aligned text chip when one or more tags are selected.

#### Scenario: User has no selected composer tags
- **WHEN** the composer has no selected tags
- **THEN** the tag trigger displays a centered plus icon in a circular compact target
- **AND** it does not expand because of internal select markup

#### Scenario: User selects composer tags
- **WHEN** the user selects one or more tags in the composer
- **THEN** the trigger displays the plus icon and tag summary in an aligned text-chip state
- **AND** clearing the tags returns the trigger to its circular icon state
