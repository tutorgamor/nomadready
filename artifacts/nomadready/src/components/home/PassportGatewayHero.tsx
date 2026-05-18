"use client";

/**
 * PassportGatewayHero — cinematic atmospheric passport-entry ritual.
 *
 * Environment:
 *   - Deep cinematic night base (#0c1020)
 *   - Warm amber desk-lamp glow pool centered on the passport (radial, large, soft)
 *   - Two parallax atmospheric glows (amber upper-right, blue-grey lower-left)
 *     that drift subtly with the cursor — RAF-driven, stops when mouse is idle
 *   - Paper grain at screen blend (editorial texture)
 *
 * Passport entrance:
 *   - Descends from y:-38 with cinematic ease [0.16, 1, 0.3, 1]
 *   - Slight scale bloom (0.94 → 1) as it "lands"
 *   - Eyebrow, chips, CTA stagger in afterward
 *
 * Passport exit (Enter click):
 *   - Passport scales to 8× with camera-push-in ease
 *   - Overlay fades after 250ms (passport eclipses it mid-zoom)
 *   - DOM removed at 920ms
 *
 * Mobile layout:
 *   - CSS classes gateway-shell / gateway-top / gateway-bottom (globals.css)
 *   - Top zone: passport hero; bottom zone: frosted panel with selector + CTA
 *   - Chips scroll horizontally, CTA full-width
 *   - Parallax disabled on touch (no mousemove events)
 *
 * Accessibility:
 *   - prefers-reduced-motion: all durations → 1ms, parallax loop skipped
 *   - radiogroup ARIA on passport selector
 *   - focus-visible rings on all interactive elements
 *   - touch targets ≥44px
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { motion, useReducedMotion } from "motion/react";
import { PassportObject } from "./PassportObject";
import { getT } from "@/lib/i18n";

// ─── Passport roster ──────────────────────────────────────────────────────────

const PASSPORTS = [
  { id: "fr", emoji: "🇫🇷", label: "France"      },
  { id: "uk", emoji: "🇬🇧", label: "UK"          },
  { id: "de", emoji: "🇩🇪", label: "Germany"     },
  { id: "nl", emoji: "🇳🇱", label: "Netherlands" },
  { id: "es", emoji: "🇪🇸", label: "Spain"       },
  { id: "it", emoji: "🇮🇹", label: "Italy"       },
  { id: "be", emoji: "🇧🇪", label: "Belgium"     },
  { id: "us", emoji: "🇺🇸", label: "USA"         },
  { id: "ca", emoji: "🇨🇦", label: "Canada"      },
  { id: "au", emoji: "🇦🇺", label: "Australia"   },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface PassportGatewayHeroProps {
  defaultPassportId?: string;
}

export function PassportGatewayHero({ defaultPassportId = "fr" }: PassportGatewayHeroProps) {
  const [visible,       setVisible]       = useState(false);
  const [activeId,      setActiveId]      = useState(defaultPassportId);
  const [isOpening,     setIsOpening]     = useState(false);
  const [isEntering,    setIsEntering]    = useState(false);
  const [overlayFading, setOverlayFading] = useState(false);

  const prefersReduced = useReducedMotion();
  const [, setLocation] = useLocation();

  // ── Parallax system ───────────────────────────────────────────────────────
  // Tracks cursor-relative position (−0.5 → 0.5) and interpolates smoothly.
  // Direct DOM style mutations to avoid React re-renders in RAF loop.
  const parallaxRef    = useRef({ tx: 0, ty: 0, cx: 0, cy: 0 });
  const parallaxRafRef = useRef<number | null>(null);
  const glowARef       = useRef<HTMLDivElement>(null); // amber upper-right
  const glowBRef       = useRef<HTMLDivElement>(null); // cool lower-left
  const deskLightRef   = useRef<HTMLDivElement>(null); // warm pool beneath passport

  useEffect(() => {
    if (prefersReduced) return;

    function loop() {
      const p = parallaxRef.current;
      // Smooth interpolation — stops naturally when converged
      p.cx += (p.tx - p.cx) * 0.055;
      p.cy += (p.ty - p.cy) * 0.055;

      // Glow A drifts with cursor (same direction, larger amplitude)
      if (glowARef.current) {
        glowARef.current.style.transform = `translate(${p.cx * 36}px, ${p.cy * 22}px)`;
      }
      // Glow B counter-drifts (opposite direction, smaller amplitude)
      if (glowBRef.current) {
        glowBRef.current.style.transform = `translate(${-p.cx * 26}px, ${-p.cy * 16}px)`;
      }
      // Desk light follows passport slightly
      if (deskLightRef.current) {
        deskLightRef.current.style.transform = `translate(calc(-50% + ${p.cx * 10}px), calc(-50% + ${p.cy * 7}px))`;
      }

      const diff = Math.abs(p.tx - p.cx) + Math.abs(p.ty - p.cy);
      if (diff > 0.001) {
        parallaxRafRef.current = requestAnimationFrame(loop);
      } else {
        parallaxRafRef.current = null;
      }
    }

    function onMouseMove(e: MouseEvent) {
      parallaxRef.current.tx = e.clientX / window.innerWidth  - 0.5;
      parallaxRef.current.ty = e.clientY / window.innerHeight - 0.5;
      if (parallaxRafRef.current === null) {
        parallaxRafRef.current = requestAnimationFrame(loop);
      }
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (parallaxRafRef.current !== null) {
        cancelAnimationFrame(parallaxRafRef.current);
        parallaxRafRef.current = null;
      }
    };
  }, [prefersReduced]);

  // ── Visibility gating — initial show ────────────────────────────────────
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("skip_gateway") === "1") return;
    try {
      if (sessionStorage.getItem("nr_gateway_passed") === "1") return;
    } catch { /* private browsing — always show */ }
    setVisible(true);
  }, []);

  // ── Re-show listener — dispatched by OpenGatewayLink from anywhere ───────
  // Reads the current URL passport so the gateway pre-selects correctly.
  useEffect(() => {
    const validIds = new Set(PASSPORTS.map((p) => p.id));

    function handleShowGateway() {
      // Sync to whatever passport the URL currently carries
      try {
        const params = new URLSearchParams(window.location.search);
        const urlPassport = params.get("passport") ?? "fr";
        setActiveId(validIds.has(urlPassport) ? urlPassport : "fr");
      } catch { /* no URL API — keep current */ }

      setIsOpening(false);
      setIsEntering(false);
      setOverlayFading(false);
      setVisible(true);
    }

    window.addEventListener("nr:show-gateway", handleShowGateway);
    return () => window.removeEventListener("nr:show-gateway", handleShowGateway);
  }, []); // stable — setters and PASSPORTS never change

  // ── Enter handler ─────────────────────────────────────────────────────────
  // Phase 1 (0 → 400ms):  passport "opens" — isOpening=true  (cover lifts + amber flash)
  // Phase 2 (400 → 1320ms): passport zooms to 8× — isEntering=true (camera push-in)
  // Phase 3 (650ms):        overlay starts fading (passport eclipses it)
  // Phase 4 (1320ms):       gateway unmounts
  const handleEnter = useCallback(() => {
    if (isEntering || isOpening) return;

    const openDuration  = prefersReduced ? 0   : 400;
    const fadDelay      = prefersReduced ? 0   : openDuration + 250;
    const removeDelay   = prefersReduced ? 50  : openDuration + 920;

    setIsOpening(true);

    // Navigate immediately so page content loads behind the animation
    setLocation(`/?passport=${activeId}`);

    setTimeout(() => {
      setIsEntering(true);
    }, openDuration);

    setTimeout(() => setOverlayFading(true), fadDelay);
    setTimeout(() => {
      setVisible(false);
      try { sessionStorage.setItem("nr_gateway_passed", "1"); } catch { /* ignore */ }
    }, removeDelay);
  }, [isEntering, isOpening, prefersReduced, activeId, setLocation]);

  if (!visible) return null;

  // ── Translations — reactive to activeId ─────────────────────────────────
  const t = getT(activeId);

  // ── Animation durations ───────────────────────────────────────────────────
  const fadeDuration     = prefersReduced ? 0.01 : 0.55;
  const entranceDuration = prefersReduced ? 0.01 : 0.68;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: overlayFading ? 0 : 1 }}
      transition={overlayFading
        ? { duration: fadeDuration, ease: "easeInOut" }
        : { duration: fadeDuration, ease: "easeOut" }
      }
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        overflow: "hidden",
        /* Layered atmospheric background:
           • Central amber warmth (desk lamp)
           • Cool blue-grey ambient (night shadow)
           • Deep cinematic night base                  */
        background: `
          radial-gradient(ellipse 72% 58% at 62% 42%, rgba(140,90,18,0.072) 0%, transparent 58%),
          radial-gradient(ellipse 55% 48% at 18% 72%, rgba(30,50,120,0.060) 0%, transparent 58%),
          linear-gradient(162deg, #0c1020 0%, #0d1228 52%, #080d1c 100%)
        `,
      }}
    >

      {/* ── Atmospheric glow A — warm amber, upper-right ── */}
      {/* Drifts with cursor via parallax RAF               */}
      <div
        ref={glowARef}
        aria-hidden
        style={{
          position: "absolute",
          top: "-18%",
          right: "-8%",
          width: "64%",
          height: "72%",
          background: "radial-gradient(ellipse, rgba(200,158,38,0.062) 0%, rgba(180,120,20,0.024) 48%, transparent 68%)",
          pointerEvents: "none",
          willChange: "transform",
        }}
      />

      {/* ── Atmospheric glow B — cool steel, lower-left ── */}
      <div
        ref={glowBRef}
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-12%",
          left: "-12%",
          width: "52%",
          height: "58%",
          background: "radial-gradient(ellipse, rgba(48,80,180,0.046) 0%, transparent 70%)",
          pointerEvents: "none",
          willChange: "transform",
        }}
      />

      {/* ── Desk lamp — warm amber pool centered on passport ── */}
      {/* Simulates a single warm light source illuminating the object.
          Shifts slightly with cursor to reinforce the physical light feel. */}
      <div
        ref={deskLightRef}
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(560px, 80vw)",
          height: "min(420px, 60vw)",
          background: "radial-gradient(ellipse, rgba(190,148,32,0.068) 0%, rgba(170,120,20,0.026) 44%, transparent 70%)",
          pointerEvents: "none",
          willChange: "transform",
        }}
      />

      {/* ── Paper grain texture ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/assets/ui/paper-grain.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "240px 240px",
          opacity: 0.022,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      {/* ════════════════════════════════════════════════
          Responsive content shell
          Desktop: centered column — gateway-shell CSS
          Mobile ≤639px: top zone + bottom panel
          ════════════════════════════════════════════════ */}
      <div className="gateway-shell">

        {/* ── Top zone — eyebrow + passport ── */}
        <div className="gateway-top">

          {/* Eyebrow */}
          <motion.p
            className="gateway-eyebrow"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: entranceDuration, delay: prefersReduced ? 0 : 0.32, ease: [0.25, 1, 0.5, 1] }}
            style={{
              color: "rgba(200,164,40,0.60)",
              fontSize: 10,
              letterSpacing: "0.28em",
              fontWeight: 500,
              textTransform: "uppercase",
              textAlign: "center",
              fontFamily: "var(--font-geist-sans)",
              margin: 0,
            }}
          >
            {t.travelFieldGuide}
          </motion.p>

          {/* Passport — descends from above, "lands" on the surface */}
          <motion.div
            className="gateway-passport-wrap"
            initial={{ opacity: 0, y: -38, scale: 0.95 }}
            animate={{ opacity: 1,  y: 0,   scale: 1    }}
            transition={{
              duration: prefersReduced ? 0.01 : 0.88,
              delay:    prefersReduced ? 0    : 0.10,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <PassportObject
              passportId={activeId}
              isOpening={isOpening}
              isEntering={isEntering}
              onEnter={handleEnter}
              className="gateway-passport"
            />
          </motion.div>

        </div>{/* /gateway-top */}

        {/* ── Bottom zone — selector, CTA, hint ── */}
        {/* Mobile: frosted bottom-sheet panel     */}
        {/* Desktop: continuation of centered col  */}
        <div className="gateway-bottom">

          {/* Visible label — displayed only on mobile via CSS */}
          <p className="gateway-selector-label" aria-hidden>
            {t.yourPassport}
          </p>

          {/* Passport selector — radiogroup for a11y */}
          <motion.div
            role="radiogroup"
            aria-label="Select your passport"
            className="gateway-chips"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: entranceDuration, delay: prefersReduced ? 0 : 0.52, ease: [0.25, 1, 0.5, 1] }}
            style={{ gap: 6 }}
          >
            {PASSPORTS.map((p) => {
              const isActive = activeId === p.id;
              return (
                <button
                  key={p.id}
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => !isEntering && !isOpening && setActiveId(p.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    paddingInline: 12,
                    paddingBlock: 10,
                    minHeight: 36,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    borderRadius: 100,
                    border: `1px solid ${isActive ? "rgba(200,164,40,0.55)" : "rgba(255,255,255,0.09)"}`,
                    background: isActive ? "rgba(200,164,40,0.12)" : "rgba(255,255,255,0.04)",
                    color: isActive ? "rgba(210,174,50,0.96)" : "rgba(255,255,255,0.46)",
                    fontSize: 11.5,
                    fontWeight: isActive ? 500 : 400,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    fontFamily: "var(--font-geist-sans)",
                    letterSpacing: "0.01em",
                    outline: "none",
                    /* Active chip gets a warm amber glow */
                    boxShadow: isActive
                      ? "0 0 14px -4px rgba(200,164,40,0.28), inset 0 0 0 1px rgba(200,164,40,0.18)"
                      : "none",
                  }}
                  onFocus={(e)  => { e.currentTarget.style.boxShadow = "0 0 0 2px rgba(200,164,40,0.55)"; }}
                  onBlur={(e)   => {
                    e.currentTarget.style.boxShadow = isActive
                      ? "0 0 14px -4px rgba(200,164,40,0.28), inset 0 0 0 1px rgba(200,164,40,0.18)"
                      : "none";
                  }}
                >
                  <span style={{ fontSize: 13 }} aria-hidden>{p.emoji}</span>
                  {p.label}
                </button>
              );
            })}
          </motion.div>

          {/* Enter CTA */}
          <motion.button
            className="gateway-cta"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: entranceDuration, delay: prefersReduced ? 0 : 0.66, ease: [0.25, 1, 0.5, 1] }}
            onClick={handleEnter}
            disabled={isEntering || isOpening}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              paddingInline: 28,
              paddingBlock: 14,
              borderRadius: 100,
              border: "1px solid rgba(200,164,40,0.36)",
              background: "rgba(200,164,40,0.09)",
              color: "rgba(210,174,50,0.88)",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.07em",
              cursor: isEntering || isOpening ? "default" : "pointer",
              fontFamily: "var(--font-geist-sans)",
              opacity: isEntering || isOpening ? 0.4 : 1,
              transition: "opacity 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
              textTransform: "uppercase",
              outline: "none",
            }}
            whileHover={!isEntering && !isOpening ? {
              background: "rgba(200,164,40,0.15)",
              boxShadow: "0 0 28px -6px rgba(200,164,40,0.30)",
            } : {}}
            whileTap={!isEntering && !isOpening ? { scale: 0.97 } : {}}
            onFocus={(e)  => { e.currentTarget.style.boxShadow = "0 0 0 2px rgba(200,164,40,0.55)"; }}
            onBlur={(e)   => { e.currentTarget.style.boxShadow = "none"; }}
          >
            {t.enterGuide}
            <span style={{ fontSize: 11, opacity: 0.65, letterSpacing: 0 }} aria-hidden>→</span>
          </motion.button>

          {/* Hint */}
          <motion.p
            className="gateway-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: entranceDuration, delay: prefersReduced ? 0 : 0.88 }}
            style={{
              color: "rgba(255,255,255,0.17)",
              fontSize: 10.5,
              letterSpacing: "0.04em",
              fontFamily: "var(--font-geist-sans)",
              margin: 0,
            }}
          >
            {t.orClickPassport}
          </motion.p>

        </div>{/* /gateway-bottom */}

      </div>{/* /gateway-shell */}
    </motion.div>
  );
}
