import type { TravelScore } from "@/lib/types";

function scoreStyle(score: number): { color: string; track: string } {
  if (score >= 85) return { color: "#15803d", track: "#bbf7d0" };
  if (score >= 70) return { color: "#92400e", track: "#fde68a" };
  return { color: "#b91c1c", track: "#fecaca" };
}

function overallBadgeStyle(score: number): { bg: string; border: string; color: string } {
  if (score >= 85) return { bg: "#f0fdf4", border: "#86efac", color: "#15803d" };
  if (score >= 70) return { bg: "#fffbeb", border: "#fcd34d", color: "#92400e" };
  return { bg: "#fef2f2", border: "#fca5a5", color: "#b91c1c" };
}

const CATEGORIES = [
  { key: "visa_ease"      as const, label: "Visa ease",   icon: "🛂" },
  { key: "budget"         as const, label: "Budget",       icon: "💸" },
  { key: "safety"         as const, label: "Safety",       icon: "🔒" },
  { key: "internet"       as const, label: "Internet",     icon: "📶" },
  { key: "transport"      as const, label: "Transport",    icon: "🚌" },
  { key: "nomad_friendly" as const, label: "Nomad scene",  icon: "💻" },
];

export function TravelScoreSection({ score }: { score: TravelScore }) {
  const badge = overallBadgeStyle(score.overall);

  return (
    <div className="card">
      {/* Title row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1.125rem",
        }}
      >
        <div>
          <p className="section-heading" style={{ marginBottom: "0.2rem" }}>
            ✈️ Travel Readiness
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
            Destination at a glance
          </p>
        </div>

        {/* Overall score badge */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: badge.bg,
            border: `2px solid ${badge.border}`,
            borderRadius: "0.75rem",
            padding: "0.45rem 0.875rem 0.35rem",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "1.875rem",
              fontWeight: 800,
              lineHeight: 1,
              color: badge.color,
              letterSpacing: "-0.04em",
            }}
          >
            {score.overall}
          </span>
          <span
            style={{
              fontSize: "0.625rem",
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: badge.color,
              opacity: 0.65,
            }}
          >
            /100
          </span>
        </div>
      </div>

      {/* Category rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {CATEGORIES.map(({ key, label, icon }) => {
          const val = score[key];
          const s = scoreStyle(val);
          return (
            <div
              key={key}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span
                aria-hidden="true"
                style={{ fontSize: "0.875rem", flexShrink: 0, width: "1.125rem", textAlign: "center" }}
              >
                {icon}
              </span>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  flexShrink: 0,
                  width: "5.25rem",
                }}
              >
                {label}
              </span>
              {/* Bar track */}
              <div
                style={{
                  flex: 1,
                  height: "0.25rem",
                  background: "var(--border)",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${val}%`,
                    background: s.color,
                    borderRadius: "9999px",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: s.color,
                  width: "1.875rem",
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {val}
              </span>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p
        style={{
          fontSize: "0.6875rem",
          color: "var(--text-muted)",
          margin: "1rem 0 0",
          lineHeight: 1.5,
          fontStyle: "italic",
        }}
      >
        Editorial travel scores — approximate and subjective.
      </p>
    </div>
  );
}
