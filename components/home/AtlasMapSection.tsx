"use client";

import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const GEO_URL = "/assets/maps/countries-110m.json";

const W = 800;
const H = 400;
const FX = 100; // left / right fade — ~12.5% of width
const FY = 108; // top  / bottom fade — ~27% of height

interface AtlasMapSectionProps {
  destinationCount: number;
}

// Absolute background layer — parent section must have position:relative + overflow:hidden.
// pointerEvents:none — all content above remains fully interactive.
// Paper grain is NOT duplicated here; AmbientLayer handles it at page level.
export function AtlasMapSection({ destinationCount: _d }: AtlasMapSectionProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* Atlas surface light drift — warm radial, simulates sunlight on terrain */}
      <div className="atlas-light-drift" aria-hidden="true" style={{ zIndex: 1 }} />

      {/* Atlas shadow drift — anti-phase to light (−31 s = half cycle offset).
          When light moves upper-right, shadow pools lower-left. Together they
          create convincing directional lighting on the embossed relief surface. */}
      <div className="atlas-shadow-drift" aria-hidden="true" style={{ zIndex: 1 }} />

      {/* Map — oversized (108% wide) and vertically centred.
          .atlas-breath applies the slow opacity breathing animation (14s cycle).
          Parent overflow:hidden clips the horizontal bleed cleanly.            */}
      <div
        className="atlas-breath"
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "108%",
          left: "-4%",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 168, center: [20, 10] }}
          width={W}
          height={H}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <defs>
            {/* ── Edge-fade gradients for SVG mask ─────────────────────────
                gradientUnits="objectBoundingBox" (SVG default) — gradient
                fills each fade rect proportionally, independent of px size. */}
            <linearGradient id="atl-fl" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="black" stopOpacity="1" />
              <stop offset="100%" stopColor="black" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="atl-fr" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="black" stopOpacity="0" />
              <stop offset="100%" stopColor="black" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="atl-ft" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="black" stopOpacity="1" />
              <stop offset="100%" stopColor="black" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="atl-fb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="black" stopOpacity="0" />
              <stop offset="100%" stopColor="black" stopOpacity="1" />
            </linearGradient>

            {/* ── SVG edge-fade mask ────────────────────────────────────── */}
            <mask id="atl-mask">
              <rect width={W} height={H} fill="white" />
              <rect x={0}      y={0}      width={FX} height={H}  fill="url(#atl-fl)" />
              <rect x={W - FX} y={0}      width={FX} height={H}  fill="url(#atl-fr)" />
              <rect x={0}      y={0}      width={W}  height={FY} fill="url(#atl-ft)" />
              <rect x={0}      y={H - FY} width={W}  height={FY} fill="url(#atl-fb)" />
            </mask>

            {/* ── Embossed relief filter ────────────────────────────────────
                Applied to the whole land group — effect fires only at
                coastlines, treating land as one continuous raised surface.
                Light source: upper-left. Shadow: lower-right.               */}
            <filter
              id="atl-relief"
              x="-5%"
              y="-5%"
              width="110%"
              height="110%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />

              <feOffset dx="-2" dy="-2.6" in="blur" result="hlOff" />
              <feFlood floodColor="rgba(255,250,240,0.68)" result="hlFill" />
              <feComposite in="hlFill" in2="hlOff" operator="in" result="hl" />

              <feOffset dx="2" dy="2.6" in="blur" result="shOff" />
              <feFlood floodColor="rgba(105,78,38,0.30)" result="shFill" />
              <feComposite in="shFill" in2="shOff" operator="in" result="sh" />

              <feMerge>
                <feMergeNode in="sh" />
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="hl" />
              </feMerge>
            </filter>
          </defs>

          {/* filter (emboss) → mask (dissolve at edges) */}
          <g filter="url(#atl-relief)" mask="url(#atl-mask)">
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#ede8d8"
                    stroke="rgba(148,125,85,0.36)"
                    strokeWidth={0.4}
                    style={{
                      default: { outline: "none" },
                      hover:   { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
          </g>
        </ComposableMap>
      </div>
    </div>
  );
}
