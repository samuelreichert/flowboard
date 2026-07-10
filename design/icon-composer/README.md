# Flowboard Icon Composer Sources

These SVGs restructure the existing Flowboard icon for Apple's Icon Composer
workflow. The current web/PWA assets in `public/` remain unchanged.

Reference: <https://developer.apple.com/documentation/Xcode/creating-your-app-icon-using-icon-composer>

## Layers

Import the numbered files as two stacked layers:

1. `01-flowboard-tile.svg`
2. `02-flowboard-board.svg`

The board layer uses a compound path with transparent slots, so the background layer
shows through the four rounded openings. This preserves the current mark while making
the foreground a single movable/composable layer in Icon Composer.

Apple recommends naming layers with numbers from back to front, exporting SVG where
possible, and saving background color, gradients, shadows, blur, opacity, and Liquid
Glass treatment for Icon Composer. These import layers therefore use flat fills. Set
appearance-specific colors in Icon Composer:

- Default/light: tile `#ffffff`, board `#050505`
- Dark: tile `#050505`, board `#ffffff`

## Previews

Use `reference-light.svg` and `reference-dark.svg` as flat references
when matching the Icon Composer output to the existing PNG assets.

## Notes

- All source SVGs use a `1024 x 1024` viewBox for app-icon scale.
- Shapes are scaled directly from the existing `64 x 64` SVG geometry in `public/`.
- The layer files avoid CSS, media queries, shadows, blurs, and gradients so they are
  easier to import into design tools and Icon Composer.
- The inset rounded tile is part of the current Flowboard mark, not a canvas mask. If
  you want a more native full-bleed Liquid Glass icon, use Icon Composer's background
  fill instead and hide or remove `01-flowboard-tile.svg`.
