import { useState, useEffect } from "react";

const PHOTOS = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=1600&q=85&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528181304800-259b08848526?w=1600&q=85&auto=format&fit=crop",
];

const INTERVAL_MS = 5000;
const FADE_MS = 1400;

export function HeroCrossfade() {
  const [cur, setCur] = useState(0);
  const [fading, setFading] = useState(false);
  const [next, setNext] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const n = (cur + 1) % PHOTOS.length;
      setNext(n);
      setFading(true);
      setTimeout(() => {
        setCur(n);
        setNext(null);
        setFading(false);
      }, FADE_MS);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [cur]);

  return (
    <>
      {PHOTOS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          fetchPriority={i === 0 ? "high" : "low"}
          decoding="async"
          className="home-hero-bg"
          style={{
            opacity: i === cur ? 1 : (fading && i === next ? 0.01 : 0),
            transition: i === next
              ? `opacity ${FADE_MS}ms ease-in`
              : i === cur
              ? `opacity ${FADE_MS}ms ease-out`
              : "none",
            animationPlayState: "paused",
          }}
        />
      ))}
    </>
  );
}
