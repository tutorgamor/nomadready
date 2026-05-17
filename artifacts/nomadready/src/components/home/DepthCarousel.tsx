"use client";

/**
 * DepthCarousel — cinematic depth-effect photo carousel.
 *
 * Transition mechanic:
 *   - EXITING photo (z=2, on top): scales 1 → 1.08, fades out — appears to push toward the camera
 *   - ENTERING photo (z=1, behind): scales 0.88 → 1, fades in — emerges from depth
 *   Combined: creates a "window into depth" feel where the old scene recedes forward
 *   and the new one materialises from behind it.
 *
 * Parallax:
 *   - RAF loop translates an oversized wrapper div (inset: -12%) opposite the cursor
 *   - Max shift: ±16px H / ±12px V — enough to feel 3D without revealing edges
 *   - Disabled on prefers-reduced-motion and touch-only devices
 *
 * Mobile:
 *   - Touch swipe left/right (>44px threshold) navigates between photos
 *   - Parallax disabled (no mousemove events)
 *
 * Accessibility:
 *   - Arrow buttons with aria-labels
 *   - Dot buttons with aria-labels
 *   - prefers-reduced-motion: all animations collapse to instant crossfade
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface CarouselPhoto {
  url: string;
  alt?: string;
}

interface Props {
  photos: CarouselPhoto[];
  aspectRatio?: number;
}

export function DepthCarousel({ photos, aspectRatio = 16 / 10 }: Props) {
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState<number | null>(null);
  const prefersReduced = useReducedMotion();

  const frameRef  = useRef<HTMLDivElement>(null);
  const layerRef  = useRef<HTMLDivElement>(null);
  const parallax  = useRef({ tx: 0, ty: 0, cx: 0, cy: 0 });
  const rafRef    = useRef<number | null>(null);
  const lockRef   = useRef(false);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchX    = useRef(0);
  const total     = photos.length;

  // Navigate to a specific index with depth transition
  const go = useCallback((nextIdx: number) => {
    if (lockRef.current || total <= 1) return;
    const n = ((nextIdx % total) + total) % total;
    if (n === current) return;

    lockRef.current = true;
    setExiting(current);
    setCurrent(n);

    if (lockTimer.current) clearTimeout(lockTimer.current);
    lockTimer.current = setTimeout(() => {
      setExiting(null);
      lockRef.current = false;
    }, 640);
  }, [current, total]);

  const prev = useCallback(() => go(current - 1), [go, current]);
  const next = useCallback(() => go(current + 1), [go, current]);

  // Cleanup timers/RAF on unmount
  useEffect(() => {
    return () => {
      if (lockTimer.current) clearTimeout(lockTimer.current);
      if (rafRef.current)    cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // RAF-driven cursor parallax on the oversized layer
  useEffect(() => {
    if (prefersReduced) return;

    function loop() {
      const p = parallax.current;
      p.cx += (p.tx - p.cx) * 0.06;
      p.cy += (p.ty - p.cy) * 0.06;
      if (layerRef.current) {
        layerRef.current.style.transform =
          `translate(${p.cx * -16}px, ${p.cy * -12}px)`;
      }
      rafRef.current =
        Math.abs(p.tx - p.cx) + Math.abs(p.ty - p.cy) > 0.0004
          ? requestAnimationFrame(loop)
          : null;
    }

    const el = frameRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      parallax.current.tx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      parallax.current.ty = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
    };
    const onLeave = () => {
      parallax.current.tx = parallax.current.ty = 0;
      if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
    };

    el.addEventListener("mousemove", onMove,  { passive: true });
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [prefersReduced]);

  if (!total) return null;

  const enterDur = prefersReduced ? 0.01 : 0.72;
  const exitDur  = prefersReduced ? 0.01 : 0.54;
  const ease     = [0.22, 1, 0.36, 1] as [number, number, number, number];
  const easeIn   = [0.55, 0, 1, 1]   as [number, number, number, number];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>

      {/* ── Porthole frame ── */}
      <div
        ref={frameRef}
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: `${(1 / aspectRatio) * 100}%`,
          borderRadius: 10,
          overflow: "hidden",
          background: "#060b14",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const d = e.changedTouches[0].clientX - touchX.current;
          if (d < -44) next(); else if (d > 44) prev();
        }}
      >
        {/* Oversized layer — absorbs parallax shift without revealing frame edge */}
        <div
          ref={layerRef}
          style={{ position: "absolute", inset: "-12%", willChange: "transform" }}
        >
          {/* LAYER 1 — entering (below, z=1): scales up from 0.88, fades in */}
          <motion.div
            key={current}
            initial={prefersReduced ? { opacity: 0 } : { scale: 0.88, opacity: 0 }}
            animate={prefersReduced ? { opacity: 1 } : { scale: 1,    opacity: 1 }}
            transition={{ duration: enterDur, ease }}
            style={{ position: "absolute", inset: 0, zIndex: 1 }}
          >
            <img
              src={photos[current].url}
              alt={photos[current].alt ?? ""}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              loading="lazy"
              decoding="async"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
            />
          </motion.div>

          {/* LAYER 2 — exiting (on top, z=2): scales forward 1→1.08, fades out */}
          {exiting !== null && (
            <motion.div
              key={`x-${exiting}`}
              initial={prefersReduced ? { opacity: 1 } : { scale: 1,    opacity: 1 }}
              animate={prefersReduced ? { opacity: 0 } : { scale: 1.08, opacity: 0 }}
              transition={{ duration: exitDur, ease: easeIn }}
              style={{ position: "absolute", inset: 0, zIndex: 2 }}
            >
              <img
                src={photos[exiting].url}
                alt={photos[exiting].alt ?? ""}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                decoding="async"
              />
            </motion.div>
          )}
        </div>

        {/* Bottom vignette — subtle depth shadow */}
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none",
            background: "radial-gradient(ellipse 80% 55% at 50% 110%, rgba(0,0,0,0.50) 0%, transparent 65%)",
          }}
        />

        {/* Navigation arrows */}
        {total > 1 && (
          <>
            {(["prev", "next"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={dir === "prev" ? prev : next}
                aria-label={dir === "prev" ? "Photo précédente" : "Photo suivante"}
                style={{
                  position: "absolute",
                  [dir === "prev" ? "left" : "right"]: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 20,
                  width: 34, height: 34, borderRadius: "50%",
                  background: "rgba(6,11,20,0.55)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.92)",
                  fontSize: "1.25rem",
                  backdropFilter: "blur(8px)",
                  outline: "none",
                  transition: "background 0.18s",
                }}
              >
                {dir === "prev" ? "‹" : "›"}
              </button>
            ))}
          </>
        )}

        {/* Counter badge */}
        <div
          aria-hidden
          style={{
            position: "absolute", right: 10, bottom: 10, zIndex: 20,
            background: "rgba(6,11,20,0.52)",
            border: "1px solid rgba(255,255,255,0.13)",
            borderRadius: 999, padding: "0.12rem 0.48rem",
            fontSize: "0.56rem", fontWeight: 600, letterSpacing: "0.07em",
            color: "rgba(255,255,255,0.76)",
            backdropFilter: "blur(8px)",
          }}
        >
          {current + 1} / {total}
        </div>
      </div>

      {/* ── Dot strip ── */}
      {total > 1 && (
        <div style={{ display: "flex", gap: "0.3rem", justifyContent: "center" }}>
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Photo ${i + 1}`}
              style={{
                width:  i === current ? "1.2rem" : "0.35rem",
                height: "0.35rem",
                borderRadius: 999,
                background: i === current ? "var(--accent)" : "rgba(255,255,255,0.28)",
                border: "none", cursor: "pointer", padding: 0, flexShrink: 0,
                transition: "width 0.35s ease, background 0.25s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
