## Context

Flowboard currently has a semantic token baseline in OKLCH, but the light workspace, card surface, and raised surface are effectively the same white. The primary teal and selected purple introduce two unrelated brand accents, and the light primary does not provide AA contrast with white text (about 3.4:1). The product direction is intentionally not a colorful productivity app: it is a restrained, premium workspace defined by black, white, clear hierarchy, and accessible interaction states.

The recent typography pass already establishes Noto Sans 400 as the UI face, JetBrains Mono for code, 15px composing/editing contexts, and 13px compact controls. This change preserves those decisions and completes the visual hierarchy around them.

## Goals / Non-Goals

**Goals:**

- Make light and dark themes feel purposeful through neutral contrast and elevation, with ink blue limited to high-value interaction orientation.
- Provide one semantic source of truth for surfaces, foregrounds, borders, solid-control foregrounds, focus, overlays, and shadows.
- Ensure essential text and interactive states meet WCAG AA contrast; do not use low-contrast gray for required information.
- Give cards, menus, dialogs, and popovers a coherent depth model that is subtle but perceptible.
- Keep priority and destructive meaning understandable without making the overall interface colorful.

**Non-Goals:**

- Redesigning workflows, data model, component APIs, copy, or unrelated animation behavior.
- Adding multiple brand colors or copying shadcn/Codex pixel-for-pixel.
- Changing the typography families or the completed 15px/13px type decisions.
- Replacing user-facing priority labels with color-only meaning.

## Decisions

### Use monochrome as the default visual language

The generic product palette will consist of neutral background, foreground, muted foreground, border, ring, and grayscale surface tokens in both themes. The teal primary and purple selected-state treatment will be removed. A solid primary control will use dark foreground on light theme and light foreground on dark theme, with an explicit `on-solid` token instead of assuming white text.

This follows the functional hierarchy of modern neutral systems while remaining Flowboard-specific. Keeping a colored brand primary was considered, but rejected because it conflicts with the requested black-and-white character and currently creates an accessibility failure with white label text.

### Give surfaces explicit jobs and visible elevation

The token model will distinguish canvas, base surface, raised surface, overlay, subtle surface, border, and strong border. In light theme, separation will primarily come from a white card/dialog over a faintly off-white canvas, a fine neutral border, and a two-layer soft black shadow for cards and overlays. In dark theme, increasingly lighter neutral surfaces and restrained shadows will create the equivalent hierarchy.

The light sidebar will intentionally sit one neutral tone below the workspace: a soft gray navigation rail beside an almost-white content plane. This establishes a stable app-chrome boundary without adding hue, while white cards retain depth through border and elevation.

Cards will be the reference raised surface: enough shadow to read as a movable unit on the board, with hover/focus enhancing the same system rather than inventing new colors. Menus and dialogs will use stronger elevation than cards; inputs stay visually attached to their parent surface.

Pure flat white was considered, but would repeat the existing issue where cards, workspace, and popovers collapse into one plane. Heavy shadows were also rejected because they undermine the quiet, premium character.

### Keep card hover feedback spatially stable

Cards will not translate or scale when a pointer hovers over them. Hover will refine border and shadow only, preserving the card's position while a person scans the board. Transform feedback remains reserved for the drag lifecycle, where it communicates a real manipulation state.

### Use ink blue as the only non-semantic interaction accent

A deeply muted ink blue/indigo will be applied only to links, focus, and selected states—not to every primary surface. It pairs naturally with black and white, reads more editorial than green, and can be contrast-tested independently. The core visual direction remains monochrome; ink blue is an orientation signal, not the brand surface color.

### Separate hierarchy from semantics

Hover, active navigation, and primary actions are hierarchy states and will be neutral. Ink blue is restricted to selection, focus, and links. Semantic exceptions are narrowly reserved for destructive/error feedback. Card priority will be readable from its localized label and a monochrome hierarchy (low subdued, medium bordered, high strongest/inverted), not red/yellow/green alone. This keeps priority understandable for color-vision differences and preserves the “mostly black and white” interface.

### Retain the compact type scale and audit density in context

The current scale remains the baseline: 12px captions, 13px menus/selects, 14px ordinary body/card content, 15px composer and rich-text input, and progressively larger titles. Implementation will verify that a popup never appears larger or more prominent than the content/control that opened it, particularly column menus, selects, and editor popovers.

### Verify semantic tokens rather than individual screens

Component CSS must consume the central tokens, including focus rings and shadows. Validation will sample the board, card composer, card editor, column menu, dialog, select/tag dropdown, sidebar, settings, toast, and tooltip in both themes. It will cover empty, focused, disabled, long-content, open-popup, desktop, and mobile states.

## Risks / Trade-offs

- [An all-neutral system can make destructive or high-priority content easy to miss] → Retain localized semantic danger treatment, explicit labels, and stronger neutral priority hierarchy.
- [More depth can become visual noise] → Use a small fixed elevation scale; only raised/overlay surfaces receive shadows.
- [Changing tokens can expose component-local color literals] → Search and replace all presentational literals, then review visual regression screenshots in both themes.
- [Dark theme can look muddy when too many grays are close together] → Validate each surface tier, border, and text role using contrast measurements and screenshots.
- [Compact typography can regress popup hierarchy] → Treat the 13px control and 15px editing contexts as acceptance criteria in browser checks.

## Migration Plan

1. Introduce and map the neutral semantic tokens while preserving existing token names only where they still represent a clear semantic role.
2. Migrate shared primitives and shared card/shell surfaces before local component exceptions.
3. Remove teal/purple tokens and any dependent hardcoded presentation values after each consumer is migrated.
4. Run light/dark visual and keyboard-state checks, then lint, typecheck, and targeted browser tests.
5. Roll back by reverting the visual-token implementation commit; no persisted data or API migration is involved.

## Open Questions

- None for the first slice. The selected direction is monochrome for product hierarchy, ink blue for links/focus/selection, destructive/error color only where semantic, and label-led monochrome priority.

## Deferred Follow-up Recommendations

- Audit spacing and density across board columns, card metadata, and dialogs once the new surface hierarchy is in place; use spacing, not color, to improve scanability.
- Standardize corner-radius roles (compact control, card, dialog) so elevation and shape reinforce each other.
- Review motion as a system—particularly completion, dialogs, drag, and menu transitions—and honor reduced-motion preferences consistently.
- Run responsive and keyboard walkthroughs for long titles, multiline editing, empty states, open popups near viewport edges, and touch targets.
