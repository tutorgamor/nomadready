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

interface PassportTheme {
  cover: string;
  coverHighlight: string;
  line1: string;
  line2: string;
  accent: string;
  spineColor: string;
}

// ─── Country Themes ───────────────────────────────────────────────────────────

const THEMES: Record<string, PassportTheme> = {
  fr: { cover: "#192450", coverHighlight: "#1e2d64", line1: "UNION EUROPÉENNE",     line2: "FRANCE",                   accent: "#C8A428", spineColor: "#111830" },
  uk: { cover: "#4A0E1B", coverHighlight: "#5d1222", line1: "GREAT BRITAIN",         line2: "UNITED KINGDOM",           accent: "#C8A428", spineColor: "#320910" },
  de: { cover: "#1A1A1C", coverHighlight: "#272728", line1: "BUNDESREPUBLIK",         line2: "DEUTSCHLAND",              accent: "#C8A428", spineColor: "#111112" },
  nl: { cover: "#13276B", coverHighlight: "#1a3285", line1: "KONINKRIJK DER",         line2: "NEDERLAND",                accent: "#C8A428", spineColor: "#0c1a49" },
  es: { cover: "#8A1823", coverHighlight: "#a51e2b", line1: "REINO DE ESPAÑA",        line2: "ESPAÑA",                   accent: "#C8A428", spineColor: "#5c1017" },
  it: { cover: "#193B19", coverHighlight: "#1f491f", line1: "REPUBBLICA ITALIANA",    line2: "ITALIA",                   accent: "#C8A428", spineColor: "#102710" },
  be: { cover: "#0E1F5C", coverHighlight: "#132872", line1: "ROYAUME DE BELGIQUE",    line2: "BELGIQUE",                 accent: "#C8A428", spineColor: "#09143d" },
  us: { cover: "#1A2A58", coverHighlight: "#20336c", line1: "DEPARTMENT OF STATE",    line2: "UNITED STATES OF AMERICA", accent: "#C8A428", spineColor: "#101a3a" },
  ca: { cover: "#1C2C4A", coverHighlight: "#22365a", line1: "GOUVERNEMENT DU CANADA", line2: "CANADA",                   accent: "#C8A428", spineColor: "#111c30" },
  au: { cover: "#0A2948", coverHighlight: "#0e3358", line1: "COMMONWEALTH OF",        line2: "AUSTRALIA",                accent: "#C8A428", spineColor: "#061a2e" },
};

// ─── Flag SVG Components ─────────────────────────────────────────────────────
// One accurate flag SVG per passport country (viewBox 0 0 90 60, 3:2 ratio).

function FlagFR() {
  return (
    <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "100%" }}>
      <rect width="30"  height="60" fill="#002395"/>
      <rect x="30" width="30" height="60" fill="#FFFFFF"/>
      <rect x="60" width="30" height="60" fill="#ED2939"/>
    </svg>
  );
}

function FlagUK() {
  return (
    <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "100%" }}>
      <rect width="90" height="60" fill="#012169"/>
      <line x1="0" y1="0" x2="90" y2="60" stroke="white" strokeWidth="12"/>
      <line x1="90" y1="0" x2="0" y2="60" stroke="white" strokeWidth="12"/>
      {/* St Patrick's red saltire (counterchange simplified) */}
      <polygon points="0,0 12,0 45,22 45,27 0,5"    fill="#C8102E"/>
      <polygon points="90,0 78,0 45,22 45,27 90,5"  fill="#C8102E"/>
      <polygon points="0,60 12,60 45,38 45,33 0,55" fill="#C8102E"/>
      <polygon points="90,60 78,60 45,38 45,33 90,55" fill="#C8102E"/>
      <rect x="33"   y="0"  width="24" height="60" fill="white"/>
      <rect x="0"    y="21" width="90" height="18" fill="white"/>
      <rect x="37.5" y="0"  width="15" height="60" fill="#C8102E"/>
      <rect x="0"    y="25.5" width="90" height="9" fill="#C8102E"/>
    </svg>
  );
}

function FlagDE() {
  return (
    <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "100%" }}>
      <rect y="0"  width="90" height="20" fill="#000000"/>
      <rect y="20" width="90" height="20" fill="#DD0000"/>
      <rect y="40" width="90" height="20" fill="#FFCE00"/>
    </svg>
  );
}

function FlagNL() {
  return (
    <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "100%" }}>
      <rect y="0"  width="90" height="20" fill="#AE1C28"/>
      <rect y="20" width="90" height="20" fill="#FFFFFF"/>
      <rect y="40" width="90" height="20" fill="#21468B"/>
    </svg>
  );
}

function FlagES() {
  return (
    <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "100%" }}>
      <rect y="0"  width="90" height="15" fill="#AA151B"/>
      <rect y="15" width="90" height="30" fill="#F1BF00"/>
      <rect y="45" width="90" height="15" fill="#AA151B"/>
    </svg>
  );
}

function FlagIT() {
  return (
    <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "100%" }}>
      <rect width="30"  height="60" fill="#009246"/>
      <rect x="30" width="30" height="60" fill="#FFFFFF"/>
      <rect x="60" width="30" height="60" fill="#CE2B37"/>
    </svg>
  );
}

function FlagBE() {
  return (
    <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "100%" }}>
      <rect width="30"  height="60" fill="#000000"/>
      <rect x="30" width="30" height="60" fill="#FAE042"/>
      <rect x="60" width="30" height="60" fill="#EF3340"/>
    </svg>
  );
}

function FlagUS() {
  const sh = 60 / 13;
  return (
    <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "100%" }}>
      {Array.from({ length: 13 }, (_, i) => (
        <rect key={i} x="0" y={i * sh} width="90" height={sh} fill={i % 2 === 0 ? "#B22234" : "#FFFFFF"}/>
      ))}
      <rect width="36" height={sh * 7} fill="#3C3B6E"/>
      {Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 6 }, (_, c) => (
          <circle key={`${r}-${c}`}
            cx={3 + c * 6} cy={2.3 + r * (sh * 7 / 5)} r="1.5"
            fill="white" opacity="0.92"/>
        ))
      )}
    </svg>
  );
}

function FlagCA() {
  const leaf = "M45,13 L46.8,20 L52.5,17.5 L50,24 L57,22.5 L53,29 L63,30 L57,35.5 L59.5,43 L51,40 L48,46 L46,46 L46,51 L44,51 L44,46 L42,46 L39,40 L30.5,43 L33,35.5 L27,30 L37,29 L33,22.5 L40,24 L37.5,17.5 L43.2,20 Z";
  return (
    <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "100%" }}>
      <rect width="22.5" height="60" fill="#FF0000"/>
      <rect x="22.5" width="45" height="60" fill="#FFFFFF"/>
      <rect x="67.5" width="22.5" height="60" fill="#FF0000"/>
      <path d={leaf} fill="#FF0000"/>
    </svg>
  );
}

function starPts(cx: number, cy: number, outer: number, inner: number, points: number): string {
  return Array.from({ length: points * 2 }, (_, i) => {
    const angle = (i * (360 / (points * 2)) - 90) * (Math.PI / 180);
    const r = i % 2 === 0 ? outer : inner;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}

function FlagAU() {
  const uj = { x: 0, y: 0, w: 45, h: 30 };
  const { x, y, w, h } = uj;
  const cjx = x + w / 2, cjy = y + h / 2;
  return (
    <svg viewBox="0 0 90 60" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%", height: "100%" }}>
      <rect width="90" height="60" fill="#00008B"/>
      {/* Mini Union Jack top-left */}
      <rect x={x} y={y} width={w} height={h} fill="#012169"/>
      <line x1={x} y1={y} x2={x+w} y2={y+h} stroke="white" strokeWidth={h*0.18}/>
      <line x1={x+w} y1={y} x2={x} y2={y+h} stroke="white" strokeWidth={h*0.18}/>
      <line x1={x} y1={y} x2={x+w} y2={y+h} stroke="#C8102E" strokeWidth={h*0.06}/>
      <line x1={x+w} y1={y} x2={x} y2={y+h} stroke="#C8102E" strokeWidth={h*0.06}/>
      <rect x={cjx-w*0.22} y={y} width={w*0.44} height={h} fill="white"/>
      <rect x={x} y={cjy-h*0.22} width={w} height={h*0.44} fill="white"/>
      <rect x={cjx-w*0.14} y={y} width={w*0.28} height={h} fill="#C8102E"/>
      <rect x={x} y={cjy-h*0.14} width={w} height={h*0.28} fill="#C8102E"/>
      {/* Commonwealth Star (7-pointed) */}
      <polygon points={starPts(22, 47, 8, 3.5, 7)} fill="white"/>
      {/* Southern Cross */}
      <polygon points={starPts(70, 49, 7,   3,   7)} fill="white"/>
      <polygon points={starPts(58, 34, 5.5, 2.4, 7)} fill="white"/>
      <polygon points={starPts(63, 13, 5.5, 2.4, 7)} fill="white"/>
      <polygon points={starPts(79, 27, 5.5, 2.4, 7)} fill="white"/>
      <polygon points={starPts(70, 30, 3,   1.2, 5)} fill="white"/>
    </svg>
  );
}

function FlagSVG({ id }: { id: string }) {
  switch (id) {
    case "fr": return <FlagFR />;
    case "uk": return <FlagUK />;
    case "de": return <FlagDE />;
    case "nl": return <FlagNL />;
    case "es": return <FlagES />;
    case "it": return <FlagIT />;
    case "be": return <FlagBE />;
    case "us": return <FlagUS />;
    case "ca": return <FlagCA />;
    case "au": return <FlagAU />;
    default:   return <FlagFR />;
  }
}

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

            {/* Flag — accurate national flag with gold frame */}
            <div
              style={{
                width: 84,
                height: 56,
                marginBottom: 14,
                flexShrink: 0,
                borderRadius: 2,
                overflow: "hidden",
                border: "1.5px solid rgba(200,164,40,0.42)",
                boxShadow: "0 3px 10px rgba(0,0,0,0.52), 0 1px 3px rgba(0,0,0,0.30), inset 0 0 0 0.5px rgba(255,255,255,0.05)",
              }}
            >
              <FlagSVG id={passportId} />
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
