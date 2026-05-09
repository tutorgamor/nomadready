import type { Place, PlaceCategory, PriceLevel } from "@/lib/types";

const CATEGORY_ICON: Record<PlaceCategory, string> = {
  restaurant:    "🍽️",
  bakery:        "🥐",
  cafe:          "☕",
  scooter_rental:"🛵",
  beach:         "🏖️",
  snorkeling:    "🤿",
  viewpoint:     "🌅",
  temple:        "🛕",
  monument:      "🗿",
  museum:        "🏛️",
  transport:     "🚌",
  practical:     "🔧",
};

const CATEGORY_LABEL: Record<PlaceCategory, string> = {
  restaurant:    "Restaurant",
  bakery:        "Bakery",
  cafe:          "Café",
  scooter_rental:"Scooter rental",
  beach:         "Beach",
  snorkeling:    "Snorkeling",
  viewpoint:     "Viewpoint",
  temple:        "Temple",
  monument:      "Monument",
  museum:        "Museum",
  transport:     "Transport",
  practical:     "Practical",
};

const PRICE_LABEL: Record<PriceLevel, string> = {
  free:    "Free",
  budget:  "€",
  mid:     "€€",
  splurge: "€€€€",
};

export function LocalGemsSection({ places }: { places: Place[] }) {
  return (
    <div className="card">
      <p className="section-heading">💎 Local Gems</p>
      <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: "0 0 1.25rem", lineHeight: 1.5 }}>
        Curated picks from people who&apos;ve been there.
      </p>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {places.map((place, i) => (
          <div
            key={place.id}
            style={{
              borderTop: i === 0 ? "none" : "1px solid var(--border)",
              paddingTop: i === 0 ? 0 : "1rem",
              paddingBottom: i === places.length - 1 ? 0 : "1rem",
            }}
          >
            {/* Name row */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "0.75rem",
                marginBottom: "0.375rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <span aria-hidden="true" style={{ fontSize: "1rem" }}>
                  {CATEGORY_ICON[place.category]}
                </span>
                <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {place.name}
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    background: "var(--bg-surface, #f5f3ef)",
                    border: "1px solid var(--border)",
                    borderRadius: "9999px",
                    padding: "0.15rem 0.55rem",
                  }}
                >
                  {CATEGORY_LABEL[place.category]}
                </span>
              </div>
              {/* Price + location */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  flexShrink: 0,
                  gap: "0.1rem",
                }}
              >
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  {PRICE_LABEL[place.price_level]}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {place.city_or_area}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
              {place.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--text-muted)",
                    background: "var(--bg-surface, #f5f3ef)",
                    border: "1px solid var(--border)",
                    borderRadius: "9999px",
                    padding: "0.15rem 0.5rem",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Personal note */}
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-secondary)",
                fontStyle: "italic",
                margin: "0 0 0.5rem",
                lineHeight: 1.55,
              }}
            >
              &ldquo;{place.personal_note}&rdquo;
            </p>

            {/* Footer row: best_for chips + maps link */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", flexShrink: 0 }}>Best for:</span>
                {place.best_for.map((use) => (
                  <span
                    key={use}
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      background: "var(--bg-surface, #f5f3ef)",
                      border: "1px solid var(--border)",
                      borderRadius: "9999px",
                      padding: "0.15rem 0.5rem",
                    }}
                  >
                    {use}
                  </span>
                ))}
              </div>
              {place.google_maps_url ? (
                <a
                  href={place.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--accent-dark)",
                    textDecoration: "none",
                    padding: "0.25rem 0.65rem",
                    borderRadius: "9999px",
                    border: "1px solid var(--accent)",
                    background: "var(--accent-light)",
                    flexShrink: 0,
                  }}
                >
                  Maps ↗
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", margin: "1rem 0 0", fontStyle: "italic", lineHeight: 1.5 }}>
        Sample places — verify before visiting.
      </p>
    </div>
  );
}
