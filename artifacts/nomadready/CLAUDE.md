# NomadReady — Engineering & Product Memory

> All source lives in `artifacts/nomadready/`. Vercel builds from here.
> Monorepo root is `nomadready/`; do **not** duplicate docs there.
> This file is the authoritative AI-session context. Read it before touching anything.

---

## What this app is

A passport-aware travel readiness SPA. A user picks their passport country and a destination, and gets a personalised guide covering visa rules, budget, safety, transport, apps, phrases, emergency contacts, and more. A traveller profile (backpacker / digital nomad / food explorer / comfort / adventure) adjusts UI emphasis without changing the underlying data.

---

## Commands

```bash
# from monorepo root
pnpm --filter @workspace/nomadready dev       # dev server at :20546
pnpm --filter @workspace/nomadready build     # outputs to artifacts/nomadready/dist/
pnpm --filter @workspace/nomadready typecheck

# from inside artifacts/nomadready/
pnpm dev / pnpm build / pnpm typecheck
```

---

## Deployment

- **Platform:** Vercel
- **Build command:** `pnpm --filter @workspace/nomadready run build`
- **Output directory:** `dist/` (relative to monorepo root — `artifacts/nomadready/dist/`)
- **Install command:** `pnpm install --frozen-lockfile`
- **Rewrites:** all routes → `/index.html` (SPA, client-side routing via Wouter)
- `vercel.json` lives at `artifacts/nomadready/vercel.json` — never at monorepo root

### Git workflow

- Feature branches off `main`
- PR title should be imperative: "Add X", "Fix Y", "Refactor Z"
- After merge, Vercel auto-deploys `main` to production
- Check Vercel dashboard for deployment status after push

### Vercel workflow

- Production domain: `nomadready.vercel.app`
- Preview deployments created on every PR branch push
- No environment variables currently required (pure static build)
- `outputDirectory` in `vercel.json` is `dist` — this is relative to the repo root, so the actual path Vercel expects is `artifacts/nomadready/dist`

---

## Tech stack

| Concern | Library |
|---|---|
| Framework | React 18 + TypeScript 5 |
| Build | Vite |
| Routing | Wouter |
| Styling | Tailwind CSS (JIT via `@tailwindcss/vite`) + custom CSS in `globals.css` |
| Components | shadcn/ui (42 components) + Radix UI primitives |
| Animation | Framer Motion (`motion/react`), GSAP, Motion v12, anime.js |
| Data fetching | TanStack React Query |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React + React Icons |
| Fonts | Geist (sans + mono) |
| Carousel | Embla Carousel |

---

## Routing

Defined in `src/App.tsx`:

```
/                                      → HomePage
/destinations/thailand                 → ThailandPage   (has city map)
/ready/:passport/:destination          → DestinationPage  (or CountryPage if has map)
/ready/:passport/:country/:city        → DestinationPage  (city-level)
*                                      → NotFound (inline, not a page file)
```

`CountryPage` is used when the destination slug is in `COUNTRIES_WITH_MAPS` (currently only `"thailand"`). Extending to new map countries: add the slug to that Set.

---

## Data model

### Passport codes

`au` `be` `ca` `de` `es` `fr` `it` `nl` `uk` `us`

### Destination slugs

`georgia` `indonesia` `japan` `malaysia` `philippines` `south-korea` `thailand` `turkey` `vietnam`

### Per-passport × per-destination guides (`src/data/ready/`)

90 files: `{passportCode}-{destination}.json` (10 × 9 matrix).
Each matches the `ReadyData` interface in `src/lib/types.ts`.
Contains: `visa` · `insurance` · `best_season` · `budget` · `useful_apps` · `transport` · `scams` · `phrases` · `emergency` · `checklist`

> Supplementary data folders, interfaces, and per-destination coverage: `src/data/README.md`

---

## Component organisation

> Full folder map and directory structure: `src/components/README.md`

**Key components:**

- `ProfileProvider` — React context wrapping the whole app; persists `TravelerProfileId` to `localStorage` key `nomadready_profile`
- `PassportGatewayHero` — Full-screen fixed overlay (z-index 500), cinematic passport entry animation. Renders on both mobile and desktop. Unmounts after the "Enter" transition completes.
- `HeroCrossfade` — Desktop-only video/image background (`display:none` below 768px). Renders a looping `<video>` with a static image fallback behind it.
- `HeroReel` — Desktop-only editorial image panel (`display:none` below 768px). Crossfades between 9 destination photos with metadata overlay.
- `home-hero-mobile-scene` — Mobile-only (hidden above 768px). A 185px static image strip with polaroid-style photo overlays. **Current known gap: no cinematic quality on mobile.**
- `DestinationPage` — Main guide view; reads `/:passport/:destination` params, imports matching JSON, renders all `ready/` section components.
- `CountryPage` — Thailand layout with SVG field-guide city map.

---

## Visual identity

> Full design language with tokens, surfaces, motion values, and component patterns: `docs/design/design-system.md`
> Editorial philosophy behind the visual direction: `docs/vision/editorial-memory-system.md`

### Colour palette (quick reference)

| Token | Value | Use |
|---|---|---|
| `--bg-base` | deep navy-black (~`#08070e`) | page background |
| `--accent` | amber `#d97706` | primary accent, CTA borders, score highlights |
| `--border` | `rgba(180,130,65,0.22)` approx | subtle warm dividers |
| `--text-muted` | low-opacity warm white | secondary labels |
| `--text-secondary` | slightly higher opacity white | body copy |

### Typography (quick reference)

- **Display / headlines:** `var(--font-display)` — tight letter-spacing (`-0.04em`), weight 600
- **UI / body:** `var(--font-geist-sans)` (Geist) — clean, neutral, minimal
- **Mono:** `var(--font-geist-mono)` — data/scores only
- Section labels: uppercase, 0.55–0.65rem, `+0.08–0.10em` letter-spacing

---

## Cinematic direction

> Editorial intent behind the cinematic direction: `docs/vision/editorial-memory-system.md §Motion and UX Principles`
> Compositor architecture and rendering rules: `docs/performance/desktop-rendering.md`

### Hero video

- `HeroCrossfade` serves adaptive sources: desktop (hero-loop-desktop.mp4, 2.6MB) and mobile (hero-loop-mobile.mp4, 1.75MB)
- Asset pipeline to reduce the 20MB source video is still open — see `docs/performance/mobile-video.md` Phase 1
- Poster frames shown immediately while video buffers; Data Saver detection skips video entirely
- CSS class `home-hero-bg`: visible on both mobile and desktop (updated May 2026)

### Ken Burns (still fallback)

Fallback `<img>` gets `hero-ken-burns` CSS animation (28s, scale + translate drift). Applied to `img.home-hero-bg` on desktop only; video element overrides with `animation: none`. Respects `prefers-reduced-motion`.

### Gateway animation

`PassportGatewayHero` uses Framer Motion:
- Passport descends y: -38 → 0, scale 0.95 → 1, ease `[0.16, 1, 0.3, 1]`
- On Enter: passport scales 8×, overlay fades, DOM removed at 920ms
- Parallax: cursor-driven RAF loop, stops when converged (diff > 0.05). Disabled when `prefers-reduced-motion`.

### Ambient layer

`AmbientLayer` — fixed atmospheric layer (z-index 200) with 13 sub-layers providing slow decorative depth. All animated layers use transform + opacity only. For GPU layer budget and current architecture see `docs/performance/desktop-rendering.md`.

---

## Interaction philosophy

> Extended: `docs/vision/editorial-memory-system.md §Motion and UX Principles`

1. **The gateway is the ritual.** Intentional friction frames the app as a personalised document.
2. **Motion serves meaning.** No decoration-only motion. Animations reveal hierarchy, simulate physical objects, or indicate state.
3. **Tactile inputs.** Passport chips use `whileHover` / `whileTap`. Focus states have warm amber glow. Touch targets ≥ 44px.
4. **Scroll reveals content.** `InView` from `motion-primitives` gates section entrance animations.
5. **Reduced motion respected.** Every timed animation checks `useReducedMotion()`. Durations collapse to 1ms; parallax loop skips entirely.

---

## Premium UX rules

- Never use generic loading spinners — use skeleton shapes or content-aware placeholders.
- Score displays use large numeric type with tight letter-spacing — they are data *and* visual design.
- Section headings are uppercase micro-labels, not `<h2>` bold headings — editorial register.
- Buttons and chips are pill-shaped (radius 9999px) with amber accent borders/glow on active state.
- All interactive elements have visible `focus-visible` rings (amber-toned for dark surfaces).
- No horizontal scrollbars on desktop. Horizontal scroll is intentional on mobile chips only.
- Destructive or noisy UI elements (modals, toasts) appear sparingly — this is a reading app.
- Empty/fallback states must carry the editorial voice ("This destination doesn't exist yet. 🗺️").

---

## Mobile adaptation strategy

### Current approach (as of May 2026)

| Element | Desktop (≥ 768px) | Mobile (< 768px) |
|---|---|---|
| `HeroCrossfade` (video/image BG) | Full-screen behind hero text | **Hidden** (`display: none`) |
| `HeroReel` (editorial image panel) | Right-side aside | **Hidden** (`display: none`) |
| `home-hero-mobile-scene` | Hidden | Shown — 185px static image strip + polaroid overlays |
| `home-hero-wordmark` (masthead bar) | Shown at top of header | Hidden |
| `home-wordmark-inline` | Hidden | Shown (inline in hero text column) |
| `PassportGatewayHero` | Full-screen, centered column | Full-screen, split top/bottom panels |
| Gateway parallax | Cursor-driven | Disabled (no mousemove on touch) |
| Gateway chips | Inline wrap | Horizontal scroll |
| Gateway CTA | Fixed width | Full-width |

### Known gap — mobile cinematic hero

The mobile hero code is updated (HeroCrossfade now serves mobile sources, CSS is enabled). The mobile video assets (encoded variants, poster frames) do not yet exist. Until Phase 1 assets are created, mobile falls back to the static poster image. See `docs/performance/mobile-video.md` for the full plan.

### Breakpoints

| Breakpoint | CSS | Purpose |
|---|---|---|
| `sm` | 640px | Gateway layout shift (mobile → desktop panels) |
| `md` | 768px | Main layout breakpoint — most hero/layout changes |
| `lg` | 1100px | page-container max-width expansion, object-position tweak |

---

## Animation constraints

- **Do not** add `will-change` without measuring — it forces GPU compositing layers, which costs VRAM on mobile
- **Do not** animate `width`, `height`, `top`, `left`, `margin` — use `transform` and `opacity` only (compositor-safe)
- `framer-motion` layout animations (the `layout` prop) trigger layout recalculation — avoid on lists > 20 items
- GSAP is in the dependency tree; use it for complex timeline sequences. For simple transitions, prefer Framer Motion or CSS.
- Parallax RAF loops: always check if converged before scheduling next frame; cancel on unmount
- `prefers-reduced-motion`: all durations should collapse to `≤ 1ms` when the flag is set. Use `useReducedMotion()` from `motion/react`.
- Ken Burns (28s) runs on the fallback hero image — this is CSS, not JS, so it's always compositor-driven

---

## Performance constraints

> Desktop compositor architecture, GPU layer budget, RAF patterns: `docs/performance/desktop-rendering.md`
> Mobile video pipeline and asset targets: `docs/performance/mobile-video.md`

- **No server** — everything builds to static files. No SSR, no API routes.
- All JSON data is imported eagerly at build time via `import.meta.glob({ eager: true })` in `HomePage.tsx` — bundles all 90 ready files. Monitor bundle size if adding destinations.
- Unsplash images in `HeroReel` use explicit `?w=800&q=75` params — maintain these or images balloon to multi-MB
- `hero-loop.mp4` source is 20MB — desktop variant 2.6MB, mobile 1.75MB (encoded). Asset pipeline to replace source still open.
- `fetchPriority="high"` on the first HeroReel image (index 0) — other images use `"low"` — preserve this
- Vite code-splitting: single SPA, no route-level splitting. CountryPage at 37KB source may warrant splitting if bundle grows.

---

## Asset specifications

### Images

| Use | Format | Max size | Notes |
|---|---|---|---|
| Destination photos (public) | JPEG or WebP | 200KB | `w=800&q=75` on Unsplash CDN |
| Local destination assets | JPEG or WebP | 300KB | `/public/assets/destinations/` |
| Editorial panels | PNG or WebP | 400KB | `/public/assets/editorial/panels/` |
| Polaroid overlays | WebP | 150KB each | `/public/assets/hero/` |
| Paper grain tile | PNG | 50KB | 240×240px tile |
| Hero cinematic still | JPEG | 100KB | Used as mobile hero BG |

### Video

| Variant | Format | Target size | Resolution | Notes |
|---|---|---|---|---|
| Desktop hero loop | MP4 (H.264) | < 5MB target (currently 20MB) | 1920×1080 or 1280×720 | Looping ambient travel footage |
| Mobile hero loop | MP4 (H.264) + WebM (VP9) | < 2MB | 720×1280 or 1080×1920 (9:16) | **Does not exist yet** |

### SVG / Icons

- Prefer Lucide React icons for UI — consistent 24px stroke-based system
- Custom SVGs (globe, map decorations, progress arcs) are inline JSX for full colour/animation control
- Do not embed SVG as `<img>` if it needs CSS variable colours — use inline JSX instead
- Map decorations (`MapDecorations.tsx`) use `<path>` and `<polyline>` with CSS-variable fills

---

## CSS architecture

- `src/globals.css` is the master stylesheet (~2600+ lines). Component-level CSS lives here, not in CSS modules.
- Tailwind utility classes used inline in JSX for spacing, layout, responsive utilities.
- CSS custom properties (CSS variables) on `:root` for all design tokens. Prefer `var(--token)` over hardcoded hex.
- Naming convention: BEM-ish block names for multi-element components (`.gateway-shell`, `.home-hero-layout`, `.hero-editorial-panel`). Modifiers with `--` suffix.
- All responsive overrides use `@media (min-width: X)` (mobile-first where possible, some desktop-first exceptions in the hero section).
- Named CSS animations: `hero-ken-burns`, `anim-fade-down`, `anim-fade-up`, `anim-reveal`, `anim-float-gentle`, `anim-delay-1` through `anim-delay-5`.

---

## Map rendering standards

- City maps are SVG-based, rendered inline in JSX (no external map tiles, no Mapbox)
- `ZoneMarker` positions are `x` / `y` values in 0–100 SVG viewBox space
- `MapDecoration` shapes (water, parks, transit lines) are hand-coded SVG paths
- Colours come from `CityTheme` (accent, mapBackground, waterColor, parkColor) — never hardcoded
- Map overlays (pulsing dots, zoom tooltips) are Framer Motion animated elements
- Adding a new city: create `data/remote-work-zones/{city}.json` matching `RemoteWorkZonesData`, add the slug to `COUNTRIES_WITH_MAPS` in `App.tsx`

---

## State management conventions

- **No global state manager** (no Redux, no Zustand)
- **Profile context:** `ProfileProvider` wraps the app. Use `useProfileContext()` to read/set profile. Persisted to `localStorage` key `nomadready_profile`.
- **Passport / destination:** passed via URL (`?passport=fr`, route params `/:passport/:destination`). Components read with `useSearch()` / `useParams()` from Wouter.
- **Gateway visibility:** local state in `PassportGatewayHero` + `sessionStorage` key `nr_gateway_passed`. Once passed, gateway never re-shows in the same session (unless `?skip_gateway=1` in URL, useful for dev).
- **UI state** (open/closed, hover, etc.): local `useState` in the component that owns it. No lifting unless two+ components need it.

---

## SVG / icon rules

- Use `aria-hidden="true"` on all decorative SVGs and icons
- Lucide icons: default 24px, use `size` prop to override. Stroke width 1.5 (Lucide default).
- Inline SVG for: globe, map decorations, terrain wave divider, editorial dashes
- Never use `<img src="*.svg">` for icons that need theme-aware colours
- Country flag images are in `/public/flags/` as PNG — used via `<img>` (fine, flags don't need CSS variables)

---

## Accessibility constraints

- ARIA roles on interactive groups: `role="radiogroup"` on passport chips in gateway
- `role="radio"` + `aria-checked` on individual passport chip buttons
- All `<video>` elements must have `muted` + `playsInline` (already present)
- All decorative images and SVGs: `alt=""` or `aria-hidden="true"`
- Focus-visible rings: amber-tone glow on dark surfaces (see gateway chip `onFocus` handler)
- Touch targets: minimum 44×44px on mobile (gateway chips: `minHeight: 36px` — can be improved to 44px)
- `prefers-reduced-motion`: all animated durations → 1ms. Parallax loop skipped. Ken Burns stops via `@media (prefers-reduced-motion: reduce)` in `globals.css` (fixed May 2026).

---

## Future component conventions

When adding a new section to `DestinationPage`:
1. Create `src/components/ready/NewSection.tsx`
2. Add the matching data fields to `ReadyData` in `src/lib/types.ts`
3. Add JSON keys to all 90 `ready/*.json` files
4. Import and render in `DestinationPage.tsx`

When adding a new destination:
1. Add entry to `src/data/destinations.json`
2. Create 10 JSON files in `src/data/ready/` (one per passport)
3. Add supplementary data files in relevant subfolders as needed
4. No code changes needed if the destination doesn't need a custom CountryPage

When adding a new passport:
1. Add entry to `src/data/passports.json`
2. Add the passport chip to `PASSPORTS` array in `PassportGatewayHero.tsx`
3. Create 9 JSON files in `src/data/ready/` (one per destination)
4. Add translations for that passport's language to `src/lib/i18n.ts`

---

## AI session startup procedure

At the start of every new session working on NomadReady:

1. Read this file (`artifacts/nomadready/CLAUDE.md`) — you are doing that now
2. Run `git log --oneline -10` to see recent changes
3. Check `git status` for any uncommitted work
4. If touching the homepage or hero: re-read `src/components/home/HeroCrossfade.tsx`, `HeroReel.tsx`, `PassportGatewayHero.tsx`
5. If touching the destination page: re-read `src/pages/DestinationPage.tsx` and `src/lib/types.ts`
6. If touching styles: the CSS is in `src/globals.css` — search for the relevant class before adding new ones (it may already exist)
7. If touching animations, GPU layers, or rendering: read `docs/performance/desktop-rendering.md` before making changes
8. If making editorial, content, or UX direction decisions: read `docs/vision/editorial-memory-system.md`
9. If making visual design decisions (colors, type, surfaces): read `docs/design/design-system.md`

---

## Known issues and open work

| Issue | Location | Severity | Plan |
|---|---|---|---|
| Mobile hero assets missing | `public/assets/hero/` | High | Phase 1 of `docs/performance/mobile-video.md` — FFmpeg encode needed |
| `hero-loop.mp4` source is 20MB | `public/assets/hero-loop.mp4` | High | Re-encode; encoded variants exist, source not yet replaced |
| Gateway chip touch targets 36px | `PassportGatewayHero.tsx` | Low | Increase `minHeight` to 44px |
| Duplicate `hero-loop.mp4` at root | `public/assets/hero-loop.mp4` | Low | Consolidate; keep only `/assets/hero/hero-loop.mp4` |
| All 90 JSON files bundled eagerly | `pages/HomePage.tsx` | Medium | Consider lazy import per passport if bundle grows |
| `<meta name="description">` missing | `index.html` | Low | Add basic SEO meta |
