# board-surface-hierarchy Specification

## Purpose
TBD - created by archiving change refine-board-surface-hierarchy. Update Purpose after archive.
## Requirements
### Requirement: Board lanes are flat structural containers
The system SHALL render persistent board columns as flat lanes rather than filled, bordered, rounded card-like containers. The system SHALL distinguish adjacent desktop lanes through stable width, header alignment, and measured spacing without persistent full-height dividing lines.

#### Scenario: User views a populated board
- **WHEN** a board contains two or more populated columns
- **THEN** each column header and card stack reads as a distinct lane
- **AND** no persistent column surface competes visually with cards through a filled panel, enclosing border, or container shadow
- **AND** no persistent full-height divider competes with the cards or column headers
- **AND** cards remain the raised work-item surfaces within their lanes

#### Scenario: User views a lane with no cards
- **WHEN** a board column contains no cards
- **THEN** its header and position remain distinguishable from adjacent lanes
- **AND** the empty state does not restore a permanent card-like column panel

### Requirement: Board lane state feedback is temporary and explicit
The system SHALL use a clear, transient visual treatment to identify a valid card drop target without changing the normal flat-lane hierarchy.

#### Scenario: User drags a card over a column
- **WHEN** a card is dragged over an eligible board column
- **THEN** the target lane displays the existing ink-blue drop feedback
- **AND** the feedback is limited to the active drag state
- **AND** the lane returns to its flat resting appearance when the drag ends or leaves

#### Scenario: User starts a card in an empty column
- **WHEN** a column has no cards and card creation or dragging makes the drop area relevant
- **THEN** the system provides a visible, accessible empty/drop affordance
- **AND** the affordance does not obscure the column header or card creation workflow

### Requirement: Column headers have structural hierarchy
The system SHALL distinguish a column header from card content through the shared structural-title type role while retaining the regular-weight card content style.

#### Scenario: User scans a populated column
- **WHEN** a column header and one or more card titles are visible together
- **THEN** the column title uses the shared 15px, Noto Sans 500 structural-title role
- **AND** card titles remain in their existing regular-weight content treatment

### Requirement: Board hierarchy survives responsive and overflow states
The system SHALL preserve the distinction between flat lanes and raised cards while the board scrolls horizontally or is viewed at the mobile breakpoint.

#### Scenario: Board overflows horizontally on desktop
- **WHEN** the board contains more lanes than fit in the desktop workspace
- **THEN** horizontal scrolling and the add-column affordance remain available
- **AND** lane spacing, headers, and raised cards remain visually coherent while scrolling

#### Scenario: User views the board on mobile
- **WHEN** the board is displayed at or below the mobile breakpoint
- **THEN** each horizontally scrollable lane remains identifiable without a persistent card-like column wrapper
- **AND** card, header, add-column, and composer controls remain usable
