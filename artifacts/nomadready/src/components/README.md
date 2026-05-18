# /components

React components for NomadReady, grouped by concern.

```
components/
├── ui/                shadcn/ui primitives (42 files — regenerate, don't hand-edit)
├── ready/             Travel guide section components (rendered by DestinationPage)
│   ├── VisaSection
│   ├── BudgetSection
│   ├── InsuranceSection
│   ├── BestSeasonSection
│   ├── TravelScoreSection
│   ├── ChecklistSection
│   ├── PhrasesSection
│   ├── TransportSection
│   ├── AppsSection
│   ├── EmergencySection
│   ├── NomadRealitySection
│   ├── RealTravelNotesSection
│   ├── ScamsSection
│   ├── LocalGemsSection
│   ├── RemoteWorkSection
│   └── RemoteWorkZonesGuide
├── home/              Landing page (PassportGatewayHero, DestinationPicker, AtlasMapSection…)
├── motion/            High-level animated UI (GlobeMap, TravelNetwork, WordReveal…)
├── motion-primitives/ Low-level animation wrappers (in-view, magnetic, carousel…)
├── core/              animated-number primitive
├── shared/            MapDecorations (SVG water/park overlays for city maps)
└── (root)             App-wide components:
                         ProfileProvider   — traveller profile context + localStorage
                         PassportSelector  — home page passport picker
                         DestinationCard   — destination grid card
                         ComparisonStrip   — side-by-side destination comparison
                         InsightsPanel     — profile-driven insight callouts
                         TripPlanner       — budget/day planner widget
                         CustomCursor      — custom SVG cursor
```

See `src/lib/types.ts` for the data interfaces each section component consumes.
See `CLAUDE.md` at the app root for full project context.
