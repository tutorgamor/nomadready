import Link from "next/link";
import Image from "next/image";
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

// Populate with real cover photos as they become available — fallback is cover_color
const COVER_IMAGES: Record<string, string> = {};

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
  const coverImage = COVER_IMAGES[id];

  return (
    <Link href={`/ready/${passportId}/${id}`} className="dest-card" aria-label={`Travel guide for ${label}`}>

      {/* ── Cover zone ──────────────────────────────────────── */}
      <div
        className="dest-card-cover"
        style={{
          backgroundColor: cover_color,
          height: "168px",
          display: "flex",
          alignItems: "flex-end",
          position: "relative",
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        {/* Real photo when available */}
        {coverImage && (
          <Image
            src={coverImage}
            alt=""
            fill
            sizes="(min-width: 768px) 340px, (min-width: 480px) 260px, calc(100vw - 2rem)"
            style={{ objectFit: "cover", objectPosition: "center 40%" }}
          />
        )}

        {/* Diagonal tonal depth — warm light from top-left */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(155deg, rgba(255,255,255,0.14) 0%, rgba(0,0,0,0.20) 100%)",
          }}
        />

        {/* Atmospheric glow — diffuse light source upper-right */}
        <div
          style={{
            position: "absolute",
            top: "-30%",
            right: "10%",
            width: "62%",
            paddingBottom: "62%",
            background: "radial-gradient(ellipse, rgba(255,255,255,0.22) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />

        {/* Bottom vignette — cinematic pull-down, eases into card body */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(0deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.12) 42%, transparent 68%)",
          }}
        />

        {/* SVG terrain — illustrated horizon layers scaled to full cover height */}
        <svg
          viewBox="0 0 280 168"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          {/* Sky cloud puffs */}
          <ellipse cx="42"  cy="28" rx="32" ry="9"  fill="rgba(255,255,255,0.09)" />
          <ellipse cx="228" cy="20" rx="22" ry="6"  fill="rgba(255,255,255,0.07)" />
          <ellipse cx="140" cy="38" rx="18" ry="5"  fill="rgba(255,255,255,0.05)" />
          {/* Distant ridge */}
          <path
            d="M-10 72 Q48 34 104 58 Q155 78 200 46 Q240 18 290 44 L290 180 L-10 180 Z"
            fill="rgba(255,255,255,0.065)"
          />
          {/* Midground hills */}
          <path
            d="M-10 96 Q62 56 148 80 Q210 98 290 62 L290 180 L-10 180 Z"
            fill="rgba(255,255,255,0.11)"
          />
          {/* Foreground slope */}
          <path
            d="M-10 114 Q80 88 174 108 Q232 122 290 94 L290 180 L-10 180 Z"
            fill="rgba(255,255,255,0.08)"
          />
          {/* Water horizon band */}
          <path
            d="M-10 136 Q100 120 200 132 Q248 138 290 122 L290 180 L-10 180 Z"
            fill="rgba(255,255,255,0.052)"
          />
        </svg>

        {/* Top-left: editorial region stamp */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "12px",
            fontSize: "0.5rem",
            fontWeight: 700,
            letterSpacing: "0.11em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.88)",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            lineHeight: 1,
            zIndex: 2,
          }}
        >
          {region}
        </div>

        {/* Top-right: score pill — frosted glass */}
        {travel_score && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "10px",
              display: "flex",
              alignItems: "baseline",
              gap: "1px",
              background: "rgba(0,0,0,0.30)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: "var(--radius-full)",
              padding: "0.2rem 0.5rem",
              zIndex: 2,
            }}
          >
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 800,
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "-0.01em",
                lineHeight: 1,
              }}
            >
              {travel_score.overall}
            </span>
            <span
              style={{
                fontSize: "0.5rem",
                fontWeight: 500,
                color: "rgba(255,255,255,0.80)",
                letterSpacing: "0.03em",
                lineHeight: 1,
              }}
            >
              /100
            </span>
          </div>
        )}

        {/* Bottom-left: flag emoji — anchored over vignette */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            marginLeft: "12px",
            marginBottom: "10px",
            fontSize: "1.875rem",
            lineHeight: 1,
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.32))",
          }}
        >
          {emoji}
        </div>
      </div>

      {/* ── Card body ─────────────────────────────────────────── */}
      <div
        className="dest-card-body"
        style={{
          padding: "0.9rem 1.25rem 1.1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem",
        }}
      >
        {/* Destination name + directional arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {label}
          </h2>
          <span
            className="dest-card-arrow"
            style={{
              color: "var(--accent)",
              fontSize: "1rem",
              flexShrink: 0,
              marginTop: "3px",
              opacity: 0.6,
              display: "inline-block",
            }}
            aria-hidden="true"
          >
            →
          </span>
        </div>

        {/* Hero tag — editorial subtitle */}
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            margin: 0,
            lineHeight: 1.45,
            letterSpacing: "-0.01em",
          }}
        >
          {hero_tag}
        </p>

        {/* Badges row — region stamp + profile highlight */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            flexWrap: "wrap",
            marginTop: "0.375rem",
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontSize: "0.625rem",
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              backgroundColor: "var(--surface-sunken)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-full)",
              padding: "0.2rem 0.55rem",
            }}
          >
            {region}
          </span>
          <ProfileCardBadge travelScore={travel_score} />
        </div>

        {/* ── Travel briefing strip (when summary provided) ─── */}
        {summary && (
          <>
            {/* Perforation tear line */}
            <div
              aria-hidden="true"
              style={{
                margin: "0.45rem -1.25rem 0",
                height: "1px",
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(180,130,60,0.28) 0px, rgba(180,130,60,0.28) 4px, transparent 4px, transparent 9px)",
              }}
            />
            {/* Amber briefing slip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                rowGap: "0.625rem",
                columnGap: "0.5rem",
                background: "linear-gradient(160deg, rgba(255,248,224,0.90) 0%, rgba(254,242,195,0.75) 100%)",
                borderRadius: "var(--radius-md)",
                margin: "0.3rem -0.5rem -0.5rem",
                padding: "0.75rem 0.5rem 0.5rem",
                border: "1px solid rgba(200,155,65,0.22)",
                boxShadow: "inset 0 1px 5px rgba(120,80,20,0.06), 0 1px 3px rgba(120,80,20,0.04)",
                position: "relative",
              }}
            >
              {/* Passport stamp mark */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: "0.5rem",
                  right: "0.5rem",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  border: "1.5px solid rgba(180,130,50,0.32)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.44,
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    border: "1px solid rgba(180,130,50,0.28)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "5px",
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "rgba(160,100,15,0.60)",
                      lineHeight: 1,
                    }}
                  >
                    OK
                  </span>
                </div>
              </div>

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
          </>
        )}
      </div>
    </Link>
  );
}
