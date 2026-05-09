import type { Destination } from "@/lib/types";
import type { DestinationSummary } from "@/components/DestinationCard";

interface ComparisonStripProps {
  destinations: Destination[];
  summaries: Map<string, DestinationSummary>;
}

export function ComparisonStrip({ destinations, summaries }: ComparisonStripProps) {
  return (
    <div className="card">
      {destinations.map((dest, i) => {
        const summary = summaries.get(dest.id);
        const isLast = i === destinations.length - 1;

        return (
          <div
            key={dest.id}
            style={{
              borderTop: i === 0 ? "none" : "1px solid var(--border)",
              paddingTop: i === 0 ? 0 : "0.875rem",
              paddingBottom: isLast ? 0 : "0.875rem",
            }}
          >
            {/* Name + score */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: "0.5rem",
                marginBottom: "0.25rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                {dest.emoji} {dest.label}
              </span>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  flexShrink: 0,
                }}
              >
                {dest.travel_score?.overall ?? "—"}
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 400,
                    color: "var(--text-muted)",
                  }}
                >
                  /100
                </span>
              </span>
            </div>

            {/* Stats line or fallback */}
            {summary ? (
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {summary.visaLabel}
                <span style={{ margin: "0 0.3rem", opacity: 0.4 }}>·</span>
                {summary.budgetFrom}
                <span style={{ margin: "0 0.3rem", opacity: 0.4 }}>·</span>
                {summary.bestMonths}
              </p>
            ) : (
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                Not available yet
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
