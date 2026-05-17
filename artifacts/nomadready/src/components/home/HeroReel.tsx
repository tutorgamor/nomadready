import { useState, useEffect } from "react";

interface ReelSlide {
  src:    string;
  label:  string;
  region: string;
  score?: number;
}

// Curated images — each clearly recognisable for its country.
// Malaysia → Petronas (not tuk-tuks), Japan → Mount Fuji, etc.
const SLIDES: ReelSlide[] = [
  {
    src:    "/assets/editorial/panels/panel-indonesia.png",
    label:  "Indonesia",
    region: "Southeast Asia",
    score:  77,
  },
  {
    // Doi Suthep temple, Chiang Mai — unmistakably Thai
    src:    "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80&auto=format&fit=crop",
    label:  "Thailand",
    region: "Southeast Asia",
    score:  81,
  },
  {
    src:    "/assets/destinations/turkey.jpg",
    label:  "Turkey",
    region: "Eurasia",
    score:  74,
  },
  {
    // Mount Fuji with cherry blossoms — iconic Japan
    src:    "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80&auto=format&fit=crop",
    label:  "Japan",
    region: "East Asia",
    score:  88,
  },
  {
    src:    "/assets/destinations/philippines.jpg",
    label:  "Philippines",
    region: "Southeast Asia",
    score:  72,
  },
  {
    // Ha Long Bay — unmistakably Vietnam
    src:    "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800&q=80&auto=format&fit=crop",
    label:  "Vietnam",
    region: "Southeast Asia",
    score:  79,
  },
  {
    src:    "/assets/destinations/georgia.jpg",
    label:  "Georgia",
    region: "Caucasus",
    score:  78,
  },
  {
    // Petronas towers at night — unmistakably Kuala Lumpur
    src:    "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80&auto=format&fit=crop",
    label:  "Malaysia",
    region: "Southeast Asia",
    score:  75,
  },
  {
    // Seoul N-tower + cityscape — unmistakably South Korea
    src:    "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80&auto=format&fit=crop",
    label:  "South Korea",
    region: "East Asia",
    score:  83,
  },
];

// Slower, more cinematic rhythm
const INTERVAL_MS = 4200;
const FADE_MS     = 1100;

export function HeroReel({ destCount }: { destCount: number }) {
  const [idx,  setIdx]  = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % SLIDES.length);
        setShow(true);
      }, FADE_MS);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[idx];

  return (
    <div className="hero-editorial-panel">
      <div className="hero-editorial-frame" style={{ position: "relative" }}>
        <img
          src={slide.src}
          alt=""
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 30%",
            display: "block", position: "absolute", inset: 0,
            opacity: show ? 1 : 0,
            transition: `opacity ${FADE_MS}ms cubic-bezier(0.4,0,0.2,1)`,
          }}
          fetchPriority="high"
          decoding="async"
        />

        <div className="hero-editorial-frame-vignette" />

        {/* Top amber accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(217,119,6,0.45) 30%, rgba(217,119,6,0.45) 70%, transparent)",
          zIndex: 4,
        }} />

        {/* Country label — soft fade with the image */}
        <div
          className="hero-editorial-frame-label"
          style={{
            opacity: show ? 1 : 0,
            transition: `opacity ${Math.round(FADE_MS * 0.5)}ms ease`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
            <span style={{
              fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.10em",
              textTransform: "uppercase", color: "rgba(217,119,6,0.85)", lineHeight: 1,
            }}>
              {slide.region}
            </span>
            <span style={{
              fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "-0.02em",
              color: "rgba(255,255,255,0.92)", lineHeight: 1.1,
            }}>
              {slide.label}
            </span>
          </div>
          {slide.score && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.15rem" }}>
              <span style={{
                fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", color: "rgba(217,119,6,0.70)", lineHeight: 1,
              }}>
                Field Score
              </span>
              <span style={{
                fontSize: "1.125rem", fontWeight: 700, color: "rgba(255,255,255,0.94)",
                letterSpacing: "-0.03em", lineHeight: 1,
              }}>
                {slide.score}
              </span>
            </div>
          )}
        </div>

        {/* Floating passport prop */}
        <div className="hero-editorial-passport">
          <div className="anim-float-gentle">
            <img
              src="/assets/editorial/old%20passport/old-passport.png"
              alt=""
              style={{
                width: "88px", height: "auto", borderRadius: "3px",
                boxShadow: "0 8px 28px rgba(0,0,0,0.50), 0 2px 6px rgba(0,0,0,0.30)",
                display: "block",
              }}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>

      {/* Bottom meta bar */}
      <div className="hero-editorial-meta">
        <svg viewBox="0 0 320 10" fill="none" style={{ flex: 1, height: "10px", display: "block" }}>
          <line x1="6" y1="5" x2="314" y2="5" stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="3 5" />
          <circle cx="6"   cy="5" r="2.5" fill="var(--accent)" opacity="0.55" />
          <circle cx="160" cy="5" r="1.8" fill="var(--accent)" opacity="0.35" />
          <circle cx="314" cy="5" r="2.5" fill="var(--accent)" opacity="0.55" />
        </svg>
        <span style={{
          fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.45)", flexShrink: 0,
        }}>
          {destCount} destinations
        </span>
      </div>
    </div>
  );
}
