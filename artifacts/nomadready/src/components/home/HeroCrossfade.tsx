import { useState, useEffect } from "react";

// Poster frames — first-frame JPEG shown immediately while the video buffers.
// Sizes: desktop 78 KB, mobile 65 KB (re-encoded from corrected source, May 2026).
const POSTER_DESKTOP = "/assets/hero/hero-loop-poster-desktop.jpg";
const POSTER_MOBILE  = "/assets/hero/hero-loop-poster-mobile.jpg";

// Static fallback shown behind the video (and when video is blocked/errored).
// Mobile: hero-cinematic.jpg — 55 KB local JPEG, already optimised.
// Desktop: Unsplash photo — served from CDN, not LCP so low priority is fine.
const STATIC_MOBILE  = "/assets/hero/hero-cinematic.jpg";
const STATIC_DESKTOP = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85&auto=format&fit=crop";

// Encoded sizes (corrected source, May 2026):
//   desktop.mp4  2.6 MB  desktop.webm 5.9 MB  → MP4 wins; list first
//   mobile.mp4   1.75 MB mobile.webm  4.1 MB  → MP4 wins; list first
// VP9/WebM is listed second so future 2-pass re-encodes can reclaim the lead
// without a source-order change in JSX.
const DESKTOP_MP4  = "/assets/hero/hero-loop-desktop.mp4";
const DESKTOP_WEBM = "/assets/hero/hero-loop-desktop.webm";
const MOBILE_MP4   = "/assets/hero/hero-loop-mobile.mp4";
const MOBILE_WEBM  = "/assets/hero/hero-loop-mobile.webm";

function getIsMobile(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

function getSaveData(): boolean {
  return (
    typeof navigator !== "undefined" &&
    (navigator as Navigator & { connection?: { saveData: boolean } }).connection?.saveData === true
  );
}

export function HeroCrossfade() {
  // Initialise synchronously so the correct sources are chosen on first render —
  // avoids a flash where desktop sources briefly load on a mobile viewport.
  const [isMobile, setIsMobile] = useState(getIsMobile);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const saveData  = getSaveData();
  const poster    = isMobile ? POSTER_MOBILE  : POSTER_DESKTOP;
  const staticImg = isMobile ? STATIC_MOBILE  : STATIC_DESKTOP;

  return (
    <>
      {/*
        Static fallback — always rendered behind the video.
        On mobile this IS the LCP element: fetchPriority="high" prioritises the network
        fetch; decoding="async" keeps the main thread free during decode (sync decode
        blocked the main thread ~20-50ms on mid-range phones for no visible first-frame
        benefit, since fetchPriority alone brings the image in early enough).
        Ken Burns (desktop) / ambient-pulse (mobile) are CSS-only, no JS.
      */}
      <img
        src={staticImg}
        alt=""
        aria-hidden="true"
        fetchPriority={isMobile ? "high" : "low"}
        decoding="async"
        className="home-hero-bg"
      />

      {/*
        Video — skipped entirely when Data Saver is on or the element has errored.
        key prop forces a full remount on breakpoint change so the browser picks up
        the correct <source> elements rather than re-evaluating the existing ones.

        Source order: MP4 first — for this specific encode the H.264 MP4 is smaller
        than the VP9 WebM on both variants (see size comments above). VP9 is listed
        second so future 2-pass re-encodes can reclaim priority without touching JSX.
      */}
      {!videoError && !saveData && (
        <video
          key={isMobile ? "mobile" : "desktop"}
          className="home-hero-bg"
          autoPlay
          muted
          loop
          playsInline
          poster={poster}
          preload="metadata"
          onError={() => setVideoError(true)}
          style={{ objectFit: "cover", objectPosition: "center center" }}
        >
          {isMobile ? (
            <>
              <source src={MOBILE_MP4}  type="video/mp4" />
              <source src={MOBILE_WEBM} type="video/webm" />
            </>
          ) : (
            <>
              <source src={DESKTOP_MP4}  type="video/mp4" />
              <source src={DESKTOP_WEBM} type="video/webm" />
            </>
          )}
        </video>
      )}
    </>
  );
}
