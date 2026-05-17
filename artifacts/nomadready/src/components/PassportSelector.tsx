"use client";

import { useLocation } from "wouter";
import { motion } from "motion/react";
import type { Passport } from "@/lib/types";

interface PassportSelectorProps {
  passports: Passport[];
  activeId: string;
}

const SPRING = { type: "spring" as const, stiffness: 460, damping: 11 };

export function PassportSelector({ passports, activeId }: PassportSelectorProps) {
  const [, setLocation] = useLocation();

  function select(id: string) {
    setLocation(`/?passport=${id}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <span
        style={{
          fontSize: "0.62rem",
          fontWeight: 700,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.32)",
        }}
      >
        Your passport
      </span>

      <div
        role="radiogroup"
        aria-label="Select your passport"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.3rem",
          maxWidth: "220px",
        }}
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
              onClick={() => select(p.id)}
              whileHover={{ scale: 1.18 }}
              whileTap={{ scale: 0.88 }}
              transition={SPRING}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                border: isActive
                  ? "2px solid rgba(217,119,6,0.90)"
                  : "1.5px solid rgba(255,255,255,0.10)",
                background: isActive
                  ? "rgba(217,119,6,0.20)"
                  : "rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: isActive
                  ? "0 0 14px rgba(217,119,6,0.38), inset 0 0 8px rgba(217,119,6,0.10)"
                  : "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1px",
                padding: 0,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "1.05rem", lineHeight: 1 }} aria-hidden="true">
                {p.emoji}
              </span>
              <span
                style={{
                  fontSize: "0.52rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: isActive ? "rgba(255,200,80,0.95)" : "rgba(255,255,255,0.35)",
                  lineHeight: 1,
                }}
              >
                {p.id.toUpperCase()}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
