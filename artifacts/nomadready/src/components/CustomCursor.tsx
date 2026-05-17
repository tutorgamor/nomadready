import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const ringRef  = useRef<HTMLDivElement>(null);
  const dotRef   = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -200, y: -200 });
  const smoothRef = useRef({ x: -200, y: -200 });
  const rafRef   = useRef<number>(0);
  const [state, setState] = useState<"idle" | "hover" | "hidden">("hidden");
  const stateRef = useRef<"idle" | "hover" | "hidden">("hidden");

  useEffect(() => {
    // Only run on pointer devices (not touch)
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // Smooth loop with lerp for the outer ring
    const tick = () => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      smoothRef.current.x = lerp(smoothRef.current.x, mx, 0.13);
      smoothRef.current.y = lerp(smoothRef.current.y, my, 0.13);

      const ring = ringRef.current;
      const dot  = dotRef.current;
      if (ring) {
        ring.style.transform = `translate3d(${smoothRef.current.x}px, ${smoothRef.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (dot) {
        dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const setS = (s: "idle" | "hover" | "hidden") => {
      if (stateRef.current === s) return;
      stateRef.current = s;
      setState(s);
    };

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setS("idle");
    };

    const onOver = (e: MouseEvent) => {
      const el = (e.target as Element)?.closest("a, button, [role='button'], .dest-card, .feat-dest-card");
      if (el) setS("hover");
    };

    const onOut = (e: MouseEvent) => {
      const el = (e.target as Element)?.closest("a, button, [role='button'], .dest-card, .feat-dest-card");
      if (el) setS("idle");
    };

    const onLeaveDoc  = () => setS("hidden");
    const onEnterDoc  = () => setS("idle");

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout",  onOut,  { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeaveDoc);
    document.documentElement.addEventListener("mouseenter", onEnterDoc);

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout",  onOut);
      document.documentElement.removeEventListener("mouseleave", onLeaveDoc);
      document.documentElement.removeEventListener("mouseenter", onEnterDoc);
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      {/* Outer ring — follows with lag */}
      <div
        ref={ringRef}
        className="cursor-ring"
        data-state={state}
        aria-hidden="true"
      />
      {/* Inner dot — snaps to cursor exactly */}
      <div
        ref={dotRef}
        className="cursor-dot"
        data-state={state}
        aria-hidden="true"
      />
    </>
  );
}
