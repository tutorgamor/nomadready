import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "motion/react";
import { animate } from "animejs";
import { getT } from "@/lib/i18n";
import type { ReadyData } from "@/lib/types";

const readyFiles = import.meta.glob<ReadyData>("../data/ready/*.json", { eager: true, import: "default" });

// ─── Precise Thailand SVG path ────────────────────────────────────────────────
// ViewBox: 0 0 480 820 — hand-traced from silhouette JPEG
// NW corner → Northern border → NE → East/Laos border → SE main body →
// Gulf coast → Peninsula Gulf (east) side → Southern tip →
// Peninsula Andaman (west) side → Main body west coast → close
const TH_PATH = [
  "M 82,40",
  "C 112,22 148,12 186,18 C 222,10 258,14 292,20",
  "C 322,12 354,22 382,18 C 406,27 430,50 450,78",
  "C 460,99 462,123 453,149",
  "C 456,174 468,198 464,226",
  "C 466,255 450,283 430,308",
  "C 410,334 393,360 370,383",
  "C 347,400 320,413 293,424",
  "C 270,434 252,442 241,454",
  "C 229,468 217,487 208,509",
  "C 198,533 188,558 180,583",
  "C 170,608 161,631 152,652",
  "C 143,671 135,689 128,707",
  "C 121,723 116,737 112,751",
  "C 109,763 112,774 124,782",
  "C 138,788 158,788 176,782",
  "C 191,776 203,763 208,749",
  "C 212,733 211,717 210,700",
  "C 208,682 204,665 200,647",
  "C 196,629 192,611 188,593",
  "C 183,574 178,555 174,536",
  "C 170,517 165,498 160,479",
  "C 155,460 148,442 140,426",
  "C 130,409 116,397 100,386",
  "C 82,373 66,355 52,333",
  "C 40,309 33,283 34,256",
  "C 35,230 44,205 57,182",
  "C 70,159 82,136 88,112",
  "C 93,89 94,66 93,48 Z",
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
  { id: "mae-hong-son", label: "Mae Hong Son", x: 110, y: 82,  active: false, tagline: "Au bout du monde vert."      },
  { id: "chiang-mai",   label: "Chiang Mai",   x: 153, y: 110, active: false, tagline: "Temples et brumes du nord."  },
  { id: "ayutthaya",    label: "Ayutthaya",    x: 226, y: 342, active: false, tagline: "L'ancienne capitale royale." },
  { id: "bangkok",      label: "Bangkok",      x: 232, y: 368, active: true,  tagline: "Le chaos devient musique."   },
];

// ─── Mountain peaks (decorative, northern zone) ───────────────────────────────
// [cx, cy, size]
const PEAKS: [number, number, number][] = [
  [118, 75, 11], [140, 64, 15], [162, 57, 13], [182, 51, 11], [202, 47, 10],
  [128, 87, 9],  [152, 79, 12], [174, 71, 10],
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

            {/* Gulf teal coastal glow */}
            <radialGradient id="th-gulf" cx="85%" cy="55%" r="40%">
              <stop offset="0%"   stopColor="#0e4a5a" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0e4a5a" stopOpacity="0"   />
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

          {/* ── Northern highlands overlay (top 28% of land) ── */}
          <rect clipPath="url(#th-land-clip)" x="30" y="30" width="420" height="240"
            fill="url(#th-north-fade)" />

          {/* ── Northern highland hatch (forest density) ── */}
          <rect clipPath="url(#th-land-clip)" x="30" y="30" width="230" height="200"
            fill="url(#th-hatch)" />

          {/* ── Gulf coast teal hint ── */}
          <path d={TH_PATH} fill="url(#th-gulf)" />

          {/* ── Central plains warm ellipse ── */}
          <ellipse clipPath="url(#th-land-clip)"
            cx="225" cy="340" rx="185" ry="95"
            fill="rgba(100,140,65,0.09)" />

          {/* ── Peninsula subtle differentiation ── */}
          <rect clipPath="url(#th-land-clip)" x="80" y="410" width="280" height="420"
            fill="rgba(20,55,40,0.12)" />

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

          {/* ── Road: Mae Hong Son → Chiang Mai ── */}
          <path className="th-road"
            d="M 110,82 C 124,87 138,97 153,110"
            fill="none" stroke="rgba(195,175,125,0.38)" strokeWidth="1.3"
            strokeLinecap="round" strokeDasharray="3,6"
          />

          {/* ── Road: Chiang Mai → Ayutthaya / Bangkok (Hwy 1) ── */}
          <path className="th-road"
            d="M 153,110 C 172,172 196,258 224,335 C 227,347 230,358 232,368"
            fill="none" stroke="rgba(195,175,125,0.32)" strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* ── Road: Ayutthaya loop ── */}
          <path className="th-road"
            d="M 226,342 C 228,352 230,360 232,368"
            fill="none" stroke="rgba(195,175,125,0.4)" strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* ── Chao Phraya River (animates after roads) ── */}
          <path id="th-river"
            d="M 192,290 C 206,318 218,348 228,382 C 232,398 235,415 238,435"
            fill="none" stroke="rgba(90,175,215,0.4)" strokeWidth="1.8"
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
          {/* Gulf of Thailand — east of peninsula, rotated */}
          <g transform="translate(415,530) rotate(90)" opacity="0.28">
            <text textAnchor="middle" fontSize="7.5" fontWeight="600"
              fill="rgba(140,210,240,1)" letterSpacing="0.22em"
              style={{ textTransform: "uppercase" } as React.CSSProperties}>
              GULF OF THAILAND
            </text>
          </g>
          {/* Andaman Sea — west of peninsula */}
          <g transform="translate(22,610) rotate(90)" opacity="0.25">
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

          {/* ── Compass rose ── */}
          <g transform="translate(428,58)" opacity="0.52">
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
