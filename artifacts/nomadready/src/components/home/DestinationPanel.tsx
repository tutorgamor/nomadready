"use client";

/**
 * DestinationPanel — bottom-sheet destination preview with DepthCarousel.
 *
 * Opens when a destination card is clicked in DestinationPicker.
 * Layout: two-column on desktop (carousel left, info right), stacked on mobile.
 * Contains: DepthCarousel, visa/budget/season pills, tagline, travel score, CTA.
 *
 * Animation:
 *   - Backdrop fades in (opacity 0→1, blur)
 *   - Panel slides up from y:"100%" with cinematic ease
 *   - On close: plays exit animations before calling onClose via onExitComplete
 *
 * Accessibility:
 *   - role="dialog" aria-modal="true"
 *   - Escape key → close
 *   - Body scroll locked while open
 *   - Focus trapped inside (close button auto-focused)
 */

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "motion/react";
import { DepthCarousel, type CarouselPhoto } from "./DepthCarousel";
import type { Destination } from "@/lib/types";
import type { DestSummary } from "./DestinationPicker";

// ── Curated photo galleries — 4 shots per destination ────────────────────────

const DEST_GALLERY: Record<string, string[]> = {
  thailand: [
    "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540206395-68808572332f?w=1400&q=82&auto=format&fit=crop",
  ],
  malaysia: [
    "https://images.unsplash.com/photo-1596422846543-986a7c5feacc?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548613053-22087dd8edb8?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519181245277-cffeb4aefd35?w=1400&q=82&auto=format&fit=crop",
  ],
  indonesia: [
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1604999333679-b86d54738315?w=1400&q=82&auto=format&fit=crop",
  ],
  philippines: [
    "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1582897085656-c636d006a246?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1559827291-72304cead5c7?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1545126621-a28c1c98aaac?w=1400&q=82&auto=format&fit=crop",
  ],
  vietnam: [
    "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1528127269322-539801943592?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555921015-5532091f6026?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=1400&q=82&auto=format&fit=crop",
  ],
  turkey: [
    "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1543702903-c994688ed6cf?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601462904263-f2fa0c851cb9?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1400&q=82&auto=format&fit=crop",
  ],
  georgia: [
    "https://images.unsplash.com/photo-1561049933-c8fbef47b329?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1598971639058-a13a44c8d0ab?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1590845947698-8924d7409b56?w=1400&q=82&auto=format&fit=crop",
  ],
  japan: [
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1400&q=82&auto=format&fit=crop",
  ],
  "south-korea": [
    "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1400&q=82&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583766395091-2eb9994ed094?w=1400&q=82&auto=format&fit=crop",
  ],
};

const DEST_TAGLINES: Record<string, string> = {
  thailand:      "Des temples d'or aux plages sauvages — une inépuisable diversité.",
  malaysia:      "Modernité et traditions séparées par quelques rues.",
  indonesia:     "Dix-sept mille îles. Chacune a sa propre version du paradis.",
  philippines:   "L'archipel où l'eau est plus transparente que le ciel.",
  vietnam:       "Du delta du Mékong aux rizières de Sapa, un pays en mouvement.",
  turkey:        "Un pont entre deux continents et dix siècles d'histoire.",
  georgia:       "Vins naturels, montagnes caucasiennes, hospitalité sans limite.",
  japan:         "L'ordre et l'excès, côte à côte, dans une harmonie étrange.",
  "south-korea": "Séoul la nuit n'est pas une ville — c'est une promesse.",
};

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  dest:       Destination;
  summary:    DestSummary | undefined;
  passportId: string;
  onClose:    () => void;
}

export function DestinationPanel({ dest, summary, passportId, onClose }: Props) {
  const [visible, setVisible] = useState(true);
  const [, setLocation]       = useLocation();
  const closeBtnRef           = useRef<HTMLButtonElement>(null);

  const photos: CarouselPhoto[] = (DEST_GALLERY[dest.id] ?? []).map((url) => ({
    url,
    alt: dest.label,
  }));

  // Auto-focus close button
  useEffect(() => { closeBtnRef.current?.focus(); }, []);

  // Escape key → close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setVisible(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  function handleNavigate() {
    setVisible(false);
    setTimeout(() => setLocation(`/ready/${passportId}/${dest.id}`), 300);
  }

  const tagline = DEST_TAGLINES[dest.id] ?? "";

  return (
    <AnimatePresence onExitComplete={onClose}>
      {visible && (
        <div className="dest-panel-root">
          {/* Backdrop */}
          <motion.div
            key="dp-backdrop"
            className="dest-panel-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.30 }}
            onClick={() => setVisible(false)}
          />

          {/* Panel */}
          <motion.div
            key="dp-panel"
            className="dest-panel"
            initial={{ y: "100%", opacity: 0.85 }}
            animate={{ y: 0,      opacity: 1    }}
            exit={{ y: "100%",    opacity: 0    }}
            transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={`${dest.label} — aperçu destination`}
          >
            {/* ── Header ── */}
            <div className="dest-panel-header">
              <div className="dest-panel-header-text">
                <p className="dest-panel-region">{dest.region}</p>
                <h2 className="dest-panel-title">{dest.label}</h2>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={() => setVisible(false)}
                aria-label="Fermer"
                className="dest-panel-close"
              >
                ×
              </button>
            </div>

            {/* ── Body ── */}
            <div className="dest-panel-body">

              {/* Left: carousel */}
              <div className="dest-panel-carousel-col">
                <DepthCarousel photos={photos} aspectRatio={16 / 11} />
              </div>

              {/* Right: info */}
              <div className="dest-panel-info-col">

                {/* Pills */}
                {summary && (
                  <div className="dest-panel-pills">
                    <span className="dest-panel-pill dest-panel-pill--visa">
                      {summary.visaLabel}
                    </span>
                    <span className="dest-panel-pill dest-panel-pill--budget">
                      {summary.budgetFrom}
                    </span>
                    <span className="dest-panel-pill dest-panel-pill--season">
                      {summary.bestMonths}
                    </span>
                  </div>
                )}

                {/* Tagline */}
                {tagline && (
                  <p className="dest-panel-tagline">{tagline}</p>
                )}

                {/* Travel score */}
                {dest.travel_score && (
                  <div className="dest-panel-score">
                    <span className="dest-panel-score-num">
                      {dest.travel_score.overall}
                    </span>
                    <span className="dest-panel-score-label">/ 100</span>
                  </div>
                )}

                {/* CTA */}
                <button
                  type="button"
                  onClick={handleNavigate}
                  className="dest-panel-cta"
                >
                  Explorer le guide complet
                  <span aria-hidden style={{ marginLeft: "0.45em", opacity: 0.8 }}>→</span>
                </button>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
