import Link from "next/link";
import type { Destination } from "@/lib/types";

interface DestinationCardProps {
  destination: Destination;
}

/**
 * DestinationCard
 *
 * Each card shows:
 *   - A full-width colour bar accent (cover_color from JSON)
 *   - Country emoji (large, centred in the bar)
 *   - Destination label + hero tag
 *   - Region badge
 *   - A subtle arrow cue
 */
export function DestinationCard({ destination }: DestinationCardProps) {
  const { id, label, emoji, hero_tag, cover_color, region } = destination;

  return (
    <Link href={`/ready/${id}`} className="dest-card" aria-label={`Travel guide for ${label}`}>
      {/* ── Colour accent bar ── */}
      <div
        style={{
          backgroundColor: cover_color,
          height: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
        aria-hidden="true"
      >
        {/* Subtle tinted overlay for depth */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(160deg, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.08) 100%)",
          }}
        />
        <span
          style={{
            fontSize: "2.5rem",
            lineHeight: 1,
            position: "relative",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
          }}
        >
          {emoji}
        </span>
      </div>

      {/* ── Card body ── */}
      <div
        style={{
          padding: "1rem 1.1rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem",
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
              fontSize: "1.1rem",
              fontWeight: 650,
              letterSpacing: "-0.025em",
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {label}
          </h2>
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: "1rem",
              flexShrink: 0,
              marginTop: "1px",
            }}
            aria-hidden="true"
          >
            →
          </span>
        </div>

        {/* Hero tag / description */}
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {hero_tag}
        </p>

        {/* Region badge */}
        <div style={{ marginTop: "0.4rem" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "0.7rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              backgroundColor: "var(--bg-base)",
              border: "1px solid var(--border)",
              borderRadius: "9999px",
              padding: "0.15rem 0.55rem",
            }}
          >
            {region}
          </span>
        </div>
      </div>
    </Link>
  );
}
