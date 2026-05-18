# /data

Static JSON data for NomadReady. No backend — everything is imported at build time.

## Reference lists

| File | Type | Contents |
|---|---|---|
| `passports.json` | `Passport[]` | 10 supported passports |
| `destinations.json` | `Destination[]` | 9 destinations with travel scores |
| `thailand-map.json` | `CityMapConfig` | SVG city map config for ThailandPage |

### Passport codes

`au` `be` `ca` `de` `es` `fr` `it` `nl` `uk` `us`

### Destination slugs

`georgia` `indonesia` `japan` `malaysia` `philippines` `south-korea` `thailand` `turkey` `vietnam`

## Per-passport + per-destination guides (`ready/`)

90 files — one for every passport × destination combination:

```
ready/{passportCode}-{destination}.json
```

Examples: `fr-thailand.json`, `us-japan.json`, `de-georgia.json`

Each file matches the `ReadyData` interface in `src/lib/types.ts` and contains:
`visa` · `insurance` · `best_season` · `budget` · `useful_apps` · `transport` · `scams` · `phrases` · `emergency` · `checklist`

## Supplementary destination data (not passport-specific)

| Folder | Interface | Available destinations |
|---|---|---|
| `nomad-reality/` | `NomadRealityNote[]` | thailand |
| `notes/` | `RealTravelNote[]` | japan, philippines, south-korea, thailand, vietnam |
| `remote-work/` | `RemoteWork` | philippines, south-korea, thailand |
| `remote-work-zones/` | `RemoteWorkZonesData` | thailand |
| `places/` | `LocalGem[]` | thailand |

All interfaces are defined in `src/lib/types.ts`.
