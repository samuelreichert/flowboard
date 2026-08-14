## Why

The current teal-led palette is calm, but it creates an unintended soft, washed-out impression: the workspace, cards, and raised surfaces share almost the same white, while the accent color competes with the desired product character. Flowboard should instead feel minimal, luxurious, and highly legible—closer to a deliberate black-and-white editorial system with depth supplied by contrast, borders, and shadows.

The color audit also identified accessibility gaps for white text on the present primary teal, inconsistent emphasis between cards and menus, and insufficiently distinct surface elevation. This is the right time to set a durable visual foundation before additional UI work compounds the token set.

## What Changes

- Replace the teal-led primary visual language with a neutral monochrome token system for light and dark themes, using a restrained ink-blue accent only for links, focus, and selected states.
- Establish deliberate surface elevation tiers, including a card treatment with restrained but visible depth, rather than relying on near-identical white surfaces.
- Define accessible foreground pairings for solid controls and semantic states; reserve color for meaning such as destructive actions and card priority rather than generic emphasis.
- Unify selected, hover, focus, disabled, overlay, and popup treatments across cards, menus, dialogs, selects, editors, and sidebar controls.
- Complete the remaining typography consistency work identified in the audit: clarify a small semantic type scale, preserve 15px composing/editing contexts, and prevent auxiliary menus from visually overpowering the content that invoked them.
- Capture follow-up quality improvements that are recommended but intentionally out of the first implementation slice, including density, motion, and responsive-state review.

## Capabilities

### New Capabilities

- `monochrome-visual-system`: A cohesive neutral color, elevation, and state system with a restrained ink-blue interaction accent.

### Modified Capabilities

- `app-shell-theme`: Theme tokens, semantic status treatment, and light/dark surface behavior change to the new monochrome visual system.
- `shared-ui-primitives`: Shared dialog and select primitives adopt consistent monochrome surfaces, typography hierarchy, focus treatment, and elevation.

## Impact

- Affected code: `src/App.css`, `src/index.css`, shared primitives, app shell/sidebar, cards, composers, rich-text editor, metadata chips, dialogs, menus, selects, popovers, tooltips, and settings controls.
- No API, database, or dependency changes are expected.
- The visual change requires light and dark screenshot/accessibility verification, including keyboard focus, open popup, hover, disabled, long-content, and mobile states.
