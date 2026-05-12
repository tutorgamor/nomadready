"use client";

import { useState } from "react";
import type { BangkokGem, BangkokLocalGems } from "@/lib/types";

const CATEGORIES = [
  { key: "remote_work",  label: "Remote Work", icon: "💻" },
  { key: "cafes_bakery", label: "Cafés",        icon: "☕" },
  { key: "local_food",   label: "Local Food",   icon: "🍜" },
  { key: "practical",    label: "Practical",    icon: "🔧" },
  { key: "explore",      label: "Explore",      icon: "🌆" },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];

const BUDGET_COLOR: Record<"$" | "$$" | "$$$", string> = {
  "$":   "#16a34a",
  "$$":  "#b45309",
  "$$$": "#c2410c",
};

function GemRow({ gem, isLast }: { gem: BangkokGem; isLast: boolean }) {
  return (
    <div
      style={{
        paddingTop: "1rem",
        paddingBottom: isLast ? 0 : "1rem",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
      }}
    >
      {/* Name + budget + area */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "0.75rem",
          marginBottom: "0.375rem",
        }}
      >
        <span
          style={{
            fontSize: "0.9375rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.3,
          }}
        >
          {gem.name}
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: BUDGET_COLOR[gem.budget],
              letterSpacing: "0.03em",
            }}
          >
            {gem.budget}
          </span>
          <span
            style={{
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              fontWeight: 400,
            }}
          >
            · {gem.area}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          flexWrap: "wrap",
          marginBottom: "0.5rem",
        }}
      >
        {gem.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              background: "var(--bg-surface, #f5f3ef)",
              border: "1px solid var(--border)",
              borderRadius: "9999px",
              padding: "0.1rem 0.45rem",
              whiteSpace: "nowrap",
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Short note */}
      <p
        style={{
          fontSize: "0.8125rem",
          color: "var(--text-secondary)",
          fontStyle: "italic",
          lineHeight: 1.6,
          margin: "0 0 0.5rem",
        }}
      >
        {gem.short_note}
      </p>

      {/* Why good + watch out */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.2rem",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            margin: 0,
            lineHeight: 1.5,
            display: "flex",
            gap: "0.35rem",
          }}
        >
          <span style={{ color: "#16a34a", flexShrink: 0 }}>✓</span>
          <span>{gem.why_good}</span>
        </p>
        {gem.watch_out && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              margin: 0,
              lineHeight: 1.5,
              display: "flex",
              gap: "0.35rem",
            }}
          >
            <span style={{ color: "#b45309", flexShrink: 0 }}>⚠</span>
            <span>{gem.watch_out}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export function BangkokGemsSection({ gems }: { gems: BangkokLocalGems }) {
  const [activeTab, setActiveTab] = useState<CategoryKey>("remote_work");
  const activeGems = gems[activeTab];

  return (
    <div className="card" style={{ overflow: "hidden", padding: 0 }}>
      {/* Editorial header strip */}
      <div
        style={{
          padding: "1.125rem 1.375rem 0.875rem",
          borderBottom: "1px solid var(--border)",
          background: "linear-gradient(160deg, #fffdf8 0%, #fdf6ee 100%)",
        }}
      >
        <p className="section-heading" style={{ margin: "0 0 0.125rem" }}>
          📍 Bangkok Local Gems
        </p>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Curated field-guide picks for working and living in Bangkok.
        </p>
      </div>

      {/* Category tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          overflowX: "auto",
          padding: "0.75rem 1.375rem 0",
          scrollbarWidth: "none",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {CATEGORIES.map(({ key, label, icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.35rem 0.75rem",
                borderRadius: "9999px 9999px 0 0",
                border: "1px solid",
                borderBottom: isActive ? "1px solid var(--bg-card)" : "1px solid var(--border)",
                borderColor: isActive ? "var(--border)" : "transparent",
                background: isActive ? "var(--bg-card)" : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: "0.8125rem",
                fontWeight: isActive ? 600 : 400,
                cursor: "pointer",
                transition: "color 0.12s, background 0.12s",
                marginBottom: isActive ? "-1px" : 0,
                position: "relative",
                zIndex: isActive ? 1 : 0,
              }}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </button>
          );
        })}
      </div>

      {/* Gem list */}
      <div style={{ padding: "0 1.375rem" }}>
        {activeGems.length === 0 ? (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              fontStyle: "italic",
              padding: "1.25rem 0",
              margin: 0,
            }}
          >
            No picks in this category yet.
          </p>
        ) : (
          activeGems.map((gem, i) => (
            <GemRow key={gem.name} gem={gem} isLast={i === activeGems.length - 1} />
          ))
        )}
      </div>

      {/* Disclaimer */}
      <p
        style={{
          fontSize: "0.6875rem",
          color: "var(--text-muted)",
          fontStyle: "italic",
          lineHeight: 1.55,
          margin: 0,
          padding: "0.875rem 1.375rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        Curated from field experience and public reviews. Always verify recent information before visiting.
      </p>
    </div>
  );
}
