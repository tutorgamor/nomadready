"use client";

import { PROFILES, useProfileContext } from "@/lib/profile";

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
            <button
              key={p.id}
              onClick={() => setProfileId(p.id)}
              title={p.tagline}
              aria-pressed={isActive}
              style={{
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.3rem 0.65rem",
                borderRadius: "9999px",
                border: isActive
                  ? "1.5px solid var(--text-primary)"
                  : "1px solid var(--border)",
                background: isActive ? "var(--text-primary)" : "var(--bg-base)",
                color: isActive ? "#fff" : "var(--text-secondary)",
                fontSize: "0.75rem",
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                letterSpacing: "0.02em",
              }}
            >
              <span aria-hidden="true" style={{ fontSize: "0.875rem", lineHeight: 1 }}>
                {p.emoji}
              </span>
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
