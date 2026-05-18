"use client";

import { useEffect, useRef } from "react";

// ── AmbientLayer ─────────────────────────────────────────────────────────────
// Fixed atmospheric rendering layer. position:fixed, zIndex:200, pointerEvents:none.
//
// Layer stack (bottom → top):
//   1. amb-paper-base    — warm physical paper substrate (static)
//   2. amb-ceiling       — atmospheric overhead light (52 s)
//   3. amb-depth-shift   — animated section climates (65 s)
//   4. amb-deep-field    — massive environmental base warmth (78 s)
//   5. amb-drift-a       — SE Asia warm zone, organic drift (38 s)
//   6. amb-drift-b       — counterpoint upper-left drift (47 s)
//   7. amb-fog           — near-depth blurred fog, 28 px (55 s)
//   8. amb-fog-far       — far-depth fog, 62 px, −42 s phase (85 s)
//   9. amb-bloom-1/2     — focused bloom zones (22 / 28 s)
//  10. amb-vignette      — dark cinematic edge shaping (static)
//  11. amb-warm-vignette — warm golden-hour lens character (static)
//  12. cursor glow       — RAF + lerp tracking, ~1.5 s lag
//  13. amb-grain         — editorial paper grain, multiply

export function AmbientLayer() {
  const glowRef = useRef<HTMLDivElement>(null);
  const target  = useRef({ x: 58, y: 45 });
  const current = useRef({ x: 58, y: 45 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // raf = 0 means the loop is not scheduled. Restart on every mousemove when
    // stopped — identical pattern to the gateway parallax convergence guard.
    let raf = 0;

    const tick = () => {
      // 0.055 matches the gateway lerp: converges in ~1 s after mouse idle,
      // vs the previous 0.028 which ran for 4–6 s per stop.
      current.current.x += (target.current.x - current.current.x) * 0.055;
      current.current.y += (target.current.y - current.current.y) * 0.055;

      if (glowRef.current) {
        glowRef.current.style.background = [
          `radial-gradient(`,
          `  900px circle at ${current.current.x}% ${current.current.y}%,`,
          `  rgba(217,119,6,0.034) 0%,`,
          `  rgba(217,119,6,0.010) 38%,`,
          `  transparent 58%`,
          `)`,
        ].join("");
      }

      // Stop when remaining offset is sub-pixel on HiDPI (≤0.3 viewport %).
      // Restarts automatically on the next mousemove.
      const diff =
        Math.abs(target.current.x - current.current.x) +
        Math.abs(target.current.y - current.current.y);
      if (diff > 0.3) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };

    const onMove = (e: MouseEvent) => {
      target.current.x = (e.clientX / window.innerWidth)  * 100;
      target.current.y = (e.clientY / window.innerHeight) * 100;
      // Restart the loop only when it has fully stopped.
      if (raf === 0) {
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf !== 0) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 200,
        overflow: "hidden",
      }}
    >
      {/* 1 — warm paper substrate: two static radials simulate ambient room light */}
      <div className="amb-paper-base" />

      {/* 2 — atmospheric ceiling: diffuse overhead warmth, 52 s */}
      <div className="amb-ceiling" />

      {/* 3 — section climates: three static gradients cross-fading via opacity.
              Replaces the single animated-background div whose `background` keyframe
              ran on the paint thread. Opacity animation is compositor-only. */}
      <div className="amb-depth-shift">
        <div className="amb-climate-dawn" />
        <div className="amb-climate-peak" />
        <div className="amb-climate-dusk" />
      </div>

      {/* 4 — deep ambient field: environmental base scale, 78 s */}
      <div className="amb-deep-field" />

      {/* 3 — drifting warm light A: SE Asia focus, 38 s */}
      <div className="amb-drift-a" />

      {/* 4 — drifting warm light B: counterpoint upper-left, 47 s */}
      <div className="amb-drift-b" />

      {/* 5 — near fog: blurred diffusion, 55 s */}
      <div className="amb-fog" />

      {/* 6 — far fog: deeper depth plane, 85 s / −42 s phase */}
      <div className="amb-fog-far" />

      {/* 7 — bloom zones: focused warm glows, 22 / 28 s */}
      <div className="amb-bloom-1" />
      <div className="amb-bloom-2" />

      {/* 8 — dark cinematic vignette */}
      <div className="amb-vignette" />

      {/* 9 — warm golden-hour lens vignette */}
      <div className="amb-warm-vignette" />

      {/* 10 — cursor-reactive glow, RAF + lerp */}
      <div
        ref={glowRef}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />

      {/* 11 — editorial paper grain */}
      <div className="amb-grain" />
    </div>
  );
}
