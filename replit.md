# NomadReady

A travel readiness field guide for backpackers — shows visa rules, budget tiers, best season, local tips, and more for any passport + destination combination.

## Run & Operate

- `pnpm --filter @workspace/nomadready run dev` — run the NomadReady frontend (Vite, auto-port)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7, TailwindCSS v4
- Routing: wouter (replaced Next.js `useRouter` / `Link`)
- Animation: motion/react, gsap
- Fonts: Geist (system UI), Cormorant Garamond (display — loaded via Google Fonts in index.html)
- Data: static JSON files loaded at build time via `import.meta.glob`

## Where things live

```
artifacts/nomadready/
  src/
    pages/          ← new React page components (HomePage, DestinationPage)
    components/     ← all UI components (ready/, home/, motion/, ui/, motion-primitives/)
    data/           ← static JSON data files
      ready/        ← 90 passport-destination pair files (e.g. fr-thailand.json)
      places/       ← local gems per destination
      notes/        ← real travel notes per destination
      nomad-reality/ ← nomad reality notes per destination
      remote-work-zones/ ← city remote-work zone guides per destination
    lib/            ← types.ts, profile.ts, budget.ts, utils.ts
    globals.css     ← design tokens (CSS variables), editorial styles
    index.css       ← TailwindCSS v4 entry + font variable declarations
    App.tsx         ← router + ProfileProvider
    main.tsx        ← React DOM entry
  src/app/          ← legacy Next.js pages (NOT used, excluded from tsconfig)
```

## Architecture decisions

- **No server** — entirely frontend-only. All JSON data is bundled via Vite `import.meta.glob` with `{ eager: true }`. No API routes needed.
- **Passport gateway** — cinematic full-screen overlay (PassportGatewayHero) shown once per session via `sessionStorage`. Respects sessionStorage in both dev and prod (no bypass). To re-test the gateway, clear `nr_gateway_passed` from sessionStorage in DevTools or open a new incognito window.
- **Routing** — wouter replaces Next.js router. Two routes: `/` (home) and `/ready/:passport/:destination`.
- **`src/app/` excluded** — legacy Next.js page files remain for reference but are excluded from tsconfig (`src/app/**`) to prevent type errors.
- **`cn()` uses clsx** — updated to support object-style conditional class names used by shadcn/recharts components.

## Product

- Passport gateway entry screen with cinematic animation, passport selector across 10 nationalities
- Home page: destination grid with visa label, budget estimate, and best months; comparison strip; trip planner
- Destination detail page: full scrollable field guide with visa, budget calculator, insurance, best season, apps, transport, scams, phrases, emergency contacts, checklist, nomad reality notes, local gems, and remote work zone maps

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The `src/app/` directory contains the original Next.js pages — they are intentionally NOT wired up. New pages live in `src/pages/`.
- Passport gateway respects `sessionStorage` in both dev and prod. It shows once per browser session. To replay it during dev, clear `nr_gateway_passed` in DevTools → Application → Session Storage.
- Ready data files are named `{passportId}-{destinationId}.json` (e.g. `fr-thailand.json`). Both IDs must exist in `passports.json` / `destinations.json` for the destination to appear.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
