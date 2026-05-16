"use client";

import { PROFILES, useProfileContext } from "@/lib/profile";
import { Magnetic } from "@/components/motion-primitives/magnetic";

const SPRING = { stiffness: 26.7, damping: 4.1, mass: 0.2 };

export function ProfileSelector() {
  const { profile, setProfileId } = useProfileContext();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <span
        style={{
          fontSize: "0.68rem",
          fontWeight: 600,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        Travel style
      </span>
      <div
        style={{
          display: "flex",
          gap: "0.375rem",
          overflowX: "auto",
          paddingBottom: "0.125rem",
          scrollbarWidth: "none",
        }}
      >
        {PROFILES.map((p) => {
          const isActive = profile.id === p.id;
          return (
            <Magnetic key={p.id} intensity={0.2} range={80} actionArea="self" springOptions={SPRING}>
              <button
                onClick={() => setProfileId(p.id)}
                title={p.tagline}
                aria-pressed={isActive}
                style={{
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  padding: "0.325rem 0.75rem",
                  borderRadius: "9999px",
                  border: isActive
                    ? "1.5px solid var(--accent-dark)"
                    : "1px solid var(--border)",
                  background: isActive ? "var(--accent)" : "var(--bg-base)",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  fontSize: "0.75rem",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.02em",
                  boxShadow: isActive ? "0 2px 8px rgba(217,119,6,0.28)" : "none",
                  transition: "background 0.15s, color 0.15s, box-shadow 0.15s, border-color 0.15s",
                }}
              >
                <span aria-hidden="true" style={{ fontSize: "0.875rem", lineHeight: 1 }}>
                  {p.emoji}
                </span>
                {p.label}
              </button>
            </Magnetic>
          );
        })}
      </div>
    </div>
  );
}
