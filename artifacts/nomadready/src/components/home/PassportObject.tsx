"use client";

/**
 * PassportObject — tactile premium passport cover rendered in CSS + SVG.
 *
 * Visual treatment:
 *   - Gold-gradient metallic fill on all text and emblems (not flat amber)
 *   - SVG feTurbulence leather grain texture at multiply blend
 *   - Gradient cover (not flat): highlights coverHighlight → cover → spineColor
 *   - Multi-layer emboss shadows on the seal
 *   - Page-block strip on the right edge (parchment pages)
 *   - Biometric chip detail at bottom
 *   - Gold-tinted specular shimmer that tracks the cursor
 *   - Edge vignette for physical depth
 *   - Corner wear marks (subtle lighter patches at corners)
 *   - CSS perspective tilt via RAF loop (±9°/±11°)
 *
 * On entering: scales to 8× with cinematic ease (camera push-in).
 * Reduced motion: all animation collapses to instant.
 */

import { useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type EmblemType = "eu" | "crown" | "eagle" | "maple" | "southern-cross";

interface PassportTheme {
  cover: string;
  coverHighlight: string;
  line1: string;
  line2: string;
  accent: string;
  emblem: EmblemType;
  spineColor: string;
}

// ─── Country Themes ───────────────────────────────────────────────────────────

const THEMES: Record<string, PassportTheme> = {
  fr: { cover: "#192450", coverHighlight: "#1e2d64", line1: "UNION EUROPÉENNE",     line2: "FRANCE",                   accent: "#C8A428", emblem: "eu",             spineColor: "#111830" },
  uk: { cover: "#4A0E1B", coverHighlight: "#5d1222", line1: "GREAT BRITAIN",         line2: "UNITED KINGDOM",           accent: "#C8A428", emblem: "crown",          spineColor: "#320910" },
  de: { cover: "#1A1A1C", coverHighlight: "#272728", line1: "BUNDESREPUBLIK",         line2: "DEUTSCHLAND",              accent: "#C8A428", emblem: "eagle",          spineColor: "#111112" },
  nl: { cover: "#13276B", coverHighlight: "#1a3285", line1: "KONINKRIJK DER",         line2: "NEDERLAND",                accent: "#C8A428", emblem: "eu",             spineColor: "#0c1a49" },
  es: { cover: "#8A1823", coverHighlight: "#a51e2b", line1: "REINO DE ESPAÑA",        line2: "ESPAÑA",                   accent: "#C8A428", emblem: "eu",             spineColor: "#5c1017" },
  it: { cover: "#193B19", coverHighlight: "#1f491f", line1: "REPUBBLICA ITALIANA",    line2: "ITALIA",                   accent: "#C8A428", emblem: "eu",             spineColor: "#102710" },
  be: { cover: "#0E1F5C", coverHighlight: "#132872", line1: "ROYAUME DE BELGIQUE",    line2: "BELGIQUE",                 accent: "#C8A428", emblem: "eu",             spineColor: "#09143d" },
  us: { cover: "#1A2A58", coverHighlight: "#20336c", line1: "DEPARTMENT OF STATE",    line2: "UNITED STATES OF AMERICA", accent: "#C8A428", emblem: "eagle",          spineColor: "#101a3a" },
  ca: { cover: "#1C2C4A", coverHighlight: "#22365a", line1: "GOUVERNEMENT DU CANADA", line2: "CANADA",                   accent: "#C8A428", emblem: "maple",          spineColor: "#111c30" },
  au: { cover: "#0A2948", coverHighlight: "#0e3358", line1: "COMMONWEALTH OF",        line2: "AUSTRALIA",                accent: "#C8A428", emblem: "southern-cross", spineColor: "#061a2e" },
};

// ─── Gold System ──────────────────────────────────────────────────────────────

/**
 * Gold gradient CSS for text elements.
 * Uses -webkit-background-clip for the metallic fill.
 * Pair with filter: drop-shadow() on the containing element for embossing.
 */
const GOLD_TEXT = {
  background: "linear-gradient(162deg, #f8e890 0%, #d8b030 28%, #8c6010 60%, #c09020 82%, #f0dc70 100%)",
  WebkitBackgroundClip: "text" as const,
  WebkitTextFillColor: "transparent" as const,
  color: "transparent" as const,
};

/**
 * Shared gradient defs injected into each emblem SVG.
 * "gld" = primary gold (vertical)
 * "gld-h" = gold horizontal (for strokes/feathers)
 * Since only one emblem is in the DOM at a time, id="gld" is safe.
 */
function GoldDefs() {
  return (
    <defs>
      <linearGradient id="gld" x1="15%" y1="0%" x2="55%" y2="100%">
        <stop offset="0%"   stopColor="#f8e890" />
        <stop offset="28%"  stopColor="#d4a820" />
        <stop offset="58%"  stopColor="#8a5e0a" />
        <stop offset="82%"  stopColor="#b88820" />
        <stop offset="100%" stopColor="#e4ca50" />
      </linearGradient>
      <linearGradient id="gld-h" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="#f8e890" />
        <stop offset="45%"  stopColor="#c8a428" />
        <stop offset="100%" stopColor="#8a5e0a" />
      </linearGradient>
      <filter id="emb-sh">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.8" floodColor="rgba(0,0,0,0.55)" />
        <feDropShadow dx="0" dy="-0.5" stdDeviation="0.5" floodColor="rgba(240,210,80,0.08)" />
      </filter>
    </defs>
  );
}

// ─── Emblem Components ────────────────────────────────────────────────────────
// Each takes no color prop — gold gradient is always applied via url(#gld).

function EuEmblem() {
  const stars = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    return { x: 44 + 30 * Math.cos(angle), y: 44 + 30 * Math.sin(angle) };
  });
  return (
    <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      <GoldDefs />
      <g filter="url(#emb-sh)">
        {stars.map((s, i) => (
          <polygon key={i} points={starPoints(s.x, s.y, 5, 2.5)} fill="url(#gld)" opacity="0.93" />
        ))}
      </g>
    </svg>
  );
}

function CrownEmblem() {
  return (
    <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      <GoldDefs />
      <g filter="url(#emb-sh)">
        <rect x="18" y="56" width="52" height="9"  rx="2" fill="url(#gld)" opacity="0.93" />
        <rect x="22" y="38" width="9"  height="21" rx="2" fill="url(#gld)" opacity="0.93" />
        <rect x="39" y="28" width="10" height="31" rx="2" fill="url(#gld)" opacity="0.93" />
        <rect x="57" y="38" width="9"  height="21" rx="2" fill="url(#gld)" opacity="0.93" />
        <circle cx="26.5" cy="35" r="5.5" fill="url(#gld)" opacity="0.93" />
        <circle cx="44"   cy="24" r="6.5" fill="url(#gld)" opacity="0.93" />
        <circle cx="61.5" cy="35" r="5.5" fill="url(#gld)" opacity="0.93" />
        <circle cx="44"   cy="24" r="2.5" fill="url(#gld)" opacity="0.35" />
      </g>
    </svg>
  );
}

function EagleEmblem() {
  return (
    <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      <GoldDefs />
      <g filter="url(#emb-sh)">
        <circle cx="44" cy="22" r="8.5"  fill="url(#gld)" opacity="0.93" />
        <path d="M50 25 L58 23 L52 29 Z"              fill="url(#gld)" opacity="0.93" />
        <ellipse cx="44" cy="48" rx="10" ry="14"       fill="url(#gld)" opacity="0.93" />
        <path d="M34 42 Q18 32 8 40 Q14 50 32 48 Z"   fill="url(#gld)" opacity="0.88" />
        <path d="M54 42 Q70 32 80 40 Q74 50 56 48 Z"  fill="url(#gld)" opacity="0.88" />
        <path d="M10 38 Q6 44 9 50"  stroke="url(#gld-h)" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
        <path d="M8  43 Q4 48 7 54"  stroke="url(#gld-h)" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
        <path d="M78 38 Q82 44 79 50" stroke="url(#gld-h)" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
        <path d="M80 43 Q84 48 81 54" stroke="url(#gld-h)" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
        <path d="M36 60 Q38 70 44 68 Q50 70 52 60"    fill="url(#gld)" opacity="0.88" />
        <path d="M39 62 L36 72 M44 63 L44 73 M49 62 L52 72" stroke="url(#gld-h)" strokeWidth="1.5" strokeLinecap="round" opacity="0.72" />
      </g>
    </svg>
  );
}

function MapleEmblem() {
  return (
    <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      <GoldDefs />
      <g filter="url(#emb-sh)">
        <path
          d="M44 8 L47 20 L54 14 L50 24 L62 20 L56 30 L68 30 L60 38 L70 42 L58 42 L62 54 L44 46 L26 54 L30 42 L18 42 L28 38 L20 30 L32 30 L26 20 L38 24 L34 14 L41 20 Z"
          fill="url(#gld)" opacity="0.93"
        />
        <rect x="42" y="54" width="4" height="16" rx="1.5" fill="url(#gld)" opacity="0.93" />
      </g>
    </svg>
  );
}

function SouthernCrossEmblem() {
  const stars = [
    { x: 44, y: 16, r: 7 },
    { x: 22, y: 40, r: 6 },
    { x: 66, y: 40, r: 6 },
    { x: 32, y: 64, r: 6 },
    { x: 56, y: 62, r: 5 },
  ];
  return (
    <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      <GoldDefs />
      <g filter="url(#emb-sh)">
        {stars.map((s, i) => (
          <polygon key={i} points={starPoints(s.x, s.y, s.r, s.r * 0.42)} fill="url(#gld)" opacity="0.93" />
        ))}
      </g>
    </svg>
  );
}

function starPoints(cx: number, cy: number, outerR: number, innerR: number): string {
  return Array.from({ length: 10 }, (_, i) => {
    const angle = (i * 36 - 90) * (Math.PI / 180);
    const r = i % 2 === 0 ? outerR : innerR;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}

function Emblem({ type }: { type: EmblemType }) {
  switch (type) {
    case "eu":             return <EuEmblem />;
    case "crown":          return <CrownEmblem />;
    case "eagle":          return <EagleEmblem />;
    case "maple":          return <MapleEmblem />;
    case "southern-cross": return <SouthernCrossEmblem />;
  }
}

// ─── PassportObject ───────────────────────────────────────────────────────────

interface PassportObjectProps {
  passportId: string;
  isEntering: boolean;
  /** True while the passport-opening pre-animation plays (before full zoom-in) */
  isOpening?: boolean;
  onEnter: () => void;
  /** Optional class forwarded to the outer container — used by gateway mobile CSS */
  className?: string;
}

export function PassportObject({ passportId, isEntering, isOpening = false, onEnter, className }: PassportObjectProps) {
  const theme = THEMES[passportId] ?? THEMES.fr;
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const passportRef  = useRef<HTMLDivElement>(null);
  const shimmerRef   = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number | null>(null);

  const targetRef  = useRef({ rx: 0, ry: 0, sx: 50, sy: 50 });
  const currentRef = useRef({ rx: 0, ry: 0, sx: 50, sy: 50 });
  const isHoveringRef = useRef(false);

  // Cancel RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const startTiltLoop = useCallback(() => {
    if (prefersReduced) return;
    if (rafRef.current !== null) return;

    function tick() {
      const t = currentRef.current;
      const g = targetRef.current;
      const factor = isHoveringRef.current ? 0.092 : 0.055;

      t.rx += (g.rx - t.rx) * factor;
      t.ry += (g.ry - t.ry) * factor;
      t.sx += (g.sx - t.sx) * factor;
      t.sy += (g.sy - t.sy) * factor;

      if (passportRef.current) {
        passportRef.current.style.transform = `rotateX(${t.rx}deg) rotateY(${t.ry}deg)`;
      }
      if (shimmerRef.current) {
        // Gold-tinted specular highlight that tracks cursor
        shimmerRef.current.style.background = `radial-gradient(
          ellipse 60% 48% at ${t.sx}% ${t.sy}%,
          rgba(255,238,170,0.15) 0%,
          rgba(255,220,120,0.06) 40%,
          transparent 70%
        )`;
      }

      const diff = Math.abs(t.rx - g.rx) + Math.abs(t.ry - g.ry);
      if (diff < 0.01 && !isHoveringRef.current) {
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [prefersReduced]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (isEntering) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
    const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    // Max tilt: ±9° vertical, ±11° horizontal — more expressive than the old ±7/±9
    targetRef.current = { rx: -dy * 9, ry: dx * 11, sx: 50 + dx * 36, sy: 50 + dy * 30 };
    isHoveringRef.current = true;
    startTiltLoop();
  }

  function handleMouseLeave() {
    targetRef.current = { rx: 0, ry: 0, sx: 50, sy: 50 };
    isHoveringRef.current = false;
    startTiltLoop();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isEntering) onEnter();
    }
  }

  // Scale 8 → fills the screen for a camera push-in feel
  const enterAnimation = prefersReduced
    ? { scale: 1, opacity: 0 }
    : { scale: 8, opacity: 0 };

  // Opening phase — cover appears to lift (rotateY slight tilt + gentle scale)
  const openingAnimation = prefersReduced
    ? {}
    : { scale: 1.04, rotateY: -16 };

  // Gradient cover: coverHighlight (top-left lit corner) → cover (body) → spineColor (shadowed edge)
  const coverBg = `linear-gradient(
    148deg,
    ${theme.coverHighlight} 0%,
    ${theme.cover} 44%,
    ${theme.spineColor}f0 80%,
    ${theme.spineColor}c0 100%
  )`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={!isEntering ? onEnter : undefined}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isEntering ? -1 : 0}
      aria-label={`Enter with ${theme.line2} passport`}
      aria-disabled={isEntering}
      className={className}
      style={{
        perspective: "1100px",
        perspectiveOrigin: "50% 50%",
        cursor: isEntering ? "default" : "pointer",
        /* Base dimensions — overridable by .gateway-passport CSS class on mobile */
        width: "min(240px, 72vw)",
        height: "min(336px, calc(72vw * 1.4))",
        flexShrink: 0,
        outline: "none",
        position: "relative",
      }}
    >
      {/* Focus ring — keyboard navigation indicator */}
      <style>{`
        [role="button"]:focus-visible .passport-focus-ring { opacity: 1; }
      `}</style>

      {/* ── Page block — parchment pages visible on right edge ── */}
      {/* Positioned as a sibling to the motion.div, behind it via z-index */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 12,
          bottom: 12,
          right: -8,
          width: 9,
          background: "repeating-linear-gradient(0deg, rgba(185,170,138,0.88) 0px, rgba(185,170,138,0.88) 0.5px, rgba(225,212,182,0.92) 0.5px, rgba(225,212,182,0.92) 4px)",
          borderRadius: "0 3px 3px 0",
          boxShadow: "2px 1px 6px rgba(0,0,0,0.32), 1px 0 3px rgba(0,0,0,0.16)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Main passport motion wrapper ── */}
      <motion.div
        ref={passportRef}
        style={{
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          willChange: "transform",
          transition: "transform 0.08s linear",
          position: "relative",
          zIndex: 1,
        }}
        animate={
          isEntering  ? enterAnimation   :
          isOpening   ? openingAnimation :
          { scale: 1, opacity: 1, rotateY: 0 }
        }
        transition={
          isEntering
            ? { duration: prefersReduced ? 0.01 : 0.92, ease: [0.16, 1, 0.3, 1] }
            : isOpening
            ? { duration: 0.40, ease: [0.25, 0.46, 0.45, 0.94] }
            : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
        }
      >
        {/* Focus ring overlay */}
        <div
          className="passport-focus-ring"
          aria-hidden
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: 14,
            border: `2px solid ${theme.accent}`,
            opacity: 0,
            pointerEvents: "none",
            transition: "opacity 0.15s ease",
            zIndex: 10,
          }}
        />

        {/* ── Passport Cover ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 10,
            overflow: "hidden",
            background: coverBg,
            boxShadow: `
              0 2px 0 0 ${theme.spineColor},
              0 32px 96px -8px rgba(0,0,0,0.82),
              0 8px 24px rgba(0,0,0,0.52),
              0 2px 8px rgba(0,0,0,0.36),
              inset 0 0 0 1.5px rgba(255,255,255,0.055),
              inset 0 1px 0 rgba(255,255,255,0.10)
            `,
          }}
        >
          {/* ── Leather grain — SVG feTurbulence at multiply blend ── */}
          {/* Creates authentic hide/grain texture without external assets */}
          <svg
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              mixBlendMode: "multiply",
              opacity: 0.18,
              pointerEvents: "none",
              borderRadius: 10,
            }}
          >
            <defs>
              <filter id={`lth-${passportId}`} x="-2%" y="-2%" width="104%" height="104%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.60 0.70"
                  numOctaves="3"
                  seed="7"
                  stitchTiles="stitch"
                  result="noise"
                />
                {/* Desaturate → gray grain */}
                <feColorMatrix type="saturate" values="0" in="noise" />
              </filter>
            </defs>
            <rect width="100%" height="100%" filter={`url(#lth-${passportId})`} rx="10" />
          </svg>

          {/* Spine shadow — darkens the left binding edge */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0, left: 0, bottom: 0,
              width: 24,
              background: `linear-gradient(90deg, ${theme.spineColor} 0%, transparent 100%)`,
              opacity: 0.72,
              pointerEvents: "none",
            }}
          />

          {/* Inner emboss frame */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 10,
              borderRadius: 5,
              border: "1px solid rgba(255,255,255,0.055)",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)",
              pointerEvents: "none",
            }}
          />

          {/* Corner ornaments — gold accent brackets */}
          {[
            { top: 14,    left: 14  },
            { top: 14,    right: 14 },
            { bottom: 14, left: 14  },
            { bottom: 14, right: 14 },
          ].map((pos, i) => (
            <div
              key={i}
              aria-hidden
              style={{
                position: "absolute",
                width: 13,
                height: 13,
                ...pos,
                borderTop:    i < 2      ? "1px solid rgba(200,164,40,0.42)" : undefined,
                borderBottom: i >= 2     ? "1px solid rgba(200,164,40,0.42)" : undefined,
                borderLeft:   i % 2 === 0 ? "1px solid rgba(200,164,40,0.42)" : undefined,
                borderRight:  i % 2 === 1 ? "1px solid rgba(200,164,40,0.42)" : undefined,
                opacity: 0.72,
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Corner wear — subtle lighter patches where leather is rubbed */}
          {[
            { top: 0,    left: 0,  borderRadius: "10px 0 0 0"  },
            { top: 0,    right: 0, borderRadius: "0 10px 0 0"  },
            { bottom: 0, left: 0,  borderRadius: "0 0 0 10px"  },
            { bottom: 0, right: 0, borderRadius: "0 0 10px 0"  },
          ].map((pos, i) => (
            <div
              key={i}
              aria-hidden
              style={{
                position: "absolute",
                width: 32,
                height: 32,
                top: pos.top, bottom: pos.bottom,
                left: pos.left, right: pos.right,
                borderRadius: pos.borderRadius,
                background: "radial-gradient(circle at center, rgba(255,255,255,0.048) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
          ))}

          {/* ── Content layer ── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "28px 20px 32px",
            }}
          >
            {/* Line 1 — union / country header */}
            <p
              style={{
                ...GOLD_TEXT,
                fontSize: 7.5,
                letterSpacing: "0.22em",
                fontWeight: 500,
                textAlign: "center",
                marginBottom: 14,
                opacity: 0.80,
                textTransform: "uppercase",
                fontFamily: "var(--font-geist-sans)",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.50))",
              }}
            >
              {theme.line1}
            </p>

            {/* Emblem — gold-gradient seal with emboss shadow */}
            <div
              style={{
                width: 78,
                height: 78,
                marginBottom: 14,
                flexShrink: 0,
                filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.52)) drop-shadow(0 -0.5px 1px rgba(248,232,144,0.10))",
              }}
            >
              <Emblem type={theme.emblem} />
            </div>

            {/* Country name */}
            <p
              style={{
                ...GOLD_TEXT,
                fontSize: theme.line2.length > 14 ? 11 : 14,
                letterSpacing: theme.line2.length > 14 ? "0.14em" : "0.22em",
                fontWeight: 600,
                textAlign: "center",
                textTransform: "uppercase",
                marginBottom: 10,
                lineHeight: 1.3,
                fontFamily: "var(--font-geist-sans)",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.50))",
              }}
            >
              {theme.line2}
            </p>

            {/* Gold divider */}
            <div
              style={{
                width: 80,
                height: 1,
                background: "linear-gradient(90deg, transparent, rgba(200,164,40,0.50), transparent)",
                marginBottom: 10,
              }}
            />

            {/* PASSPORT label */}
            <p
              style={{
                ...GOLD_TEXT,
                fontSize: 8.5,
                letterSpacing: "0.30em",
                fontWeight: 400,
                textAlign: "center",
                opacity: 0.74,
                textTransform: "uppercase",
                fontFamily: "var(--font-geist-sans)",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))",
              }}
            >
              PASSPORT
            </p>
          </div>

          {/* ── Biometric chip — bottom center ── */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: 18,
              left: "50%",
              transform: "translateX(-50%)",
              width: 30,
              height: 22,
              borderRadius: 3,
              border: "1px solid rgba(200,164,40,0.40)",
              background: "linear-gradient(135deg, rgba(200,164,40,0.13) 0%, rgba(200,164,40,0.05) 100%)",
              boxShadow: "inset 0 0 8px rgba(200,164,40,0.10), 0 1px 3px rgba(0,0,0,0.20)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
              <rect x="2" y="1" width="18" height="12" rx="1" stroke="rgba(200,164,40,0.42)" strokeWidth="0.5" fill="none" />
              <line x1="8"  y1="0" x2="8"  y2="14" stroke="rgba(200,164,40,0.28)" strokeWidth="0.5" />
              <line x1="14" y1="0" x2="14" y2="14" stroke="rgba(200,164,40,0.28)" strokeWidth="0.5" />
              <line x1="0"  y1="4" x2="22" y2="4"  stroke="rgba(200,164,40,0.22)" strokeWidth="0.5" />
              <line x1="0"  y1="7" x2="22" y2="7"  stroke="rgba(200,164,40,0.18)" strokeWidth="0.5" />
              <line x1="0"  y1="10" x2="22" y2="10" stroke="rgba(200,164,40,0.22)" strokeWidth="0.5" />
            </svg>
          </div>

          {/* ── Amber opening flash — glows from inside when cover lifts ── */}
          {(isOpening || isEntering) && !prefersReduced && (
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: isOpening && !isEntering ? [0, 0.78, 0.55] : [0.55, 0] }}
              transition={{ duration: isOpening && !isEntering ? 0.38 : 0.45, ease: "easeOut" }}
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(ellipse 60% 80% at 18% 50%, rgba(217,119,6,0.72) 0%, rgba(251,191,36,0.22) 45%, transparent 70%)",
                borderRadius: 10,
                zIndex: 20,
                pointerEvents: "none",
                mixBlendMode: "screen",
              }}
            />
          )}

          {/* ── Light shimmer — gold-tinted specular, cursor-tracking ── */}
          <div
            ref={shimmerRef}
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 60% 48% at 50% 50%, rgba(255,238,170,0.10) 0%, transparent 70%)",
              borderRadius: 10,
              pointerEvents: "none",
              mixBlendMode: "screen",
            }}
          />

          {/* Top gloss — specular strip along top edge */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: "26%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.052) 0%, transparent 100%)",
              borderRadius: "10px 10px 0 0",
              pointerEvents: "none",
            }}
          />

          {/* Edge vignette — darkens perimeter to increase center depth */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 80% 85% at 50% 44%, transparent 52%, rgba(0,0,0,0.30) 100%)",
              borderRadius: 10,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* ── Spine — left edge, 3D transform hint ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: -6,
            width: 6,
            height: "100%",
            background: `linear-gradient(90deg, ${theme.spineColor}c0, ${theme.cover}90)`,
            borderRadius: "4px 0 0 4px",
            transformOrigin: "right center",
            transform: "rotateY(-90deg)",
            transformStyle: "flat",
          }}
        />
      </motion.div>
    </div>
  );
}
