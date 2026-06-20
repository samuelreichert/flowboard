## Context

Flowboard's modern app shell already moved the product toward theme-aware surfaces, quiet navigation, and a Markdown-backed rich editor. The remaining polish is concentrated in a few places: the theme tokens are duplicated between root and app scopes, several editor popup styles still use hardcoded colors, priority colors do not match the requested green/yellow/red semantics, and the README still presents the older background-customized board as the primary product view.

The change should refine the existing system rather than introduce a new design framework. Flowboard already uses CSS custom properties, Base UI primitives, Geist fonts, and Tiptap image node selection, so the implementation can stay within those patterns.

## Goals / Non-Goals

**Goals:**

- Make the theme color system easier to maintain by using OKLCH color values as the baseline and reducing duplicated color tokens.
- Keep component CSS consuming semantic tokens rather than raw palette values.
- Standardize priority color meaning: low is green, medium is yellow, and high is red.
- Normalize ordinary form control typography across dialogs, selects, popovers, and editor URL fields.
- Make selected rich-text images visibly active before and while contextual image actions are shown.
- Update README screenshots and feature language so the current UI is the first visual and removed background customization is no longer advertised as a current primary feature.

**Non-Goals:**

- Redesign the app shell, sidebar, board layout, card layout, or editor toolbar.
- Change card content storage, Markdown serialization, image insertion behavior, or contextual image actions.
- Remove legacy background data from browser storage or SQLite persistence.
- Add new design-system dependencies or screenshot automation infrastructure.
- Rework all historical README content beyond the screenshot/history and current-capability updates.

## Decisions

### Use semantic tokens backed by OKLCH values

The root theme should define semantic tokens such as app background, surfaces, text, borders, hover states, focus rings, shadows, status colors, and priority colors using OKLCH where practical. Components should continue to reference semantic tokens instead of using OKLCH directly.

Alternatives considered:

- Keep hex and RGB values. This preserves the status quo but makes future color tuning less predictable.
- Introduce a separate palette layer and semantic layer. This is attractive for a larger design system, but this change can stay smaller by making the existing semantic variables the stable API and using OKLCH as their values.

### Keep one authoritative theme scope

Theme tokens should be defined once for the root light theme and once for the dark theme override. The app container should consume those variables rather than redefining the same token set.

Alternatives considered:

- Keep duplicated `:root` and `.app` token declarations. This works visually but invites drift and makes small token changes tedious.
- Move all variables to component files. This would reduce central duplication but fragment the theme contract.

### Add token roles only when they reduce hardcoded color pockets

The editor popovers, select dropdowns, tooltips, URL fields, and selected-image outline should use existing tokens where those tokens map cleanly. New tokens should be limited to missing reusable roles, such as inverse tooltip surfaces or selected media outlines, instead of creating one-off variables for each selector.

Alternatives considered:

- Replace every one-off color with a unique variable. This removes literals but does not simplify the system.
- Leave editor popups hardcoded. This keeps the patch smaller but prevents dark/theme consistency from being reliable.

### Treat title editing as display text, not an ordinary input

Ordinary inputs, textareas, selects, and URL fields should share the same font family and weight. The editable card title can keep a larger, stronger display treatment because it functions as the card title, not as a standard form field.

Alternatives considered:

- Force every input-like element to the same weight. This is maximally consistent but would weaken the card title hierarchy.
- Normalize only browser-native inputs. This would miss Base UI trigger fields and editor URL controls, which are part of the same perceived form system.

### Preserve screenshots as named historical assets

The README should show the latest UI first and keep older screenshots as historical reference assets with clear filenames. The copy should describe the current app shell and rich editor capabilities while avoiding background customization as a current primary feature.

Alternatives considered:

- Replace the old screenshot in place. This updates the README but loses the historical visual record the user asked to preserve.
- Move screenshots outside `public`. Keeping README-visible assets in `public` is consistent with the current project layout and avoids extra packaging decisions.

## Risks / Trade-offs

- [Risk] OKLCH values may be unsupported in very old browsers. -> Mitigation: Flowboard targets modern browsers and already depends on modern CSS behavior; keep the token set simple and verify the production build.
- [Risk] Token cleanup can accidentally alter contrast in dark mode. -> Mitigation: inspect light and dark app surfaces, editor popovers, selected states, priority chips, and focus rings after the migration.
- [Risk] Reducing duplicated white/surface tokens too aggressively can blur semantic roles. -> Mitigation: remove only redundant aliases and keep separate variables when two roles may diverge later.
- [Risk] Selected-image outline could shift layout or clash with image rounding. -> Mitigation: use outline or box-shadow styles that do not affect layout and respect existing border radius.
- [Risk] README screenshot history could become confusing if the latest image is not clearly distinguished. -> Mitigation: make the latest screenshot the primary image and label historical images separately.

## Migration Plan

1. Consolidate theme token declarations so `:root` and dark-theme overrides are authoritative.
2. Convert theme colors and priority colors to OKLCH-backed values while preserving semantic token names used by components.
3. Replace remaining hardcoded editor popup, select, tooltip, URL field, and priority colors with appropriate tokens.
4. Normalize ordinary form control typography while preserving the card title display treatment.
5. Add non-layout-shifting selected-image styling for Tiptap image node selection.
6. Preserve the existing screenshot as a historical asset, add or rename screenshots for first/second/latest UI states, and update the README to show the latest UI first.
7. Run tests/build and manually inspect representative light, dark, editor image selection, popup, priority chip, and README states.

Rollback is limited to reverting CSS and README asset changes. No persisted data or API shape changes are involved.

## Open Questions

- What exact screenshot filenames should be considered the first, second, and latest versions if historical assets already exist outside `public`?
- Should the README show all historical screenshots inline, or show only the latest screenshot inline and link/list the older versions below it?
