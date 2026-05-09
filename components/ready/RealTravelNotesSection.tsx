import type { RealTravelNote } from "@/lib/types";

const TYPE_ICON: Record<string, string> = {
  wifi:          "📶",
  transport:     "🚌",
  money:         "💳",
  weather:       "🌧️",
  cost:          "💸",
  accommodation: "🏨",
  food:          "🍜",
  culture:       "🏛️",
  navigation:    "🗺️",
  health:        "💊",
  safety:        "🛡️",
  ferry:         "⛴️",
};

function icon(type: string): string {
  return TYPE_ICON[type] ?? "📌";
}

export function RealTravelNotesSection({ notes }: { notes: RealTravelNote[] }) {
  if (notes.length === 0) return null;

  return (
    <div className="card">
      <p className="section-heading">📌 Things Nobody Tells You</p>
      <p
        style={{
          fontSize: "0.8125rem",
          color: "var(--text-muted)",
          margin: "0 0 1.25rem",
          lineHeight: 1.5,
        }}
      >
        Practical realities from people who&apos;ve spent real time there.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {notes.map((n, i) => (
          <div
            key={i}
            style={{
              borderLeft: "3px solid var(--accent)",
              paddingLeft: "0.875rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.4rem",
                marginBottom: "0.3rem",
              }}
            >
              <span aria-hidden="true" style={{ fontSize: "0.875rem", flexShrink: 0 }}>
                {icon(n.type)}
              </span>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  lineHeight: 1.4,
                }}
              >
                {n.title}
              </span>
            </div>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-secondary)",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {n.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
