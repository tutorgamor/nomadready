/**
 * components/DestinationCoverPattern.tsx
 *
 * Regional SVG pattern library for destination card covers.
 * Each pattern is an inline SVG composition designed for a 280×168px viewport.
 *
 * Regions covered:
 *   Southeast Asia  — Batik mandala (lotus tri-ring on dot-weave ground)
 *   Caucasus        — Bolnisi cross with vine tendrils on stone-lace ground
 *   Eurasia         — Iznik 8-pointed star with arabesque flow
 *   East Asia / Japan      — Seigaiha wave scales + sakura blossom
 *   East Asia / South Korea — Dancheong geometry + taeguk circle
 *   Default         — Diamond lattice fallback
 *
 * All paths use white-on-transparency so they composite cleanly on any
 * cover_color. Opacity is kept low (0.04–0.16) to stay atmospheric —
 * these are the texture of an atlas page, not wallpaper.
 *
 * Usage: drop <CoverPatternSVG> as the sole child of an SVG element
 *        with viewBox="0 0 280 168" preserveAspectRatio="xMidYMid slice".
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Renders N petal-shaped paths radiating from the origin.
 * Each petal: a cubic bezier stretching to `outer` along -Y, width `width`.
 */
function MandalaPetals({
  count,
  outer,
  width,
  phaseOffset = 0,
}: {
  count: number;
  outer: number;
  width: number;
  phaseOffset?: number;
}) {
  const ctrl = outer * 0.56;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <path
          key={i}
          d={`M0,0 Q${width},-${ctrl} 0,-${outer} Q-${width},-${ctrl} 0,0`}
          transform={`rotate(${(360 / count) * i + phaseOffset})`}
          fill="rgba(255,255,255,1)"
        />
      ))}
    </>
  );
}

/** Small filled dot ring at radius `r` with `count` dots. */
function DotRing({ r, count, dotR = 1.4 }: { r: number; count: number; dotR?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx="0" cy={-r} r={dotR} transform={`rotate(${(360 / count) * i})`} fill="rgba(255,255,255,1)" />
      ))}
    </>
  );
}

// ── Southeast Asia — Batik mandala ────────────────────────────────────────────

function SoutheastAsiaPattern({ id }: { id: string }) {
  // Small positional nudge so Thailand / Vietnam / Philippines don't look identical
  const cx = id === "vietnam" ? 158 : id === "philippines" ? 145 : 152;
  const cy = id === "malaysia" ? 87 : 80;

  return (
    <>
      {/* Fine dot grid — batik fabric weave */}
      <defs>
        <pattern id={`sea-d-${id}`} x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="0.75" fill="rgba(255,255,255,0.10)" />
        </pattern>
      </defs>
      <rect width="280" height="168" fill={`url(#sea-d-${id})`} />

      {/* Diagonal wax-resist bands — batik block-print character */}
      <line x1="-18" y1="58"  x2="106" y2="-10" stroke="rgba(255,255,255,0.028)" strokeWidth="16" />
      <line x1="174" y1="180" x2="298" y2="108"  stroke="rgba(255,255,255,0.022)" strokeWidth="12" />

      {/* ── Main mandala — tri-ring lotus ── */}
      <g transform={`translate(${cx},${cy})`} opacity="0.135">
        {/* Outer ring: 12 petals, radius 40 */}
        <MandalaPetals count={12} outer={40} width={5.5} />
        {/* Accent dots at radius 49 between petals */}
        <DotRing r={49} count={12} dotR={1.3} />
        {/* Mid ring: 8 petals, radius 25, phase-shifted */}
        <MandalaPetals count={8} outer={25} width={4} phaseOffset={22.5} />
        {/* Inner ring: 6 petals, radius 13 */}
        <MandalaPetals count={6} outer={13} width={2.8} />
        {/* Center disc */}
        <circle r="5"   fill="rgba(255,255,255,1)" />
        <circle r="2.5" fill="none" stroke="rgba(255,255,255,1)" strokeWidth="0.7" />
      </g>

      {/* Small accent mandala — top-left corner */}
      <g transform="translate(28,26)" opacity="0.085">
        <MandalaPetals count={8} outer={18} width={3} />
        <circle r="3" fill="rgba(255,255,255,1)" />
      </g>

      {/* Small accent mandala — bottom-right corner */}
      <g transform="translate(250,140)" opacity="0.075">
        <MandalaPetals count={8} outer={16} width={2.5} />
        <circle r="2.5" fill="rgba(255,255,255,1)" />
      </g>
    </>
  );
}

// ── Caucasus / Georgia — Bolnisi cross with vine ──────────────────────────────

function CaucasusPattern({ id }: { id: string }) {
  return (
    <>
      {/* Interlocking arch ground — Georgian stone lacework */}
      <defs>
        <pattern id={`cau-g-${id}`} x="0" y="0" width="36" height="20" patternUnits="userSpaceOnUse">
          {/* Upper arch row */}
          <path d="M-18 20 Q0 2 18 20"  stroke="rgba(255,255,255,0.065)" fill="none" strokeWidth="0.7" />
          <path d="M18  20 Q36 2 54 20" stroke="rgba(255,255,255,0.065)" fill="none" strokeWidth="0.7" />
          {/* Between-row arch */}
          <path d="M0 0 Q18 -18 36 0"  stroke="rgba(255,255,255,0.040)" fill="none" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="280" height="168" fill={`url(#cau-g-${id})`} />

      {/* Ornamental arch cornice at top */}
      {Array.from({ length: 8 }, (_, i) => (
        <path
          key={i}
          d={`M${i * 36} 14 Q${i * 36 + 18} -2 ${i * 36 + 36} 14`}
          stroke="rgba(255,255,255,0.07)"
          fill="none"
          strokeWidth="0.8"
        />
      ))}

      {/* ── Bolnisi cross — Georgian ecclesiastical emblem ── */}
      {/*
        Arms taper toward center (narrower at crossing, wider at tips).
        Swallow-tail terminal at each arm end.
        Classic Georgian proportions: arm span ~90px, center 8px wide.
      */}
      <g transform="translate(140,82)" opacity="0.14">

        {/* Full cross silhouette — one combined path */}
        <path
          d={[
            /* Top arm — rises from center, widens slightly at tip */
            "M -4,-7  L -5,-40 Q -3,-48  0,-50 Q  3,-48  5,-40 L  4,-7",
            /* Connector to right arm */
            "L  7,-4",
            /* Right arm */
            "L  40,-5 Q  48,-3  50, 0 Q  48, 3  40, 5 L  7, 4",
            /* Connector to bottom arm */
            "L  4, 7",
            /* Bottom arm */
            "L  5, 40 Q  3, 48  0, 50 Q -3, 48 -5, 40 L -4, 7",
            /* Connector to left arm */
            "L -7, 4",
            /* Left arm */
            "L -40, 5 Q -48, 3 -50, 0 Q -48,-3 -40,-5 L -7,-4",
            "Z",
          ].join(" ")}
          fill="rgba(255,255,255,1)"
        />

        {/* Raised center square rotated 45° — bolnisi detail */}
        <rect x="-5" y="-5" width="10" height="10" transform="rotate(45)" fill="rgba(255,255,255,0.3)" />

        {/* Terminal circles at arm ends */}
        <circle cx="0"   cy="-50" r="4.5" fill="rgba(255,255,255,1)" />
        <circle cx="0"   cy=" 50" r="4.5" fill="rgba(255,255,255,1)" />
        <circle cx="-50" cy="0"   r="4.5" fill="rgba(255,255,255,1)" />
        <circle cx=" 50" cy="0"   r="4.5" fill="rgba(255,255,255,1)" />

        {/* Vine tendrils radiating from center — Georgian grape vine motif */}
        <path d="M  8, 0 Q 20,-16  16,-30" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M  8, 0 Q 22, 12  14, 28" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M -8, 0 Q-20,-16 -16,-30" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M -8, 0 Q-22, 12 -14, 28" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.9" strokeLinecap="round" />

        {/* Leaf at vine tip */}
        <ellipse cx=" 16" cy="-30" rx="3.5" ry="5.5" transform="rotate(-22, 16,-30)" fill="rgba(255,255,255,0.45)" />
        <ellipse cx=" 14" cy=" 28" rx="3.5" ry="5.5" transform="rotate( 18, 14, 28)" fill="rgba(255,255,255,0.45)" />
        <ellipse cx="-16" cy="-30" rx="3.5" ry="5.5" transform="rotate( 22,-16,-30)" fill="rgba(255,255,255,0.45)" />
        <ellipse cx="-14" cy=" 28" rx="3.5" ry="5.5" transform="rotate(-18,-14, 28)" fill="rgba(255,255,255,0.45)" />
      </g>
    </>
  );
}

// ── Eurasia / Turkey — Iznik 8-pointed star + arabesque ───────────────────────

/**
 * Pre-calculated 8-pointed star paths.
 * Outer radius 36, inner radius 13.5 at 22.5° offsets.
 * All coordinates rounded to 1 decimal place.
 */
const STAR_LG =
  "M0,-36 L5.2,-13 L25.5,-25.5 L13,-5.2 L36,0 L13,5.2 L25.5,25.5 L5.2,13 " +
  "L0,36 L-5.2,13 L-25.5,25.5 L-13,5.2 L-36,0 L-13,-5.2 L-25.5,-25.5 L-5.2,-13 Z";

const STAR_SM =
  "M0,-20 L2.9,-7.2 L14.1,-14.1 L7.2,-2.9 L20,0 L7.2,2.9 L14.1,14.1 L2.9,7.2 " +
  "L0,20 L-2.9,7.2 L-14.1,14.1 L-7.2,2.9 L-20,0 L-7.2,-2.9 L-14.1,-14.1 L-2.9,-7.2 Z";

function EurasiaPattern({ id }: { id: string }) {
  return (
    <>
      {/* Diamond lattice — Iznik tile grout lines */}
      <defs>
        <pattern
          id={`eur-h-${id}`}
          x="0" y="0"
          width="40" height="40"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(22.5)"
        >
          <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="rgba(255,255,255,0.048)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="280" height="168" fill={`url(#eur-h-${id})`} />

      {/* Arabesque flowing curves — soft calligraphic wave */}
      <path
        d="M-10 84 C55 18 115 150 180 84 C245 18 280 96 310 82"
        stroke="rgba(255,255,255,0.052)" fill="none" strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M-20 42 C32 102 90 8 152 58 C214 108 254 38 305 60"
        stroke="rgba(255,255,255,0.040)" fill="none" strokeWidth="8"
        strokeLinecap="round"
      />

      {/* ── Main 8-pointed star — Iznik tilework centrepiece ── */}
      <g transform="translate(148,82)" opacity="0.145">
        <path d={STAR_LG} fill="rgba(255,255,255,1)" />
        {/* Inner outline ring */}
        <path d={STAR_SM} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.7" />
        <circle r="5" fill="rgba(255,255,255,0.9)" />
        {/* Accent diamonds between star points */}
        {Array.from({ length: 8 }, (_, i) => (
          <path
            key={i}
            d="M0,-41 L2,-38 L0,-35 L-2,-38 Z"
            transform={`rotate(${i * 45})`}
            fill="rgba(255,255,255,0.8)"
          />
        ))}
      </g>

      {/* Satellite stars */}
      <g transform="translate(42,30)" opacity="0.082">
        <path d={STAR_SM} fill="rgba(255,255,255,1)" />
      </g>
      <g transform="translate(242,136)" opacity="0.072">
        <path d={STAR_SM} fill="rgba(255,255,255,1)" />
      </g>

      {/* Tile border band at top — Iznik border ornament */}
      <rect x="0" y="0" width="280" height="5" fill="rgba(255,255,255,0.038)" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={i * 32 + 4} y="0.5" width="22" height="4" rx="0.5" fill="rgba(255,255,255,0.05)" />
      ))}
    </>
  );
}

// ── East Asia / Japan — Seigaiha wave scales + sakura ────────────────────────

function JapanPattern() {
  /* Generate seigaiha (overlapping arc scales).
     Row 0 is at y=168 (bottom, painted first = behind).
     Each successive row overlaps the one below.          */
  const R = 22;
  const scales: { cx: number; cy: number }[] = [];
  const rowCount = Math.ceil(168 / R) + 1; // fills top edge
  for (let row = 0; row <= rowCount; row++) {
    const y = 168 - row * R;
    const offsetX = (row % 2) * R;
    for (let cx = -R + offsetX; cx <= 280 + R; cx += R * 2) {
      scales.push({ cx, cy: y });
    }
  }

  return (
    <>
      {/* Seigaiha — overlapping arc scales */}
      <g opacity="0.072" strokeWidth="0.65" stroke="rgba(255,255,255,1)" fill="none">
        {scales.map((s, i) => (
          <path key={i} d={`M${s.cx - R},${s.cy} A${R},${R},0,0,1,${s.cx + R},${s.cy}`} />
        ))}
      </g>

      {/* Subtle scale fill — depth on bottom rows */}
      <g opacity="0.032" fill="rgba(255,255,255,1)">
        {scales.filter((_, i) => i % 3 === 0).map((s, i) => (
          <path key={i} d={`M${s.cx - R},${s.cy} A${R},${R},0,0,1,${s.cx + R},${s.cy} Z`} />
        ))}
      </g>

      {/* ── Central sakura blossom ── */}
      <g transform="translate(148,76)" opacity="0.155">
        {/* 5 petals at 72° intervals — classic sakura shape with split tip */}
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 72})`}>
            {/* Petal body */}
            <path
              d="M0,0 C8,-10 10,-22 0,-30 C-10,-22 -8,-10 0,0"
              fill="rgba(255,255,255,1)"
            />
            {/* Petal notch — sakura characteristic split */}
            <path
              d="M0,-27 Q0,-24 0,-21"
              stroke="rgba(0,0,0,0.07)"
              strokeWidth="0.9"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        ))}
        {/* Center disc */}
        <circle r="6.5" fill="rgba(255,255,255,1)" />
        {/* Stamens — 12 tiny circles at radius 9 */}
        {Array.from({ length: 12 }, (_, i) => (
          <circle key={i} cx="0" cy="-9" r="1.1" transform={`rotate(${i * 30})`} fill="rgba(255,255,255,0.75)" />
        ))}
      </g>

      {/* Secondary sakura — upper left */}
      <g transform="translate(36,27)" opacity="0.085">
        {Array.from({ length: 5 }, (_, i) => (
          <path
            key={i}
            d="M0,0 C4.5,-5.5 5.5,-12 0,-17 C-5.5,-12 -4.5,-5.5 0,0"
            transform={`rotate(${i * 72})`}
            fill="rgba(255,255,255,1)"
          />
        ))}
        <circle r="3.5" fill="rgba(255,255,255,1)" />
      </g>

      {/* Falling petals — scattered, rotated ellipses */}
      <ellipse cx="88"  cy="50"  rx="4"   ry="7"   transform="rotate(-18,  88, 50)"  fill="rgba(255,255,255,0.07)" />
      <ellipse cx="198" cy="128" rx="3.5" ry="6.5" transform="rotate( 22, 198,128)"  fill="rgba(255,255,255,0.06)" />
      <ellipse cx="60"  cy="116" rx="3"   ry="5.5" transform="rotate(-35,  60,116)"  fill="rgba(255,255,255,0.055)" />
      <ellipse cx="234" cy="60"  rx="3"   ry="5"   transform="rotate( 10, 234, 60)"  fill="rgba(255,255,255,0.048)" />
    </>
  );
}

// ── East Asia / South Korea — Dancheong geometry + taeguk ────────────────────

function SouthKoreaPattern({ id }: { id: string }) {
  return (
    <>
      {/* Hanji paper hexagonal grid */}
      <defs>
        <pattern id={`kor-hex-${id}`} x="0" y="0" width="30" height="26" patternUnits="userSpaceOnUse">
          {/* Hexagon: flat-top orientation */}
          <path
            d="M15 0 L30 8.5 L30 17.5 L15 26 L0 17.5 L0 8.5 Z"
            fill="none"
            stroke="rgba(255,255,255,0.052)"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="280" height="168" fill={`url(#kor-hex-${id})`} />

      {/* ── Dancheong border bands (temple ceiling decorative rhythm) ── */}
      {/* Top band */}
      <rect x="0" y="0" width="280" height="7" fill="rgba(255,255,255,0.04)" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={i * 32 + 2} y="1" width="18" height="5" rx="0" fill="rgba(255,255,255,0.045)" />
      ))}
      {/* Bottom band — thin line */}
      <rect x="0" y="161" width="280" height="7" fill="rgba(255,255,255,0.035)" />

      {/* ── Taeguk — Korean yin-yang with four trigrams ── */}
      <g transform="translate(144,80)" opacity="0.14">
        {/* Outer background circle */}
        <circle r="33" fill="rgba(255,255,255,0.06)" />
        {/* S-curve divider: half filled = represents yang */}
        <path
          d="M 0,-33 A 16.5,16.5,0,0,0 0,0 A 16.5,16.5,0,0,1 0,33"
          fill="rgba(255,255,255,0.14)"
        />
        {/* Inner dots */}
        <circle cx="0" cy="-16.5" r="8.5" fill="rgba(255,255,255,0.06)"  />
        <circle cx="0" cy=" 16.5" r="8.5" fill="rgba(255,255,255,0.16)" />
        {/* Outer ring lines */}
        <circle r="33" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.9" />
        <circle r="37" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.5" />

        {/* Four trigrams — simplified bar notation at cardinal points
            Heaven (☰) 0°, Water (☵) 90°, Earth (☷) 180°, Fire (☲) 270° */}
        {[
          { angle: 0,   bars: [true,  true,  true]  }, // Heaven ☰
          { angle: 90,  bars: [true,  false, true]  }, // Water ☵
          { angle: 180, bars: [false, false, false] }, // Earth ☷
          { angle: 270, bars: [false, true,  false] }, // Fire ☲
        ].map(({ angle, bars }, gi) => (
          <g key={gi} transform={`rotate(${angle})`}>
            {bars.map((solid, bi) =>
              solid ? (
                <rect
                  key={bi}
                  x="-8" y={-54 + bi * 6}
                  width="16" height="3"
                  rx="0.5"
                  fill="rgba(255,255,255,0.72)"
                />
              ) : (
                <g key={bi}>
                  <rect x="-8"  y={-54 + bi * 6} width="6" height="3" rx="0.5" fill="rgba(255,255,255,0.72)" />
                  <rect x="  2" y={-54 + bi * 6} width="6" height="3" rx="0.5" fill="rgba(255,255,255,0.72)" />
                </g>
              )
            )}
          </g>
        ))}
      </g>

      {/* Corner bracket ornament — top right */}
      <g transform="translate(254,20)" opacity="0.09">
        <rect x="-12" y="-12" width="24" height="24" fill="none" stroke="rgba(255,255,255,1)" strokeWidth="0.8" />
        <rect x="-7"  y="-7"  width="14" height="14" fill="rgba(255,255,255,0.28)" />
        <line x1="-12" y1="0" x2="12" y2="0" stroke="rgba(255,255,255,1)" strokeWidth="0.6" />
        <line x1="0" y1="-12" x2="0" y2="12" stroke="rgba(255,255,255,1)" strokeWidth="0.6" />
      </g>
    </>
  );
}

// ── Default — Diamond lattice fallback ────────────────────────────────────────

function DefaultPattern({ id }: { id: string }) {
  return (
    <>
      <defs>
        <pattern id={`def-grid-${id}`} x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect x="0" y="0" width="28" height="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="280" height="168" fill={`url(#def-grid-${id})`} />
      <circle cx="140" cy="84" r="42" fill="none" stroke="rgba(255,255,255,0.08)"  strokeWidth="1" />
      <circle cx="140" cy="84" r="28" fill="none" stroke="rgba(255,255,255,0.065)" strokeWidth="0.7" />
      <circle cx="140" cy="84" r="12" fill="rgba(255,255,255,0.05)" />
    </>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

/**
 * Returns the SVG children for the destination card cover pattern.
 * Render inside: <svg viewBox="0 0 280 168" preserveAspectRatio="xMidYMid slice">
 */
export function CoverPatternSVG({ id, region }: { id: string; region: string }) {
  if (region === "Southeast Asia") return <SoutheastAsiaPattern id={id} />;
  if (region === "Caucasus")       return <CaucasusPattern id={id} />;
  if (region === "Eurasia")        return <EurasiaPattern id={id} />;
  if (region === "East Asia") {
    if (id === "japan")       return <JapanPattern />;
    if (id === "south-korea") return <SouthKoreaPattern id={id} />;
  }
  return <DefaultPattern id={id} />;
}
