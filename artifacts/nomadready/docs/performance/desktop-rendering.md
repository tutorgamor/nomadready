# NomadReady — Desktop Rendering Architecture

> Documents the compositor architecture, GPU layer budget, and RAF patterns established in May 2026.
> Read this before adding animations, blur effects, or will-change declarations on desktop.
> Updated: May 2026

---

## Why This Document Exists

Two performance passes in May 2026 established the current rendering architecture. The decisions involved are not obvious from the code alone — knowing *why* something was removed or restructured prevents future sessions from accidentally reversing the work.

The primary symptom that drove this work: the desktop landing page felt heavy, the cursor had slight perceptible lag, and the carousel drag felt sluggish. The root causes were entirely in the compositor and main-thread animation pipeline, not in content or layout.

---

## Current GPU Layer Budget

**AmbientLayer blur textures: 2 (down from 5)**

| Element | CSS class | Blur | Animated | Compositor | Justification |
|---|---|---|---|---|---|
| Near fog | `.amb-fog` | `blur(28px)` | Yes (translate+opacity, 55s) | Promoted via `will-change` | Creates perceptible depth plane between fog and drift layers — justified |
| Bloom zone | `.amb-bloom` | `blur(24px)` | Yes (opacity, 25s) | Implicit (animated blur) | Single merged layer replacing two; warm glow quality requires blur |
| Ceiling | `.amb-ceiling` | none (removed) | No | Standard paint | Three-stop gradient falloff imperceptible without blur at 0.048 max alpha |
| Far fog | `.amb-fog-far` | none (removed) | No | Standard paint | Replaced by 5-stop exponential alpha decay gradient; saves the largest single GPU texture |
| Bloom 1 | `.amb-bloom-1` | `blur(22px)` (removed) | — | — | Merged into `.amb-bloom` |
| Bloom 2 | `.amb-bloom-2` | `blur(28px)` (removed) | — | — | Merged into `.amb-bloom` |

Other active GPU layers on the hero:
- Video element: browser-composited natively
- Ken Burns fallback `<img>` with `will-change: transform`: 1 layer (static transform animation, compositor-safe)
- Custom cursor ring: 1 layer (fixed position, direct DOM mutation)
- `AmbientLayer` container: 1 fixed stacking context (umbrella, not per-child)

**Total simultaneous blur textures on desktop hero: 2.** Previous state: 5. The compositing step per frame is measurably shorter; this is the primary cause of the perceptual improvement in cursor immediacy and scroll fluidity.

---

## RAF Convergence Architecture

Both cursor-driven RAF loops (AmbientLayer glow and gateway parallax) use the same pattern: **stop when converged, restart on mousemove only**.

### The pattern (AmbientLayer, `src/components/home/AmbientLayer.tsx`)

```ts
let raf = 0;  // 0 = stopped

const tick = () => {
  current.x += (target.x - current.x) * 0.055;
  current.y += (target.y - current.y) * 0.055;
  // ... update DOM style ...

  const diff = Math.abs(target.x - current.x) + Math.abs(target.y - current.y);
  if (diff > 0.3) {        // 0.3 viewport-% threshold = sub-pixel on HiDPI
    raf = requestAnimationFrame(tick);
  } else {
    raf = 0;               // self-terminating
  }
};

const onMove = () => {
  // update target ...
  if (raf === 0) raf = requestAnimationFrame(tick);  // restart only when stopped
};
```

**Convergence threshold:** `diff > 0.3` (viewport percentage units). At 0.3% of viewport width, the remaining glow offset is ≤2px on a 1440p display — sub-pixel on HiDPI, invisible to the eye.

**Lerp factor:** `0.055` — the loop runs for approximately 1 second after the mouse stops before converging. The previous value was `0.028`, which kept the loop running for 4–6 seconds per idle period.

### The gateway parallax uses an identical pattern

`src/components/home/PassportGatewayHero.tsx`, threshold at `diff > 0.05` (tighter, because the gateway glows are larger and the animation is more prominent).

### What was wrong before

The AmbientLayer RAF had no convergence check and was running **continuously at 60fps for the entire session**. On every tick it recomputed a radial gradient and set `style.background`. This competed with scroll, interaction, and compositor work for main-thread time, causing the cursor lag and scroll heaviness perceived by users.

---

## Climate Layer Migration (Paint Thread → Compositor)

### The problem

`.amb-depth-shift` previously animated the `background` CSS property (interpolating between `linear-gradient()` values in keyframes). Animating `background` is not compositor-safe — it runs on the paint thread, requiring style resolution and paint on every frame where the interpolated value changes.

### The fix

The single animated element was replaced with three static gradient divs, each with an **opacity** animation. Opacity animation runs entirely on the compositor thread.

**Structure** (`src/components/home/AmbientLayer.tsx`):
```jsx
<div className="amb-depth-shift">
  <div className="amb-climate-dawn" />   {/* opacity: 1 at 0%/100%, fades at 32% */}
  <div className="amb-climate-peak" />   {/* opacity: 1 at 32%, invisible at 0%/68%/100% */}
  <div className="amb-climate-dusk" />   {/* opacity: 1 at 68%, invisible elsewhere */}
</div>
```

The three gradients are the same values as the original keyframe states. The `65s ease-in-out infinite` timing is preserved across the three animations with offset keyframe positions to replicate the cross-fade rhythm.

**Rule derived:** Never animate `background`, `background-image`, or gradient values in CSS keyframes. Use opacity cross-fades on static gradient elements instead.

---

## Blur Removal: Gradient Stop Equivalents

When removing `filter: blur()` from a static element, the visual result can be preserved by adding intermediate gradient stops that create exponential alpha decay. This replicates the edge-softening that blur provides.

### Example: `.amb-fog-far` (62px blur removed)

```css
/* Before: */
background: radial-gradient(ellipse 52% 62% at 45% 56%,
  rgba(238, 224, 202, 0.034) 0%,
  rgba(230, 216, 192, 0.012) 48%,
  transparent 72%
);
filter: blur(62px);

/* After: */
background: radial-gradient(ellipse 52% 62% at 45% 56%,
  rgba(238, 224, 202, 0.034) 0%,
  rgba(235, 220, 198, 0.024) 28%,   /* intermediate stop */
  rgba(231, 217, 194, 0.014) 52%,   /* intermediate stop */
  rgba(227, 213, 189, 0.006) 70%,   /* near-zero stop */
  transparent 88%                    /* extend transparent point */
);
```

The 5-stop version produces a visually identical result to the 62px blur at these opacity levels (max alpha 0.034 × element opacity 0.85 = 0.029). The GPU texture cost goes from ~100MB on a 2560×1440 display (largest blur texture in the layer stack) to zero.

**This technique works reliably when:**
- The element is static (not animated via transform)
- Max alpha is ≤ 0.06 (very subtle; edge precision is not perceptible)
- The gradient is radial with natural falloff

**Do not apply this to `.amb-fog`** — it is animated (translate+opacity) and the blur is part of the "near fog" depth character that distinguishes it from the far fog plane.

---

## amb-grain Blend Mode

`.amb-grain` uses `mix-blend-mode: screen` (changed from `multiply`).

On the dark hero background, `multiply` was fractionally darkening the video, contributing to a slightly muted/grainy video quality perception. `screen` adds the grain's light values additively — producing authentic film grain on dark backgrounds without the darkening artifact. Consistent with the gateway grain which also uses `screen`.

---

## Backdrop-filter Budget

One `backdrop-filter` surface per viewport on desktop. Currently: `.hero-controls-glass`.

```css
backdrop-filter: blur(14px);
```

Changed from `blur(22px) saturate(160%)` in May 2026. The `saturate()` compound filter adds a color-saturation pass on every composite frame over the glass card; at the amber accent radius this was indistinguishable from baseline. Removed. Blur radius reduced from 22 to 14px.

The passport sidebar also has `backdrop-filter: blur(14px) saturate(140%)` at `≥768px`. This is a secondary surface and is acceptable — the sidebar is narrow and only partially overlaps the hero.

**Rule:** Before adding a new `backdrop-filter` element, verify the current count. Two on desktop is the maximum before compositing cost becomes perceptible.

---

## Remaining Bottlenecks

These were identified in the May 2026 audit and deferred:

**1. `.amb-fog` — `filter: blur(28px)`, animated (translate+opacity, 55s)**

This is the one remaining blur-animated element and it is justified. The near-fog blur creates visible depth separation between the fog plane and the drift layers — removing it would perceptibly flatten the atmospheric stack. The `will-change: transform, opacity` declaration correctly promotes it.

Do not remove this unless the layer count pressure becomes severe and a gradient-stop equivalent can be designed that preserves the depth perception.

**2. `.atlas-shadow-drift` — `filter: blur(26px)` + `mix-blend-mode: multiply`, static**

This CSS class exists in `globals.css` but does not appear to be rendered in `AmbientLayer.tsx`. If it is used on the Thailand/CountryPage, it carries a compositing cost there. If unused, it is dead CSS.

**3. `backdrop-filter: blur(14px) saturate(140%)` on `.passport-sidebar`**

Minor. Desktop sidebar. The `saturate(140%)` adds a small shader cost. Low priority.

---

## Rules for Future Changes

1. **No new `filter: blur()` without auditing the current layer count.** The budget is 2 blur textures in AmbientLayer. Adding a third requires removing one.

2. **No new `will-change` declarations without measuring.** Each `will-change: transform` promotes an element to a compositor layer and costs VRAM. The gateway glows already declare it statically — consider making it dynamic (add on animation start, remove on stop).

3. **No RAF loops without a convergence threshold.** Every cursor-tracking or lerp-based RAF loop must self-terminate. Use the `diff > threshold → raf = 0` pattern. Threshold in viewport-% units.

4. **No CSS keyframe animation of `background`, `color`, or gradient values.** Use opacity cross-fades on static elements.

5. **No new `backdrop-filter` surfaces.** The glass card and sidebar already exist. Additional surfaces require removing an existing one.

6. **Carousel and draggable springs:** `stiffness: 320, damping: 30`. Do not reduce stiffness below 240 or damping below 26 without visual testing — lower values produce overshoot that reads as sluggish.
