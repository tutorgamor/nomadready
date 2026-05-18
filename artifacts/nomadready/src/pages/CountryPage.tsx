import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "motion/react";
import { animate } from "animejs";
import { getT } from "@/lib/i18n";
import type { ReadyData } from "@/lib/types";
import mapData from "../data/thailand-map.json";

const readyFiles = import.meta.glob<ReadyData>("../data/ready/*.json", { eager: true, import: "default" });

// ─── Thailand SVG paths — derived from real GeoJSON province data ─────────────
// Source: thailand-provinces.geojson (78 provinces, Mercator projection)
// Projection: geoMercator().fitSize([480,820]) — scale=2919.66
// Pre-computed via Python RDP simplification (tolerance=0.018°) + Mercator
// projection. N tip y=20.5, S tip y=799.5, W x=28.7, E x=451.3.
const TH_PATH = mapData.combined;

interface City {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: "city" | "island";
  active: boolean;
  tagline: string;
  region: string;
  desc: string;
  hasGuide?: boolean;
}

// Coordinates derived from Mercator projection of real lat/lon (see thailand-map.json)
const CITIES: City[] = [
  {
    id: "chiang-mai", label: "Chiang Mai", x: 112, y: 111, kind: "city",
    active: true, region: "Nord", tagline: "Temples et brumes du Nord.",
    desc: "Capitale culturelle du Nord. Marchés de nuit animés, temples dorés dans la jungle, trekking vers les villages montagnards. Base idéale pour le Triangle d'Or et les rizières en terrasses de Chiang Rai.",
  },
  {
    id: "kanchanaburi", label: "Kanchanaburi", x: 140, y: 365, kind: "city",
    active: true, region: "Centre-Ouest", tagline: "Rivières et mémoire.",
    desc: "Le Pont de la Rivière Kwaï, les chutes de l'Erawan aux sept bassins émeraude, forêts denses et temples perchés. Cimetières de guerre poignants — histoire de la Ligne de Chemin de Fer de la Mort.",
  },
  {
    id: "ayutthaya", label: "Ayutthaya", x: 193, y: 347, kind: "city",
    active: true, region: "Centre", tagline: "L'ancienne capitale royale.",
    desc: "Ancienne capitale du royaume de Siam, classée au Patrimoine Mondial de l'UNESCO. Têtes de Bouddha enchâssées dans les racines de figuiers banians, stupas de briques rouges. À 80 km de Bangkok.",
  },
  {
    id: "bangkok", label: "Bangkok", x: 190, y: 378, kind: "city",
    active: true, hasGuide: true, region: "Centre", tagline: "Le chaos devient musique.",
    desc: "Mégapole en perpétuel mouvement. Street food d'exception, temples dorés, marchés flottants, rooftops vertigineux. Hub incontournable du voyage en Asie du Sud-Est — le point de départ de tout.",
  },
  {
    id: "koh-chang", label: "Koh Chang", x: 283, y: 465, kind: "island",
    active: true, region: "Golfe de Thaïlande", tagline: "La grande île sauvage.",
    desc: "Deuxième plus grande île de Thaïlande. Jungle quasi-impénétrable descendant jusqu'aux plages larges, cascades cachées, eaux calmes du Golfe. Bien moins touristique que les îles du Sud.",
  },
  {
    id: "koh-kut", label: "Koh Kut", x: 295, y: 489, kind: "island",
    active: true, region: "Golfe de Thaïlande", tagline: "L'île la plus vierge.",
    desc: "Île la plus reculée de l'archipel de Koh Chang. Plages absolument immaculées, forêts primaires intactes, eaux turquoise d'une limpidité rare. Tourisme ultra-confidentiel, luxe naturel sans hôtels de chaîne.",
  },
  {
    id: "koh-tao", label: "Koh Tao", x: 156, y: 569, kind: "island",
    active: true, region: "Golfe de Thaïlande", tagline: "Paradis mondial de la plongée.",
    desc: "L'un des sites de plongée les plus accessibles d'Asie. Certifications PADI parmi les moins chères au monde, récifs coralliens vivants, requins baleines saisonniers. Snorkeling en accès direct depuis la plage.",
  },
];

const PEAKS = mapData.peakCoords as [number, number, number][];

export default function CountryPage() {
  const { passport } = useParams<{ passport: string }>();
  const [, navigate]    = useLocation();
  const passportId      = passport ?? "fr";
  const t               = getT(passportId);
  const svgRef          = useRef<SVGSVGElement>(null);
  const [hovered,     setHovered]     = useState<string | null>(null);
  const [activeCity,  setActiveCity]  = useState<City | null>(null);
  const [exiting,     setExiting]     = useState(false);
  const [exitBack,    setExitBack]    = useState(false);

  const dataKey  = Object.keys(readyFiles).find(k => k.endsWith(`/${passportId}-thailand.json`));
  const data     = dataKey ? readyFiles[dataKey] : null;
  const visaLabel = data?.visa?.type === "Visa Exemption" || data?.visa?.type === "Visa Free"
    ? `Exempt · ${data.visa.duration_days ?? 30}j`
    : data?.visa?.type ?? "Voir conditions";

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const outline = svg.querySelector<SVGPathElement>("#th-outline");
    if (outline) {
      const len = outline.getTotalLength();
      outline.style.strokeDasharray  = `${len}`;
      outline.style.strokeDashoffset = `${len}`;
      animate(outline, { strokeDashoffset: 0, duration: 3200, ease: "inOutQuart", delay: 300 });
    }
    const roads = svg.querySelectorAll<SVGPathElement>(".th-road");
    roads.forEach((road, i) => {
      const len = road.getTotalLength();
      road.style.strokeDasharray  = `${len}`;
      road.style.strokeDashoffset = `${len}`;
      animate(road, { strokeDashoffset: 0, duration: 900, ease: "inOutCubic", delay: 2200 + i * 200 });
    });
    const river = svg.querySelector<SVGPathElement>("#th-river");
    if (river) {
      const len = river.getTotalLength();
      river.style.strokeDasharray  = `${len}`;
      river.style.strokeDashoffset = `${len}`;
      animate(river, { strokeDashoffset: 0, duration: 1100, ease: "inOutCubic", delay: 2500 });
    }
  }, []);

  const handleCityClick = useCallback((city: City) => {
    if (exiting || exitBack) return;
    setActiveCity(prev => prev?.id === city.id ? null : city);
  }, [exiting, exitBack]);

  const openBangkokGuide = useCallback(() => {
    if (exiting || exitBack) return;
    setExiting(true);
    setTimeout(() => navigate(`/ready/${passportId}/thailand/bangkok`), 560);
  }, [exiting, exitBack, navigate, passportId]);

  const goBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (exiting || exitBack) return;
    setExitBack(true);
    setTimeout(() => navigate(`/?passport=${passportId}&skip_gateway=1`), 600);
  }, [exiting, exitBack, navigate, passportId]);

  return (
    <main
      style={{ position: "relative", width: "100vw", height: "100dvh", overflow: "hidden", background: "#080609" }}
      onClick={() => setActiveCity(null)}
    >

      {/* ── Transition overlays ──────────────────────────────────────────────────── */}
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
            style={{ position: "fixed", inset: 0, background: "#080609", zIndex: 9999, pointerEvents: "none" }}
          />
        )}
      </AnimatePresence>

      {/* ── Tactical grid — warm amber ──────────────────────────────────────────── */}
      <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.02, pointerEvents: "none" }}>
        <defs>
          <pattern id="cp-grid" width="52" height="52" patternUnits="userSpaceOnUse">
            <path d="M 52 0 L 0 0 0 52" fill="none" stroke="#c49a40" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cp-grid)" />
      </svg>

      {/* ── Atmospheric glow — warm amber ────────────────────────────────────────── */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse 55% 72% at 65% 48%, rgba(90,62,18,0.16) 0%, transparent 70%)",
      }} />

      {/* ── Vignette ──────────────────────────────────────────────────────────────── */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "radial-gradient(ellipse 85% 85% at 62% 50%, transparent 22%, rgba(0,0,0,0.80) 100%)",
      }} />

      {/* ── Header ──────────────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.5 }}
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 1.5rem", zIndex: 20,
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          background: "linear-gradient(to bottom, rgba(8,6,9,0.97) 0%, transparent 100%)",
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
        <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em", color: "rgba(196,154,62,0.62)", textTransform: "uppercase" }}>
          THAILAND · SOUTHEAST ASIA
        </span>
      </motion.header>

      {/* ── Left info panel ─────────────────────────────────────────────────────── */}
      <motion.div
        className="cp-sidebar"
        initial={{ opacity: 0, x: -22 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "absolute", left: "3.5rem", top: "50%", transform: "translateY(-52%)", zIndex: 10, maxWidth: 240 }}
        onClick={e => e.stopPropagation()}
      >
        <p className="th-eyebrow th-eyebrow--amber" style={{ marginBottom: "0.55rem" }}>FIELD GUIDE</p>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 2.6vw, 2.6rem)",
          lineHeight: 1.1, color: "#fff", fontStyle: "italic", marginBottom: "0.85rem",
        }}>
          La&nbsp;Thaïlande<br />se&nbsp;mérite.
        </h1>
        <p style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.36)", lineHeight: 1.72, marginBottom: "1.35rem" }}>
          Du chaos de Bangkok<br />aux brumes du Nord.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.44rem" }}>
          {[
            { label: "VISA",   value: visaLabel },
            { label: "DEVISE", value: "฿ Baht"  },
            { label: "FUSEAU", value: "UTC +7"  },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", gap: "0.7rem", alignItems: "baseline" }}>
              <span style={{ fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.15em", color: "rgba(196,154,62,0.5)", textTransform: "uppercase", width: 42, flexShrink: 0 }}>
                {s.label}
              </span>
              <span style={{ fontSize: "0.74rem", fontWeight: 500, color: "rgba(255,255,255,0.76)" }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1.15rem", paddingTop: "0.85rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: "0.54rem", color: "rgba(255,255,255,0.26)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            1 guide disponible · 6 à venir
          </p>
        </div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 3.4, duration: 0.8 }}
          style={{ marginTop: "2rem", fontSize: "0.58rem", color: "rgba(255,255,255,0.18)", letterSpacing: "0.08em" }}
        >
          Cliquer une ville pour explorer →
        </motion.p>
      </motion.div>

      {/* ── Map ─────────────────────────────────────────────────────────────────── */}
      <div
        className="cp-map-wrap"
        style={{ position: "absolute", inset: 0, paddingTop: 56, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: "22%", zIndex: 5 }}
        onClick={e => e.stopPropagation()}
      >
        <motion.svg
          ref={svgRef}
          viewBox="0 0 480 820"
          aria-label="Carte interactive de la Thaïlande"
          style={{
            height: "94vh", width: "auto", overflow: "visible",
            filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.96)) drop-shadow(12px 18px 36px rgba(0,0,0,0.75))",
          }}
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <defs>
            {/* Land — dark warm parchment / amber-brown atlas tones (no green) */}
            <linearGradient id="th-land" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%"   stopColor="#1e1912" />
              <stop offset="25%"  stopColor="#28200e" />
              <stop offset="55%"  stopColor="#342a18" />
              <stop offset="100%" stopColor="#2e2517" />
            </linearGradient>

            {/* NW light source — warm illumination from top-left */}
            <radialGradient id="th-light-nw" cx="10%" cy="5%" r="70%">
              <stop offset="0%"   stopColor="rgba(215,178,108,0.14)" />
              <stop offset="60%"  stopColor="rgba(180,145,80,0.04)"  />
              <stop offset="100%" stopColor="rgba(0,0,0,0)"           />
            </radialGradient>

            {/* SE inner shadow — depth shelf effect */}
            <radialGradient id="th-shadow-es" cx="88%" cy="82%" r="58%">
              <stop offset="0%"   stopColor="rgba(0,0,0,0.42)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)"    />
            </radialGradient>

            {/* Peninsula lower darkening */}
            <linearGradient id="th-peninsula-fade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="rgba(8,5,3,0)"    />
              <stop offset="100%" stopColor="rgba(8,5,3,0.24)" />
            </linearGradient>

            {/* Ocean background */}
            <linearGradient id="th-ocean" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#08060a" />
              <stop offset="100%" stopColor="#060408" />
            </linearGradient>

            {/* Clip to land — evenodd ensures GeoJSON-derived multi-ring paths clip correctly */}
            <clipPath id="th-land-clip">
              <path d={TH_PATH} fillRule="evenodd" />
            </clipPath>

            {/* Parchment dot texture */}
            <pattern id="th-parchment" width="7" height="7" patternUnits="userSpaceOnUse">
              <circle cx="3.5" cy="3.5" r="0.45" fill="rgba(195,155,72,0.09)" />
            </pattern>

            {/* Highland cross-hatch (NW mountains) */}
            <pattern id="th-highland-hatch" width="5.5" height="5.5" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
              <line x1="0" y1="0" x2="0" y2="5.5" stroke="rgba(160,125,60,0.16)" strokeWidth="0.7" />
            </pattern>

            {/* Blur filters for 2.5D shadows */}
            <filter id="f-blur-outer" x="-60%" y="-40%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
            <filter id="f-blur-inner" x="-35%" y="-25%" width="170%" height="170%">
              <feGaussianBlur stdDeviation="6" />
            </filter>

            {/* Pin glow filters */}
            <filter id="f-glow-pin-sm" x="-250%" y="-250%" width="600%" height="600%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <filter id="f-glow-pin-lg" x="-250%" y="-250%" width="600%" height="600%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>

          {/* ── Ocean background ── */}
          <rect x="-80" y="-60" width="640" height="960" fill="url(#th-ocean)" />

          {/* Subtle ocean shimmer lines */}
          {[95, 195, 305, 430, 545, 665, 765].map((y, i) => (
            <line key={i} x1="-80" y1={y} x2="560" y2={y}
              stroke="rgba(55,40,75,0.055)" strokeWidth="0.65" />
          ))}

          {/* ── 2.5D depth — outer soft shadow ── */}
          <path d={TH_PATH} transform="translate(16,24)"
            fill="rgba(0,0,0,0.52)"
            fillRule="evenodd"
            filter="url(#f-blur-outer)"
          />

          {/* ── 2.5D depth — inner tight shadow ── */}
          <path d={TH_PATH} transform="translate(6,10)"
            fill="rgba(0,0,0,0.45)"
            fillRule="evenodd"
            filter="url(#f-blur-inner)"
          />

          {/* ── Land base fill ── */}
          <path d={TH_PATH} fill="url(#th-land)" fillRule="evenodd" />

          {/* ── Parchment dot texture ── */}
          <path d={TH_PATH} fill="url(#th-parchment)" fillRule="evenodd" />

          {/* ── Topographic contour lines (horizontal, very subtle) ── */}
          <g clipPath="url(#th-land-clip)" opacity="0.12">
            {Array.from({ length: 20 }, (_, i) => (
              <line key={`topo-${i}`}
                x1="-80" y1={28 + i * 40} x2="560" y2={28 + i * 40}
                stroke="#c09542" strokeWidth="0.3"
              />
            ))}
          </g>

          {/* ── Highland hatch (NW highlands zone — Doi Inthanon / Chiang Rai peaks) ── */}
          <rect clipPath="url(#th-land-clip)" x="55" y="20" width="130" height="200"
            fill="url(#th-highland-hatch)" />

          {/* ── NW light source (illumination from top-left) ── */}
          <path d={TH_PATH} fill="url(#th-light-nw)" fillRule="evenodd" />

          {/* ── SE inner shadow (2.5D depth) ── */}
          <path d={TH_PATH} fill="url(#th-shadow-es)" fillRule="evenodd" />

          {/* ── Peninsula lower fade ── */}
          <rect clipPath="url(#th-land-clip)" x="30" y="555" width="185" height="280"
            fill="url(#th-peninsula-fade)" />

          {/* ── Mountain peaks (Doi Inthanon / NW highlands) ── */}
          {PEAKS.map(([mx, my, sz], i) => (
            <g key={i}>
              <polygon
                points={`${mx + 2.5},${my + sz * 1.4} ${mx - sz * 0.68 + 2.5},${my + sz * 2.2} ${mx + sz * 0.68 + 2.5},${my + sz * 2.2}`}
                fill="rgba(0,0,0,0.28)"
              />
              <polygon
                points={`${mx},${my} ${mx - sz * 0.68},${my + sz * 1.35} ${mx + sz * 0.68},${my + sz * 1.35}`}
                fill={`rgba(40,32,18,${0.78 + i * 0.012})`}
                stroke="rgba(155,122,58,0.22)"
                strokeWidth="0.5"
              />
              <polygon
                points={`${mx},${my} ${mx - sz * 0.22},${my + sz * 0.4} ${mx + sz * 0.22},${my + sz * 0.4}`}
                fill={`rgba(200,172,112,${0.11 - i * 0.005})`}
              />
            </g>
          ))}

          {/* ── Chao Phraya River — Mercator-projected from Nakhon Sawan → Bangkok ── */}
          <path id="th-river"
            d="M 163,246 C 170,262 171,274 173,282 C 175,298 174,312 176,330 C 180,346 186,358 190,368 C 190,372 189.5,375 189.5,378"
            fill="none" stroke="rgba(75,135,185,0.3)" strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* ── Road: Mae Hong Son → Chiang Mai (mountain dashed) ── */}
          <path className="th-road"
            d="M 60,71 C 76,85 93,98 112,111"
            fill="none" stroke="rgba(180,150,78,0.25)" strokeWidth="1.0"
            strokeLinecap="round" strokeDasharray="2.5,5"
          />

          {/* ── Road: Chiang Mai → Bangkok via Hwy 1 ── */}
          <path className="th-road"
            d="M 112,111 C 128,145 154,192 165,230 C 170,252 172,268 172,282 C 175,310 180,340 189.5,378"
            fill="none" stroke="rgba(180,150,78,0.2)" strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* ── Road: Ayutthaya spur ── */}
          <path className="th-road"
            d="M 193,347 C 192,358 191,368 189.5,378"
            fill="none" stroke="rgba(180,150,78,0.28)" strokeWidth="0.95"
            strokeLinecap="round"
          />

          {/* ── Province outlines (animated draw-on) — restrained amber cartographic etching ── */}
          <path id="th-outline"
            d={TH_PATH}
            fill="none"
            fillRule="evenodd"
            stroke="rgba(195,158,82,0.28)"
            strokeWidth="0.45"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* ── Neighbor country labels — repositioned for Mercator projection ── */}
          {(
            [
              { label: "MYANMAR",  x: -52, y: 310 },
              { label: "LAOS",     x: 436, y: 182 },
              { label: "CAMBODIA", x: 428, y: 398 },
              { label: "MALAYSIA", x: 116, y: 850 },
            ] as { label: string; x: number; y: number }[]
          ).map(({ label, x, y }) => (
            <text key={label} x={x} y={y}
              fontSize="5.8" fontWeight="700"
              fill="rgba(185,155,82,0.18)" letterSpacing="0.22em"
              style={{ textTransform: "uppercase" } as React.CSSProperties}
              fontFamily="Georgia, 'Times New Roman', serif"
            >{label}</text>
          ))}

          {/* ── Sea labels — repositioned for Mercator projection ── */}
          <g transform="translate(388,560) rotate(90)" opacity="0.2">
            <text textAnchor="middle" fontSize="6.8" fontWeight="600"
              fill="rgba(125,185,220,1)" letterSpacing="0.25em"
              fontFamily="Georgia, 'Times New Roman', serif"
              style={{ textTransform: "uppercase" } as React.CSSProperties}>
              GULF OF THAILAND
            </text>
          </g>
          <g transform="translate(18,650) rotate(90)" opacity="0.18">
            <text textAnchor="middle" fontSize="6.8" fontWeight="600"
              fill="rgba(125,185,220,1)" letterSpacing="0.25em"
              fontFamily="Georgia, 'Times New Roman', serif"
              style={{ textTransform: "uppercase" } as React.CSSProperties}>
              ANDAMAN SEA
            </text>
          </g>

          {/* ── Ocean depth reference lines ── */}
          {[185, 330, 475, 618, 740].map((y, i) => (
            <line key={`lat-${i}`} x1="-80" y1={y} x2="560" y2={y}
              stroke="rgba(50,38,70,0.04)" strokeWidth="0.55" />
          ))}

          {/* ── City + island pins ── */}
          {CITIES.map((city, i) =>
            city.kind === "island" ? (
              <IslandPin
                key={city.id}
                city={city}
                index={i}
                isHovered={hovered === city.id}
                isActive={activeCity?.id === city.id}
                onHover={() => setHovered(city.id)}
                onLeave={() => setHovered(null)}
                onClick={() => handleCityClick(city)}
              />
            ) : (
              <CityPin
                key={city.id}
                city={city}
                index={i}
                isHovered={hovered === city.id}
                isActive={activeCity?.id === city.id}
                onHover={() => setHovered(city.id)}
                onLeave={() => setHovered(null)}
                onClick={() => handleCityClick(city)}
              />
            )
          )}

          {/* ── Compass rose ── */}
          <g transform="translate(450,44)" opacity="0.46">
            <circle cx="0" cy="0" r="14" fill="none" stroke="rgba(195,158,82,0.2)" strokeWidth="0.7" />
            <circle cx="0" cy="0" r="2.2" fill="rgba(195,158,82,0.35)" />
            <polygon points="0,-12 -2.5,-4 2.5,-4"  fill="rgba(195,158,82,0.7)"  />
            <polygon points="0,12 -2.5,4 2.5,4"     fill="rgba(195,158,82,0.22)" />
            <polygon points="-12,0 -4,-2.5 -4,2.5"  fill="rgba(195,158,82,0.22)" />
            <polygon points="12,0 4,-2.5 4,2.5"     fill="rgba(195,158,82,0.22)" />
            <text x="0" y="-19" textAnchor="middle" fontSize="5" fontWeight="700"
              fill="rgba(195,158,82,0.52)" letterSpacing="0.12em"
              fontFamily="Georgia, serif">N</text>
          </g>

          {/* ── Scale bar ── */}
          <g transform="translate(68,807)">
            <rect x="-2" y="-8" width="104" height="16" rx="3" fill="rgba(0,0,0,0.4)" />
            <line x1="0" y1="0" x2="88" y2="0" stroke="rgba(195,158,82,0.3)" strokeWidth="1" />
            <line x1="0"  y1="-3.5" x2="0"  y2="3.5" stroke="rgba(195,158,82,0.3)" strokeWidth="1" />
            <line x1="88" y1="-3.5" x2="88" y2="3.5" stroke="rgba(195,158,82,0.3)" strokeWidth="1" />
            <text x="44" y="-5.5" textAnchor="middle" fontSize="4.5" fill="rgba(195,158,82,0.32)"
              fontFamily="Georgia, serif" letterSpacing="0.1em">500 KM</text>
          </g>

        </motion.svg>
      </div>

      {/* ── Side editorial panel ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeCity && (
          <motion.aside
            key={activeCity.id}
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed", top: 56, right: 0, bottom: 0, width: 368,
              background: "rgba(9,7,8,0.97)",
              backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
              borderLeft: "1px solid rgba(195,158,82,0.12)",
              zIndex: 30, overflowY: "auto",
              display: "flex", flexDirection: "column",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Panel header */}
            <div style={{ padding: "1.8rem 1.8rem 1.4rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.65rem" }}>
                <span style={{
                  fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.2em",
                  color: "rgba(196,154,62,0.6)", textTransform: "uppercase",
                }}>
                  THAÏLANDE · {activeCity.region.toUpperCase()}
                </span>
                <button
                  onClick={() => setActiveCity(null)}
                  style={{
                    background: "none", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
                    color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", lineHeight: 1,
                    padding: "0.25rem 0.5rem", borderRadius: 4,
                    transition: "border-color 0.18s, color 0.18s",
                    flexShrink: 0, marginLeft: "1rem",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.28)";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.72)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)";
                  }}
                  aria-label="Fermer"
                >×</button>
              </div>
              <h2 style={{
                fontFamily: "var(--font-display)", fontSize: "2.15rem",
                fontStyle: "italic", color: "#fff", lineHeight: 1.08, marginBottom: "0.42rem",
              }}>
                {activeCity.label}
              </h2>
              <p style={{ fontSize: "0.72rem", color: "rgba(196,154,62,0.7)", fontStyle: "italic", lineHeight: 1.4 }}>
                {activeCity.tagline}
              </p>
            </div>

            {/* Panel body */}
            <div style={{ padding: "1.4rem 1.8rem", flex: 1 }}>
              <div style={{ marginBottom: "1.15rem" }}>
                <span style={{
                  display: "inline-block",
                  padding: "0.2rem 0.6rem", borderRadius: 3,
                  background: activeCity.kind === "island"
                    ? "rgba(60,115,175,0.16)"
                    : "rgba(196,154,62,0.1)",
                  border: `1px solid ${activeCity.kind === "island"
                    ? "rgba(85,145,205,0.22)"
                    : "rgba(196,154,62,0.2)"}`,
                  fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.16em",
                  color: activeCity.kind === "island"
                    ? "rgba(115,178,225,0.75)"
                    : "rgba(196,154,62,0.75)",
                  textTransform: "uppercase",
                }}>
                  {activeCity.kind === "island" ? "ÎLE" : "VILLE"}
                </span>
              </div>

              <p style={{
                fontSize: "0.77rem", color: "rgba(255,255,255,0.52)",
                lineHeight: 1.78, marginBottom: "1.8rem",
              }}>
                {activeCity.desc}
              </p>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.055)", marginBottom: "1.4rem" }} />

              {/* Bangkok full guide CTA */}
              {activeCity.hasGuide && (
                <button
                  onClick={openBangkokGuide}
                  style={{
                    width: "100%", padding: "0.9rem 1.2rem",
                    background: "rgba(196,154,62,0.1)",
                    border: "1px solid rgba(196,154,62,0.32)",
                    borderRadius: 7, cursor: "pointer",
                    color: "rgba(225,188,95,0.92)", fontSize: "0.7rem",
                    fontWeight: 600, letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    transition: "background 0.2s, border-color 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(196,154,62,0.18)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(196,154,62,0.5)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(196,154,62,0.1)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(196,154,62,0.32)";
                  }}
                >
                  <span>Ouvrir le guide complet</span>
                  <span style={{ opacity: 0.6, fontSize: "0.85rem" }}>→</span>
                </button>
              )}
            </div>

            {/* Panel footer */}
            <div style={{ padding: "1rem 1.8rem 1.8rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <p style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.18)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                NomadReady · Atlas Thaïlande
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

    </main>
  );
}

// ─── City pin ─────────────────────────────────────────────────────────────────

function CityPin({ city, index, isHovered, isActive, onHover, onLeave, onClick }: {
  city: City; index: number; isHovered: boolean; isActive: boolean;
  onHover: () => void; onLeave: () => void; onClick: () => void;
}) {
  const poleH  = 20;
  const dotY   = city.y - poleH;
  const lit    = isHovered || isActive;
  const col    = lit ? "rgba(232,192,104,1)" : "rgba(196,154,62,0.9)";
  const pulseDelay = `${index * 0.38}s`;

  return (
    <g
      style={{ cursor: "pointer" }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      role="button"
      aria-label={city.label}
    >
      {/* Hit area */}
      <circle cx={city.x} cy={city.y - poleH / 2} r={24} fill="transparent" />

      {/* Ground shadow */}
      <ellipse cx={city.x + 2} cy={city.y + 2.5} rx={5} ry={1.8} fill="rgba(0,0,0,0.35)" />

      {/* Pole */}
      <line
        x1={city.x} y1={city.y}
        x2={city.x} y2={dotY + 2.5}
        stroke={lit ? "rgba(232,192,104,0.88)" : "rgba(196,154,62,0.6)"}
        strokeWidth={lit ? 1.8 : 1.3}
        strokeLinecap="round"
      />

      {/* Glow halo */}
      <circle
        cx={city.x} cy={dotY}
        r={lit ? 10 : 6}
        fill={lit ? "rgba(232,192,104,0.28)" : "rgba(196,154,62,0.18)"}
        filter={lit ? "url(#f-glow-pin-lg)" : "url(#f-glow-pin-sm)"}
      />

      {/* Pulse ring */}
      <circle cx={city.x} cy={dotY} r={5.5} fill="none"
        stroke={lit ? "rgba(232,192,104,0.58)" : "rgba(196,154,62,0.38)"}
        strokeWidth={1.0}
      >
        <animate attributeName="r"       values="5.5;16;5.5"   dur="3.1s" begin={pulseDelay} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.7;0;0.7"     dur="3.1s" begin={pulseDelay} repeatCount="indefinite" />
      </circle>

      {/* Core dot */}
      <circle
        cx={city.x} cy={dotY}
        r={lit ? 5.6 : 4.0}
        fill={col}
        stroke={lit ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.18)"}
        strokeWidth={lit ? 1.4 : 0.7}
      />

      {/* Label */}
      <text
        x={city.x + 10}
        y={dotY + 2.8}
        fontSize={lit ? 7.8 : 7.0}
        fontWeight="600"
        fill={lit ? "rgba(235,196,112,1)" : "rgba(255,248,225,0.78)"}
        letterSpacing="0.07em"
        fontFamily="Georgia, 'Times New Roman', serif"
        style={{ textTransform: "uppercase", userSelect: "none", pointerEvents: "none" } as React.CSSProperties}
      >{city.label}</text>

      {/* Active indicator (selected city underline) */}
      {isActive && (
        <line
          x1={city.x + 10} y1={dotY + 5.5}
          x2={city.x + 10 + city.label.length * 4.4} y2={dotY + 5.5}
          stroke="rgba(232,192,104,0.42)" strokeWidth="0.6"
        />
      )}

      {/* Bangkok GUIDE badge */}
      {city.hasGuide && (
        <g transform={`translate(${city.x + 10},${dotY - 9.5})`}>
          <rect x={0} y={-6} width={27} height={8.5} rx={4}
            fill={lit ? "rgba(232,192,104,0.95)" : "rgba(196,154,62,0.88)"} />
          <text x={13.5} y={0.5} textAnchor="middle" fontSize={3.8} fontWeight="700"
            fill="rgba(0,0,0,0.72)" letterSpacing="0.08em"
            fontFamily="Georgia, serif">
            GUIDE
          </text>
        </g>
      )}
    </g>
  );
}

// ─── Island pin ───────────────────────────────────────────────────────────────

function IslandPin({ city, index, isHovered, isActive, onHover, onLeave, onClick }: {
  city: City; index: number; isHovered: boolean; isActive: boolean;
  onHover: () => void; onLeave: () => void; onClick: () => void;
}) {
  const lit     = isHovered || isActive;
  const gold    = "rgba(196,154,62,0.78)";
  const goldLit = "rgba(232,192,104,0.96)";
  const pulseDelay = `${index * 0.45}s`;

  return (
    <g
      style={{ cursor: "pointer" }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      role="button"
      aria-label={city.label}
    >
      <circle cx={city.x} cy={city.y} r={22} fill="transparent" />

      {/* Glow */}
      <circle
        cx={city.x} cy={city.y}
        r={lit ? 9 : 5.5}
        fill={lit ? "rgba(100,158,218,0.16)" : "rgba(75,130,190,0.09)"}
        filter={lit ? "url(#f-glow-pin-lg)" : "url(#f-glow-pin-sm)"}
      />

      {/* Pulse ring */}
      <circle cx={city.x} cy={city.y} r={5.5} fill="none"
        stroke={lit ? "rgba(232,192,104,0.52)" : "rgba(196,154,62,0.32)"}
        strokeWidth={0.8}
      >
        <animate attributeName="r"       values="5.5;18;5.5"   dur="3.6s" begin={pulseDelay} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.65;0;0.65"   dur="3.6s" begin={pulseDelay} repeatCount="indefinite" />
      </circle>

      {/* Outer ring */}
      <circle
        cx={city.x} cy={city.y}
        r={lit ? 8 : 6}
        fill="none"
        stroke={lit ? goldLit : gold}
        strokeWidth={lit ? 1.3 : 0.9}
      />

      {/* Core dot */}
      <circle
        cx={city.x} cy={city.y}
        r={lit ? 3.2 : 2.4}
        fill={lit ? goldLit : gold}
      />

      {/* Label */}
      <text
        x={city.x + 12}
        y={city.y + 3.5}
        fontSize={lit ? 7.5 : 6.5}
        fontWeight="600"
        fill={lit ? "rgba(235,196,112,1)" : "rgba(255,248,225,0.7)"}
        letterSpacing="0.07em"
        fontFamily="Georgia, 'Times New Roman', serif"
        style={{ textTransform: "uppercase", userSelect: "none", pointerEvents: "none" } as React.CSSProperties}
      >{city.label}</text>

      {/* Active indicator */}
      {isActive && (
        <line
          x1={city.x + 12} y1={city.y + 6.5}
          x2={city.x + 12 + city.label.length * 3.8} y2={city.y + 6.5}
          stroke="rgba(232,192,104,0.38)" strokeWidth="0.5"
        />
      )}
    </g>
  );
}
