# NomadReady — Design System

> Executable design language reference. Colors, type, motion tokens, surfaces, component patterns.
> For the philosophy behind these decisions: `docs/vision/editorial-memory-system.md`
> Updated: May 2026

---

## Color

### Strategy

**Cinematic deep-night.** The background is near-black with a warm amber tint toward hue. The single accent is amber, used for interactive states, score highlights, and warm light sources. The design reads as a darkroom-processed luxury travel magazine — not dark-mode productivity software.

Color commitment level: **Committed**. Amber carries the emotional register; neutrals recede entirely.

### Tokens (CSS custom properties on `:root`)

| Token | Approximate value | Role |
|---|---|---|
| `--bg-base` | `#08070e` | Page background |
| `--accent` | `#d97706` | Primary accent: CTA borders, score highlights, active states |
| `--border` | `rgba(180,130,65,0.22)` | Warm dividers, subtle separation |
| `--text-muted` | `rgba(255,255,255,0.38)` | Tertiary labels, hints |
| `--text-secondary` | `rgba(255,255,255,0.62)` | Body copy, secondary content |

The amber accent at full opacity (`--accent: #d97706`) is used sparingly — it appears as a border or glow, not a fill. The actual amber used on interactive states is `rgba(200,164,40,0.xx)` family — slightly warmer and more golden than the pure amber token.

### Interaction color scale

Active chips, focus rings, and hover glows use this amber family:

```
rgba(200,164,40,0.09)   — background at rest (chip)
rgba(200,164,40,0.12)   — background active
rgba(200,164,40,0.15)   — background hover
rgba(200,164,40,0.36)   — border at rest (CTA button)
rgba(200,164,40,0.55)   — border active / focus ring
rgba(200,164,40,0.28)   — glow (box-shadow spread)
```

### Atmospheric ambient palette

Used in `AmbientLayer` — not interactive, not decorative in the conventional sense. These are the environmental light temperatures:

- Amber/orange warm (SE Asia desk lamp): `rgba(217,119,6,0.016–0.052)` — the source of warmth
- Warm parchment (ambient fill): `rgba(210,180,140,0.018–0.034)` — paper substrate temperature
- Cool steel (shadow fill): `rgba(48,80,180,0.046)` — night shadow counterpoint

These should not be used for UI elements. They belong to the atmospheric layer system only.

---

## Typography

### Type scale

| Role | Variable | Approximate size | Weight | Letter-spacing |
|---|---|---|---|---|
| Display / hero headlines | `var(--font-display)` | 2.5–5rem | 600 | `-0.04em` |
| Section headings | `var(--font-display)` | 1.25–1.75rem | 600 | `-0.03em` |
| Body / UI | `var(--font-geist-sans)` | 0.875–1rem | 400–500 | `normal` |
| Micro-labels (uppercase) | `var(--font-geist-sans)` | 0.5–0.65rem | 600–700 | `+0.08–0.10em` |
| Data / scores | `var(--font-geist-mono)` | varies | 700 | `-0.02–0.03em` |
| Mono / code | `var(--font-geist-mono)` | 0.875rem | 400 | `normal` |

### Conventions

- Section labels are **uppercase micro-type** at 0.55–0.65rem, letter-spacing +0.08–0.10em, weight 600–700. They function as editorial markers, not `<h2>` headings.
- Score numerics use tight letter-spacing (−0.02 to −0.03em) at large sizes — they read as both data and visual design.
- Body text maximum line length: 65–75ch.
- Hero text shadows: `0 2px 40px rgba(0,0,0,0.72), 0 1px 10px rgba(0,0,0,0.44)` — necessary for legibility over the cinematic background.

---

## Motion Tokens

Defined as CSS custom properties on `:root` in `src/globals.css`:

### Duration scale

```css
--duration-instant:    80ms;   /* state changes, cursor */
--duration-quick:     150ms;   /* micro-interactions */
--duration-moderate:  260ms;   /* standard UI transitions */
--duration-slow:      400ms;   /* panel reveals, fades */
--duration-cinematic: 700ms;   /* hero entrances */
--duration-dramatic: 1100ms;   /* gateway exit sequence */
```

When `prefers-reduced-motion` is active, all tokens collapse to 1ms. Always use these tokens rather than hardcoded ms values.

### Easing curves

```css
--ease-smooth:    cubic-bezier(0.25, 0.46, 0.45, 0.94);   /* standard */
--ease-snappy:    cubic-bezier(0.19, 1.00, 0.22, 1.00);   /* quick settle */
--ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1.00);   /* slight overshoot (use rarely) */
--ease-cinematic: cubic-bezier(0.16, 1.00, 0.30, 1.00);   /* hero moments */
```

The cinematic ease is the signature timing curve — used for the passport entrance, section reveals, and any "arrival" moment. It decelerates extremely quickly to a full stop, creating the sense of something settling definitively.

### Framer Motion spring (carousel, interactive elements)

```
stiffness: 320  damping: 30  type: spring
```

Critically damped — no overshoot, no oscillation, settles in ~120ms. This is the correct spring for any interactive draggable or paged element. Do not use `stiffness: 90, damping: 18` (the previous default) — it undershoots and feels sluggish.

---

## Surfaces and Elevation

### Glass card (hero controls, desktop only)

```css
background: rgba(6, 10, 22, 0.52);
backdrop-filter: blur(14px);
-webkit-backdrop-filter: blur(14px);
border: 1px solid rgba(217, 119, 6, 0.22);
border-radius: 1rem;
box-shadow:
  0 6px 36px rgba(0,0,0,0.50),
  0 1px 0 rgba(255,255,255,0.04) inset,
  0 0 0 1px rgba(217,119,6,0.08);
```

Use sparingly. One glass surface per viewport is the limit. This is the hero controls card — the only instance of backdrop-filter on the main page.

### Frosted panel (mobile gateway bottom sheet)

```css
backdrop-filter: blur(28px);
-webkit-backdrop-filter: blur(28px);
```

Applied only at `max-width: 639px` — the mobile gateway bottom panel. Never on desktop.

### Paper grain texture

```css
background-image: url('/assets/ui/editorial-paper-texture.webp');
background-size: 520px 520px;
opacity: 0.042;
mix-blend-mode: screen;
```

Used in `AmbientLayer` as the topmost layer. The gateway overlay uses a separate grain tile at `opacity: 0.022, mix-blend-mode: screen`. Do not increase opacity — it becomes visible noise rather than editorial texture.

### Vignettes

Two composited vignettes in `AmbientLayer` — a dark edge shaper and a warm golden-hour lens vignette. Both are static, pure CSS, and should not be animated or replicated elsewhere in the UI.

---

## Component Patterns

### Pill chips (passport selector, profile tabs)

```css
border-radius: 9999px;
border: 1px solid rgba(255,255,255,0.09);        /* at rest */
border: 1px solid rgba(200,164,40,0.55);         /* active */
background: rgba(255,255,255,0.04);              /* at rest */
background: rgba(200,164,40,0.12);               /* active */
padding: 10px 12px;
min-height: 44px;   /* touch target minimum */
```

Active state adds amber glow: `box-shadow: 0 0 14px -4px rgba(200,164,40,0.28), inset 0 0 0 1px rgba(200,164,40,0.18)`.

Focus ring: `box-shadow: 0 0 0 2px rgba(200,164,40,0.55)` — set on `onFocus`, cleared on `onBlur`.

### CTA button (gateway enter)

Same pill shape. Amber border at 0.36 opacity at rest, amber glow on hover. `paddingInline: 28px, paddingBlock: 14px`. Text uppercase, letter-spacing 0.07em.

### Editorial section labels

Uppercase, 0.55–0.65rem, weight 700, letter-spacing +0.08–0.10em, color `rgba(217,119,6,0.70–0.85)` (amber, not white). These are markers, not headings. No `<h2>` semantics in editorial sections.

### Score displays

Large numeric type (1.125rem+), weight 700, letter-spacing -0.03em, white at 0.94 opacity. Accompanied by an amber micro-label ("Field Score", uppercase) above. Score and label are a paired unit — never separate them.

---

## Do Not

- Do not use `#000` or `#fff` directly. Tint neutrals toward hue.
- Do not add a `backdrop-filter` surface without checking the current count — one per viewport on desktop.
- Do not use `border-left` as a colored accent stripe. Use full borders, background tints, or nothing.
- Do not use gradient text (`background-clip: text`). Use solid color with weight/size emphasis.
- Do not use the spring `stiffness: 90, damping: 18` — it undershoots visually.
- Do not animate `background` (gradient) values in CSS keyframes — use opacity cross-fades on static elements instead.
