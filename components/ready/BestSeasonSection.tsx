import type { BestSeason, Month } from "@/lib/types";

const ALL_MONTHS: Month[] = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function MonthChip({ month, state }: { month: Month; state: "best" | "avoid" | "neutral" }) {
  const colors = {
    best:    { bg: "#f0fdf4", color: "var(--ok)",      border: "var(--ok)" },
    avoid:   { bg: "#fef2f2", color: "var(--danger)",  border: "var(--danger)" },
    neutral: { bg: "var(--bg-base)", color: "var(--text-muted)", border: "var(--border)" },
  };
  const c = colors[state];
  return (
    <span
      style={{
        fontSize: "0.72rem",
        fontWeight: 600,
        padding: "0.2rem 0.45rem",
        borderRadius: "0.375rem",
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
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
      <p className="section-heading">🌤️ Best Season</p>

      {/* Overall best months */}
      <div style={{ marginBottom: "1.25rem" }}>
        <p
          style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: "0 0 0.5rem",
          }}
        >
          Overall best
        </p>
        <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
          {ALL_MONTHS.map((m) => (
            <MonthChip
              key={m}
              month={m}
              state={bestSeason.overall_best_months.includes(m) ? "best" : "neutral"}
            />
          ))}
        </div>
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
              {ALL_MONTHS.map((m) => {
                const state = region.best.includes(m)
                  ? "best"
                  : region.avoid.includes(m)
                  ? "avoid"
                  : "neutral";
                return <MonthChip key={m} month={m} state={state} />;
              })}
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
