"use client";

import type { LocalGem, GemGroup } from "@/lib/types";
import { useProfileContext } from "@/lib/profile";

const BUDGET_COLOR: Record<"$" | "$$" | "$$$", string> = {
  "$":   "#16a34a",
  "$$":  "#b45309",
  "$$$": "#c2410c",
};

const GROUP_ORDER: GemGroup[] = [
  "Work-Friendly",
  "Coffee & Bakery",
  "Local Food",
  "Practical",
  "Explore",
];

function GemRow({ gem, isLast }: { gem: LocalGem; isLast: boolean }) {
  return (
    <div
      style={{
        paddingTop: "0.875rem",
        paddingBottom: "0.875rem",
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
          marginBottom: "0.3rem",
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

      {/* Field highlight */}
      <p
        style={{
          fontSize: "0.8125rem",
          color: "var(--text-secondary)",
          fontStyle: "italic",
          lineHeight: 1.55,
          margin: gem.micro_watch_out ? "0 0 0.25rem" : 0,
        }}
      >
        &ldquo;{gem.field_highlight}&rdquo;
      </p>

      {/* Micro watch out */}
      {gem.micro_watch_out && (
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
          <span>{gem.micro_watch_out}</span>
        </p>
      )}
    </div>
  );
}

function GemGroupPanel({ groupName, gems }: { groupName: GemGroup; gems: LocalGem[] }) {
  return (
    <div>
      {/* Group label */}
      <div style={{ padding: "0.75rem 1.375rem 0" }}>
        <span
          style={{
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          {groupName}
        </span>
      </div>

      {/* Gems in this group */}
      <div style={{ padding: "0 1.375rem" }}>
        {gems.map((gem, i) => (
          <GemRow key={gem.name} gem={gem} isLast={i === gems.length - 1} />
        ))}
      </div>
    </div>
  );
}

export function LocalGemsSection({ gems }: { gems: LocalGem[] }) {
  const { profile } = useProfileContext();

  const grouped = GROUP_ORDER
    .map((g) => ({ group: g, gems: gems.filter((gem) => gem.group === g) }))
    .filter(({ gems: g }) => g.length > 0);

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
          Local Gems
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

      {/* Groups — desktop: 2-column newspaper layout */}
      <div className="gems-groups-grid">
        {grouped.map(({ group, gems: groupGems }) => (
          <div key={group} className="gems-group-cell">
            <GemGroupPanel groupName={group} gems={groupGems} />
          </div>
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
