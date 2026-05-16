"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";

// ─── Country Themes ───────────────────────────────────────────────────────────

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

const THEMES: Record<string, PassportTheme> = {
  fr: { cover: "#192450", coverHighlight: "#1e2d64", line1: "UNION EUROPÉENNE", line2: "FRANCE", accent: "#C8A428", emblem: "eu", spineColor: "#111830" },
  uk: { cover: "#4A0E1B", coverHighlight: "#5d1222", line1: "GREAT BRITAIN", line2: "UNITED KINGDOM", accent: "#C8A428", emblem: "crown", spineColor: "#320910" },
  de: { cover: "#1A1A1C", coverHighlight: "#242428", line1: "BUNDESREPUBLIK", line2: "DEUTSCHLAND", accent: "#C8A428", emblem: "eagle", spineColor: "#111112" },
  nl: { cover: "#13276B", coverHighlight: "#1a3285", line1: "KONINKRIJK DER", line2: "NEDERLAND", accent: "#C8A428", emblem: "eu", spineColor: "#0c1a49" },
  es: { cover: "#8A1823", coverHighlight: "#a51e2b", line1: "REINO DE ESPAÑA", line2: "ESPAÑA", accent: "#C8A428", emblem: "eu", spineColor: "#5c1017" },
  it: { cover: "#193B19", coverHighlight: "#1f491f", line1: "REPUBBLICA ITALIANA", line2: "ITALIA", accent: "#C8A428", emblem: "eu", spineColor: "#102710" },
  be: { cover: "#0E1F5C", coverHighlight: "#132872", line1: "ROYAUME DE BELGIQUE", line2: "BELGIQUE", accent: "#C8A428", emblem: "eu", spineColor: "#09143d" },
  us: { cover: "#1A2A58", coverHighlight: "#20336c", line1: "DEPARTMENT OF STATE", line2: "UNITED STATES OF AMERICA", accent: "#C8A428", emblem: "eagle", spineColor: "#101a3a" },
  ca: { cover: "#1C2C4A", coverHighlight: "#22365a", line1: "GOUVERNEMENT DU CANADA", line2: "CANADA", accent: "#C8A428", emblem: "maple", spineColor: "#111c30" },
  au: { cover: "#0A2948", coverHighlight: "#0e3358", line1: "COMMONWEALTH OF", line2: "AUSTRALIA", accent: "#C8A428", emblem: "southern-cross", spineColor: "#061a2e" },
};

// ─── Emblem SVGs ─────────────────────────────────────────────────────────────

function EuEmblem({ color }: { color: string }) {
  const stars = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const r = 30;
    return { x: 44 + r * Math.cos(angle), y: 44 + r * Math.sin(angle) };
  });
  return (
    <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      {stars.map((s, i) => (
        <polygon key={i} points={starPoints(s.x, s.y, 4, 2)} fill={color} opacity="0.9" />
      ))}
    </svg>
  );
}

function CrownEmblem({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="56" width="52" height="9" rx="2" fill={color} opacity="0.9" />
      <rect x="22" y="38" width="9" height="21" rx="2" fill={color} opacity="0.9" />
      <rect x="39" y="28" width="10" height="31" rx="2" fill={color} opacity="0.9" />
      <rect x="57" y="38" width="9" height="21" rx="2" fill={color} opacity="0.9" />
      <circle cx="26.5" cy="35" r="5" fill={color} opacity="0.9" />
      <circle cx="44" cy="24" r="6" fill={color} opacity="0.9" />
      <circle cx="61.5" cy="35" r="5" fill={color} opacity="0.9" />
      <circle cx="44" cy="24" r="2.5" fill={color} opacity="0.3" />
    </svg>
  );
}

function EagleEmblem({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="44" cy="22" r="8" fill={color} opacity="0.9" />
      <path d="M50 25 L58 23 L52 29 Z" fill={color} opacity="0.9" />
      <ellipse cx="44" cy="48" rx="10" ry="14" fill={color} opacity="0.9" />
      <path d="M34 42 Q18 32 8 40 Q14 50 32 48 Z" fill={color} opacity="0.85" />
      <path d="M54 42 Q70 32 80 40 Q74 50 56 48 Z" fill={color} opacity="0.85" />
      <path d="M10 38 Q6 44 9 50" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M8 43 Q4 48 7 54" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M78 38 Q82 44 79 50" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M80 43 Q84 48 81 54" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <path d="M36 60 Q38 70 44 68 Q50 70 52 60" fill={color} opacity="0.85" />
      <path d="M39 62 L36 72 M44 63 L44 73 M49 62 L52 72" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function MapleEmblem({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M44 8 L47 20 L54 14 L50 24 L62 20 L56 30 L68 30 L60 38 L70 42 L58 42 L62 54 L44 46 L26 54 L30 42 L18 42 L28 38 L20 30 L32 30 L26 20 L38 24 L34 14 L41 20 Z"
        fill={color} opacity="0.9"
      />
      <rect x="42" y="54" width="4" height="16" rx="1.5" fill={color} opacity="0.9" />
    </svg>
  );
}

function SouthernCrossEmblem({ color }: { color: string }) {
  const stars5 = [
    { x: 44, y: 16, r: 7 },
    { x: 22, y: 40, r: 6 },
    { x: 66, y: 40, r: 6 },
    { x: 32, y: 64, r: 6 },
    { x: 56, y: 62, r: 5 },
  ];
  return (
    <svg viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
      {stars5.map((s, i) => (
        <polygon key={i} points={starPoints(s.x, s.y, s.r, s.r * 0.42)} fill={color} opacity="0.9" />
      ))}
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

function Emblem({ type, color }: { type: EmblemType; color: string }) {
  switch (type) {
    case "eu":             return <EuEmblem color={color} />;
    case "crown":          return <CrownEmblem color={color} />;
    case "eagle":          return <EagleEmblem color={color} />;
    case "maple":          return <MapleEmblem color={color} />;
    case "southern-cross": return <SouthernCrossEmblem color={color} />;
  }
}

// ─── Passport Object ─────────────────────────────────────────────────────────

interface PassportObjectProps {
  passportId: string;
  isEntering: boolean;
  onEnter: () => void;
  className?: string;
}

export function PassportObject({ passportId, isEntering, onEnter, className }: PassportObjectProps) {
  const theme = THEMES[passportId] ?? THEMES.fr;
  const prefersReduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const passportRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const targetRef = useRef({ rx: 0, ry: 0, sx: 50, sy: 50 });
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
      const factor = isHoveringRef.current ? 0.1 : 0.06;

      t.rx += (g.rx - t.rx) * factor;
      t.ry += (g.ry - t.ry) * factor;
      t.sx += (g.sx - t.sx) * factor;
      t.sy += (g.sy - t.sy) * factor;

      if (passportRef.current) {
        passportRef.current.style.transform = `rotateX(${t.rx}deg) rotateY(${t.ry}deg)`;
      }
      if (shimmerRef.current) {
        shimmerRef.current.style.background = `radial-gradient(ellipse 70% 55% at ${t.sx}% ${t.sy}%, rgba(255,255,255,0.09) 0%, transparent 70%)`;
      }

      if (
        Math.abs(t.rx - g.rx) < 0.01 &&
        Math.abs(t.ry - g.ry) < 0.01 &&
        !isHoveringRef.current
      ) {
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
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    targetRef.current = { rx: -dy * 7, ry: dx * 9, sx: 50 + dx * 30, sy: 50 + dy * 30 };
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

  const enterAnimation = prefersReduced
    ? { scale: 1, opacity: 0 }
    : { scale: 6, opacity: 0 };

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
        width: "min(240px, 72vw)",
        height: "min(336px, calc(72vw * 1.4))",
        flexShrink: 0,
        outline: "none",
      }}
    >
      {/* Focus ring — keyboard navigation indicator */}
      <style>{`
        [role="button"]:focus-visible .passport-focus-ring {
          opacity: 1;
        }
      `}</style>

      <motion.div
        ref={passportRef}
        style={{
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          willChange: "transform",
          transition: "transform 0.08s linear",
          position: "relative",
        }}
        animate={isEntering ? enterAnimation : { scale: 1, opacity: 1 }}
        transition={
          isEntering
            ? { duration: prefersReduced ? 0.01 : 0.9, ease: [0.16, 1, 0.3, 1] }
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

        {/* Passport Cover */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 10,
            overflow: "hidden",
            background: theme.cover,
            boxShadow: `
              0 2px 0 0 ${theme.spineColor},
              0 24px 80px -8px rgba(0,0,0,0.7),
              0 4px 16px rgba(0,0,0,0.4),
              inset 0 0 0 1.5px rgba(255,255,255,0.06),
              inset 0 1px 0 rgba(255,255,255,0.12)
            `,
          }}
        >
          {/* Leather dot-matrix texture */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
              backgroundSize: "3px 3px",
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
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)",
              pointerEvents: "none",
            }}
          />

          {/* Corner ornaments */}
          {[
            { top: 14, left: 14 },
            { top: 14, right: 14 },
            { bottom: 14, left: 14 },
            { bottom: 14, right: 14 },
          ].map((pos, i) => (
            <div
              key={i}
              aria-hidden
              style={{
                position: "absolute",
                width: 12,
                height: 12,
                ...pos,
                borderTop: i < 2 ? `1px solid ${theme.accent}44` : undefined,
                borderBottom: i >= 2 ? `1px solid ${theme.accent}44` : undefined,
                borderLeft: i % 2 === 0 ? `1px solid ${theme.accent}44` : undefined,
                borderRight: i % 2 === 1 ? `1px solid ${theme.accent}44` : undefined,
                opacity: 0.6,
              }}
            />
          ))}

          {/* Content */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "28px 20px 24px",
            }}
          >
            <p
              style={{
                color: theme.accent,
                fontSize: 7.5,
                letterSpacing: "0.22em",
                fontWeight: 500,
                textAlign: "center",
                marginBottom: 14,
                opacity: 0.75,
                textTransform: "uppercase",
                fontFamily: "var(--font-geist-sans)",
              }}
            >
              {theme.line1}
            </p>

            <div style={{ width: 76, height: 76, marginBottom: 12, flexShrink: 0 }}>
              <Emblem type={theme.emblem} color={theme.accent} />
            </div>

            <p
              style={{
                color: theme.accent,
                fontSize: theme.line2.length > 14 ? 11 : 14,
                letterSpacing: theme.line2.length > 14 ? "0.14em" : "0.22em",
                fontWeight: 600,
                textAlign: "center",
                textTransform: "uppercase",
                marginBottom: 10,
                lineHeight: 1.3,
                fontFamily: "var(--font-geist-sans)",
              }}
            >
              {theme.line2}
            </p>

            <div
              style={{
                width: 80,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${theme.accent}55, transparent)`,
                marginBottom: 10,
              }}
            />

            <p
              style={{
                color: theme.accent,
                fontSize: 8.5,
                letterSpacing: "0.3em",
                fontWeight: 400,
                textAlign: "center",
                opacity: 0.7,
                textTransform: "uppercase",
                fontFamily: "var(--font-geist-sans)",
              }}
            >
              PASSPORT
            </p>
          </div>

          {/* Light shimmer */}
          <div
            ref={shimmerRef}
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(255,255,255,0.07) 0%, transparent 70%)",
              borderRadius: 10,
              pointerEvents: "none",
              mixBlendMode: "screen",
            }}
          />

          {/* Top gloss */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "30%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)",
              borderRadius: "10px 10px 0 0",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Spine */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: -6,
            width: 6,
            height: "100%",
            background: `linear-gradient(90deg, ${theme.spineColor}cc, ${theme.cover}88)`,
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
