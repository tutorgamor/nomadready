"use client";

import type { TravelScore } from "@/lib/types";
import { useProfileContext } from "@/lib/profile";

const CATEGORIES: { key: keyof Omit<TravelScore, "overall">; label: string }[] = [
  { key: "visa_ease",       label: "Visa"     },
  { key: "budget",          label: "Budget"   },
  { key: "safety",          label: "Safety"   },
  { key: "internet",        label: "Internet" },
  { key: "transport",       label: "Transit"  },
  { key: "nomad_friendly",  label: "Nomad"    },
];

function scoreColor(v: number): string {
  if (v >= 85) return "#16a34a";
  if (v >= 70) return "#d97706";
  return "#dc2626";
}

export function TravelScoreSection({ score }: { score: TravelScore }) {
  const { profile } = useProfileContext();
  const color = scoreColor(score.overall);

  return (
    <div
      className="card"
      style={{ padding: 0, overflow: "hidden" }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "0.875rem 1.375rem 0.75rem",
          borderBottom: "1px solid var(--border)",
          flexWrap: "wrap",
        }}
      >
        <p
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          Travel Readiness
        </p>
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            margin: 0,
            fontStyle: "italic",
            lineHeight: 1.4,
          }}
        >
          {profile.scoreBlurb}
        </p>
      </div>

      {/* ── Instrument body: dial + sub-score grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "1.5rem",
          padding: "1.25rem 1.375rem 1.125rem",
          alignItems: "center",
        }}
      >
        {/* Central field-score dial */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.375rem",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "92px",
              height: "92px",
              borderRadius: "50%",
              border: `1.5px solid ${color}50`,
              boxShadow: `0 0 0 5px ${color}0e, var(--shadow-card)`,
              background: "linear-gradient(160deg, #ffffff 0%, #fef9f3 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.375rem",
                fontWeight: 600,
                letterSpacing: "-0.04em",
                color,
                lineHeight: 1,
              }}
            >
              {score.overall}
            </span>
            <span
              style={{
                fontSize: "0.55rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                marginTop: "0.1rem",
              }}
            >
              /100
            </span>
          </div>
          <p
            style={{
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              margin: 0,
            }}
          >
            Field score
          </p>
        </div>

        {/* 3 × 2 sub-score cell grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            borderTop: "1px solid var(--border)",
            borderLeft: "1px solid var(--border)",
          }}
        >
          {CATEGORIES.map(({ key, label }) => {
            const val = score[key] as number;
            const c = scoreColor(val);
            const highlighted = profile.scoreHighlight.includes(key);
            return (
              <div
                key={key}
                style={{
                  position: "relative",
                  padding: "0.625rem 0.75rem 0.5rem",
                  borderRight: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                  background: highlighted
                    ? "rgba(254,243,199,0.42)"
                    : "transparent",
                }}
              >
                {highlighted && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      background: "var(--accent)",
                    }}
                  />
                )}
                <p
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: c,
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {val}
                </p>
                <p
                  style={{
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: highlighted ? "var(--text-secondary)" : "var(--text-muted)",
                    margin: "0.2rem 0 0",
                    lineHeight: 1.2,
                  }}
                >
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer ── */}
      <p
        style={{
          fontSize: "0.6875rem",
          color: "var(--text-muted)",
          fontStyle: "italic",
          lineHeight: 1.5,
          margin: 0,
          padding: "0.625rem 1.375rem 0.875rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        Editorial travel scores — approximate and subjective.
      </p>
    </div>
  );
}
