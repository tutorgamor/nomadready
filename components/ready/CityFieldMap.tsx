"use client";

import { useState } from "react";
import type { CityFieldMapData, CityMapMarker, MarkerCategory, MapBackground, CityTheme } from "@/lib/types";

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

/* ─── SVG map ──────────────────────────────────────────────── */

function FieldMapSVG({
  map,
  theme,
  markers,
  selectedId,
  activeCategory,
  onSelect,
}: {
  map: MapBackground;
  theme: CityTheme;
  markers: CityMapMarker[];
  selectedId: string | null;
  activeCategory: MarkerCategory;
  onSelect: (id: string) => void;
}) {
  const catColor = CAT[activeCategory].color;

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
        {/* Map decorations */}
        {map.decorations.map((deco, i) => {
          if (deco.type === "water" && deco.path) {
            return (
              <path key={i} d={deco.path} fill={theme.waterColor} opacity={0.5} />
            );
          }
          if (deco.type === "park" && deco.path) {
            return (
              <path key={i} d={deco.path} fill={theme.parkColor} opacity={0.5} />
            );
          }
          if (deco.type === "line" && deco.points) {
            const pts = deco.points.map(([x, y]) => `${x},${y}`).join(" ");
            const mid = deco.points[Math.floor(deco.points.length / 2)];
            return (
              <g key={i}>
                <polyline
                  points={pts}
                  fill="none"
                  stroke="#b0a090"
                  strokeWidth="0.7"
                  strokeDasharray="1.8,1.4"
                  opacity={0.6}
                />
                {deco.label && (
                  <text
                    x={mid[0] + 2}
                    y={mid[1] - 1.5}
                    fontSize="2.2"
                    fill="#a09080"
                    letterSpacing="0.25"
                    fontWeight="600"
                  >
                    {deco.label}
                  </text>
                )}
              </g>
            );
          }
          return null;
        })}

        {/* Category markers */}
        {markers.map((m) => {
          const isSelected = m.id === selectedId;
          return (
            <g
              key={m.id}
              onClick={() => onSelect(m.id)}
              style={{ cursor: "pointer" }}
              role="button"
              aria-label={m.name}
            >
              {/* Tap target */}
              <circle cx={m.x} cy={m.y} r="7" fill="transparent" />

              {/* Halo on selected */}
              {isSelected && (
                <circle cx={m.x} cy={m.y} r="5" fill={catColor} opacity={0.18} />
              )}

              {/* Marker dot */}
              <circle
                cx={m.x}
                cy={m.y}
                r={isSelected ? 3.2 : 2.4}
                fill={catColor}
                opacity={isSelected ? 1 : 0.7}
              />

              {/* White inner dot when selected */}
              {isSelected && (
                <circle cx={m.x} cy={m.y} r="1.1" fill="white" />
              )}

              {/* Name label below */}
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
            <span style={{ fontSize: "0.575rem", color: "var(--text-muted)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Detail panel ─────────────────────────────────────────── */

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
          style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, display: "inline-block" }}
        />
        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", alignItems: "center" }}>
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

export function CityFieldMap({ data }: { data: CityFieldMapData }) {
  const firstWork = data.markers.find((m) => m.category === "work");
  const [activeCategory, setActiveCategory] = useState<MarkerCategory>("work");
  const [selectedId, setSelectedId] = useState<string | null>(firstWork?.id ?? null);

  const visibleMarkers = data.markers.filter((m) => m.category === activeCategory);
  const selectedMarker = visibleMarkers.find((m) => m.id === selectedId) ?? visibleMarkers[0] ?? null;

  const counts = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = data.markers.filter((m) => m.category === cat).length;
    return acc;
  }, {} as Record<MarkerCategory, number>);

  function handleCategoryChange(cat: MarkerCategory) {
    setActiveCategory(cat);
    const first = data.markers.find((m) => m.category === cat);
    setSelectedId(first?.id ?? null);
  }

  function handleSelectMarker(id: string) {
    setSelectedId(id);
  }

  return (
    <div className="card card--map-grid">
      {/* Section heading */}
      <p className="section-heading" style={{ marginBottom: "0.875rem" }}>
        📍 {data.city} Field Map
      </p>

      {/* Category tabs */}
      <CategoryTabs
        active={activeCategory}
        counts={counts}
        onSelect={handleCategoryChange}
      />

      {/* Map + detail panel */}
      <div className="cfm-layout">
        <FieldMapSVG
          map={data.map}
          theme={data.theme}
          markers={visibleMarkers}
          selectedId={selectedId}
          activeCategory={activeCategory}
          onSelect={handleSelectMarker}
        />
        <MarkerDetail marker={selectedMarker} activeCategory={activeCategory} />
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
