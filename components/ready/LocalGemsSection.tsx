"use client";

import type { LocalGem } from "@/lib/types";
import { useProfileContext } from "@/lib/profile";

const BUDGET_COLOR: Record<"$" | "$$" | "$$$", string> = {
  "$":   "#16a34a",
  "$$":  "#b45309",
  "$$$": "#c2410c",
};

function GemRow({ gem, isLast }: { gem: LocalGem; isLast: boolean }) {
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
          marginBottom: "0.35rem",
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexShrink: 0 }}>
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
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
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
          margin: "0 0 0.45rem",
        }}
      >
        {gem.short_note}
      </p>

      {/* Why good + watch out */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
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

export function LocalGemsSection({ gems }: { gems: LocalGem[] }) {
  const { profile } = useProfileContext();

  return (
    <div className="card" style={{ overflow: "hidden", padding: 0 }}>
      {/* Header */}
      <div
        style={{
          padding: "1.125rem 1.375rem 0.875rem",
          borderBottom: "1px solid var(--border)",
          background: "linear-gradient(160deg, #fffdf8 0%, #fdf6ee 100%)",
        }}
      >
        <p className="section-heading" style={{ margin: "0 0 0.125rem" }}>
          💎 Local Gems
        </p>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
            margin: "0 0 0.375rem",
            lineHeight: 1.5,
          }}
        >
          {profile.gemsBlurb}
        </p>
      </div>

      {/* Gem list */}
      <div style={{ padding: "0 1.375rem" }}>
        {gems.map((gem, i) => (
          <GemRow key={gem.name} gem={gem} isLast={i === gems.length - 1} />
        ))}
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
