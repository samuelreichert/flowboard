## Why

Flowboard's new app shell and richer editor are close, but a few polish gaps still make the system harder to maintain and slightly less clear to use. This change tightens the theme foundation, standardizes small UI details, and updates the project presentation so the README reflects the current product direction.

## What Changes

- Convert the app color system to an OKLCH-based token baseline so light and dark themes are easier to scale and tune.
- Remove duplicated theme token definitions and reduce repeated surface values, especially repeated white tokens that currently encode the same role in multiple places.
- Standardize priority colors so low is green, medium is yellow, and high is red across light and dark themes.
- Normalize ordinary input typography so text inputs, textareas, selects, and editor URL fields share the same font family and weight while still allowing size to vary by use case.
- Add a visible active outline for selected images inside rich text content so image selection is immediately obvious before using contextual image actions.
- Preserve historical app screenshots, including the first version, second version, and latest UI, and update the README to show the latest UI first.
- Remove or revise README language that describes board background customization as a current primary feature.

## Capabilities

### New Capabilities
- `app-shell-theme`: Covers the OKLCH theme token baseline, de-duplicated color variables, semantic priority colors, and normalized input typography for the current app shell.
- `card-content-rich-editing`: Covers selected-image visual affordances inside the rich text editor.

### Modified Capabilities
- `project-readme-presentation`: Updates README requirements so the project presentation shows the latest UI, preserves historical screenshots, and no longer advertises removed board background customization as a current primary feature.

## Impact

- Affected styling: `src/App.css`, `src/index.css`, rich editor CSS, dialog/select/input CSS, and any component styles still using hardcoded colors that should be theme tokens.
- Affected editor behavior: image node selection visuals only; existing insert/edit/open/remove image commands remain unchanged.
- Affected documentation/assets: `README.md` and public screenshot assets.
- No backend API, storage schema, or dependency changes are expected.
