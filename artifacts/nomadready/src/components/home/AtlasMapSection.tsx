;

// Server component — no react-simple-maps, no client hooks needed.
// Map is ambient background only: static SVG asset + CSS/SVG filter rendering.
//
// SVG filter defs are inlined in the same document so the Image's CSS
// filter can reference url(#atl-relief) cross-element.
// Emboss technique: SourceAlpha blur → top-left highlight + bottom-right
// shadow → merged over SourceGraphic → raised-surface illusion.

interface AtlasMapSectionProps {
  destinationCount: number;
}

export function AtlasMapSection({ destinationCount: _d }: AtlasMapSectionProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* ── Inline SVG filter defs ──────────────────────────────────────────
          Zero-size SVG — exists only to host the emboss filter definition.
          The Image below references it via CSS filter: url(#atl-relief).   */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: "absolute" }}
      >
        <defs>
          <filter
            id="atl-relief"
            x="-5%"
            y="-5%"
            width="110%"
            height="110%"
            colorInterpolationFilters="sRGB"
          >
            {/* Soft alpha mask from land/coast edges */}
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            {/* Top-left highlight — light grazes the raised rim */}
            <feOffset dx="-2" dy="-2.6" in="blur" result="hlOff" />
            <feFlood floodColor="rgba(255,250,240,0.68)" result="hlFill" />
            <feComposite in="hlFill" in2="hlOff" operator="in" result="hl" />
            {/* Bottom-right shadow — depth below the raised surface */}
            <feOffset dx="2" dy="2.6" in="blur" result="shOff" />
            <feFlood floodColor="rgba(105,78,38,0.30)" result="shFill" />
            <feComposite in="shFill" in2="shOff" operator="in" result="sh" />
            <feMerge>
              <feMergeNode in="sh" />
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="hl" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Atlas surface light drift — drifting warm radial, 62 s */}
      <div className="atlas-light-drift"  aria-hidden="true" style={{ zIndex: 1 }} />
      {/* Atlas shadow drift — anti-phase to light, −31 s offset */}
      <div className="atlas-shadow-drift" aria-hidden="true" style={{ zIndex: 1 }} />

      {/* ── Map — oversized (108 % wide), vertically centred ───────────────
          .atlas-breath  → slow opacity breathing (14 s)
          background     → #e9e0d0 = ocean colour, shows through SVG
                           transparent areas
          CSS filter chain applied to the SVG image:
            invert(1)    → black land paths become white; ocean stays transparent
            sepia+...    → warm white toward parchment (#e0d5bc range)
            url(#atl-relief) → SVG emboss fires on the tinted result       */}
      <div
        className="atlas-breath atlas-map-wrapper"
        aria-hidden="true"
        style={{ background: "#e9e0d0" }}
      >
        {/* Aspect-ratio lock — natural SVG ratio 665.96 / 1009.67 ≈ 65.97 % */}
        <div style={{ position: "relative", width: "100%", paddingBottom: "65.97%" }}>
          <img src="/assets/maps/world-map.svg" alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "center center", filter: "invert(1) sepia(0.55) brightness(0.86) saturate(0.65) contrast(1.08) url(#atl-relief)" }} />

          {/* Edge fades — dissolve map into page background */}
          <div aria-hidden="true" style={{ position: "absolute", top: 0,    left: 0, right:  0, height: "18%", background: "linear-gradient(to bottom, var(--bg-base), transparent)", pointerEvents: "none", zIndex: 8 }} />
          <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right:  0, height: "18%", background: "linear-gradient(to top,    var(--bg-base), transparent)", pointerEvents: "none", zIndex: 8 }} />
          <div aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, left:  0, width: "12%",  background: "linear-gradient(to right,  var(--bg-base), transparent)", pointerEvents: "none", zIndex: 8 }} />
          <div aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "12%",  background: "linear-gradient(to left,   var(--bg-base), transparent)", pointerEvents: "none", zIndex: 8 }} />
        </div>
      </div>
    </div>
  );
}
