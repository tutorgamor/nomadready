"use client";

import { useState } from "react";
import type {
  RemoteWorkZonesData,
  FieldGuideZone,
  CityTheme,
  ZoneMetrics,
} from "@/lib/types";
import { MapDecorations } from "@/components/shared/MapDecorations";

/* ─── Helpers ──────────────────────────────────────────────── */

function confidenceBadge(level: "low" | "medium" | "high") {
  if (level === "high")   return { bg: "#fef3c7", color: "#92400e", border: "#fcd34d", label: "HIGH CONFIDENCE" };
  if (level === "medium") return { bg: "#fff7ed", color: "#9a3412", border: "#fdba74", label: "MEDIUM CONFIDENCE" };
  return                         { bg: "#fef2f2", color: "#b91c1c", border: "#fca5a5", label: "LOW CONFIDENCE" };
}

function splitHeadline(headline: string, word: string, accent: string) {
  if (!word || !headline.includes(word)) return <>{headline}</>;
  const [before, after] = headline.split(word);
  return (
    <>
      {before}
      <em style={{ fontStyle: "italic", color: accent }}>{word}</em>
      {after}
    </>
  );
}

/* ─── Dot metric indicator ─────────────────────────────────── */

function MetricDots({ value, accent }: { value: number; accent: string }) {
  return (
    <span style={{ display: "inline-flex", gap: "3px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: i <= value ? accent : "var(--border)",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
      ))}
    </span>
  );
}

/* ─── Score bar (at-a-glance cards) ───────────────────────── */

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div
      style={{
        height: "3px",
        background: "var(--border)",
        borderRadius: "9999px",
        overflow: "hidden",
        flex: 1,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${(value / 5) * 100}%`,
          background: color,
          borderRadius: "9999px",
        }}
      />
    </div>
  );
}

/* ─── SVG City Map ─────────────────────────────────────────── */

function CityMap({
  data,
  selectedZoneId,
  onSelectZone,
}: {
  data: RemoteWorkZonesData;
  selectedZoneId: string;
  onSelectZone: (id: string) => void;
}) {
  const { map, zones, theme } = data;

  return (
    <div
      style={{
        background: theme.mapBackground,
        borderRadius: "0.75rem",
        border: "1px solid var(--border)",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Map header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "0.625rem",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontSize: "0.8125rem",
            fontStyle: "italic",
            color: "var(--text-secondary)",
            fontWeight: 500,
          }}
        >
          {map.label}
        </span>
        <span
          style={{
            fontSize: "0.6rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
          }}
        >
          {map.attribution}
        </span>
      </div>

      {/* SVG map */}
      <div style={{ flex: 1 }}>
        <svg
          viewBox="0 0 100 100"
          style={{ width: "100%", height: "auto", display: "block" }}
          preserveAspectRatio="xMidYMid meet"
          aria-label={map.label}
        >
          <MapDecorations decorations={map.decorations} theme={theme} />

          {/* Zone markers */}
          {map.markers.map((marker) => {
            const zone = zones.find((z) => z.id === marker.zoneId);
            if (!zone) return null;
            const active = marker.zoneId === selectedZoneId;

            return (
              <g
                key={marker.zoneId}
                onClick={() => onSelectZone(marker.zoneId)}
                style={{ cursor: "pointer" }}
                role="button"
                aria-label={zone.name}
              >
                {/* Tap target */}
                <circle cx={marker.x} cy={marker.y} r="6" fill="transparent" />

                {/* Visible marker */}
                {active ? (
                  <circle cx={marker.x} cy={marker.y} r="2.8" fill={theme.accent} />
                ) : (
                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r="2.4"
                    fill="white"
                    stroke="#8c8070"
                    strokeWidth="0.65"
                  />
                )}

                {/* Number above */}
                <text
                  x={marker.x}
                  y={marker.y - 4.2}
                  fontSize="2.3"
                  fill={active ? theme.accent : "#a09080"}
                  textAnchor="middle"
                  fontWeight={active ? "700" : "400"}
                >
                  {zone.number}
                </text>

                {/* Name below */}
                <text
                  x={marker.x}
                  y={marker.y + 6}
                  fontSize="3"
                  fill={active ? theme.accent : "var(--text-primary)"}
                  textAnchor="middle"
                  fontWeight={active ? "700" : "500"}
                >
                  {zone.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: "0.625rem",
          background: "rgba(255,255,255,0.82)",
          border: "1px solid var(--border)",
          borderRadius: "0.375rem",
          padding: "0.5rem 0.625rem",
          width: "fit-content",
        }}
      >
        <p
          style={{
            fontSize: "0.575rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: "0 0 0.3rem",
          }}
        >
          Reading the map
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {map.legend.map((item) => (
            <div
              key={item.label}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              {item.type === "fill" && (
                <span
                  style={{
                    width: "14px",
                    height: "7px",
                    background: item.color,
                    borderRadius: "2px",
                    display: "inline-block",
                    flexShrink: 0,
                    opacity: 0.75,
                  }}
                />
              )}
              {item.type === "line" && (
                <span
                  style={{
                    width: "14px",
                    height: "0",
                    borderTop: `2px dashed ${item.color}`,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
              )}
              {item.type === "dot" && (
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: item.color,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
              )}
              <span
                style={{
                  fontSize: "0.6rem",
                  color: "var(--text-muted)",
                  letterSpacing: "0.02em",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Metric labels config ─────────────────────────────────── */

const METRIC_ROWS: { key: keyof ZoneMetrics; label: string }[] = [
  { key: "noise_level",      label: "Noise level" },
  { key: "remote_work_fit",  label: "Remote-work fit" },
  { key: "long_stay_comfort",label: "Long-stay comfort" },
  { key: "nightlife",        label: "Nightlife" },
  { key: "cafe_density",     label: "Café density" },
  { key: "call_ready",       label: "Call-ready" },
];

/* ─── Zone detail panel ────────────────────────────────────── */

function ZoneDetailPanel({
  zone,
  reviewed,
  theme,
}: {
  zone: FieldGuideZone;
  reviewed: string;
  theme: CityTheme;
}) {
  const conf = confidenceBadge(zone.confidence);

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "0.75rem",
        padding: "1.5rem",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Zone number + confidence badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <span
          style={{
            fontSize: "0.6875rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            fontWeight: 500,
          }}
        >
          Zone / {zone.number}
        </span>
        <span
          style={{
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            background: conf.bg,
            color: conf.color,
            border: `1.5px solid ${conf.border}`,
            padding: "0.18rem 0.55rem",
            borderRadius: "9999px",
            whiteSpace: "nowrap",
          }}
        >
          {conf.label}
        </span>
      </div>

      {/* Zone name */}
      <h2
        style={{
          fontSize: "clamp(1.875rem, 4vw, 2.75rem)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: "var(--text-primary)",
          margin: "0 0 0.5rem",
          lineHeight: 1,
        }}
      >
        {zone.name}
      </h2>

      {/* Tagline */}
      <p
        style={{
          fontSize: "0.9375rem",
          fontStyle: "italic",
          color: "var(--text-secondary)",
          lineHeight: 1.55,
          margin: "0 0 1.125rem",
        }}
      >
        {zone.tagline}
      </p>

      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 1rem" }} />

      {/* Best for */}
      <div style={{ marginBottom: "1rem" }}>
        <p
          style={{
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: "0 0 0.45rem",
          }}
        >
          Best for
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
          {zone.best_for.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                padding: "0.2rem 0.65rem",
                borderRadius: "9999px",
                border: `1.5px solid ${theme.accent}`,
                color: theme.accent,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Metrics — 2-column grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem 1.25rem",
          marginBottom: "1rem",
        }}
      >
        {METRIC_ROWS.map(({ key, label }) => (
          <div key={key}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.25rem",
              }}
            >
              <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                {label}
              </span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
              >
                {zone.metrics[key]}/5
              </span>
            </div>
            <MetricDots value={zone.metrics[key]} accent={theme.accent} />
          </div>
        ))}
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 0.875rem" }} />

      {/* Field notes */}
      <div style={{ marginBottom: "1.25rem", flex: 1 }}>
        <p
          style={{
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: "0 0 0.45rem",
          }}
        >
          Field notes
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {zone.field_notes.map((note, i) => (
            <p
              key={i}
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              · {note}
            </p>
          ))}
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 0.875rem" }} />

      {/* Footer row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", margin: 0 }}>
          <em>Reviewed {reviewed}</em>
          {" · "}
          <span
            style={{
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontSize: "0.6rem",
            }}
          >
            Editorial Guide
          </span>
        </p>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              padding: "0.38rem 0.875rem",
              borderRadius: "9999px",
              border: "1.5px solid var(--border-strong)",
              background: "transparent",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            Save
          </button>
          <button
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "0.38rem 1rem",
              borderRadius: "9999px",
              background: "var(--text-primary)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Stays in {zone.name} →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Zone card (at a glance) ─────────────────────────────── */

const SCORE_BAR_COLORS = { work: "#4d7c0f", stay: "#b45309", play: "#c2410c" } as const;

function ZoneCard({
  zone,
  isActive,
  onClick,
  theme,
}: {
  zone: FieldGuideZone;
  isActive: boolean;
  onClick: () => void;
  theme: CityTheme;
}) {
  return (
    <div
      onClick={onClick}
      className="rzg-zone-card"
      style={{ background: isActive ? "rgba(255,255,255,0.75)" : "transparent" }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-pressed={isActive}
    >
      <p
        style={{
          fontSize: "0.575rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "var(--text-muted)",
          margin: "0 0 0.2rem",
        }}
      >
        {zone.number}
      </p>
      <p
        style={{
          fontSize: "1.0625rem",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: isActive ? theme.accent : "var(--text-primary)",
          margin: "0 0 0.35rem",
          lineHeight: 1.1,
        }}
      >
        {zone.name}
      </p>
      <p
        style={{
          fontSize: "0.725rem",
          color: "var(--text-secondary)",
          lineHeight: 1.4,
          margin: "0 0 0.625rem",
        }}
      >
        {zone.summary}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        {(["work", "stay", "play"] as const).map((key) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span
              style={{
                fontSize: "0.525rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                width: "1.875rem",
                flexShrink: 0,
              }}
            >
              {key}
            </span>
            <ScoreBar value={zone.scores[key]} color={SCORE_BAR_COLORS[key]} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main exported component ──────────────────────────────── */

export function RemoteWorkZonesGuide({ data }: { data: RemoteWorkZonesData }) {
  const [selectedId, setSelectedId] = useState(data.zones[0].id);

  const selectedZone = data.zones.find((z) => z.id === selectedId) ?? data.zones[0];

  return (
    <div>
      {/* Masthead line */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          fontSize: "0.625rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        <span>NomadReady</span>
        <span>·</span>
        <span>Field Guide # {data.issue_number}</span>
        <span
          style={{
            flex: 1,
            height: "1px",
            background: "var(--border)",
            display: "inline-block",
          }}
        />
        <span style={{ color: data.theme.accent }}>
          {data.city}, {data.country}
        </span>
      </div>

      {/* Hero — headline + meta table */}
      <div className="rzg-hero">
        <div style={{ flex: 1 }}>
          <h2 className="rzg-headline">
            {splitHeadline(data.headline, data.headline_italic_word, data.theme.accent)}
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
              lineHeight: 1.65,
              maxWidth: "46ch",
              margin: 0,
            }}
          >
            {data.subheadline}
          </p>
        </div>

        <div className="rzg-meta-table">
          {[
            { label: "Issue",    value: data.issue },
            { label: "Zones",    value: String(data.zones.length).padStart(2, "0") },
            { label: "Reviewed", value: data.reviewed },
            { label: "Author",   value: data.authors },
          ].map(({ label, value }) => (
            <div key={label} className="rzg-meta-row">
              <span className="rzg-meta-label">{label}</span>
              <span
                className="rzg-meta-value"
                style={label === "Issue" ? { color: data.theme.accent } : undefined}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Map + zone detail */}
      <div className="rzg-main-layout">
        <CityMap data={data} selectedZoneId={selectedId} onSelectZone={setSelectedId} />
        <ZoneDetailPanel
          zone={selectedZone}
          reviewed={data.reviewed}
          theme={data.theme}
        />
      </div>

      {/* At a glance */}
      <div style={{ marginTop: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "0.875rem",
            paddingBottom: "0.625rem",
            borderBottom: "2px solid var(--text-primary)",
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            All {data.zones.length}, at a glance
          </h3>
          <span
            style={{
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Click a zone to read in detail →
          </span>
        </div>

        <div
          className="rzg-zones-grid"
          style={{ "--rzg-cols": data.zones.length } as React.CSSProperties}
        >
          {data.zones.map((zone) => (
            <ZoneCard
              key={zone.id}
              zone={zone}
              isActive={zone.id === selectedId}
              onClick={() => setSelectedId(zone.id)}
              theme={data.theme}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "1.5rem",
          paddingTop: "0.75rem",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <p
          style={{
            fontSize: "0.6875rem",
            color: "var(--text-muted)",
            fontStyle: "italic",
            margin: 0,
          }}
        >
          Editorial scores reflect on-the-ground reporting. Verify recent reviews before booking long stays.
        </p>
        <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", margin: 0 }}>
          © NomadReady 2026 · Field Guide N° {data.issue_number} / {data.city}
        </p>
      </div>
    </div>
  );
}
