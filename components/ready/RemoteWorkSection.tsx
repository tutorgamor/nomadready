import type { RemoteWork } from "@/lib/types";

function scoreStyle(score: number): { color: string } {
  if (score >= 85) return { color: "#15803d" };
  if (score >= 70) return { color: "#92400e" };
  return { color: "#b91c1c" };
}

function overallBadgeStyle(score: number): { bg: string; border: string; color: string } {
  if (score >= 85) return { bg: "#f0fdf4", border: "#86efac", color: "#15803d" };
  if (score >= 70) return { bg: "#fffbeb", border: "#fcd34d", color: "#92400e" };
  return { bg: "#fef2f2", border: "#fca5a5", color: "#b91c1c" };
}

const CATEGORIES = [
  { key: "wifi_reliability"    as const, label: "WiFi reliability",  icon: "📶" },
  { key: "mobile_data"         as const, label: "Mobile data",        icon: "📡" },
  { key: "quiet_for_calls"     as const, label: "Quiet for calls",    icon: "🎙️" },
  { key: "cowork_availability" as const, label: "Coworking",          icon: "🏢" },
  { key: "cafe_work_friendly"  as const, label: "Café-friendly",      icon: "☕" },
  { key: "night_work_friendly" as const, label: "Night work",         icon: "🌙" },
  { key: "long_stay_suitability" as const, label: "Long stays",       icon: "📅" },
];

export function RemoteWorkSection({ remoteWork }: { remoteWork: RemoteWork }) {
  const badge = overallBadgeStyle(remoteWork.overall);

  return (
    <div className="card" id="remote">
      {/* Title row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "0.5rem",
        }}
      >
        <div>
          <p className="section-heading" style={{ marginBottom: "0.2rem" }}>
            💻 Remote Work Readiness
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
            For nomads, online teachers &amp; long stays
          </p>
        </div>

        {/* Overall score badge */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: badge.bg,
            border: `2px solid ${badge.border}`,
            borderRadius: "0.75rem",
            padding: "0.45rem 0.875rem 0.35rem",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "1.875rem",
              fontWeight: 800,
              lineHeight: 1,
              color: badge.color,
              letterSpacing: "-0.04em",
            }}
          >
            {remoteWork.overall}
          </span>
          <span
            style={{
              fontSize: "0.625rem",
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: badge.color,
              opacity: 0.65,
            }}
          >
            /100
          </span>
        </div>
      </div>

      {/* Category rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
        {CATEGORIES.map(({ key, label, icon }) => {
          const val = remoteWork[key];
          const s = scoreStyle(val);
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                aria-hidden="true"
                style={{ fontSize: "0.875rem", flexShrink: 0, width: "1.125rem", textAlign: "center" }}
              >
                {icon}
              </span>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  flexShrink: 0,
                  width: "6rem",
                }}
              >
                {label}
              </span>
              <div
                style={{
                  flex: 1,
                  height: "0.25rem",
                  background: "var(--border)",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${val}%`,
                    background: s.color,
                    borderRadius: "9999px",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: s.color,
                  width: "1.875rem",
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {val}
              </span>
            </div>
          );
        })}
      </div>

      {/* Best for */}
      <div style={{ marginBottom: "0.75rem" }}>
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--text-muted)",
            margin: "0 0 0.4rem",
          }}
        >
          Best for
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {remoteWork.best_for.map((item) => (
            <span
              key={item}
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                padding: "0.2rem 0.6rem",
                borderRadius: "9999px",
                background: "#f0fdf4",
                border: "1px solid #86efac",
                color: "#15803d",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Watch out */}
      <div style={{ marginBottom: "0.75rem" }}>
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--text-muted)",
            margin: "0 0 0.4rem",
          }}
        >
          Watch out
        </p>
        <ul
          style={{
            margin: 0,
            paddingLeft: "1.1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {remoteWork.watch_out.map((item) => (
            <li
              key={item}
              style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Field notes */}
      <div
        style={{
          background: "var(--bg-subtle, #faf7f4)",
          border: "1px solid var(--border)",
          borderRadius: "0.5rem",
          padding: "0.625rem 0.75rem",
          marginBottom: "0.875rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem",
        }}
      >
        {remoteWork.field_notes.map((note) => (
          <p
            key={note}
            style={{
              margin: 0,
              fontSize: "0.8125rem",
              color: "var(--text-secondary)",
              lineHeight: 1.55,
              fontStyle: "italic",
            }}
          >
            {note}
          </p>
        ))}
      </div>

      {/* Disclaimer */}
      <p
        style={{
          fontSize: "0.6875rem",
          color: "var(--text-muted)",
          margin: 0,
          lineHeight: 1.5,
          fontStyle: "italic",
        }}
      >
        Remote work scores are editorial and should be verified with recent reviews before booking.
      </p>
    </div>
  );
}
