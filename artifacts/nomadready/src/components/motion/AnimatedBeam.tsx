"use client";

import { RefObject, useEffect, useId, useState } from "react";
import { motion } from "motion/react";

export interface AnimatedBeamProps {
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}

function getCenter(el: HTMLElement, container: HTMLElement): { x: number; y: number } {
  const er = el.getBoundingClientRect();
  const cr = container.getBoundingClientRect();
  return { x: er.left - cr.left + er.width / 2, y: er.top - cr.top + er.height / 2 };
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 3.5,
  delay = 0,
  pathColor = "rgba(217,119,6,0.15)",
  pathWidth = 1.5,
  pathOpacity = 1,
  gradientStartColor = "#d97706",
  gradientStopColor = "#fbbf24",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}: AnimatedBeamProps) {
  const uid = useId();
  const [pathD, setPathD] = useState("");
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    function update() {
      const from = fromRef.current;
      const to = toRef.current;
      const ctr = containerRef.current;
      if (!from || !to || !ctr) return;

      const cr = ctr.getBoundingClientRect();
      setDims({ w: cr.width, h: cr.height });

      const s = getCenter(from, ctr);
      const e = getCenter(to, ctr);
      const sx = s.x + startXOffset, sy = s.y + startYOffset;
      const ex = e.x + endXOffset, ey = e.y + endYOffset;

      const mx = (sx + ex) / 2;
      const my = (sy + ey) / 2;
      const dx = ex - sx, dy = ey - sy;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const cx = mx + (-dy / len) * curvature;
      const cy = my + (dx / len) * curvature;

      setPathD(`M ${sx},${sy} Q ${cx},${cy} ${ex},${ey}`);
    }

    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", update, { passive: true });
    return () => { ro.disconnect(); window.removeEventListener("resize", update); };
  }, [fromRef, toRef, containerRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset]);

  if (!pathD) return null;

  const id1 = `${uid}-a`;
  const id2 = `${uid}-b`;

  return (
    <svg
      aria-hidden="true"
      style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        overflow: "visible", zIndex: 0, width: dims.w, height: dims.h,
      }}
    >
      <defs>
        <linearGradient id={id1} gradientUnits="userSpaceOnUse"
          x1={reverse ? "100%" : "0%"} y1="0%" x2={reverse ? "0%" : "100%"} y2="0%">
          <stop offset="0%"   stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="50%"  stopColor={gradientStartColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor}  stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id2} gradientUnits="userSpaceOnUse"
          x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="100%" stopColor={gradientStartColor} stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <path d={pathD} stroke={pathColor} strokeWidth={pathWidth}
        fill="none" strokeOpacity={pathOpacity} />

      <motion.path
        d={pathD}
        stroke={`url(#${id1})`}
        strokeWidth={pathWidth + 0.5}
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
        transition={{
          duration,
          delay,
          ease: "easeInOut",
          times: [0, 0.1, 0.85, 1],
          repeat: Infinity,
          repeatDelay: 0.8,
        }}
      />
    </svg>
  );
}
