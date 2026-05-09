import Link from "next/link";
import type { CSSProperties } from "react";
import type { Destination } from "@/lib/types";
import { ProfileCardBadge } from "@/components/ProfileCardBadge";

export interface DestinationSummary {
  visaLabel: string;
  budgetFrom: string;
  bestMonths: string;
}

interface DestinationCardProps {
  destination: Destination;
  passportId: string;
  summary?: DestinationSummary;
}

const STAT_LABEL: CSSProperties = {
  fontSize: "0.625rem",
  fontWeight: 700,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  margin: "0 0 0.175rem",
};

const STAT_VALUE: CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: "var(--text-secondary)",
  margin: 0,
  lineHeight: 1.25,
};

export function DestinationCard({ destination, passportId, summary }: DestinationCardProps) {
  const { id, label, emoji, hero_tag, cover_color, region, travel_score } = destination;

  return (
    <Link href={`/ready/${passportId}/${id}`} className="dest-card" aria-label={`Travel guide for ${label}`}>
      {/* ── Colour accent bar ── */}
      <div
        style={{
          backgroundColor: cover_color,
          height: "112px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
        aria-hidden="true"
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(0,0,0,0.12) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(0deg, rgba(0,0,0,0.1) 0%, transparent 50%)",
          }}
        />
        <span
          style={{
            fontSize: "3rem",
            lineHeight: 1,
            position: "relative",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))",
          }}
        >
          {emoji}
        </span>
      </div>

      {/* ── Card body ── */}
      <div
        style={{
          padding: "1.1rem 1.25rem 1.1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
        }}
      >
        {/* Top row: label + arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            {label}
          </h2>
          <span
            style={{
              color: "var(--accent)",
              fontSize: "0.875rem",
              flexShrink: 0,
              marginTop: "1px",
              opacity: 0.7,
            }}
            aria-hidden="true"
          >
            →
          </span>
        </div>

        {/* Hero tag */}
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {hero_tag}
        </p>

        {/* Region badge */}
        <div style={{ marginTop: "0.5rem" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "0.68rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              backgroundColor: "var(--bg-base)",
              border: "1px solid var(--border)",
              borderRadius: "9999px",
              padding: "0.2rem 0.6rem",
            }}
          >
            {region}
          </span>
        </div>

        {/* Profile-specific highlight badge */}
        <div>
          <ProfileCardBadge travelScore={travel_score} />
        </div>

        {/* ── Highlights grid ── */}
        {summary && (
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "0.75rem",
              marginTop: "0.25rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              rowGap: "0.625rem",
              columnGap: "0.5rem",
            }}
          >
            <div>
              <p style={STAT_LABEL}>Score</p>
              <p style={{ ...STAT_VALUE, color: "var(--text-primary)", fontWeight: 700 }}>
                {travel_score?.overall ?? "—"}
                <span style={{ fontSize: "0.6875rem", fontWeight: 400, color: "var(--text-muted)" }}>/100</span>
              </p>
            </div>
            <div>
              <p style={STAT_LABEL}>Visa</p>
              <p style={STAT_VALUE}>{summary.visaLabel}</p>
            </div>
            <div>
              <p style={STAT_LABEL}>Budget from</p>
              <p style={STAT_VALUE}>{summary.budgetFrom}</p>
            </div>
            <div>
              <p style={STAT_LABEL}>Best time</p>
              <p style={STAT_VALUE}>{summary.bestMonths}</p>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
