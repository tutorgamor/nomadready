// components/WorldMapScene.tsx
// Phase 6 — Editorial World Map Scene
// SVG + CSS only · no external libraries · prefers-reduced-motion aware
// Server component — no interactivity, pure projection math + CSS keyframes

interface DestinationPin {
  id: string;
  label: string;
  emoji: string;
}

interface WorldMapSceneProps {
  destinations: DestinationPin[];
}

// ── Equirectangular projection ─────────────────────────────────
// ViewBox 0 0 860 400
// Longitude: -20 → 175 (195° span)
// Latitude:   72 → -52 (124° span)
function px(lon: number, lat: number): [number, number] {
  return [
    Math.round(((lon + 20) / 195) * 860),
    Math.round(((72 - lat) / 124) * 400),
  ];
}

// ── Geographic coordinates per destination ──────────────────────
const DEST_GEO: Record<string, [number, number]> = {
  'thailand':    [101,  14],
  'malaysia':    [102,   3],
  'indonesia':   [115,  -8],
  'georgia':     [ 45,  42],
  'turkey':      [ 29,  41],
  'vietnam':     [106,  16],
  'philippines': [121,  14],
  'japan':       [140,  36],
  'south-korea': [127,  37],
};

// Route drawn west→east; long gaps (>220 SVG units) become pen-lifts (M not L)
const ROUTE_ORDER = [
  'georgia', 'turkey', 'vietnam', 'thailand',
  'malaysia', 'indonesia', 'philippines', 'south-korea', 'japan',
];

function buildRoutePath(activeIds: Set<string>): string {
  const MAX_DIST_SQ = 220 * 220;
  const pts = ROUTE_ORDER
    .filter((id) => DEST_GEO[id] && activeIds.has(id))
    .map((id) => { const [lon, lat] = DEST_GEO[id]; return { id, ...{ x: px(lon, lat)[0], y: px(lon, lat)[1] } }; });

  if (pts.length < 2) return '';
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const distSq = (curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2;
    d += distSq < MAX_DIST_SQ ? ` L ${curr.x},${curr.y}` : ` M ${curr.x},${curr.y}`;
  }
  return d;
}

// ── Equator y-position ─────────────────────────────────────────
const [, EQUATOR_Y] = px(0, 0);

export function WorldMapScene({ destinations }: WorldMapSceneProps) {
  const activeIds = new Set(destinations.map((d) => d.id));
  const routeD = buildRoutePath(activeIds);

  const markers = Object.entries(DEST_GEO)
    .filter(([id]) => activeIds.has(id))
    .map(([id, [lon, lat]], i) => {
      const [x, y] = px(lon, lat);
      const dest = destinations.find((d) => d.id === id)!;
      return { id, x, y, label: dest.label, i };
    });

  return (
    <section className="wms-section" aria-hidden="true">
      <div className="page-container">

        {/* Section label — matches .section-label-editorial pattern */}
        <p className="section-label-editorial wms-label">
          <span style={{ color: 'var(--accent)', opacity: 0.55 }} aria-hidden="true">◈</span>
          Destinations on the map
        </p>

        {/* Map stage */}
        <div className="wms-stage">
          <svg
            viewBox="0 0 860 400"
            preserveAspectRatio="xMidYMid slice"
            className="wms-svg"
          >
            <defs>
              {/* Ocean: soft warm sea */}
              <linearGradient id="wms-ocean" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#c8dfe9" />
                <stop offset="100%" stopColor="#b8d0de" />
              </linearGradient>

              {/* Land: warm parchment */}
              <linearGradient id="wms-land" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="#edddc0" />
                <stop offset="100%" stopColor="#dfc9a2" />
              </linearGradient>

              {/* Vignette: subtle depth framing */}
              <radialGradient id="wms-vignette" cx="50%" cy="50%" r="68%">
                <stop offset="0%"   stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(80,50,15,0.14)" />
              </radialGradient>

              <style>{`
                /* Route draw-in */
                .wms-route {
                  stroke-dasharray: 1800;
                  stroke-dashoffset: 1800;
                  animation: wms-draw 3.2s cubic-bezier(0.16,1,0.3,1) 0.5s forwards;
                }
                @keyframes wms-draw {
                  to { stroke-dashoffset: 0; }
                }

                /* Pin scale-in */
                .wms-pin {
                  transform-box: fill-box;
                  transform-origin: center;
                  animation: wms-pin-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
                }
                @keyframes wms-pin-in {
                  from { opacity: 0; transform: scale(0.1); }
                  to   { opacity: 1; transform: scale(1);   }
                }

                /* Ambient pulse ring */
                .wms-pulse {
                  transform-box: fill-box;
                  transform-origin: center;
                  animation: wms-pulse 2.8s ease-out infinite;
                }
                @keyframes wms-pulse {
                  0%   { opacity: 0.55; transform: scale(1);   }
                  70%  { opacity: 0;    transform: scale(2.8); }
                  100% { opacity: 0;    transform: scale(2.8); }
                }

                /* Reduced-motion: disable all map animations */
                @media (prefers-reduced-motion: reduce) {
                  .wms-route { animation: none; stroke-dashoffset: 0; }
                  .wms-pin   { animation: none; opacity: 1; transform: none; }
                  .wms-pulse { animation: none; opacity: 0; }
                }
              `}</style>
            </defs>

            {/* ── Ocean background ─────────────────────────────── */}
            <rect width="860" height="400" fill="url(#wms-ocean)" />

            {/* ── Cartographic grid — latitude & longitude ─────── */}
            <g stroke="rgba(90,60,20,0.08)" strokeWidth="0.5" fill="none">
              {[60, 45, 30, 15, 0, -15, -30, -45].map((lat) => {
                const [, y] = px(0, lat);
                return <line key={lat} x1="0" y1={y} x2="860" y2={y} />;
              })}
              {[0, 20, 40, 60, 80, 100, 120, 140, 160].map((lon) => {
                const [x] = px(lon, 0);
                return <line key={lon} x1={x} y1="0" x2={x} y2="400" />;
              })}
            </g>

            {/* ── Equator — slightly stronger dashed line ───────── */}
            <line
              x1="0" y1={EQUATOR_Y} x2="860" y2={EQUATOR_Y}
              stroke="rgba(90,60,20,0.22)"
              strokeWidth="0.75"
              strokeDasharray="4 7"
            />

            {/* ── Land masses ───────────────────────────────────── */}
            <g fill="url(#wms-land)" stroke="rgba(130,90,35,0.28)" strokeWidth="0.75" strokeLinejoin="round">

              {/* Africa */}
              <path d="
                M 66,116
                C 38,118 10,152 8,188
                C 6,218 30,252 60,278
                C 88,302 128,328 167,342
                C 198,352 228,338 255,310
                C 278,284 305,252 313,212
                C 318,188 312,170 292,154
                C 268,136 240,124 196,117
                C 158,110 96,112 66,116 Z
              " />

              {/* Europe mainland (Iberia → Scandinavia → E. Europe → Black Sea → Turkey → Med coast) */}
              <path d="
                M 48,114
                C 44,100 46,88 54,78
                C 62,68 64,56 68,46
                C 74,34 88,22 110,16
                C 130,10 152,6 178,6
                C 202,6 220,16 232,28
                C 246,42 248,58 236,70
                C 224,82 208,86 196,90
                C 182,94 174,100 182,110
                C 190,118 212,122 230,118
                C 246,114 260,108 272,112
                C 282,116 284,124 272,130
                C 256,136 224,130 196,122
                C 168,116 148,112 124,112
                C 104,112 82,114 64,116
                C 56,117 50,115 48,114 Z
              " />

              {/* Scandinavia (Norway + Sweden) */}
              <path d="
                M 120,58
                C 115,44 112,30 118,18
                C 122,8 134,2 147,4
                C 160,6 170,18 172,32
                C 174,46 165,60 155,66
                C 146,72 134,70 126,64
                C 122,61 120,58 120,58 Z
              " />

              {/* UK / Ireland (simplified island block) */}
              <path d="
                M 52,64
                C 48,54 49,42 56,36
                C 63,30 74,28 82,34
                C 90,40 92,52 87,62
                C 82,72 70,74 62,70
                C 57,67 54,65 52,64 Z
              " />

              {/* Russia / North Asia band — spans full top of map */}
              <path d="
                M 200,4 C 280,2 400,2 540,4 C 660,4 770,6 860,8
                L 860,0 L 160,0 Z
              " />

              {/* Asia main body — bulk of continent south of Russia */}
              <path d="
                M 248,18
                C 250,40 250,72 252,108
                C 268,100 294,92 330,84
                C 374,76 428,70 488,66
                C 548,62 614,58 676,56
                C 740,54 806,54 860,56
                L 860,8 C 770,6 660,4 540,4 C 400,2 280,2 200,4
                L 200,4 C 210,8 230,14 248,18 Z
              " />

              {/* Arabian peninsula */}
              <path d="
                M 252,133
                C 268,136 282,148 292,162
                C 302,176 306,194 300,208
                C 294,220 280,226 264,218
                C 248,210 238,192 234,174
                C 230,156 234,140 252,133 Z
              " />

              {/* Indian subcontinent */}
              <path d="
                M 386,128
                C 408,126 432,130 446,144
                C 462,160 464,180 458,198
                C 452,216 440,228 424,232
                C 408,236 392,228 380,214
                C 367,200 362,180 366,160
                C 370,140 376,130 386,128 Z
              " />

              {/* Indochina peninsula (Myanmar → Thailand → Vietnam south tip) */}
              <path d="
                M 530,126
                C 548,122 566,126 576,140
                C 586,154 584,172 578,188
                C 572,204 560,216 550,222
                C 540,228 534,228 532,222
                C 528,215 530,200 532,184
                C 534,165 532,146 530,126 Z
              " />

              {/* Malay peninsula (extends south from Indochina) */}
              <path d="
                M 532,222
                C 534,230 538,240 540,248
                C 542,256 540,260 535,260
                C 528,260 520,252 518,242
                C 515,232 518,223 524,220
                C 528,218 532,220 532,222 Z
              " />

              {/* Sumatra */}
              <path d="
                M 488,208
                C 504,204 522,210 534,222
                C 546,234 548,252 542,264
                C 536,276 522,280 508,272
                C 493,264 485,248 486,230
                C 486,218 486,210 488,208 Z
              " />

              {/* Borneo */}
              <path d="
                M 576,196
                C 594,192 614,200 624,216
                C 634,232 634,252 625,265
                C 616,278 600,282 585,274
                C 568,266 560,248 562,230
                C 562,214 566,200 576,196 Z
              " />

              {/* Java + Bali (elongated island chain) */}
              <path d="
                M 546,252
                C 558,248 578,248 596,254
                C 610,258 618,266 616,274
                C 614,280 600,283 582,279
                C 560,274 546,264 542,256
                C 540,252 542,252 546,252 Z
              " />

              {/* Philippines — Luzon */}
              <path d="
                M 621,166
                C 632,162 644,166 650,176
                C 656,186 655,200 647,208
                C 639,216 626,216 619,207
                C 611,198 609,184 614,174
                C 616,169 618,167 621,166 Z
              " />

              {/* Japan — Honshu */}
              <path d="
                M 697,94
                C 712,88 730,94 738,108
                C 746,122 742,140 730,148
                C 718,156 702,152 694,140
                C 686,128 685,110 697,94 Z
              " />

              {/* Korean peninsula */}
              <path d="
                M 657,106
                C 668,102 680,108 685,120
                C 690,132 686,146 676,152
                C 666,158 652,152 647,140
                C 641,128 644,114 657,106 Z
              " />

              {/* Australia — partial hint, bottom-right */}
              <path d="
                M 718,316
                C 740,308 768,312 784,328
                C 800,344 800,366 787,378
                C 774,390 754,390 737,378
                C 718,365 710,344 714,326
                C 715,320 716,318 718,316 Z
              " />

            </g>

            {/* ── Vignette overlay — editorial depth ─────────── */}
            <rect width="860" height="400" fill="url(#wms-vignette)" />

            {/* ── Route line ────────────────────────────────── */}
            {routeD && (
              <path
                d={routeD}
                fill="none"
                stroke="rgba(217,119,6,0.46)"
                strokeWidth="1.4"
                strokeDasharray="4 9"
                strokeLinecap="round"
                className="wms-route"
              />
            )}

            {/* ── Destination markers ────────────────────────── */}
            {markers.map((m) => (
              <g key={m.id}>
                {/* Ambient pulse ring */}
                <circle
                  cx={m.x} cy={m.y} r="5"
                  fill="rgba(217,119,6,0.18)"
                  stroke="rgba(217,119,6,0.52)"
                  strokeWidth="1"
                  className="wms-pulse"
                  style={{ animationDelay: `${1.2 + m.i * 0.28}s` }}
                />
                {/* Pin: outer ring + inner dot */}
                <g
                  className="wms-pin"
                  style={{ animationDelay: `${0.65 + m.i * 0.07}s` }}
                >
                  <circle
                    cx={m.x} cy={m.y} r="5"
                    fill="rgba(217,119,6,0.16)"
                    stroke="rgba(217,119,6,0.65)"
                    strokeWidth="1.25"
                  />
                  <circle cx={m.x} cy={m.y} r="2.2" fill="rgba(217,119,6,0.94)" />
                </g>
                {/* Destination label */}
                <text
                  x={m.x + 8}
                  y={m.y + 3.5}
                  fontSize="6.5"
                  fontWeight="600"
                  letterSpacing="0.04em"
                  fill="rgba(72,48,16,0.82)"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  className="wms-pin"
                  style={{ animationDelay: `${0.65 + m.i * 0.07}s` }}
                >
                  {m.label}
                </text>
              </g>
            ))}

            {/* ── Equator label ─────────────────────────────── */}
            <text
              x="4" y={EQUATOR_Y - 3}
              fontSize="5" fontWeight="600" letterSpacing="0.08em"
              fill="rgba(110,78,28,0.42)"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              EQUATOR
            </text>
          </svg>

          {/* Warm editorial paper texture overlay */}
          <div className="wms-paper" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
