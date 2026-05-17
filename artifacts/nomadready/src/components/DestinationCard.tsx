import { Link } from "wouter";


import type { CSSProperties } from "react";
import type { Destination } from "@/lib/types";
import { ProfileCardBadge } from "@/components/ProfileCardBadge";
import { CoverPatternSVG } from "@/components/DestinationCoverPattern";

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

const COVER_IMAGES: Record<string, string> = {
  thailand:      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80&auto=format&fit=crop",
  malaysia:      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80&auto=format&fit=crop",
  indonesia:     "/assets/editorial/panels/panel-indonesia.png",
  georgia:       "https://images.unsplash.com/photo-1565008887274-377b4a6c4e03?w=600&q=80&auto=format&fit=crop",
  turkey:        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80&auto=format&fit=crop",
  vietnam:       "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80&auto=format&fit=crop",
  philippines:   "https://images.unsplash.com/photo-1518509562904-e7ef99cdce86?w=600&q=80&auto=format&fit=crop",
  japan:         "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&q=80&auto=format&fit=crop",
  "south-korea": "https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=600&q=80&auto=format&fit=crop",
};

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
    <Link to={`/ready/${passportId}/${id}`} className="dest-card" aria-label={`Travel guide for ${label}`}>

      {/* ── Cover zone ──────────────────────────────────────── */}
      <div
        className="dest-card-cover"
        style={{
          backgroundColor: cover_color,
          height: "188px",
          display: "flex",
          alignItems: "flex-end",
          position: "relative",
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        {/* Real photo when available */}
        {coverImage && (
          <img src={coverImage} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} />
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

        {/* Regional SVG pattern — batik, Bolnisi cross, Iznik star,
            seigaiha/sakura, or dancheong/taeguk depending on region + id */}
        <svg
          viewBox="0 0 280 168"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          aria-hidden="true"
        >
          <CoverPatternSVG id={id} region={region} />
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
              fontFamily: "var(--font-display)",
              fontSize: "1.375rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              margin: 0,
              lineHeight: 1.05,
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

        {/* Thin amber rule — editorial divider */}
        <div aria-hidden="true" style={{ height: "1px", background: "linear-gradient(90deg, rgba(217,119,6,0.30) 0%, rgba(217,119,6,0.06) 60%, transparent 100%)", margin: "0.25rem 0" }} />

        {/* Hero tag — editorial subtitle */}
        <p
          style={{
            fontSize: "0.8125rem",
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
