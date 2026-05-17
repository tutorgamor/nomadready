"use client";

import { useLocation } from "wouter";
import { motion } from "motion/react";
import type { Passport } from "@/lib/types";

interface PassportSidebarProps {
  passports: Passport[];
  activeId: string;
}

const SPRING = { type: "spring" as const, stiffness: 440, damping: 13 };

// Map passport id → ISO 3166-1 alpha-2 code for local /flags/{code}.png
const FLAG_CODE: Record<string, string> = {
  fr: "fr",
  uk: "gb",
  de: "de",
  nl: "nl",
  es: "es",
  it: "it",
  be: "be",
  us: "us",
  ca: "ca",
  au: "au",
};

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
        const flagCode = FLAG_CODE[p.id] ?? p.id;
        const flagSrc = `${import.meta.env.BASE_URL}flags/${flagCode}.png`;

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
            {/* Flag image — local file, fills the circle */}
            <img
              src={flagSrc}
              alt=""
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: isActive ? 0.92 : 0.55,
                transition: "opacity 0.2s",
                pointerEvents: "none",
              }}
            />

            {/* Country code overlaid on top */}
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
