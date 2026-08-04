## Context

`AuthGate` renders provider choices from the shared `socialAuthProviders` list, but each choice currently uses the same generic `button` class and text-only content. The app supports light and dark themes through semantic CSS tokens, and the auth view already owns its provider layout and disabled-provider guidance.

The update must make Google and Apple immediately recognizable without changing the provider list, Supabase request flow, localized accessible names, or the disabled Apple setup state.

## Goals / Non-Goals

**Goals:**

- Present a provider icon next to each social sign-in label.
- Give Google a light, bordered treatment and Apple a black, white-foreground treatment that echo the supplied reference.
- Preserve Flowboard's existing 42px control height, corner radius, focus treatment, mobile sizing, responsive layout, disabled state, and loading behavior.
- Keep branded colors centralized in the app theme rather than scattering provider color literals through component CSS.

**Non-Goals:**

- Changing OAuth providers, Supabase configuration, redirects, auth copy, provider availability, or Apple enablement.
- Adding Facebook or any additional social provider.
- Reworking the rest of the auth form or generic Flowboard buttons.
- Adding a third-party icon dependency solely for these two provider marks.

## Decisions

### Use a small local provider-icon component

Render the Google and Apple marks from a dedicated local React component keyed by the existing `SocialAuthProvider['id']`. Each SVG is decorative (`aria-hidden`) because the existing localized button text remains the accessible name. This keeps icon selection colocated and typed with provider data, avoids network-loaded assets, and lets tests assert that the correct provider marker is rendered.

Alternatives considered:

- **Use Lucide icons:** rejected because Lucide does not provide official Google or Apple brand marks.
- **Add a brand-icon package:** rejected because two static icons do not justify a dependency and its maintenance surface.
- **Use text glyphs or external image URLs:** rejected because glyph coverage varies and external assets add network and availability risk.

### Apply provider variants only within the auth view

Keep the generic `button` primitive unchanged. `AuthGate` will add a provider-specific modifier based on `provider.id`; `AuthGate.css` will own the provider layout and icon positioning. The label remains visually centered while the icon is anchored at the leading edge, matching the reference without changing Flowboard's compact control geometry.

This isolates provider branding from normal action buttons and avoids accidentally changing unrelated controls.

### Centralize provider color roles in theme tokens

Add narrowly scoped theme tokens for the Google control surface, border, and foreground and Apple control surface and foreground. Their brand treatment remains intentionally stable across light and dark Flowboard themes, while existing Flowboard focus and disabled rules continue to apply.

Alternatives considered:

- **Use the normal surface/text tokens:** rejected because the Google button would become dark in dark mode and no longer resemble a familiar Google sign-in control.
- **Hard-code colors in `AuthGate.css`:** rejected because it violates the app's central token baseline and makes future theme adjustment harder.

## Risks / Trade-offs

- [Official-looking brand marks can drift if improvised] → Use a vetted local SVG representation, keep it small, and do not alter its colors through CSS.
- [Fixed light/black provider treatments contrast differently with either app theme] → Retain a visible Google border, a distinct Apple edge where needed, and the existing Flowboard focus ring.
- [Absolute icon positioning could overlap localized labels] → Reserve a fixed leading inset, retain responsive control sizing, and test the localized default labels and loading state.
- [Provider-specific styling could mask disabled state] → Reuse the shared button disabled opacity/cursor behavior and leave the Apple configuration note unchanged.

## Migration Plan

1. Ship as a frontend-only visual update with no API, persistence, or environment-variable migration.
2. Verify the auth screen in light and dark themes at desktop and mobile widths, including enabled Google, disabled Apple, focus, and loading states.
3. If a visual regression is found, revert the auth component, auth stylesheet, icon component, tokens, and associated tests together; sign-in behavior is unaffected.

## Open Questions

None. The supplied reference establishes the intended Google and Apple treatments while Flowboard's existing control geometry remains the source of layout conventions.
