import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const ringRef  = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "hover" | "hidden">("hidden");
  const stateRef = useRef<"idle" | "hover" | "hidden">("hidden");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const setS = (s: "idle" | "hover" | "hidden") => {
      if (stateRef.current === s) return;
      stateRef.current = s;
      setState(s);
    };

    // Position set directly in mousemove — no rAF loop, no lerp, no trail.
    // The browser coalesces style mutations with its own paint cycle,
    // keeping the ring exactly on the real cursor with zero lag.
    const onMove = (e: MouseEvent) => {
      const ring = ringRef.current;
      if (ring) {
        ring.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0) translate(-50%,-50%)`;
      }
      setS("idle");
    };

    const onOver = (e: MouseEvent) => {
      if ((e.target as Element)?.closest("a,button,[role='button'],.dest-card,.feat-dest-card")) {
        setS("hover");
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element)?.closest("a,button,[role='button'],.dest-card,.feat-dest-card")) {
        setS("idle");
      }
    };

    const onLeave = () => setS("hidden");
    const onEnter = () => setS("idle");

    window.addEventListener("mousemove",  onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout",  onOut,  { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      window.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout",  onOut);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <div
      ref={ringRef}
      className="cursor-ring"
      data-state={state}
      aria-hidden="true"
    />
  );
}
