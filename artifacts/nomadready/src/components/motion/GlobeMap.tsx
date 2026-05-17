import { motion } from "motion/react";

const HUB = { x: 74, y: 48 };

const NODES = [
  { id: "geo", x: 148, y: 28, emoji: "🇬🇪", label: "GEO" },
  { id: "tr",  x: 170, y: 44, emoji: "🇹🇷", label: "TUR" },
  { id: "th",  x: 310, y: 30, emoji: "🇹🇭", label: "THA" },
  { id: "my",  x: 348, y: 50, emoji: "🇲🇾", label: "MYS" },
  { id: "id",  x: 364, y: 62, emoji: "🇮🇩", label: "IDN" },
  { id: "vn",  x: 330, y: 38, emoji: "🇻🇳", label: "VNM" },
  { id: "ph",  x: 395, y: 40, emoji: "🇵🇭", label: "PHL" },
  { id: "jp",  x: 448, y: 22, emoji: "🇯🇵", label: "JPN" },
  { id: "kr",  x: 430, y: 32, emoji: "🇰🇷", label: "KOR" },
];

function getCP(node: { x: number; y: number }, idx: number) {
  const cpY =
    idx % 2 === 0
      ? Math.min(HUB.y, node.y) - 22
      : Math.max(HUB.y, node.y) + 10;
  return { x: (HUB.x + node.x) / 2, y: cpY };
}

function arcPath(node: { x: number; y: number }, idx: number): string {
  const cp = getCP(node, idx);
  return `M ${HUB.x} ${HUB.y} Q ${cp.x} ${cp.y} ${node.x} ${node.y}`;
}

function bezierPt(
  p0: { x: number; y: number },
  cp: { x: number; y: number },
  p1: { x: number; y: number },
  t: number
) {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * cp.x + t * t * p1.x,
    y: mt * mt * p0.y + 2 * mt * t * cp.y + t * t * p1.y,
  };
}

// ── Timing — outbound and return at equal speeds ────────────
const PLANE_TRAVEL = 1.9;  // HUB → destination (s)
const PLANE_PAUSE  = 0.2;  // dwell at destination (s)
const PLANE_RETURN = 1.8;  // destination → HUB — same pace as outbound (s)
const PLANE_ARC    = PLANE_TRAVEL + PLANE_PAUSE + PLANE_RETURN; // 3.9s per hop
const PLANE_CYCLE  = NODES.length * PLANE_ARC; // 35.1s full lap

const ARC_DURATION     = 2.0;
const ARC_STAGGER      = PLANE_ARC;
const ARC_REPEAT_DELAY = PLANE_CYCLE - ARC_DURATION;

// Pre-compute plane keyframes (runs once at module load)
const { PLANE_XS, PLANE_YS, PLANE_TS } = (() => {
  const xs: number[] = [];
  const ys: number[] = [];
  const ts: number[] = [];

  const add = (pt: { x: number; y: number }, absTime: number) => {
    xs.push(Math.round(pt.x * 10) / 10);
    ys.push(Math.round(pt.y * 10) / 10);
    ts.push(Math.round((absTime / PLANE_CYCLE) * 10000) / 10000);
  };

  for (let i = 0; i < NODES.length; i++) {
    const node = NODES[i];
    const cp   = getCP(node, i);
    const base = i * PLANE_ARC;

    // Outbound: HUB → dest (skip t=0 after first arc — return already set HUB)
    const outTs = i === 0 ? [0, 0.25, 0.5, 0.75, 1.0] : [0.25, 0.5, 0.75, 1.0];
    for (const t of outTs) {
      add(bezierPt(HUB, cp, node, t), base + t * PLANE_TRAVEL);
    }

    // Dwell at destination
    add({ x: node.x, y: node.y }, base + PLANE_TRAVEL + PLANE_PAUSE);

    // Return: dest → HUB — same speed, 4 sample points for smooth curve
    for (const t of [0.25, 0.5, 0.75, 1.0]) {
      add(bezierPt(node, cp, HUB, t), base + PLANE_TRAVEL + PLANE_PAUSE + t * PLANE_RETURN);
    }
  }

  // Close loop at cycle end (= HUB)
  add(HUB, PLANE_CYCLE);

  return { PLANE_XS: xs, PLANE_YS: ys, PLANE_TS: ts };
})();

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
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(217,119,6,0.0)" />
            <stop offset="40%"  stopColor="rgba(217,119,6,0.50)" />
            <stop offset="100%" stopColor="rgba(251,191,36,0.80)" />
          </linearGradient>
          <filter id="nodeGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="hubGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="planeGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id="gridPat" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
            <line x1="0" y1="10" x2="40" y2="10" stroke="rgba(217,119,6,0.06)" strokeWidth="0.6" />
          </pattern>
        </defs>

        <rect x="0" y="0" width="520" height="86" fill="url(#gridPat)" />
        {[20, 43, 66].map((y) => (
          <line key={y} x1="20" y1={y} x2="500" y2={y}
            stroke="rgba(217,119,6,0.07)" strokeWidth="0.8" strokeDasharray="2 6" />
        ))}
        {[100, 200, 300, 400].map((x) => (
          <line key={x} x1={x} y1="6" x2={x} y2="80"
            stroke="rgba(217,119,6,0.05)" strokeWidth="0.6" strokeDasharray="2 8" />
        ))}

        {/* Animated arcs synced with plane */}
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
              opacity:    [0, 0.65, 0.65, 0],
            }}
            transition={{
              duration:    ARC_DURATION,
              delay:       i * ARC_STAGGER,
              repeat:      Infinity,
              repeatDelay: ARC_REPEAT_DELAY,
              ease:        "easeInOut",
            }}
          />
        ))}

        {/* Destination dots */}
        {NODES.map((node, i) => (
          <g key={`node-${node.id}`}>
            <motion.circle
              cx={node.x} cy={node.y} r={5}
              fill="none"
              stroke="rgba(251,191,36,0.35)"
              strokeWidth={0.8}
              initial={{ opacity: 0, r: 4 }}
              animate={{ opacity: [0, 0.6, 0.6, 0], r: [4, 6, 6, 4] }}
              transition={{
                duration:    ARC_DURATION,
                delay:       i * ARC_STAGGER + ARC_DURATION * 0.72,
                repeat:      Infinity,
                repeatDelay: ARC_REPEAT_DELAY,
              }}
            />
            <circle
              cx={node.x} cy={node.y} r={3}
              fill="rgba(217,119,6,0.28)"
              stroke="rgba(251,191,36,0.55)"
              strokeWidth={0.8}
              filter="url(#nodeGlow)"
            />
            <text x={node.x} y={node.y - 8} textAnchor="middle" fontSize="9" style={{ userSelect: "none" }}>
              {node.emoji}
            </text>
          </g>
        ))}

        {/* Hub */}
        <g filter="url(#hubGlow)">
          <motion.circle
            cx={HUB.x} cy={HUB.y} r={14}
            fill="none"
            stroke="rgba(217,119,6,0.22)"
            strokeWidth={1}
            animate={{ r: [12, 16, 12], opacity: [0.4, 0.15, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <circle cx={HUB.x} cy={HUB.y} r={9} fill="rgba(217,119,6,0.95)" />
          <text x={HUB.x} y={HUB.y + 3.5} textAnchor="middle" fontSize="9" style={{ userSelect: "none" }}>🌍</text>
        </g>

        {/* ── Flying plane — outbound and return at equal speed ── */}
        <motion.g
          initial={{ x: HUB.x, y: HUB.y }}
          animate={{ x: PLANE_XS, y: PLANE_YS }}
          transition={{
            duration: PLANE_CYCLE,
            repeat:   Infinity,
            ease:     "linear",
            times:    PLANE_TS,
          }}
          filter="url(#planeGlow)"
        >
          <circle r={5} fill="rgba(251,191,36,0.18)" stroke="rgba(251,191,36,0.50)" strokeWidth={0.8} />
          <text x={0} y={0} textAnchor="middle" dominantBaseline="central" fontSize="7" style={{ userSelect: "none" }}>✈</text>
        </motion.g>

      </svg>
    </div>
  );
}
