import Link from "next/link";
import type { Destination } from "@/lib/types";

interface DestinationCardProps {
  destination: Destination;
  passportId: string;
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
export function DestinationCard({ destination, passportId }: DestinationCardProps) {
  const { id, label, emoji, hero_tag, cover_color, region } = destination;

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
        {/* Depth overlays */}
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

        {/* Hero tag / description */}
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
      </div>
    </Link>
  );
}
