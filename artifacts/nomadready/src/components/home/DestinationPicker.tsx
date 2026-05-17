import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "motion/react";
import type { Destination } from "@/lib/types";
import { CoverPatternSVG } from "@/components/DestinationCoverPattern";
import { DestinationPanel } from "./DestinationPanel";

export interface DestSummary {
  visaLabel:  string;
  budgetFrom: string;
  bestMonths: string;
}

interface Props {
  destinations: Destination[];
  summaries:    Map<string, DestSummary>;
  passportId:   string;
}

// Curated landmark photos — one clearly-recognisable shot per destination
const DEST_IMAGES: Record<string, string> = {
  indonesia:    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80&auto=format&fit=crop",
  turkey:       "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80&auto=format&fit=crop",
  philippines:  "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80&auto=format&fit=crop",
  georgia:      "https://images.unsplash.com/photo-1561049933-c8fbef47b329?w=800&q=80&auto=format&fit=crop",
  thailand:     "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80&auto=format&fit=crop",
  malaysia:     "https://images.unsplash.com/photo-1596422846543-986a7c5feacc?w=800&q=80&auto=format&fit=crop",
  vietnam:      "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=800&q=80&auto=format&fit=crop",
  japan:        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80&auto=format&fit=crop",
  "south-korea":"https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&q=80&auto=format&fit=crop",
};

const PAGE_SIZE = 3;
const AUTO_MS   = 5000;

const slideVariants = {
  enter:  (d: number) => ({ x: d > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
  exit:   (d: number) => ({ x: d > 0 ? -48 : 48, opacity: 0, transition: { duration: 0.28 } }),
};

export function DestinationPicker({ destinations, summaries, passportId }: Props) {
  const totalPages = Math.ceil(destinations.length / PAGE_SIZE);
  const [page,   setPage]   = useState(0);
  const [dir,    setDir]    = useState(1);
  const [paused, setPaused] = useState(false);
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (p: number, d: number) => {
    setDir(d);
    setPage(p);
    restartTimer();
  };

  const restartTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDir(1);
      setPage(p => (p + 1) % totalPages);
    }, AUTO_MS);
  };

  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      restartTimer();
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, totalPages]);

  const pageDests  = destinations.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const selectedDest = destinations.find((d) => d.id === selectedDestId) ?? null;

  return (
    <>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Cards grid */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <AnimatePresence custom={dir} mode="wait">
            <motion.div
              key={page}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.875rem",
              }}
              className="dest-picker-grid"
            >
              {pageDests.map(dest => {
                const sum = summaries.get(dest.id);
                const img = DEST_IMAGES[dest.id];
                return (
                  <Link
                    key={dest.id}
                    to={`/ready/${passportId}/${dest.id}`}
                    className="feat-dest-card dest-picker-card"
                    aria-label={dest.label}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedDestId(dest.id);
                    }}
                  >
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="feat-dest-card-bg"
                        fetchPriority="low"
                        decoding="async"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <>
                        <div style={{ position: "absolute", inset: 0, backgroundColor: dest.cover_color, zIndex: 0 }} />
                        <svg viewBox="0 0 560 360" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }} aria-hidden="true">
                          <CoverPatternSVG id={dest.id} region={dest.region} />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.30) 100%)", zIndex: 1 }} />
                      </>
                    )}

                    <div className="feat-dest-card-vignette" />
                    <div className="feat-dest-card-region">{dest.region}</div>

                    {dest.travel_score && (
                      <div className="feat-dest-card-score">
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.96)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                          {dest.travel_score.overall}
                        </span>
                        <span style={{ fontSize: "0.5rem", fontWeight: 500, color: "rgba(255,255,255,0.72)", lineHeight: 1 }}>/100</span>
                      </div>
                    )}

                    <div className="feat-dest-card-content" style={{ padding: "0.75rem 1rem 0.875rem", gap: "0.4rem" }}>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.125rem, 2.5vw, 1.625rem)", fontWeight: 700, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.97)", margin: 0, lineHeight: 1.05 }}>
                        {dest.label}
                      </h3>
                      {sum && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", alignItems: "center" }}>
                          <span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.04em", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "999px", padding: "0.15rem 0.45rem", color: "rgba(255,255,255,0.88)", backdropFilter: "blur(6px)", whiteSpace: "nowrap" }}>
                            {sum.visaLabel}
                          </span>
                          <span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.04em", background: "rgba(217,119,6,0.20)", border: "1px solid rgba(217,119,6,0.40)", borderRadius: "999px", padding: "0.15rem 0.45rem", color: "rgba(255,200,80,0.95)", backdropFilter: "blur(6px)", whiteSpace: "nowrap" }}>
                            {sum.budgetFrom}
                          </span>
                          <span style={{ fontSize: "0.55rem", fontWeight: 600, color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>
                            {sum.bestMonths}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1rem" }}>
          <button
            type="button"
            onClick={() => goTo((page - 1 + totalPages) % totalPages, -1)}
            aria-label="Previous destinations"
            style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", width: "2rem", height: "2rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.9rem", flexShrink: 0 }}
          >
            ←
          </button>

          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i, i > page ? 1 : -1)}
                aria-label={`Go to page ${i + 1}`}
                style={{ width: i === page ? "1.5rem" : "0.45rem", height: "0.45rem", borderRadius: "999px", background: i === page ? "var(--accent)" : "var(--border)", border: "none", cursor: "pointer", padding: 0, transition: "width 0.3s ease, background 0.3s ease", flexShrink: 0 }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goTo((page + 1) % totalPages, 1)}
            aria-label="Next destinations"
            style={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", width: "2rem", height: "2rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.9rem", flexShrink: 0 }}
          >
            →
          </button>
        </div>
      </div>

      {/* Destination panel — rendered outside the hover-pause zone */}
      <AnimatePresence>
        {selectedDest && (
          <DestinationPanel
            key={selectedDest.id}
            dest={selectedDest}
            summary={summaries.get(selectedDest.id)}
            passportId={passportId}
            onClose={() => setSelectedDestId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
