"use client";

import { useState } from "react";
import type {
  RemoteWorkZonesData,
  FieldGuideZone,
  CityTheme,
  ZoneMetrics,
  CityMapMarker,
  MarkerCategory,
} from "@/lib/types";
import { MapDecorations } from "@/components/shared/MapDecorations";

/* ─── Helpers ──────────────────────────────────────────────── */

function confidenceBadge(level: "low" | "medium" | "high") {
  if (level === "high")   return { bg: "#fef3c7", color: "#92400e", border: "#fcd34d", label: "HIGH CONFIDENCE" };
  if (level === "medium") return { bg: "#fff7ed", color: "#9a3412", border: "#fdba74", label: "MEDIUM CONFIDENCE" };
  return                         { bg: "#fef2f2", color: "#b91c1c", border: "#fca5a5", label: "LOW CONFIDENCE" };
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

/* ─── Category config ──────────────────────────────────────── */

const CAT: Record<MarkerCategory, { label: string; color: string }> = {
  work:      { label: "Work",      color: "#d97706" },
  food:      { label: "Food",      color: "#c2410c" },
  practical: { label: "Practical", color: "#3A7CA5" },
  explore:   { label: "Explore",   color: "#4d7c0f" },
};

const CATEGORY_ORDER: MarkerCategory[] = ["work", "food", "practical", "explore"];

/* ─── Category tabs ────────────────────────────────────────── */

function CategoryTabs({
  active,
  counts,
  onSelect,
}: {
  active: MarkerCategory;
  counts: Record<MarkerCategory, number>;
  onSelect: (c: MarkerCategory) => void;
}) {
  return (
    <div className="cfm-tabs" role="tablist">
      {CATEGORY_ORDER.map((cat) => {
        const isActive = cat === active;
        const { label, color } = CAT[cat];
        if (counts[cat] === 0) return null;
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(cat)}
            className={`cfm-tab${isActive ? " cfm-tab--active" : ""}`}
            style={isActive ? { color, borderBottomColor: color } : undefined}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: isActive ? color : "var(--border-strong)",
                display: "inline-block",
                marginRight: "0.3rem",
                flexShrink: 0,
                verticalAlign: "middle",
              }}
            />
            {label}
            <span
              style={{
                marginLeft: "0.3rem",
                fontSize: "0.575rem",
                fontWeight: 400,
                color: isActive ? color : "var(--text-muted)",
                opacity: 0.85,
              }}
            >
              {counts[cat]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Unified SVG City Map ─────────────────────────────────── */

function UnifiedCityMap({
  data,
  activeCategory,
  selectedZoneId,
  selectedMarkerId,
  visibleMarkers,
  onSelectZone,
  onSelectMarker,
}: {
  data: RemoteWorkZonesData;
  activeCategory: MarkerCategory;
  selectedZoneId: string;
  selectedMarkerId: string | null;
  visibleMarkers: CityMapMarker[];
  onSelectZone: (id: string) => void;
  onSelectMarker: (id: string) => void;
}) {
  const { map, zones, theme } = data;
  const catColor = CAT[activeCategory].color;
  const isWorkTab = activeCategory === "work";

  return (
    <div
      style={{
        background: theme.mapBackground,
        borderRadius: "0.625rem",
        border: "1px solid var(--border)",
        padding: "0.875rem",
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
          marginBottom: "0.5rem",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            fontStyle: "italic",
            color: "var(--text-secondary)",
            fontWeight: 500,
          }}
        >
          {map.label}
        </span>
        <span
          style={{
            fontSize: "0.575rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
          }}
        >
          {map.attribution}
        </span>
      </div>

      {/* SVG */}
      <svg
        viewBox="0 0 100 100"
        style={{ width: "100%", height: "auto", display: "block" }}
        preserveAspectRatio="xMidYMid meet"
        aria-label={map.label}
      >
        <MapDecorations decorations={map.decorations} theme={theme} opacity={0.5} />

        {isWorkTab
          ? map.markers.map((marker) => {
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
                  <circle cx={marker.x} cy={marker.y} r="6" fill="transparent" />
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
            })
          : visibleMarkers.map((m) => {
              const isSelected = m.id === selectedMarkerId;
              return (
                <g
                  key={m.id}
                  onClick={() => onSelectMarker(m.id)}
                  style={{ cursor: "pointer" }}
                  role="button"
                  aria-label={m.name}
                >
                  <circle cx={m.x} cy={m.y} r="7" fill="transparent" />
                  {isSelected && (
                    <circle cx={m.x} cy={m.y} r="5" fill={catColor} opacity={0.18} />
                  )}
                  <circle
                    cx={m.x}
                    cy={m.y}
                    r={isSelected ? 3.2 : 2.4}
                    fill={catColor}
                    opacity={isSelected ? 1 : 0.7}
                  />
                  {isSelected && <circle cx={m.x} cy={m.y} r="1.1" fill="white" />}
                  <text
                    x={m.x}
                    y={m.y + 6.5}
                    fontSize="2.7"
                    fill={isSelected ? catColor : "var(--text-primary)"}
                    textAnchor="middle"
                    fontWeight={isSelected ? "700" : "500"}
                  >
                    {m.name}
                  </text>
                </g>
              );
            })}
      </svg>

      {/* Compact legend */}
      <div
        style={{
          marginTop: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        {map.legend.map((item) => (
          <div
            key={item.label}
            style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
          >
            {item.type === "fill" && (
              <span
                style={{
                  width: "10px",
                  height: "6px",
                  background: item.color,
                  borderRadius: "2px",
                  display: "inline-block",
                  opacity: 0.7,
                  flexShrink: 0,
                }}
              />
            )}
            {item.type === "line" && (
              <span
                style={{
                  width: "10px",
                  height: "0",
                  borderTop: `1.5px dashed ${item.color}`,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            )}
            {item.type === "dot" && (
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: item.color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            )}
            <span style={{ fontSize: "0.575rem", color: "var(--text-muted)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Metric label config ──────────────────────────────────── */

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
        borderRadius: "0.625rem",
        padding: "1.125rem",
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
          marginBottom: "0.875rem",
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
      <h3
        style={{
          fontSize: "1.25rem",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--text-primary)",
          margin: "0 0 0.375rem",
          lineHeight: 1.1,
        }}
      >
        {zone.name}
      </h3>

      {/* Tagline */}
      <p
        style={{
          fontSize: "0.8125rem",
          fontStyle: "italic",
          color: "var(--text-secondary)",
          lineHeight: 1.5,
          margin: "0 0 0.875rem",
        }}
      >
        {zone.tagline}
      </p>

      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 0.75rem" }} />

      {/* Best for */}
      <div style={{ marginBottom: "0.875rem" }}>
        <p
          style={{
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: "0 0 0.4rem",
          }}
        >
          Best for
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
          {zone.best_for.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "0.7rem",
                fontWeight: 500,
                padding: "0.15rem 0.55rem",
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
          gap: "0.625rem 1rem",
          marginBottom: "0.875rem",
        }}
      >
        {METRIC_ROWS.map(({ key, label }) => (
          <div key={key}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.2rem",
              }}
            >
              <span style={{ fontSize: "0.625rem", color: "var(--text-muted)" }}>
                {label}
              </span>
              <span
                style={{
                  fontSize: "0.625rem",
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

      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 0.75rem" }} />

      {/* Field notes */}
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: "0 0 0.4rem",
          }}
        >
          Field notes
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
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

      {/* Reviewed line */}
      <p
        style={{
          fontSize: "0.6875rem",
          color: "var(--text-muted)",
          margin: "0.875rem 0 0",
          fontStyle: "italic",
        }}
      >
        Reviewed {reviewed} · Editorial Guide
      </p>
    </div>
  );
}

/* ─── Marker detail panel ──────────────────────────────────── */

function MarkerDetail({
  marker,
  activeCategory,
}: {
  marker: CityMapMarker | null;
  activeCategory: MarkerCategory;
}) {
  const { color, label } = CAT[activeCategory];

  if (!marker) {
    return (
      <div
        style={{
          border: "1px dashed var(--border)",
          borderRadius: "0.625rem",
          padding: "1.5rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "160px",
          textAlign: "center",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: color,
            display: "inline-block",
          }}
        />
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
            margin: 0,
            fontStyle: "italic",
          }}
        >
          Select a {label.toLowerCase()} spot on the map
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "0.625rem",
        padding: "1.125rem",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: "0",
      }}
    >
      {/* Category + area row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: color,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color,
            }}
          >
            {label}
          </span>
        </div>
        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 500,
            color: "var(--text-muted)",
            background: "var(--bg-base)",
            border: "1px solid var(--border)",
            borderRadius: "9999px",
            padding: "0.1rem 0.55rem",
          }}
        >
          {marker.area}
        </span>
      </div>

      {/* Name */}
      <h3
        style={{
          fontSize: "1.25rem",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--text-primary)",
          margin: "0 0 0.5rem",
          lineHeight: 1.15,
        }}
      >
        {marker.name}
      </h3>

      {/* Note */}
      <p
        style={{
          fontSize: "0.8125rem",
          color: "var(--text-secondary)",
          lineHeight: 1.55,
          margin: "0 0 0.75rem",
        }}
      >
        {marker.note}
      </p>

      {/* Tags + budget */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.3rem",
          alignItems: "center",
        }}
      >
        {marker.budget && (
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "0.15rem 0.5rem",
              borderRadius: "9999px",
              background: "var(--accent-light)",
              color: "var(--accent-dark)",
              flexShrink: 0,
            }}
          >
            {marker.budget}
          </span>
        )}
        {marker.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontSize: "0.7rem",
              fontWeight: 500,
              padding: "0.15rem 0.5rem",
              borderRadius: "9999px",
              background: "var(--bg-base)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main exported component ──────────────────────────────── */

export function RemoteWorkZonesGuide({ data }: { data: RemoteWorkZonesData }) {
  const hasMarkers = !!data.markers?.length;

  const [activeCategory, setActiveCategory] = useState<MarkerCategory>("work");
  const [selectedZoneId, setSelectedZoneId] = useState(data.zones[0].id);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(
    data.markers?.find((m) => m.category !== "work")?.id ?? null
  );

  const selectedZone = data.zones.find((z) => z.id === selectedZoneId) ?? data.zones[0];
  const visibleMarkers =
    activeCategory !== "work"
      ? (data.markers?.filter((m) => m.category === activeCategory) ?? [])
      : [];
  const selectedMarker =
    visibleMarkers.find((m) => m.id === selectedMarkerId) ?? visibleMarkers[0] ?? null;

  const counts = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      acc[cat] =
        cat === "work"
          ? data.zones.length
          : (data.markers?.filter((m) => m.category === cat).length ?? 0);
      return acc;
    },
    {} as Record<MarkerCategory, number>
  );

  function handleCategoryChange(cat: MarkerCategory) {
    setActiveCategory(cat);
    if (cat !== "work") {
      const first = data.markers?.find((m) => m.category === cat);
      setSelectedMarkerId(first?.id ?? null);
    }
  }

  return (
    <div className="card card--map-grid">
      {/* Section heading */}
      <p className="section-heading" style={{ marginBottom: "0.875rem" }}>
        📍 {data.city} Field Map
      </p>

      {/* Category tabs */}
      {hasMarkers && (
        <CategoryTabs
          active={activeCategory}
          counts={counts}
          onSelect={handleCategoryChange}
        />
      )}

      {/* Map + detail panel */}
      <div className="cfm-layout">
        <UnifiedCityMap
          data={data}
          activeCategory={activeCategory}
          selectedZoneId={selectedZoneId}
          selectedMarkerId={selectedMarkerId}
          visibleMarkers={visibleMarkers}
          onSelectZone={setSelectedZoneId}
          onSelectMarker={setSelectedMarkerId}
        />
        {activeCategory === "work" ? (
          <ZoneDetailPanel
            zone={selectedZone}
            reviewed={data.reviewed}
            theme={data.theme}
          />
        ) : (
          <MarkerDetail marker={selectedMarker} activeCategory={activeCategory} />
        )}
      </div>

      {/* Footer note */}
      <p
        style={{
          fontSize: "0.6875rem",
          color: "var(--text-muted)",
          fontStyle: "italic",
          margin: "0.875rem 0 0",
          lineHeight: 1.5,
        }}
      >
        Field positions are editorial approximations. Always verify hours and locations before visiting.
      </p>
    </div>
  );
}
