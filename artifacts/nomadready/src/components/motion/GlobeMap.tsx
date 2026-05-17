import { useEffect, useRef } from "react";
import { motion } from "motion/react";

// Hub = Europe (approximate on the strip projection)
const HUB = { x: 74, y: 48 };

// Destination nodes — x increases eastward, y varies by latitude
const NODES = [
  { id: "geo",  x: 148, y: 28, emoji: "🇬🇪", label: "GEO" },
  { id: "tr",   x: 170, y: 44, emoji: "🇹🇷", label: "TUR" },
  { id: "th",   x: 310, y: 30, emoji: "🇹🇭", label: "THA" },
  { id: "my",   x: 348, y: 50, emoji: "🇲🇾", label: "MYS" },
  { id: "id",   x: 364, y: 62, emoji: "🇮🇩", label: "IDN" },
  { id: "vn",   x: 330, y: 38, emoji: "🇻🇳", label: "VNM" },
  { id: "ph",   x: 395, y: 40, emoji: "🇵🇭", label: "PHL" },
  { id: "jp",   x: 448, y: 22, emoji: "🇯🇵", label: "JPN" },
  { id: "kr",   x: 430, y: 32, emoji: "🇰🇷", label: "KOR" },
];

// Quadratic bezier arc path — control point arcs over the midpoint
function arcPath(to: { x: number; y: number }, idx: number): string {
  // Alternate arcs above/below for visual separation
  const cpY = idx % 2 === 0
    ? Math.min(HUB.y, to.y) - 22
    : Math.max(HUB.y, to.y) + 10;
  const cpX = (HUB.x + to.x) / 2;
  return `M ${HUB.x} ${HUB.y} Q ${cpX} ${cpY} ${to.x} ${to.y}`;
}

const ARC_DURATION = 2.2;
const ARC_STAGGER  = 0.55;

export function GlobeMap() {
  return (
    <div
      className="travel-network-strip"
      aria-hidden="true"
      style={{ height: 86, overflow: "visible" }}
    >
      <svg
        viewBox="0 0 520 86"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
        aria-hidden="true"
      >
        <defs>
          {/* Amber gradient for arcs */}
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(217,119,6,0.0)" />
            <stop offset="40%"  stopColor="rgba(217,119,6,0.55)" />
            <stop offset="100%" stopColor="rgba(251,191,36,0.85)" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="nodeGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="hubGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Subtle globe-line pattern */}
          <pattern id="gridPat" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
            <line x1="0" y1="10" x2="40" y2="10" stroke="rgba(217,119,6,0.06)" strokeWidth="0.6" />
          </pattern>
        </defs>

        {/* Latitude band fill */}
        <rect x="0" y="0" width="520" height="86" fill="url(#gridPat)" />

        {/* Equator / reference lines */}
        {[20, 43, 66].map((y) => (
          <line key={y} x1="20" y1={y} x2="500" y2={y}
            stroke="rgba(217,119,6,0.07)" strokeWidth="0.8" strokeDasharray="2 6" />
        ))}
        {/* Meridian verticals */}
        {[100, 200, 300, 400].map((x) => (
          <line key={x} x1={x} y1="6" x2={x} y2="80"
            stroke="rgba(217,119,6,0.05)" strokeWidth="0.6" strokeDasharray="2 8" />
        ))}

        {/* Animated arcs — draw in sequence, loop */}
        {NODES.map((node, i) => (
          <motion.path
            key={node.id}
            d={arcPath(node, i)}
            stroke="url(#arcGrad)"
            strokeWidth={1.4}
            fill="none"
            strokeDasharray="4 6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 1, 0],
              opacity:    [0, 0.7, 0.7, 0],
            }}
            transition={{
              duration:    ARC_DURATION,
              delay:       i * ARC_STAGGER,
              repeat:      Infinity,
              repeatDelay: NODES.length * ARC_STAGGER,
              ease:        "easeInOut",
            }}
          />
        ))}

        {/* Destination dots */}
        {NODES.map((node, i) => (
          <g key={`node-${node.id}`}>
            {/* Outer ring — pulses in sync with arc */}
            <motion.circle
              cx={node.x} cy={node.y} r={5}
              fill="none"
              stroke="rgba(251,191,36,0.35)"
              strokeWidth={0.8}
              initial={{ opacity: 0, r: 4 }}
              animate={{ opacity: [0, 0.6, 0.6, 0], r: [4, 6, 6, 4] }}
              transition={{
                duration:    ARC_DURATION,
                delay:       i * ARC_STAGGER + ARC_DURATION * 0.7,
                repeat:      Infinity,
                repeatDelay: NODES.length * ARC_STAGGER,
              }}
            />
            {/* Core dot */}
            <circle
              cx={node.x} cy={node.y} r={3}
              fill="rgba(217,119,6,0.28)"
              stroke="rgba(251,191,36,0.55)"
              strokeWidth={0.8}
              filter="url(#nodeGlow)"
            />
            {/* Emoji flag */}
            <text
              x={node.x}
              y={node.y - 8}
              textAnchor="middle"
              fontSize="9"
              style={{ userSelect: "none" }}
            >
              {node.emoji}
            </text>
          </g>
        ))}

        {/* Hub — Europe passport icon */}
        <g filter="url(#hubGlow)">
          {/* Outer pulse ring */}
          <motion.circle
            cx={HUB.x} cy={HUB.y} r={14}
            fill="none"
            stroke="rgba(217,119,6,0.22)"
            strokeWidth={1}
            animate={{ r: [12, 16, 12], opacity: [0.4, 0.15, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Hub circle */}
          <circle
            cx={HUB.x} cy={HUB.y} r={10}
            fill="rgba(217,119,6,1)"
          />
          {/* Plane icon in hub */}
          <text
            x={HUB.x} y={HUB.y + 4}
            textAnchor="middle"
            fontSize="10"
            style={{ userSelect: "none" }}
          >
            ✈
          </text>
        </g>

      </svg>
    </div>
  );
}
