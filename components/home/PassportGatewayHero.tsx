"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PassportObject } from "./PassportObject";

const PASSPORTS = [
  { id: "fr", emoji: "🇫🇷", label: "France" },
  { id: "uk", emoji: "🇬🇧", label: "UK" },
  { id: "de", emoji: "🇩🇪", label: "Germany" },
  { id: "nl", emoji: "🇳🇱", label: "Netherlands" },
  { id: "es", emoji: "🇪🇸", label: "Spain" },
  { id: "it", emoji: "🇮🇹", label: "Italy" },
  { id: "be", emoji: "🇧🇪", label: "Belgium" },
  { id: "us", emoji: "🇺🇸", label: "USA" },
  { id: "ca", emoji: "🇨🇦", label: "Canada" },
  { id: "au", emoji: "🇦🇺", label: "Australia" },
];

interface PassportGatewayHeroProps {
  defaultPassportId?: string;
}

export function PassportGatewayHero({ defaultPassportId = "fr" }: PassportGatewayHeroProps) {
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState(defaultPassportId);
  const [isEntering, setIsEntering] = useState(false);
  const [overlayFading, setOverlayFading] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    // In development, always show the gateway so it can be iterated on.
    // In production, skip it once the user has entered.
    if (process.env.NODE_ENV !== "production") {
      setVisible(true);
      return;
    }
    try {
      if (sessionStorage.getItem("nr_gateway_passed") === "1") return;
    } catch {
      // private browsing — always show
    }
    setVisible(true);
  }, []);

  const handleEnter = useCallback(() => {
    if (isEntering) return;
    setIsEntering(true);

    const fadDelay = prefersReduced ? 0 : 380;
    const removeDelay = prefersReduced ? 50 : 950;

    setTimeout(() => setOverlayFading(true), fadDelay);
    setTimeout(() => {
      setVisible(false);
      if (process.env.NODE_ENV === "production") {
        try { sessionStorage.setItem("nr_gateway_passed", "1"); } catch { /* ignore */ }
      }
    }, removeDelay);
  }, [isEntering, prefersReduced]);

  if (!visible) return null;

  const fadeDuration = prefersReduced ? 0.01 : 0.55;
  const entranceDuration = prefersReduced ? 0.01 : 0.6;

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
        background: `linear-gradient(160deg, var(--cinematic-night, #0c1020) 0%, color-mix(in srgb, var(--cinematic-night, #0c1020) 85%, #202840) 45%, oklch(8% 0.012 250) 100%)`,
        overflow: "hidden",
      }}
    >
      {/* Atmospheric glows */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-15%",
          right: "-5%",
          width: "60%",
          height: "65%",
          background: "radial-gradient(ellipse, rgba(200,164,40,0.055) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-10%",
          width: "50%",
          height: "55%",
          background: "radial-gradient(ellipse, rgba(60,100,200,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/assets/ui/paper-grain.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "240px 240px",
          opacity: 0.025,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />

      {/* ── Responsive content shell ──────────────────────────
          Desktop: centered column (justify-content: center).
          Mobile ≤639px: two zones — top (passport hero) +
          bottom panel (selector + CTA) via CSS classes.    */}
      <div className="gateway-shell">

        {/* Top zone — eyebrow + passport hero */}
        <div className="gateway-top">

          {/* Eyebrow */}
          <motion.p
            className="gateway-eyebrow"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: entranceDuration, delay: prefersReduced ? 0 : 0.15, ease: [0.25, 1, 0.5, 1] }}
            style={{
              color: "rgba(200,164,40,0.65)",
              fontSize: 10,
              letterSpacing: "0.28em",
              fontWeight: 500,
              textTransform: "uppercase",
              textAlign: "center",
              fontFamily: "var(--font-geist-sans)",
              margin: 0,
            }}
          >
            ✦ Travel Field Guide
          </motion.p>

          {/* Passport object */}
          <motion.div
            className="gateway-passport-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: entranceDuration, delay: prefersReduced ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <PassportObject
              passportId={activeId}
              isEntering={isEntering}
              onEnter={handleEnter}
              className="gateway-passport"
            />
          </motion.div>

        </div>{/* /gateway-top */}

        {/* Bottom zone — selector, CTA, hint
            Mobile: frosted bottom-sheet panel.
            Desktop: continues the centered column flow.    */}
        <div className="gateway-bottom">

          {/* Visible label — only renders on mobile via CSS  */}
          <p className="gateway-selector-label" aria-hidden>
            Your Passport
          </p>

          {/* Passport selector — radiogroup for a11y */}
          <motion.div
            role="radiogroup"
            aria-label="Select your passport"
            className="gateway-chips"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: entranceDuration, delay: prefersReduced ? 0 : 0.45, ease: [0.25, 1, 0.5, 1] }}
            style={{ gap: 6 }}
          >
            {PASSPORTS.map((p) => {
              const isActive = activeId === p.id;
              return (
                <button
                  key={p.id}
                  role="radio"
                  aria-checked={isActive}
                  onClick={() => !isEntering && setActiveId(p.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    paddingInline: 12,
                    paddingBlock: 10,           /* min 44px touch target via combined padding + text */
                    minHeight: 36,              /* ensures touch target at ≥44px with container */
                    flexShrink: 0,
                    borderRadius: 100,
                    border: `1px solid ${isActive ? "rgba(200,164,40,0.5)" : "rgba(255,255,255,0.08)"}`,
                    background: isActive ? "rgba(200,164,40,0.1)" : "rgba(255,255,255,0.03)",
                    color: isActive ? "rgba(200,164,40,0.95)" : "rgba(255,255,255,0.45)",
                    fontSize: 11.5,
                    fontWeight: isActive ? 500 : 400,
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    fontFamily: "var(--font-geist-sans)",
                    letterSpacing: "0.01em",
                    outline: "none",
                    whiteSpace: "nowrap",
                  }}
                  onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px rgba(200,164,40,0.5)"; }}
                  onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: entranceDuration, delay: prefersReduced ? 0 : 0.6, ease: [0.25, 1, 0.5, 1] }}
            onClick={handleEnter}
            disabled={isEntering}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingInline: 24,
              paddingBlock: 13,
              borderRadius: 100,
              border: "1px solid rgba(200,164,40,0.3)",
              background: "rgba(200,164,40,0.08)",
              color: "rgba(200,164,40,0.85)",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.06em",
              cursor: isEntering ? "default" : "pointer",
              fontFamily: "var(--font-geist-sans)",
              opacity: isEntering ? 0.4 : 1,
              transition: "opacity 0.2s ease, background 0.2s ease",
              textTransform: "uppercase",
              outline: "none",
            }}
            whileHover={!isEntering ? { background: "rgba(200,164,40,0.13)" } : {}}
            whileTap={!isEntering ? { scale: 0.97 } : {}}
            onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px rgba(200,164,40,0.5)"; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
          >
            Enter the Guide
            <span style={{ fontSize: 11, opacity: 0.7 }} aria-hidden>→</span>
          </motion.button>

          {/* Hint */}
          <motion.p
            className="gateway-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: entranceDuration, delay: prefersReduced ? 0 : 0.85 }}
            style={{
              color: "rgba(255,255,255,0.18)",
              fontSize: 10.5,
              letterSpacing: "0.04em",
              fontFamily: "var(--font-geist-sans)",
              margin: 0,
            }}
          >
            or click the passport
          </motion.p>

        </div>{/* /gateway-bottom */}

      </div>{/* /gateway-shell */}
    </motion.div>
  );
}
