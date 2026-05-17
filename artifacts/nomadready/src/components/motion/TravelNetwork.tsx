"use client";

import { useRef } from "react";
import { AnimatedBeam } from "@/components/motion/AnimatedBeam";

const NODE_STYLE: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  background: "var(--surface-raised)",
  border: "1px solid rgba(217,119,6,0.22)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "1.125rem",
  lineHeight: 1,
  flexShrink: 0,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const HUB_STYLE: React.CSSProperties = {
  ...NODE_STYLE,
  width: "44px",
  height: "44px",
  background: "var(--accent)",
  border: "none",
  fontSize: "1.25rem",
  boxShadow: "0 4px 16px rgba(217,119,6,0.30), 0 0 0 4px rgba(217,119,6,0.12)",
};

export function TravelNetwork() {
  const containerRef = useRef<HTMLDivElement>(null);
  const r0 = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const r3 = useRef<HTMLDivElement>(null);
  const r4 = useRef<HTMLDivElement>(null);
  const r5 = useRef<HTMLDivElement>(null);

  const leftRefs  = [r0, r1, r2] as const;
  const rightRefs = [r3, r4, r5] as const;

  return (
    <div
      ref={containerRef}
      className="travel-network-strip"
      aria-hidden="true"
      style={{ gap: "1.125rem" }}
    >
      <div ref={r0} style={NODE_STYLE}>🇬🇪</div>
      <div ref={r1} style={NODE_STYLE}>🇹🇷</div>
      <div ref={r2} style={NODE_STYLE}>🇹🇭</div>
      <div ref={hubRef} style={HUB_STYLE}>✈</div>
      <div ref={r3} style={NODE_STYLE}>🇮🇩</div>
      <div ref={r4} style={NODE_STYLE}>🇵🇭</div>
      <div ref={r5} style={NODE_STYLE}>🇯🇵</div>

      {leftRefs.map((ref, i) => (
        <AnimatedBeam
          key={`l${i}`}
          containerRef={containerRef as React.RefObject<HTMLElement>}
          fromRef={ref as React.RefObject<HTMLElement>}
          toRef={hubRef as React.RefObject<HTMLElement>}
          delay={i * 0.7}
          duration={2.6}
          curvature={i === 1 ? -14 : 0}
        />
      ))}

      {rightRefs.map((ref, i) => (
        <AnimatedBeam
          key={`r${i}`}
          containerRef={containerRef as React.RefObject<HTMLElement>}
          fromRef={hubRef as React.RefObject<HTMLElement>}
          toRef={ref as React.RefObject<HTMLElement>}
          reverse
          delay={i * 0.7 + 0.35}
          duration={2.6}
          curvature={i === 1 ? 14 : 0}
        />
      ))}
    </div>
  );
}
