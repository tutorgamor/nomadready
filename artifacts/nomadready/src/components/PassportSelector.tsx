"use client";

import { useLocation } from "wouter";
import type { Passport } from "@/lib/types";

interface PassportSelectorProps {
  passports: Passport[];
  activeId: string;
}

export function PassportSelector({ passports, activeId }: PassportSelectorProps) {
  const [, setLocation] = useLocation();

  function select(id: string) {
    setLocation(`/?passport=${id}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <span
        style={{
          fontSize: "0.68rem",
          fontWeight: 700,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        Your passport
      </span>

      <div className="passport-chips-grid" role="radiogroup" aria-label="Select your passport">
        {passports.map((p) => {
          const isActive = p.id === activeId;
          return (
            <button
              key={p.id}
              role="radio"
              aria-checked={isActive}
              type="button"
              title={p.label}
              onClick={() => select(p.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.3rem",
                padding: "0.4rem 0.6rem",
                borderRadius: "8px",
                border: isActive
                  ? "1.5px solid var(--accent)"
                  : "1px solid var(--border)",
                background: isActive
                  ? "var(--accent)"
                  : "var(--surface-raised)",
                cursor: "pointer",
                transition: "background 0.15s, border-color 0.15s, box-shadow 0.15s",
                boxShadow: isActive ? "0 2px 8px rgba(217,119,6,0.30)" : "none",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: "1rem", lineHeight: 1 }} aria-hidden="true">
                {p.emoji}
              </span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#fff" : "var(--text-secondary)",
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                }}
              >
                {p.id.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
