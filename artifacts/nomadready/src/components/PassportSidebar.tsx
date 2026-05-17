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
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: isActive
                ? "2px solid rgba(217,119,6,0.92)"
                : "1px solid rgba(255,255,255,0.10)",
              background: isActive
                ? "rgba(217,119,6,0.22)"
                : "rgba(255,255,255,0.05)",
              boxShadow: isActive
                ? "0 0 12px rgba(217,119,6,0.40), 0 2px 8px rgba(0,0,0,0.30)"
                : "0 1px 4px rgba(0,0,0,0.18)",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "0.875rem", lineHeight: 1 }} aria-hidden="true">
              {p.emoji}
            </span>
            <span
              style={{
                fontSize: "0.44rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: isActive ? "rgba(255,200,80,0.95)" : "rgba(255,255,255,0.28)",
                lineHeight: 1,
                marginTop: "1px",
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
