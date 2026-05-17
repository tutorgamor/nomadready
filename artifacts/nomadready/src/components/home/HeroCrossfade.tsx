import { useState } from "react";

const FALLBACK = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85&auto=format&fit=crop";

export function HeroCrossfade() {
  const [videoError, setVideoError] = useState(false);

  return (
    <>
      {/* Fallback photo — always rendered behind video */}
      <img
        src={FALLBACK}
        alt=""
        aria-hidden="true"
        fetchPriority="low"
        decoding="async"
        className="home-hero-bg"
        style={{ opacity: 1 }}
      />

      {/* Generated hero video — looping cinematic travel journey */}
      {!videoError && (
        <video
          className="home-hero-bg"
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
          style={{
            opacity: 1,
            objectFit: "cover",
            objectPosition: "center center",
          }}
        >
          <source src="/assets/hero-loop.mp4" type="video/mp4" />
        </video>
      )}
    </>
  );
}
