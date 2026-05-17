import { useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "motion/react";
import { getT } from "@/lib/i18n";
import type { ReadyData } from "@/lib/types";

const readyFiles = import.meta.glob<ReadyData>("../data/ready/*.json", { eager: true, import: "default" });

// ── Thailand map geometry ─────────────────────────────────────────────────────
// ViewBox: 0 0 420 620  (portrait, ~1:1.48 ratio like Thailand's elongated shape)

const TH_PATH = [
  "M 115,78",
  "C 132,55 152,34 165,26",
  "C 190,13 225,16 250,34",
  "C 274,50 298,76 312,106",
  "C 325,136 335,164 338,190",
  "C 340,210 334,228 320,242",
  "C 308,254 291,263 276,274",
  "C 260,285 247,300 239,322",
  "C 230,345 226,370 222,395",
  "C 218,418 214,443 211,467",
  "C 208,490 205,514 202,534",
  "L 200,544",
  "C 196,540 191,533 189,520",
  "C 187,500 185,477 185,452",
  "C 185,426 183,400 181,376",
  "C 177,349 169,325 157,309",
  "C 146,294 131,278 120,261",
  "C 111,246 106,229 106,211",
  "C 106,191 108,171 110,151",
  "C 112,129 114,107 115,90",
  "Z",
].join(" ");

// Mountain peaks in northern Thailand (triangles)
const MOUNTAINS: [number, number][] = [
  [128, 70], [150, 60], [170, 54], [192, 50], [210, 47],
  [144, 80], [163, 74], [183, 66], [200, 62],
];

// ── City data ─────────────────────────────────────────────────────────────────

interface City {
  id: string;
  label: string;
  kind: "city" | "island";
  x: number;
  y: number;
  hasGuide: boolean;
  score: number | null;
  tagline: string;
  iRx?: number;
  iRy?: number;
}

const CITIES: City[] = [
  { id: "bangkok",      label: "Bangkok",      kind: "city",   x: 224, y: 258, hasGuide: true,  score: 85,   tagline: "Le chaos devient musique."   },
  { id: "ayutthaya",    label: "Ayutthaya",    kind: "city",   x: 212, y: 240, hasGuide: false, score: null, tagline: "L'ancienne capitale royale."  },
  { id: "chiang-mai",   label: "Chiang Mai",   kind: "city",   x: 142, y: 90,  hasGuide: false, score: null, tagline: "Temples et brumes du nord."   },
  { id: "mae-hong-son", label: "Mae Hong Son", kind: "city",   x: 116, y: 76,  hasGuide: false, score: null, tagline: "Au bout du monde vert."       },
  { id: "koh-tao",      label: "Koh Tao",      kind: "island", x: 268, y: 372, hasGuide: false, score: null, tagline: "La plongée, l'essence.",  iRx: 9,  iRy: 6  },
  { id: "koh-kood",     label: "Koh Kood",     kind: "island", x: 356, y: 306, hasGuide: false, score: null, tagline: "Paradise préservé.",      iRx: 13, iRy: 8  },
  { id: "koh-mak",      label: "Koh Mak",      kind: "island", x: 349, y: 318, hasGuide: false, score: null, tagline: "L'île du silence.",        iRx: 8,  iRy: 5  },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function CountryPage() {
  const { passport, destination } = useParams<{ passport: string; destination: string }>();
  const [, navigate] = useLocation();
  const passportId   = passport ?? "fr";
  const t            = getT(passportId);

  const dataKey = Object.keys(readyFiles).find(k => k.endsWith(`/${passportId}-thailand.json`));
  const data    = dataKey ? readyFiles[dataKey] : null;

  const visaLabel  = data?.visa?.type === "Visa Exemption" || data?.visa?.type === "Visa Free"
    ? `Exempt · ${data.visa.duration_days ?? 30}j`
    : data?.visa?.type ?? "Voir conditions";

  const [hovered,  setHovered]  = useState<string | null>(null);
  const [exiting,  setExiting]  = useState(false);
  const [exitBack, setExitBack] = useState(false);
  void destination;

  const goToCity = useCallback((city: City) => {
    if (!city.hasGuide || exiting || exitBack) return;
    setExiting(true);
    setTimeout(() => navigate(`/ready/${passportId}/thailand/${city.id}`), 580);
  }, [exiting, exitBack, navigate, passportId]);

  const goBack = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (exiting || exitBack) return;
    setExitBack(true);
    setTimeout(() => navigate(`/?passport=${passportId}&skip_gateway=1`), 620);
  }, [exiting, exitBack, navigate, passportId]);

  const hoveredCity = CITIES.find(c => c.id === hovered) ?? null;
  const guideCount  = CITIES.filter(c => c.hasGuide).length;
  const lockedCount = CITIES.length - guideCount;

  return (
    <main style={{ position: "relative", width: "100vw", height: "100dvh", overflow: "hidden", background: "#030c07" }}>

      {/* ── Transition overlays ── */}
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

      {/* ── Tactical grid background ── */}
      <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035 }}>
        <defs>
          <pattern id="cp-grid" width="44" height="44" patternUnits="userSpaceOnUse">
            <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#4af098" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cp-grid)" />
      </svg>

      {/* ── Radial vignette ── */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, rgba(0,0,0,0.68) 100%)",
      }} />

      {/* ── Header bar ── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.5 }}
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 1.5rem", zIndex: 20,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "linear-gradient(to bottom, rgba(3,12,7,0.95) 0%, transparent 100%)",
        }}
      >
        <motion.a
          href={`/?passport=${passportId}&skip_gateway=1`}
          onClick={goBack}
          className="th-back-link"
          animate={exitBack ? { opacity: 0, y: -8, filter: "blur(4px)" } : {}}
          transition={{ duration: 0.2 }}
          aria-label="Retour à l'atlas"
        >
          ← {t.backToAtlas}
        </motion.a>
        <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em", color: "rgba(217,119,6,0.7)", textTransform: "uppercase" }}>
          THAILAND · SOUTHEAST ASIA
        </span>
      </motion.header>

      {/* ── Left info panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -22 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.62, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "absolute", left: "3.5rem", top: "50%", transform: "translateY(-52%)", zIndex: 10, maxWidth: 255 }}
      >
        <p className="th-eyebrow th-eyebrow--amber" style={{ marginBottom: "0.55rem" }}>FIELD GUIDE</p>
        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 2.8vw, 2.7rem)",
          lineHeight: 1.1, color: "#fff", fontStyle: "italic", marginBottom: "0.85rem",
        }}>
          La&nbsp;Thaïlande<br />se&nbsp;mérite.
        </h1>
        <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginBottom: "1.35rem" }}>
          Du chaos de Bangkok<br />aux brumes du Nord.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.42rem" }}>
          {([
            { label: "VISA",   value: visaLabel },
            { label: "DEVISE", value: "฿ Baht" },
            { label: "FUSEAU", value: "UTC +7" },
          ] as const).map(s => (
            <div key={s.label} style={{ display: "flex", gap: "0.7rem", alignItems: "baseline" }}>
              <span style={{ fontSize: "0.52rem", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(217,119,6,0.6)", textTransform: "uppercase", width: 44, flexShrink: 0 }}>
                {s.label}
              </span>
              <span style={{ fontSize: "0.76rem", fontWeight: 500, color: "rgba(255,255,255,0.80)" }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1.15rem", paddingTop: "0.85rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ fontSize: "0.56rem", color: "rgba(255,255,255,0.32)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {guideCount} guide{guideCount !== 1 ? "s" : ""} disponible{guideCount !== 1 ? "s" : ""} · {lockedCount} à venir
          </p>
        </div>
      </motion.div>

      {/* ── SVG Map ── */}
      <div style={{ position: "absolute", inset: 0, paddingTop: 56, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5 }}>
        <TH_MapSVG hovered={hovered} onHover={setHovered} onCityClick={goToCity} />
      </div>

      {/* ── Hover city card ── */}
      <AnimatePresence mode="wait">
        {hoveredCity && (
          <motion.div
            key={hoveredCity.id}
            initial={{ opacity: 0, y: 7, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            style={{
              position: "fixed", bottom: "2rem", right: "2.5rem", zIndex: 30,
              background: "rgba(4,16,9,0.93)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              border: `1px solid ${hoveredCity.hasGuide ? "rgba(217,119,6,0.3)" : "rgba(90,140,100,0.2)"}`,
              borderRadius: 12, padding: "1rem 1.2rem", minWidth: 200, maxWidth: 245, pointerEvents: "none",
            }}
          >
            <p style={{ fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.2em", color: "rgba(217,119,6,0.72)", textTransform: "uppercase", marginBottom: "0.22rem" }}>
              {hoveredCity.kind === "island" ? "ÎLE" : "VILLE"} · THAÏLANDE
            </p>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.32rem", fontStyle: "italic", color: "#fff", lineHeight: 1.15, marginBottom: "0.26rem" }}>
              {hoveredCity.label}
            </h3>
            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.55, marginBottom: "0.65rem" }}>
              {hoveredCity.tagline}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.42rem" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: hoveredCity.hasGuide ? "rgba(217,119,6,1)" : "rgba(80,130,90,0.6)" }} />
              <span style={{ fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: hoveredCity.hasGuide ? "rgba(217,119,6,0.88)" : "rgba(255,255,255,0.34)" }}>
                {hoveredCity.hasGuide ? "Guide disponible — cliquer" : "Guide bientôt disponible"}
              </span>
            </div>
            {hoveredCity.score !== null && (
              <div style={{ marginTop: "0.45rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", textTransform: "uppercase" }}>FIELD SCORE</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "rgba(217,119,6,0.86)" }}>{hoveredCity.score}/100</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}

// ── Thailand SVG map ──────────────────────────────────────────────────────────

function TH_MapSVG({ hovered, onHover, onCityClick }: {
  hovered: string | null;
  onHover: (id: string | null) => void;
  onCityClick: (city: City) => void;
}) {
  return (
    <motion.svg
      viewBox="0 0 420 620"
      aria-label="Carte interactive de la Thaïlande avec villes et îles"
      style={{ height: "88vh", maxHeight: 700, width: "auto", overflow: "visible", filter: "drop-shadow(0 22px 48px rgba(0,0,0,0.9))" }}
      initial={{ scale: 0.86, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.92, ease: [0.22, 1, 0.36, 1] }}
    >
      <defs>
        <linearGradient id="cp-ocean" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#061a22" />
          <stop offset="100%" stopColor="#020e0a" />
        </linearGradient>
        <linearGradient id="cp-land" x1="0%" y1="0%" x2="22%" y2="100%">
          <stop offset="0%" stopColor="#3e7454" />
          <stop offset="42%" stopColor="#2e5e42" />
          <stop offset="100%" stopColor="#1d4430" />
        </linearGradient>
        <radialGradient id="cp-north-mist" cx="36%" cy="16%" r="32%">
          <stop offset="0%" stopColor="rgba(160,210,170,0.2)" />
          <stop offset="100%" stopColor="rgba(160,210,170,0)" />
        </radialGradient>
        <filter id="cp-glow-sm" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="cp-glow-lg" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ocean base */}
      <rect width="420" height="620" fill="url(#cp-ocean)" />

      {/* Tactical grid lines on ocean */}
      <g opacity="0.05" stroke="#3ae88a" strokeWidth="0.5" strokeDasharray="2 11">
        {Array.from({ length: 11 }, (_, i) => <line key={`v${i}`} x1={i * 42} y1={0} x2={i * 42} y2={620} />)}
        {Array.from({ length: 16 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 41.4} x2={420} y2={i * 41.4} />)}
      </g>

      {/* Compass rose */}
      <g transform="translate(388, 40)" opacity="0.24">
        <circle cx={0} cy={0} r={18} fill="none" stroke="rgba(217,119,6,0.55)" strokeWidth="0.5" />
        <circle cx={0} cy={0} r={12} fill="none" stroke="rgba(217,119,6,0.28)" strokeWidth="0.5" />
        <text textAnchor="middle" x={0} y={-22} fontSize="6.5" fill="rgba(217,119,6,0.9)" fontWeight="700" letterSpacing="0.08em">N</text>
        <polygon points="0,-11 2.2,-2 0,3 -2.2,-2" fill="rgba(217,119,6,0.88)" />
        <polygon points="0,11 2.2,2 0,-3 -2.2,2" fill="rgba(255,255,255,0.22)" />
        <line x1="-11" y1={0} x2="-4" y2={0} stroke="rgba(255,255,255,0.28)" strokeWidth="0.8" />
        <line x1="4" y1={0} x2="11" y2={0} stroke="rgba(255,255,255,0.28)" strokeWidth="0.8" />
      </g>

      {/* Scale bar */}
      <g transform="translate(22, 606)" opacity="0.3">
        <line x1={0} y1={0} x2={54} y2={0} stroke="rgba(255,255,255,0.65)" strokeWidth="0.8" />
        <line x1={0} y1={-3} x2={0} y2={3} stroke="rgba(255,255,255,0.65)" strokeWidth="0.8" />
        <line x1={54} y1={-3} x2={54} y2={3} stroke="rgba(255,255,255,0.65)" strokeWidth="0.8" />
        <text x={27} y={-5.5} textAnchor="middle" fontSize={5.5} fill="rgba(255,255,255,0.65)" fontFamily="monospace" letterSpacing="0.04em">500 KM</text>
      </g>

      {/* ── Land: shadow for 2.5D depth ── */}
      <path d={TH_PATH} transform="translate(9,13)" fill="rgba(0,5,2,0.72)" />

      {/* ── Land: main body ── */}
      <path d={TH_PATH} fill="url(#cp-land)" />

      {/* ── Northern mountain mist overlay ── */}
      <path d={TH_PATH} fill="url(#cp-north-mist)" />

      {/* ── Land edge highlight (top-left lit) ── */}
      <path d={TH_PATH} fill="none" stroke="#5c9270" strokeWidth="1.5" opacity="0.36" />
      <path d={TH_PATH} fill="none" stroke="#9dd4aa" strokeWidth="0.5" opacity="0.18" />

      {/* ── Mountain peaks (northern region) ── */}
      {MOUNTAINS.map(([mx, my], i) => (
        <g key={i} transform={`translate(${mx},${my})`} opacity="0.30">
          <polygon points="0,-9 7,5 -7,5" fill="#1c3828" stroke="#4a7058" strokeWidth="0.5" />
          <polygon points="0,-5 3.5,2 -3.5,2" fill="#2e5040" opacity="0.55" />
          <line x1={0} y1={-9} x2={0} y2={-13} stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" strokeLinecap="round" />
        </g>
      ))}

      {/* ── Chao Phraya river hint ── */}
      <path
        d="M 190,132 C 194,158 200,185 207,210 C 212,228 218,244 222,257"
        fill="none" stroke="rgba(70,150,195,0.2)" strokeWidth="1.8" strokeLinecap="round"
      />

      {/* ── Island bodies ── */}
      {CITIES.filter(c => c.kind === "island" && c.iRx).map(c => (
        <g key={`isle-${c.id}`}>
          <ellipse cx={c.x + 4} cy={c.y + 7} rx={(c.iRx ?? 8) + 2} ry={(c.iRy ?? 5) + 2} fill="rgba(0,4,2,0.62)" />
          <ellipse cx={c.x} cy={c.y} rx={c.iRx ?? 8} ry={c.iRy ?? 5} fill="url(#cp-land)" stroke="#5c9270" strokeWidth="0.8" opacity="0.95" />
        </g>
      ))}

      {/* ── City + island pins ── */}
      {CITIES.map((city, i) => (
        <CityPin
          key={city.id}
          city={city}
          index={i}
          isHovered={hovered === city.id}
          onHover={() => onHover(city.id)}
          onLeave={() => onHover(null)}
          onClick={() => onCityClick(city)}
        />
      ))}
    </motion.svg>
  );
}

// ── City pin ──────────────────────────────────────────────────────────────────

function CityPin({ city, index, isHovered, onHover, onLeave, onClick }: {
  city: City; index: number; isHovered: boolean;
  onHover: () => void; onLeave: () => void; onClick: () => void;
}) {
  const poleH    = city.kind === "island" ? 0 : 20;
  const dotY     = city.y - poleH;
  const active   = city.hasGuide;
  const amber    = "rgba(217,119,6,1)";
  const muted    = "rgba(85,135,95,0.72)";
  const hotAmber = "rgba(255,210,75,1)";
  const dotFill  = isHovered ? hotAmber : (active ? amber : muted);
  const glowId   = isHovered ? "url(#cp-glow-lg)" : "url(#cp-glow-sm)";

  const pulseDelay = `${index * 0.35}s`;

  return (
    <g
      style={{ cursor: active ? "pointer" : "default" }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      role="button"
      aria-label={`${city.label}${active ? " — guide disponible" : " — bientôt disponible"}`}
    >
      {/* Enlarged transparent hit area */}
      <circle cx={city.x} cy={city.y - poleH / 2} r={24} fill="transparent" />

      {/* Ground shadow ellipse */}
      <ellipse cx={city.x + 2} cy={city.y + 3} rx={7} ry={3} fill="rgba(0,0,0,0.42)" />

      {/* Vertical pole (land cities only) */}
      {poleH > 0 && (
        <line
          x1={city.x} y1={city.y}
          x2={city.x} y2={dotY + 2}
          stroke={isHovered ? "rgba(255,200,75,0.88)" : (active ? "rgba(217,119,6,0.76)" : "rgba(85,135,95,0.48)")}
          strokeWidth={isHovered ? 2 : 1.5}
          strokeLinecap="round"
        />
      )}

      {/* Glow halo — blur via SVG filter */}
      <circle
        cx={city.x} cy={dotY}
        r={isHovered ? 11 : 7}
        fill={isHovered ? "rgba(255,180,35,0.38)" : (active ? "rgba(217,119,6,0.28)" : "rgba(85,135,95,0.18)")}
        filter={glowId}
      />

      {/* Pulsing ring (available only) — SMIL animation, always reliable in SVG */}
      {active && (
        <circle cx={city.x} cy={dotY} r={6} fill="none"
          stroke={isHovered ? "rgba(255,200,75,0.7)" : "rgba(217,119,6,0.5)"}
          strokeWidth={1}
        >
          <animate attributeName="r"       values="6;15;6"      dur="2.8s" begin={pulseDelay} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0;0.7"   dur="2.8s" begin={pulseDelay} repeatCount="indefinite" />
        </circle>
      )}

      {/* Core dot */}
      <circle
        cx={city.x} cy={dotY}
        r={isHovered ? 6.5 : 4.8}
        fill={dotFill}
        stroke={isHovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)"}
        strokeWidth={isHovered ? 1.5 : 0.8}
      />

      {/* City label */}
      <text
        x={city.x}
        y={dotY - (poleH > 0 ? 12 : 17)}
        textAnchor="middle"
        fontSize={isHovered ? 7.8 : 6.8}
        fontWeight="600"
        fill={isHovered ? "rgba(255,220,95,1)" : "rgba(255,255,255,0.84)"}
        letterSpacing="0.06em"
        style={{ textTransform: "uppercase", userSelect: "none", pointerEvents: "none" }}
      >
        {city.label}
      </text>

      {/* "GUIDE" badge pill for available cities */}
      {active && (
        <g transform={`translate(${city.x + 10},${dotY - 7})`}>
          <rect x={0} y={-6} width={22} height={8} rx={4} fill={isHovered ? "rgba(255,180,35,0.96)" : "rgba(217,119,6,0.9)"} />
          <text x={11} y={0.5} textAnchor="middle" fontSize={4} fontWeight="700" fill="rgba(0,0,0,0.78)" letterSpacing="0.06em">
            GUIDE
          </text>
        </g>
      )}
    </g>
  );
}
