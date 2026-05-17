# /data

This folder holds all static JSON data for NomadReady.

## Structure (added in Step 2)

```
data/
├── passports.json          # List of supported passports
├── destinations.json       # List of supported destinations
└── ready/
    ├── fr-thailand.json
    ├── fr-malaysia.json
    ├── fr-indonesia.json
    ├── fr-georgia.json
    └── fr-turkey.json
```

Each `fr-[destination].json` file contains the full travel readiness
data for a French passport holder travelling to that destination.
