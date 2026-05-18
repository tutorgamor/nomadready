# NomadReady — Mobile Performance & Video Plan

> Status: **Open** — no fixes implemented yet  
> Created: May 2026  
> Scope: Homepage mobile cinematic hero, video pipeline, overall mobile performance

---

## 1. The Mobile Homepage Video Problem — Exact Diagnosis

### What users see

| Platform | Hero experience |
|---|---|
| Desktop (≥ 768px) | Looping cinematic video behind full-screen header + editorial image panel (HeroReel) |
| Mobile (< 768px) | Static 185px image strip with two polaroid-style photo overlays. No video. No HeroReel. |

The mobile experience is a downgrade from the desktop's cinematic quality. This document explains exactly why it happens and how to fix it.

---

### Root cause #1 — CSS display: none (primary cause)

**File:** `src/globals.css`, line 927

```css
.home-hero-bg {
  display: none;       /* ← hidden on mobile */
}

@media (min-width: 768px) {
  .home-hero-bg {
    display: block;
    /* ... */
  }
}
```

Both the `<video>` and its `<img>` fallback in `HeroCrossfade` share the class `home-hero-bg`. Below 768px, **neither element renders at all** — the browser doesn't even fetch the video. This is intentional in the current code, but it means mobile users get zero cinematic background.

Similarly, `HeroReel` (the animated editorial image panel) uses class `home-hero-aside`:

```css
.home-hero-aside {
  display: none;       /* ← hidden on mobile */
}
@media (min-width: 768px) {
  .home-hero-aside { display: flex; }
}
```

### Root cause #2 — No mobile video asset

**File:** `public/assets/hero-loop.mp4` (and duplicate at `public/assets/hero/hero-loop.mp4`)

- **Size: 20MB** — far too large for mobile
- **Dimensions:** Unknown, but likely 1920×1080 landscape (16:9)
- **Mobile aspect ratio mismatch:** Portrait phones need a 9:16 or 4:5 crop, not landscape 16:9
- **No WebM variant** — VP9/WebM is 30–40% smaller than H.264 MP4 at equivalent quality
- **No `poster` attribute** — zero first-frame placeholder while loading
- **No `preload` attribute** — browsers default to `"metadata"` on desktop, `"none"` on many mobile browsers (bandwidth conservation)

### Root cause #3 — Mobile autoplay policy constraints

Even if the video were shown on mobile, 20MB would create problems:

**iOS Safari:**
- Allows autoplay only when `muted` + `playsinline` are set (✓ both present in `HeroCrossfade`)
- **Low Power Mode** suspends video autoplay, even with `muted`
- Files > ~10MB on cellular may trigger Safari's resource budget and silently fail to play
- Safari requires the video to be sufficiently buffered before autoplay starts — with 20MB, first-frame delay is measurable

**Android Chrome:**
- Respects `muted` autoplay (✓)
- **Data Saver** mode (`navigator.connection.saveData === true`) blocks media autoplay
- Background tabs throttle video decoding
- Older Android (Chrome < 88) has stricter autoplay policies on low-memory devices

**General:**
- Mobile GPUs have much lower video decode throughput — 1080p H.264 can cause thermal throttle on mid-range devices
- A 20MB video means ~3–8 seconds of initial load on a 4G connection before the first frame appears

### Root cause #4 — Static fallback is not cinematic

The current mobile fallback (`home-hero-mobile-scene` in `HomePage.tsx`):

```jsx
<div className="home-hero-mobile-scene">
  <div style={{ height: "185px", borderRadius: "1rem", overflow: "hidden" }}>
    <img src={HERO_IMGS.main} ... />   {/* hero-cinematic.jpg — 55KB */}
    <div .../>  {/* gradient overlays */}
    <img src={HERO_IMGS.japan} ... />  {/* polaroid-japan.webp — 2.1MB (!!) */}
    <img src={HERO_IMGS.tropic} ... /> {/* Unsplash photo */}
    <span ...>9 destinations</span>
  </div>
</div>
```

Problems:
- 185px height is too short for a cinematic impression — it reads as a card, not a scene
- `polaroid-japan.webp` is **2.1MB** — a thumbnail image that should be < 80KB
- No motion, no ambient layer, no depth
- The hero text above it uses default dark background colours (no cinematic overlay)

---

## 2. Production-Grade Fix Strategy

The goal: **preserve the cinematic luxury feel on mobile** while respecting mobile constraints (bandwidth, battery, autoplay policies, portrait orientation).

### Strategy overview

```
Mobile hero flow (proposed):
  1. Static poster frame shown immediately (< 50KB JPEG)
  2. Ambient animation layer (CSS, no JS) provides immediate motion feeling
  3. Mobile video (WebM/MP4, 720p portrait, < 2MB) loads in background
  4. Video plays when ready; crossfades from poster with opacity transition
  5. If video blocked (Low Power Mode, Data Saver) → poster + Ken Burns CSS fallback
```

---

## 3. Exact Fixes

### Fix A — Create mobile video asset

Export two new video files from the hero-loop source footage:

| Asset | Specs |
|---|---|
| `hero-loop-mobile.webm` | VP9, 720×1280 (9:16 portrait crop), 24fps, CRF 33, 1-pass, target < 1.8MB |
| `hero-loop-mobile.mp4` | H.264, 720×1280, 24fps, CRF 28, target < 2.5MB |
| `hero-loop-desktop.webm` | VP9, 1280×720, 24fps, CRF 30, target < 4MB (replaces the 20MB original) |
| `hero-loop-desktop.mp4` | H.264, 1280×720, 24fps, CRF 26, target < 5MB (replaces the 20MB original) |

Place all in: `public/assets/hero/`

### Fix B — Re-author `HeroCrossfade` for adaptive loading

```tsx
// src/components/home/HeroCrossfade.tsx (proposed rewrite)

import { useState, useEffect } from "react";

const POSTER_DESKTOP = "/assets/hero/hero-loop-poster-desktop.jpg";  // ~40KB
const POSTER_MOBILE  = "/assets/hero/hero-loop-poster-mobile.jpg";   // ~30KB, portrait crop
const FALLBACK_IMG   = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85&auto=format&fit=crop";

export function HeroCrossfade() {
  const [videoError, setVideoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Respect Data Saver
  const saveData = typeof navigator !== "undefined" &&
    (navigator as Navigator & { connection?: { saveData: boolean } })
      .connection?.saveData === true;

  const poster = isMobile ? POSTER_MOBILE : POSTER_DESKTOP;

  return (
    <>
      {/* Fallback always behind video */}
      <img
        src={isMobile ? poster : FALLBACK_IMG}
        alt=""
        aria-hidden="true"
        fetchPriority={isMobile ? "high" : "low"}
        decoding="async"
        className="home-hero-bg"
        style={{ opacity: 1 }}
      />

      {/* Video: skip entirely if Data Saver or if errored */}
      {!videoError && !saveData && (
        <video
          className="home-hero-bg"
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          preload="metadata"
          onError={() => setVideoError(true)}
          style={{ opacity: 1, objectFit: "cover", objectPosition: "center center" }}
        >
          {/* Modern format first (smaller), legacy fallback second */}
          {isMobile ? (
            <>
              <source src="/assets/hero/hero-loop-mobile.webm" type="video/webm" />
              <source src="/assets/hero/hero-loop-mobile.mp4"  type="video/mp4" />
            </>
          ) : (
            <>
              <source src="/assets/hero/hero-loop-desktop.webm" type="video/webm" />
              <source src="/assets/hero/hero-loop-desktop.mp4"  type="video/mp4" />
            </>
          )}
        </video>
      )}
    </>
  );
}
```

### Fix C — Enable mobile hero background in CSS

Remove the `display: none` default on `.home-hero-bg` and instead handle sizing differently:

```css
/* Replace the current `.home-hero-bg` block in globals.css */

.home-hero-bg {
  display: block;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 45%;
  z-index: 0;
}

/* Mobile: portrait crop centred */
@media (max-width: 767px) {
  .home-hero-bg {
    object-position: center 35%;
    /* No Ken Burns on mobile — too GPU-heavy */
  }
  video.home-hero-bg {
    object-position: center center;
  }
}

/* Desktop: Ken Burns drift + adjusted position */
@media (min-width: 768px) {
  .home-hero-bg {
    object-position: center 45%;
    transform-origin: center center;
    animation: hero-ken-burns 28s ease-in-out infinite;
    will-change: transform;
  }
  video.home-hero-bg {
    animation: none;
    object-position: center center;
  }
}

@media (min-width: 1100px) {
  .home-hero-bg {
    object-position: center 40%;
  }
}

/* Kill Ken Burns when reduced motion is requested */
@media (prefers-reduced-motion: reduce) {
  .home-hero-bg {
    animation: none !important;
  }
}
```

Also enable the overlay on mobile:

```css
/* Currently display:none on mobile — restore but use lighter overlay */
.home-hero-overlay {
  display: block;
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

@media (max-width: 767px) {
  .home-hero-overlay {
    background:
      linear-gradient(to top,  rgba(6,4,1,0.92) 0%, rgba(6,4,1,0.60) 25%, rgba(6,4,1,0.20) 55%, transparent 72%),
      linear-gradient(to bottom, rgba(6,4,1,0.40) 0%, transparent 20%);
  }
}

@media (min-width: 768px) {
  .home-hero-overlay {
    background:
      linear-gradient(to top,  rgba(8,4,1,0.90) 0%, rgba(8,4,1,0.54) 28%, rgba(8,4,1,0.12) 54%, transparent 70%),
      linear-gradient(105deg,  rgba(8,4,1,0.55) 0%, rgba(8,4,1,0.22) 40%, transparent 60%),
      linear-gradient(to bottom, rgba(10,5,1,0.35) 0%, transparent 22%),
      radial-gradient(ellipse 100% 70% at 68% 38%, rgba(180,100,12,0.18) 0%, transparent 60%);
  }
}
```

### Fix D — Upgrade `home-hero-mobile-scene`

Replace the static 185px card with a taller immersive scene that uses the poster frame + motion:

```jsx
{/* In HomePage.tsx, replace home-hero-mobile-scene content */}
<div className="home-hero-mobile-scene">
  {/* Poster frame fills behind — poster is already loaded via HeroCrossfade */}
  {/* Mobile scene is now decorative texture only — the full-bleed video/poster handles depth */}
  {/* Show only the destination count pill */}
  <div className="home-hero-mobile-scene-pill">
    <span>{availableDestinations.length} destinations</span>
  </div>
</div>
```

And update CSS to make the mobile scene taller:

```css
.home-hero-mobile-scene {
  /* Becomes a minimal overlay element — the hero BG provides the scene */
  margin-top: auto;
  padding-bottom: 1rem;
  position: relative;
  z-index: 4;
}

@media (min-width: 768px) {
  .home-hero-mobile-scene { display: none; }
}
```

### Fix E — Fix oversized polaroid images

`polaroid-japan.webp`, `polaroid-community.webp`, `polaroid-thailand.webp` are each ~2MB. These are thumbnail-sized images used as decorative overlays.

Target: **< 80KB each** at 200×150px or similar, WebP quality 75.

---

## 4. Asset Optimization Pipeline

### Video export pipeline (FFmpeg)

```bash
# Extract poster frames (first usable frame)
ffmpeg -i hero-loop.mp4 -vframes 1 -vf scale=1280:720 -q:v 2 hero-loop-poster-desktop.jpg
ffmpeg -i hero-loop.mp4 -vframes 1 -vf "crop=ih*9/16:ih,scale=720:1280" -q:v 2 hero-loop-poster-mobile.jpg

# Desktop WebM (VP9)
ffmpeg -i hero-loop.mp4 \
  -c:v libvpx-vp9 -b:v 0 -crf 30 \
  -vf scale=1280:720 -r 24 \
  -an -deadline good -cpu-used 2 \
  hero-loop-desktop.webm

# Desktop MP4 (H.264)
ffmpeg -i hero-loop.mp4 \
  -c:v libx264 -crf 26 -preset slow \
  -vf scale=1280:720 -r 24 \
  -an -movflags +faststart \
  hero-loop-desktop.mp4

# Mobile WebM (VP9, portrait crop)
ffmpeg -i hero-loop.mp4 \
  -c:v libvpx-vp9 -b:v 0 -crf 33 \
  -vf "crop=ih*9/16:ih,scale=720:1280" -r 24 \
  -an -deadline good -cpu-used 2 \
  hero-loop-mobile.webm

# Mobile MP4 (H.264, portrait crop)
ffmpeg -i hero-loop.mp4 \
  -c:v libx264 -crf 28 -preset slow \
  -vf "crop=ih*9/16:ih,scale=720:1280" -r 24 \
  -an -movflags +faststart \
  hero-loop-mobile.mp4
```

### Image optimization

```bash
# Polaroid thumbnails — resize to 200×150 and compress
for f in polaroid-*.webp; do
  ffmpeg -i "$f" -vf scale=200:150 -quality 75 "${f%.webp}-opt.webp"
done

# Or with cwebp:
cwebp -q 72 -resize 200 150 polaroid-japan.webp -o polaroid-japan-opt.webp
```

---

## 5. Codec & Bitrate Targets

### Video

| Variant | Codec | Resolution | Frame rate | CRF/Quality | Target bitrate | Target file size |
|---|---|---|---|---|---|---|
| desktop.webm | VP9 | 1280×720 | 24fps | CRF 30 | ~500kbps | 3–4MB |
| desktop.mp4 | H.264 | 1280×720 | 24fps | CRF 26 | ~700kbps | 4–5MB |
| mobile.webm | VP9 | 720×1280 | 24fps | CRF 33 | ~350kbps | 1.5–2MB |
| mobile.mp4 | H.264 | 720×1280 | 24fps | CRF 28 | ~500kbps | 2–2.5MB |

All videos: no audio (`-an`), `movflags +faststart` on MP4 (moov atom at front for progressive play).

### Images

| Type | Format | Quality | Max dimensions | Target size |
|---|---|---|---|---|
| Destination photos (public) | WebP | 75 | 1200px wide | 150KB |
| Polaroid overlays | WebP | 72 | 200×150px | 60KB |
| Hero poster (desktop) | JPEG | 85 | 1280×720 | 40KB |
| Hero poster (mobile) | JPEG | 82 | 720×1280 | 30KB |
| Hero cinematic still | JPEG | 82 | 1200px wide | 55KB (already good) |

---

## 6. GPU-Heavy Effects to Reduce on Mobile

These effects are expensive on mobile GPUs and should either be disabled or simplified below 768px:

| Effect | Current | Mobile recommendation |
|---|---|---|
| `backdrop-filter: blur(Xpx)` | Used on hero controls glass card | Cap at `blur(8px)` on mobile; iOS handles this, Android < 12 may jank |
| Ken Burns animation on `<img>` | `animation: hero-ken-burns 28s` | **Already disabled on mobile** (`.home-hero-bg { display: none }`) — keep disabled if using video; use CSS-only fade instead |
| `will-change: transform` on parallax divs | 3 divs in PassportGatewayHero | Parallax already disabled on touch; remove `will-change` on those divs conditionally |
| Framer Motion `layout` animations | Not currently used in hot paths | Avoid on any list of > 10 items |
| `mix-blend-mode: screen` on grain | `opacity: 0.022` | Already very cheap; fine to keep |
| GlobeMap canvas animation | Below the fold | Load lazily; only render when in viewport (`InView`) — already using InView |

---

## 7. Lighthouse Optimization Priorities

Run Lighthouse against production at `nomadready.vercel.app` on mobile (Moto G Power preset).

Expected current bottlenecks and recommended fixes:

### Performance (estimated current: 55–70 mobile)

| Issue | Impact | Fix |
|---|---|---|
| `hero-loop.mp4` served but unused on mobile (20MB in browser cache) | Low on mobile (display:none prevents fetch) but wastes Vercel bandwidth | No fetch happens; still, clean up the root-level duplicate |
| `polaroid-japan.webp` (2.1MB) loaded on mobile | **High** — this loads eagerly in `home-hero-mobile-scene` | Resize to < 80KB |
| `polaroid-community.webp` and `polaroid-thailand.webp` (2MB+ each) | **High** if used | Resize |
| No `preload` on hero video | Medium | Add `preload="metadata"` |
| No `poster` on hero video | Medium | Add poster JPEG |
| Missing `fetchPriority="high"` on above-fold hero images | Medium | Mark LCP image with high priority |
| Unsplash images in HeroReel fetched with `fetchPriority="low"` | Low | Correct for non-LCP |
| Large JS bundle (90 JSON files eagerly imported) | Low-medium | Consider lazy-loading per passport code |

### Best Practices

| Issue | Fix |
|---|---|
| `<video>` missing `poster` | Add poster attribute |
| Mixed CDN + local images | Ensure all local assets served with proper Cache-Control headers (Vercel sets this automatically for `/public`) |

### SEO

| Issue | Fix |
|---|---|
| `<img alt="">` on all hero images | Consider adding descriptive alt text on the LCP hero image for SEO |
| No `<meta name="description">` | Add in `index.html` |

---

## 8. Responsive Animation Strategy

### Philosophy

On mobile, **animations should feel intentional, not decorative**. Reduce complexity, preserve impact.

| Animation type | Desktop | Mobile |
|---|---|---|
| Gateway entrance | Full Framer Motion stagger (0.32s → 0.88s delays) | Keep — feels premium, short |
| Gateway parallax (cursor) | RAF-driven, ± 36px glow movement | Disabled (no mousemove on touch) — already correct |
| Ken Burns on hero BG | 28s CSS animation | Disable on mobile — use static poster or slow fade |
| HeroReel crossfade (900ms) | Auto-cycles 4.2s | Hidden on mobile — for future: consider a simpler 3-slide carousel |
| Section InView reveals | `opacity 0 → 1, y 32 → 0` | Keep — lightweight and feels purposeful |
| GlobeMap canvas rotation | Continuous canvas animation | Pause when off-screen (already via InView) |
| Profile dropdown | shadcn Radix animation | Keep |
| `prefers-reduced-motion` | All durations → 1ms | Keep — already implemented |

### New: mobile hero motion (proposed)

To replace the static `home-hero-mobile-scene` with something cinematic without video:

```css
/* Slow ambient pulse on mobile poster — CSS only, no JS, minimal GPU */
@keyframes hero-mobile-ambient {
  0%   { opacity: 0.92; transform: scale(1.00); }
  50%  { opacity: 1.00; transform: scale(1.025); }
  100% { opacity: 0.92; transform: scale(1.00); }
}

@media (max-width: 767px) {
  .home-hero-bg {
    animation: hero-mobile-ambient 8s ease-in-out infinite;
    will-change: opacity;   /* opacity only — compositor-safe */
  }
  video.home-hero-bg {
    animation: none;  /* video provides its own motion */
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-hero-bg { animation: none !important; }
}
```

---

## 9. Implementation Checklist

### Phase 1 — Asset work (no code changes)

- [ ] Re-encode `hero-loop.mp4` to `hero-loop-desktop.webm` + `hero-loop-desktop.mp4` (< 5MB each)
- [ ] Crop and encode `hero-loop-mobile.webm` + `hero-loop-mobile.mp4` (9:16, < 2MB each)
- [ ] Extract poster frames: `hero-loop-poster-desktop.jpg` + `hero-loop-poster-mobile.jpg`
- [ ] Resize `polaroid-japan.webp`, `polaroid-community.webp`, `polaroid-thailand.webp` to < 80KB each
- [ ] Delete root-level duplicate `public/assets/hero-loop.mp4`

### Phase 2 — Code changes

- [ ] Rewrite `HeroCrossfade.tsx` — adaptive mobile/desktop source selection + poster + preload + Data Saver check
- [ ] Update `globals.css` — `.home-hero-bg` visible on mobile, portrait sizing, mobile overlay gradient
- [ ] Fix `prefers-reduced-motion` gap in `.home-hero-bg` CSS animation
- [ ] Simplify `home-hero-mobile-scene` — remove oversized polaroid images, make it an overlay element
- [ ] Add `<meta name="description">` to `index.html`

### Phase 3 — Validation

- [ ] Lighthouse mobile audit (target: Performance ≥ 80)
- [ ] Test autoplay on iOS Safari (real device or BrowserStack)
- [ ] Test autoplay on Android Chrome with Data Saver enabled
- [ ] Test Low Power Mode (iOS) — confirm poster visible and Ken Burns/ambient CSS fallback works
- [ ] Test `prefers-reduced-motion` — all animations collapsed
- [ ] Verify 768px breakpoint — no layout flash at exactly the breakpoint
