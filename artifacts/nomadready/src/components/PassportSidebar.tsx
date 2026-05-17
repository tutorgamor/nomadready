"use client";

import { useLocation } from "wouter";
import { motion } from "motion/react";
import type { Passport } from "@/lib/types";

interface PassportSidebarProps {
  passports: Passport[];
  activeId: string;
}

const SPRING = { type: "spring" as const, stiffness: 440, damping: 13 };

export function PassportSidebar({ passports, activeId }: PassportSidebarProps) {
  const [, setLocation] = useLocation();

  return (
    <div
      className="passport-sidebar"
      aria-label="Select your passport"
      role="radiogroup"
    >
      {passports.map((p) => {
        const isActive = p.id === activeId;
        return (
          <motion.button
            key={p.id}
            role="radio"
            aria-checked={isActive}
            aria-label={p.label}
            type="button"
            title={p.label}
            onClick={() => setLocation(`/?passport=${p.id}`)}
            whileHover={{ scale: 1.22, x: 3 }}
            whileTap={{ scale: 0.88 }}
            transition={SPRING}
            style={{
              position: "relative",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: isActive
                ? "2px solid rgba(217,119,6,0.92)"
                : "1px solid rgba(255,255,255,0.10)",
              background: "rgba(0,0,0,0.28)",
              boxShadow: isActive
                ? "0 0 12px rgba(217,119,6,0.40), 0 2px 8px rgba(0,0,0,0.30)"
                : "0 1px 4px rgba(0,0,0,0.18)",
              cursor: "pointer",
              padding: 0,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {/* Flag — fills the button */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.35rem",
                lineHeight: 1,
                opacity: isActive ? 0.92 : 0.55,
                transition: "opacity 0.2s",
              }}
            >
              {p.emoji}
            </span>

            {/* Country code — overlaid on top */}
            <span
              style={{
                position: "relative",
                zIndex: 1,
                fontSize: "0.48rem",
                fontWeight: 900,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: isActive ? "rgba(255,230,100,1)" : "rgba(255,255,255,0.90)",
                textShadow: "0 1px 4px rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.70)",
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              {p.id.toUpperCase()}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
