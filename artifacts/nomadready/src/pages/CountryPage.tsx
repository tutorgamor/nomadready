import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "motion/react";
import { animate } from "animejs";
import { getT } from "@/lib/i18n";
import type { ReadyData } from "@/lib/types";

const readyFiles = import.meta.glob<ReadyData>("../data/ready/*.json", { eager: true, import: "default" });

// ─── Thailand SVG path — geographically accurate ──────────────────────────────
// ViewBox: 0 0 480 820
// Projection: x = (lon − 97.5) / 8.2 × 480   y = (20.5 − lat) / 14.9 × 820
// Clockwise from topmost point (Chiang Rai/20.5°N)
// → NE (Golden Triangle) → Laos/Mekong border → Isaan east bulge
// → Cambodia border → Gulf NE coast (going W) → Peninsula Gulf side (going S)
// → Southern tip (Malaysia) → Andaman coast (going N) → Myanmar border (going N)
// → NW corner → top border (going E back to start)
const TH_PATH = [
  "M 100,0",
  // Top border (NW → NE / Golden Triangle)
  "C 122,0 138,4 153,9",
  // Laos / Mekong border sweeping south-east
  "C 168,20 184,62 206,106",
  "C 222,148 248,168 286,178",
  "C 322,186 364,202 408,220",
  // Isaan NE — max east bulge (~105.6°E → x ≈ 476)
  "C 444,238 468,266 476,294",
  // Cambodia border, turns SW
  "C 478,308 468,328 452,344",
  "C 432,360 408,372 384,380",
  // Gulf NE shore — goes WEST toward Bangkok
  "C 352,390 312,406 274,420",
  "C 240,432 210,442 186,454",
  // Peninsula — Gulf (east) side going SOUTH
  "C 162,464 144,478 132,498",
  "C 118,518 106,540 100,558",
  // Kra Isthmus narrowest (~10.5°N)
  "C 96,574 100,594 118,616",
  // Lower peninsula Gulf coast (curves right/east as it goes south)
  "C 136,638 150,660 162,682",
  "C 172,702 186,720 196,742",
  "C 204,760 210,778 212,792",
  "C 212,804 212,814 214,820",
  // SE tip — Malaysia border going WEST
  "C 204,820 186,818 168,814",
  "C 158,810 154,804 153,798",
  // Andaman (west) coast going NORTH — x decreases toward Phuket/Krabi
  "C 142,786 126,772 110,750",
  "C 94,728 78,706 60,680",
  // Leftward jog at Krabi/Phuket (~8°N), then curves right going north
  "C 48,660 44,634 54,610",
  "C 62,586 72,560 82,534",
  "C 90,510 100,488 108,462",
  // Joins Myanmar (main body west) border — going north
  "C 116,440 120,416 118,390",
  "C 116,364 108,336 96,310",
  "C 80,284 62,256 46,228",
  // Mae Hong Son westernmost dip (~18.5°N, 97.7°E → x ≈ 12)
  "C 32,202 16,176 12,150",
  "C 8,124 10,98 16,74",
  // NW Myanmar border going east back to top
  "C 22,54 34,32 50,18",
  "C 64,8 80,2 100,0 Z",
].join(" ");

// ─── City data (4 cities only) ────────────────────────────────────────────────
interface City {
  id: string;
  label: string;
  x: number;
  y: number;
  active: boolean;
  tagline: string;
}

const CITIES: City[] = [
  // Positions from same projection: x=(lon−97.5)/8.2×480, y=(20.5−lat)/14.9×820
  { id: "mae-hong-son", label: "Mae Hong Son", x: 28,  y: 66,  active: false, tagline: "Au bout du monde vert."      },
  { id: "chiang-mai",   label: "Chiang Mai",   x: 87,  y: 94,  active: false, tagline: "Temples et brumes du nord."  },
  { id: "ayutthaya",    label: "Ayutthaya",    x: 180, y: 338, active: false, tagline: "L'ancienne capitale royale." },
  { id: "bangkok",      label: "Bangkok",      x: 176, y: 372, active: true,  tagline: "Le chaos devient musique."   },
];

// ─── Mountain peaks (decorative, NW highlands zone) ───────────────────────────
// [cx, cy, size] — positioned in NW highlands (Mae Hong Son / Doi Inthanon area)
const PEAKS: [number, number, number][] = [
  [36, 48, 10], [52, 40, 14], [68, 34, 12], [86, 28, 10], [104, 22, 9],
  [44, 62, 8],  [62, 55, 11], [80, 46, 9],
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CountryPage() {
  const { passport } = useParams<{ passport: string }>();
  const [, navigate]  = useLocation();
  const passportId    = passport ?? "fr";
  const t             = getT(passportId);
  const svgRef        = useRef<SVGSVGElement>(null);
  const [hovered,   setHovered]  = useState<string | null>(null);
  const [exiting,   setExiting]  = useState(false);
  const [exitBack,  setExitBack] = useState(false);

  const dataKey = Object.keys(readyFiles).find(k => k.endsWith(`/${passportId}-thailand.json`));
  const data    = dataKey ? readyFiles[dataKey] : null;

  const visaLabel = data?.visa?.type === "Visa Exemption" || data?.visa?.type === "Visa Free"
    ? `Exempt · ${data.visa.duration_days ?? 30}j`
    : data?.visa?.type ?? "Voir conditions";

  // ── Anime.js draw-on animations ──────────────────────────────────────────────
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const scheduleRaf = (fn: () => void, delay: number) => {
      const t = setTimeout(fn, delay);
      return () => clearTimeout(t);
    };

    // 1. Country outline draw-on
    const outline = svg.querySelector<SVGPathElement>("#th-outline");
    if (outline) {
      const len = outline.getTotalLength();
      outline.style.strokeDasharray  = `${len}`;
      outline.style.strokeDashoffset = `${len}`;
      animate(outline, { strokeDashoffset: 0, duration: 2800, ease: "inOutQuart", delay: 300 });
    }

    // 2. Roads stagger reveal
    const roads = svg.querySelectorAll<SVGPathElement>(".th-road");
    roads.forEach((road, i) => {
      const len = road.getTotalLength();
      road.style.strokeDasharray  = `${len}`;
      road.style.strokeDashoffset = `${len}`;
      animate(road, { strokeDashoffset: 0, duration: 900, ease: "inOutCubic", delay: 2100 + i * 220 });
    });

    // 3. River draw-in
    const river = svg.querySelector<SVGPathElement>("#th-river");
    if (river) {
      const len = river.getTotalLength();
      river.style.strokeDasharray  = `${len}`;
      river.style.strokeDashoffset = `${len}`;
      animate(river, { strokeDashoffset: 0, duration: 1100, ease: "inOutCubic", delay: 2400 });
    }

    return () => {};
  }, []);

  const goToCity = useCallback((city: City) => {
    if (!city.active || exiting || exitBack) return;
    setExiting(true);
    setTimeout(() => navigate(`/ready/${passportId}/thailand/${city.id}`), 560);
  }, [exiting, exitBack, navigate, passportId]);

  const goBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (exiting || exitBack) return;
    setExitBack(true);
    setTimeout(() => navigate(`/?passport=${passportId}&skip_gateway=1`), 600);
  }, [exiting, exitBack, navigate, passportId]);

  const hoveredCity = CITIES.find(c => c.id === hovered) ?? null;

  return (
    <main style={{ position: "relative", width: "100vw", height: "100dvh", overflow: "hidden", background: "#030c07" }}>

      {/* ── Transition overlays ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {exitBack && (
          <motion.div key="cp-back"
            initial={{ y: "-100%" }} animate={{ y: "0%" }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            style={{ position: "fixed", inset: 0, background: "linear-gradient(180deg,#0a0800,#1a0e02 55%,#0d0900)", zIndex: 9999, pointerEvents: "none" }}
          />
        )}
        {exiting && (
          <motion.div key="cp-fwd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.42 }}
            style={{ position: "fixed", inset: 0, background: "#030c07", zIndex: 9999, pointerEvents: "none" }}
          />
        )}
      </AnimatePresence>

      {/* ── Tactical grid ────────────────────────────────────────────────────────── */}
      <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.028, pointerEvents: "none" }}>
        <defs>
          <pattern id="cp-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#4af098" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cp-grid)" />
      </svg>

      {/* ── Atmospheric radial glow (center-right where map sits) ─────────────── */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse 55% 70% at 68% 52%, rgba(30,80,50,0.18) 0%, transparent 70%)",
      }} />

      {/* ── Vignette ──────────────────────────────────────────────────────────── */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "radial-gradient(ellipse 85% 85% at 62% 50%, transparent 22%, rgba(0,0,0,0.72) 100%)",
      }} />

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.5 }}
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 1.5rem", zIndex: 20,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "linear-gradient(to bottom, rgba(3,12,7,0.96) 0%, transparent 100%)",
        }}
      >
        <motion.a
          href={`/?passport=${passportId}&skip_gateway=1`}
          onClick={goBack}
          className="th-back-link"
          animate={exitBack ? { opacity: 0, y: -6 } : {}}
          transition={{ duration: 0.18 }}
        >
          ← {t.backToAtlas}
        </motion.a>
        <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em", color: "rgba(217,119,6,0.7)", textTransform: "uppercase" }}>
          THAILAND · SOUTHEAST ASIA
        </span>
      </motion.header>

      {/* ── Left info panel ───────────────────────────────────────────────────── */}
      <motion.div
        className="cp-sidebar"
        initial={{ opacity: 0, x: -22 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "absolute", left: "3.5rem", top: "50%", transform: "translateY(-52%)", zIndex: 10, maxWidth: 240 }}
      >
        <p className="th-eyebrow th-eyebrow--amber" style={{ marginBottom: "0.55rem" }}>FIELD GUIDE</p>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 2.6vw, 2.6rem)",
          lineHeight: 1.1, color: "#fff", fontStyle: "italic", marginBottom: "0.85rem",
        }}>
          La&nbsp;Thaïlande<br />se&nbsp;mérite.
        </h1>
        <p style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.72, marginBottom: "1.35rem" }}>
          Du chaos de Bangkok<br />aux brumes du Nord.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.44rem" }}>
          {[
            { label: "VISA",   value: visaLabel },
            { label: "DEVISE", value: "฿ Baht"  },
            { label: "FUSEAU", value: "UTC +7"  },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", gap: "0.7rem", alignItems: "baseline" }}>
              <span style={{ fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.15em", color: "rgba(217,119,6,0.58)", textTransform: "uppercase", width: 42, flexShrink: 0 }}>
                {s.label}
              </span>
              <span style={{ fontSize: "0.74rem", fontWeight: 500, color: "rgba(255,255,255,0.80)" }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1.15rem", paddingTop: "0.85rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ fontSize: "0.54rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            1 guide disponible · 3 à venir
          </p>
        </div>

        {/* Scroll hint — click a city */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 3.2, duration: 0.8 }}
          style={{ marginTop: "2rem", fontSize: "0.58rem", color: "rgba(255,255,255,0.22)", letterSpacing: "0.08em" }}
        >
          Cliquer une ville pour explorer →
        </motion.p>
      </motion.div>

      {/* ── Map ───────────────────────────────────────────────────────────────── */}
      <div
        className="cp-map-wrap"
        style={{ position: "absolute", inset: 0, paddingTop: 56, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: "28%", zIndex: 5 }}
      >
        <motion.svg
          ref={svgRef}
          viewBox="0 0 480 820"
          aria-label="Carte interactive de la Thaïlande"
          style={{ height: "88vh", maxHeight: 720, width: "auto", overflow: "visible", filter: "drop-shadow(0 28px 56px rgba(0,0,0,0.88))" }}
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <defs>
            {/* Land vertical gradient — deep forest green */}
            <linearGradient id="th-land" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#2e5c3f" />
              <stop offset="30%"  stopColor="#244e36" />
              <stop offset="65%"  stopColor="#1f4530" />
              <stop offset="100%" stopColor="#1b3d2b" />
            </linearGradient>

            {/* Northern highlands darker overlay */}
            <linearGradient id="th-north-fade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#193828" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#193828" stopOpacity="0"    />
            </linearGradient>

            {/* Gulf teal coastal glow — radiates from Isaan/SE corner (east side) */}
            <radialGradient id="th-gulf" cx="92%" cy="48%" r="50%">
              <stop offset="0%"   stopColor="#0e4a5a" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0e4a5a" stopOpacity="0"    />
            </radialGradient>

            {/* Ocean bg gradient */}
            <linearGradient id="th-ocean" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#04141e" />
              <stop offset="100%" stopColor="#020e0a" />
            </linearGradient>

            {/* Pin glow filter (small) */}
            <filter id="f-glow-sm" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
            {/* Pin glow filter (large / hovered) */}
            <filter id="f-glow-lg" x="-150%" y="-150%" width="400%" height="400%">
              <feGaussianBlur stdDeviation="8" />
            </filter>

            {/* Clip to Thailand land */}
            <clipPath id="th-land-clip">
              <path d={TH_PATH} />
            </clipPath>

            {/* Dot texture for terrain feeling */}
            <pattern id="th-terrain-dots" width="9" height="9" patternUnits="userSpaceOnUse">
              <circle cx="4.5" cy="4.5" r="0.55" fill="rgba(255,255,255,0.055)" />
            </pattern>

            {/* Northern hatch pattern */}
            <pattern id="th-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="7" stroke="rgba(60,100,70,0.18)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* ── Ocean / sea background ── */}
          <rect x="-60" y="-40" width="600" height="920" fill="url(#th-ocean)" />

          {/* Subtle sea shimmer lines */}
          {[120, 200, 310, 440, 560, 680].map((y, i) => (
            <line key={i} x1="-60" y1={y} x2="540" y2={y}
              stroke="rgba(30,80,100,0.07)" strokeWidth="0.8" />
          ))}

          {/* ── Land depth shadow ── */}
          <path d={TH_PATH} transform="translate(11,15)" fill="rgba(0,0,0,0.5)" />

          {/* ── Land base fill ── */}
          <path d={TH_PATH} fill="url(#th-land)" />

          {/* ── Terrain dot texture ── */}
          <path d={TH_PATH} fill="url(#th-terrain-dots)" />

          {/* ── Northern highlands overlay (NW high terrain) ── */}
          <rect clipPath="url(#th-land-clip)" x="0" y="0" width="200" height="220"
            fill="url(#th-north-fade)" />

          {/* ── Northern highland hatch (forest density, NW only) ── */}
          <rect clipPath="url(#th-land-clip)" x="0" y="0" width="160" height="195"
            fill="url(#th-hatch)" />

          {/* ── Isaan plateau — subtle dry/warm differentiation ── */}
          <rect clipPath="url(#th-land-clip)" x="155" y="0" width="330" height="420"
            fill="rgba(160,185,100,0.045)" />

          {/* ── Gulf coast teal hint ── */}
          <path d={TH_PATH} fill="url(#th-gulf)" />

          {/* ── Central plains warm ellipse (Chao Phraya basin) ── */}
          <ellipse clipPath="url(#th-land-clip)"
            cx="170" cy="350" rx="140" ry="88"
            fill="rgba(100,140,65,0.08)" />

          {/* ── Peninsula subtle differentiation ── */}
          <rect clipPath="url(#th-land-clip)" x="0" y="440" width="300" height="400"
            fill="rgba(20,55,40,0.10)" />

          {/* ── Mountain peaks (decorative) ── */}
          {PEAKS.map(([mx, my, sz], i) => (
            <g key={i}>
              {/* Mountain shadow */}
              <polygon
                points={`${mx + 2},${my + sz * 1.3} ${mx - sz * 0.72 + 2},${my + sz * 2.1} ${mx + sz * 0.72 + 2},${my + sz * 2.1}`}
                fill="rgba(0,0,0,0.22)"
              />
              {/* Mountain body */}
              <polygon
                points={`${mx},${my} ${mx - sz * 0.72},${my + sz * 1.3} ${mx + sz * 0.72},${my + sz * 1.3}`}
                fill={`rgba(35,72,50,${0.55 + i * 0.018})`}
                stroke="rgba(110,170,130,0.22)"
                strokeWidth="0.6"
              />
              {/* Snow cap */}
              <polygon
                points={`${mx},${my} ${mx - sz * 0.24},${my + sz * 0.42} ${mx + sz * 0.24},${my + sz * 0.42}`}
                fill={`rgba(220,240,225,${0.14 - i * 0.008})`}
              />
            </g>
          ))}

          {/* ── Road: Mae Hong Son → Chiang Mai (mountain road, dashed) ── */}
          <path className="th-road"
            d="M 28,66 C 48,74 68,84 87,94"
            fill="none" stroke="rgba(195,175,125,0.38)" strokeWidth="1.3"
            strokeLinecap="round" strokeDasharray="3,6"
          />

          {/* ── Road: Chiang Mai → Bangkok via Hwy 1 (through Lampang, Nakhon Sawan) ── */}
          <path className="th-road"
            d="M 87,94 C 104,148 130,230 158,300 C 166,320 172,334 176,372"
            fill="none" stroke="rgba(195,175,125,0.32)" strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* ── Road: Ayutthaya spur ── */}
          <path className="th-road"
            d="M 180,338 C 179,351 178,362 176,372"
            fill="none" stroke="rgba(195,175,125,0.4)" strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* ── Chao Phraya River (animates after roads) ── */}
          <path id="th-river"
            d="M 148,255 C 155,285 162,318 170,352 C 173,362 174,368 176,372"
            fill="none" stroke="rgba(90,175,215,0.42)" strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* ── Country outline stroke (animated draw-on) ── */}
          <path id="th-outline"
            d={TH_PATH}
            fill="none"
            stroke="rgba(130,195,150,0.52)"
            strokeWidth="1.3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* ── City pins ── */}
          {CITIES.map((city, i) => (
            <CityPin
              key={city.id}
              city={city}
              index={i}
              isHovered={hovered === city.id}
              onHover={() => setHovered(city.id)}
              onLeave={() => setHovered(null)}
              onClick={() => goToCity(city)}
            />
          ))}

          {/* ── Sea labels ── */}
          {/* Gulf of Thailand — right of peninsula (ocean area x>220, y~580) */}
          <g transform="translate(388,585) rotate(90)" opacity="0.27">
            <text textAnchor="middle" fontSize="7.5" fontWeight="600"
              fill="rgba(140,210,240,1)" letterSpacing="0.22em"
              style={{ textTransform: "uppercase" } as React.CSSProperties}>
              GULF OF THAILAND
            </text>
          </g>
          {/* Andaman Sea — left of peninsula (ocean area x<40, y~640) */}
          <g transform="translate(14,634) rotate(90)" opacity="0.24">
            <text textAnchor="middle" fontSize="7.5" fontWeight="600"
              fill="rgba(140,210,240,1)" letterSpacing="0.22em"
              style={{ textTransform: "uppercase" } as React.CSSProperties}>
              ANDAMAN SEA
            </text>
          </g>

          {/* ── Subtle ocean depth lines (latitude hints) ── */}
          {[160, 290, 440, 590, 710].map((y, i) => (
            <line key={`lat-${i}`} x1="-60" y1={y} x2="540" y2={y}
              stroke="rgba(40,90,120,0.055)" strokeWidth="0.6" />
          ))}

          {/* ── Frame border on ocean bg ── */}
          <rect x="-60" y="-40" width="600" height="920"
            fill="none" stroke="rgba(40,100,130,0.12)" strokeWidth="1" />

          {/* ── Compass rose — top-right ocean area (east of Isaan) ── */}
          <g transform="translate(452,42)" opacity="0.52">
            <circle cx="0" cy="0" r="15" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="2.5" fill="rgba(255,255,255,0.3)" />
            <polygon points="0,-13 -3,-4 3,-4"  fill="rgba(255,255,255,0.72)" />
            <polygon points="0,13 -3,4 3,4"     fill="rgba(255,255,255,0.22)" />
            <polygon points="-13,0 -4,-3 -4,3"  fill="rgba(255,255,255,0.22)" />
            <polygon points="13,0 4,-3 4,3"     fill="rgba(255,255,255,0.22)" />
            <text x="0" y="-20" textAnchor="middle" fontSize="5.5" fontWeight="700"
              fill="rgba(255,255,255,0.55)" letterSpacing="0.12em">N</text>
          </g>

          {/* ── Scale bar ── */}
          <g transform="translate(72,803)">
            <rect x="-2" y="-8" width="102" height="16" rx="3" fill="rgba(0,0,0,0.35)" />
            <line x1="0" y1="0" x2="84" y2="0" stroke="rgba(255,255,255,0.38)" strokeWidth="1" />
            <line x1="0"  y1="-3.5" x2="0"  y2="3.5" stroke="rgba(255,255,255,0.38)" strokeWidth="1" />
            <line x1="84" y1="-3.5" x2="84" y2="3.5" stroke="rgba(255,255,255,0.38)" strokeWidth="1" />
            <text x="42" y="-6" textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.38)" letterSpacing="0.09em">500 KM</text>
          </g>

        </motion.svg>
      </div>

      {/* ── Hover city card ────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {hoveredCity && (
          <motion.div
            key={hoveredCity.id}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            style={{
              position: "fixed", bottom: "2rem", right: "2.5rem", zIndex: 30,
              background: "rgba(3,14,8,0.94)", backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
              border: `1px solid ${hoveredCity.active ? "rgba(217,119,6,0.32)" : "rgba(85,140,100,0.2)"}`,
              borderRadius: 14, padding: "1.05rem 1.25rem", minWidth: 205, maxWidth: 250, pointerEvents: "none",
            }}
          >
            <p style={{ fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.2em", color: "rgba(217,119,6,0.72)", textTransform: "uppercase", marginBottom: "0.22rem" }}>
              VILLE · THAÏLANDE
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", fontStyle: "italic", color: "#fff", lineHeight: 1.15, marginBottom: "0.3rem" }}>
              {hoveredCity.label}
            </h3>
            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.48)", lineHeight: 1.6, marginBottom: "0.7rem" }}>
              {hoveredCity.tagline}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: hoveredCity.active ? "rgba(217,119,6,1)" : "rgba(80,130,90,0.6)" }} />
              <span style={{ fontSize: "0.57rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: hoveredCity.active ? "rgba(217,119,6,0.88)" : "rgba(255,255,255,0.32)" }}>
                {hoveredCity.active ? "Guide disponible — cliquer" : "Bientôt disponible"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}

// ─── City pin subcomponent ────────────────────────────────────────────────────

function CityPin({ city, index, isHovered, onHover, onLeave, onClick }: {
  city: City;
  index: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const poleH  = 22;
  const dotY   = city.y - poleH;
  const amber  = "#D97706";
  const muted  = "rgba(105,165,120,0.82)";
  const hot    = "#FFD24B";
  const dotFill = isHovered ? hot : (city.active ? amber : muted);
  const pulseDelay = `${index * 0.42}s`;

  return (
    <g
      style={{ cursor: city.active ? "pointer" : "default" }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      role={city.active ? "button" : "presentation"}
      aria-label={city.label}
    >
      {/* Enlarged invisible hit area */}
      <circle cx={city.x} cy={city.y - poleH / 2} r={22} fill="transparent" />

      {/* Ground shadow */}
      <ellipse cx={city.x + 2.5} cy={city.y + 3} rx={6.5} ry={2.5} fill="rgba(0,0,0,0.4)" />

      {/* Pole */}
      <line
        x1={city.x} y1={city.y}
        x2={city.x} y2={dotY + 2.5}
        stroke={isHovered
          ? "rgba(255,200,75,0.92)"
          : (city.active ? "rgba(217,119,6,0.72)" : "rgba(105,165,120,0.52)")}
        strokeWidth={isHovered ? 2 : 1.5}
        strokeLinecap="round"
      />

      {/* Glow halo (blurred circle below core dot) */}
      <circle
        cx={city.x} cy={dotY}
        r={isHovered ? 11 : 7}
        fill={isHovered
          ? "rgba(255,180,35,0.38)"
          : (city.active ? "rgba(217,119,6,0.26)" : "rgba(105,165,120,0.18)")}
        filter={isHovered ? "url(#f-glow-lg)" : "url(#f-glow-sm)"}
      />

      {/* Animated pulse ring — SMIL (reliable in SVG, no delay issue) */}
      {city.active && (
        <circle cx={city.x} cy={dotY} r={6} fill="none"
          stroke={isHovered ? "rgba(255,200,75,0.68)" : "rgba(217,119,6,0.48)"}
          strokeWidth={1.2}
        >
          <animate attributeName="r"       values="6;17;6"    dur="2.9s" begin={pulseDelay} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.75;0;0.75" dur="2.9s" begin={pulseDelay} repeatCount="indefinite" />
        </circle>
      )}

      {/* Core dot */}
      <circle
        cx={city.x} cy={dotY}
        r={isHovered ? 6.2 : 4.6}
        fill={dotFill}
        stroke={isHovered ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.22)"}
        strokeWidth={isHovered ? 1.6 : 0.9}
      />

      {/* City label */}
      <text
        x={city.x + 11}
        y={dotY + 2.5}
        fontSize={isHovered ? 8.2 : 7.2}
        fontWeight="600"
        fill={isHovered ? "rgba(255,222,95,1)" : "rgba(255,255,255,0.78)"}
        letterSpacing="0.06em"
        style={{ textTransform: "uppercase", userSelect: "none", pointerEvents: "none" }}
      >
        {city.label}
      </text>

      {/* GUIDE badge pill (Bangkok only) */}
      {city.active && (
        <g transform={`translate(${city.x + 9},${dotY - 9})`}>
          <rect x={0} y={-6} width={22} height={8.5} rx={4.2}
            fill={isHovered ? "rgba(255,180,35,0.96)" : "rgba(217,119,6,0.9)"} />
          <text x={11} y={0.5} textAnchor="middle" fontSize={4} fontWeight="700"
            fill="rgba(0,0,0,0.76)" letterSpacing="0.07em">
            GUIDE
          </text>
        </g>
      )}
    </g>
  );
}
