import type { BestSeason, Month } from "@/lib/types";

const ALL_MONTHS: Month[] = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type MonthState = "ideal" | "mixed" | "avoid";

const STATE_STYLES: Record<MonthState, { bg: string; color: string; border: string }> = {
  ideal: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  mixed: { bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
  avoid: { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
};

const LEGEND: Array<{ state: MonthState; label: string }> = [
  { state: "ideal", label: "Ideal" },
  { state: "mixed", label: "Mixed" },
  { state: "avoid", label: "Avoid" },
];

function getOverallState(month: Month, bestSeason: BestSeason): MonthState {
  if (bestSeason.overall_best_months.includes(month)) return "ideal";
  const { regions } = bestSeason;
  if (regions.length === 0) return "mixed";
  const avoidCount = regions.filter((r) => r.avoid.includes(month)).length;
  return avoidCount / regions.length >= 0.5 ? "avoid" : "mixed";
}

function getRegionState(month: Month, best: Month[], avoid: Month[]): MonthState {
  if (best.includes(month)) return "ideal";
  if (avoid.includes(month)) return "avoid";
  return "mixed";
}

function HeatmapCell({ month, state }: { month: Month; state: MonthState }) {
  const s = STATE_STYLES[state];
  return (
    <div
      className="bsh-cell"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: "0.375rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.5rem 0.125rem",
        fontSize: "0.6875rem",
        fontWeight: 700,
        letterSpacing: "0.02em",
        cursor: "default",
        userSelect: "none",
        transition: "filter 0.12s ease, transform 0.12s ease",
      }}
    >
      {month}
    </div>
  );
}

function MonthChip({ month, state }: { month: Month; state: MonthState }) {
  const s = STATE_STYLES[state];
  return (
    <span
      style={{
        fontSize: "0.72rem",
        fontWeight: 600,
        padding: "0.2rem 0.45rem",
        borderRadius: "0.375rem",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        letterSpacing: "0.02em",
      }}
    >
      {month}
    </span>
  );
}

export function BestSeasonSection({ bestSeason }: { bestSeason: BestSeason }) {
  return (
    <div className="card">
      <style>{`
        .bsh-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.25rem; }
        @media (min-width: 480px) { .bsh-grid { grid-template-columns: repeat(12, 1fr); } }
        @media (hover: hover) { .bsh-cell:hover { filter: brightness(0.93); transform: translateY(-1px); } }
      `}</style>

      <p className="section-heading">Best Season</p>

      {/* Heatmap — overall 12-month view */}
      <div className="bsh-grid" style={{ marginBottom: "0.5rem" }}>
        {ALL_MONTHS.map((m) => (
          <HeatmapCell key={m} month={m} state={getOverallState(m, bestSeason)} />
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem" }}>
        {LEGEND.map(({ state, label }) => {
          const s = STATE_STYLES[state];
          return (
            <span
              key={state}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.6875rem",
                color: "var(--text-muted)",
                letterSpacing: "0.03em",
              }}
            >
              <span
                style={{
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: "0.125rem",
                  background: s.color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {label}
            </span>
          );
        })}
      </div>

      {/* Regional breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {bestSeason.regions.map((region) => (
          <div
            key={region.area}
            style={{ borderTop: "1px solid var(--border)", paddingTop: "0.875rem" }}
          >
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: "0 0 0.4rem",
              }}
            >
              {region.area}
            </p>
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
              {ALL_MONTHS.map((m) => (
                <MonthChip
                  key={m}
                  month={m}
                  state={getRegionState(m, region.best, region.avoid)}
                />
              ))}
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
              {region.notes}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
