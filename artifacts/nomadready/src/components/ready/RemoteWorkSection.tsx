import { SectionHeading } from './SectionHeading';
import type { RemoteWork, RemoteWorkZone } from "@/lib/types";

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

function confidenceBadge(level: "low" | "medium" | "high"): { bg: string; color: string; label: string } {
  if (level === "high")   return { bg: "#f0fdf4", color: "#15803d", label: "High confidence" };
  if (level === "medium") return { bg: "#fffbeb", color: "#92400e", label: "Medium confidence" };
  return                         { bg: "#fef2f2", color: "#b91c1c", label: "Low confidence" };
}

function formatReviewed(iso: string): string {
  const [year, month] = iso.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

const CATEGORIES = [
  { key: "wifi_reliability"      as const, label: "WiFi reliability", icon: "📶" },
  { key: "mobile_data"           as const, label: "Mobile data",       icon: "📡" },
  { key: "quiet_for_calls"       as const, label: "Quiet for calls",   icon: "🎙️" },
  { key: "cowork_availability"   as const, label: "Coworking",         icon: "🏢" },
  { key: "cafe_work_friendly"    as const, label: "Café-friendly",     icon: "☕" },
  { key: "night_work_friendly"   as const, label: "Night work",        icon: "🌙" },
  { key: "long_stay_suitability" as const, label: "Long stays",        icon: "📅" },
];

export function RemoteWorkSection({ remoteWork }: { remoteWork: RemoteWork }) {
  const badge = overallBadgeStyle(remoteWork.overall);
  const hasZones = !!remoteWork.remote_work_zones?.length;

  return (
    <div className="card" id="remote">
      {/* Title row — always full width */}
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
          <SectionHeading category="remote" style={{ marginBottom: "0.2rem" }}>
            Remote Work Readiness
          </SectionHeading>
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

      {/* Body — desktop: left column (scores) | right column (zones) */}
      <div className={hasZones ? "rw-desktop-body" : undefined}>

        {/* Left / only column: category scores + meta */}
        <div>
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
          <div style={{ marginBottom: "0.625rem" }}>
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

          {/* Single micro-insight */}
          {remoteWork.field_notes && remoteWork.field_notes.length > 0 && (
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-muted)",
                fontStyle: "italic",
                lineHeight: 1.5,
                margin: "0 0 0.75rem",
              }}
            >
              {remoteWork.field_notes[0]}
            </p>
          )}

          {/* Trust meta */}
          <div style={{ paddingTop: "0.625rem", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", alignItems: "center", marginBottom: "0.375rem" }}>
              {(() => {
                const conf = confidenceBadge(remoteWork.confidence);
                return (
                  <span
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      background: conf.bg,
                      color: conf.color,
                      padding: "0.15rem 0.45rem",
                      borderRadius: "9999px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {conf.label}
                  </span>
                );
              })()}
              {remoteWork.source_type.map((src) => (
                <span
                  key={src}
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 500,
                    padding: "0.15rem 0.45rem",
                    borderRadius: "9999px",
                    background: "var(--bg-card, #fff)",
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {src}
                </span>
              ))}
            </div>
            <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>
              {remoteWork.verify_note ?? "Remote work scores are editorial. Verify with recent reviews before booking."}
              {remoteWork.last_reviewed && <> · Reviewed {formatReviewed(remoteWork.last_reviewed)}</>}
            </p>
          </div>
        </div>

        {/* Right column (desktop): zones panel */}
        {hasZones && (
          <RemoteWorkZones zones={remoteWork.remote_work_zones!} />
        )}
      </div>
    </div>
  );
}

function RemoteWorkZones({ zones }: { zones: RemoteWorkZone[] }) {
  return (
    <div className="rw-zones">
      {/* Subsection heading */}
      <p
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: "var(--text-muted)",
          margin: "0 0 0.625rem",
        }}
      >
        Remote Work Zones
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {zones.map((zone) => {
          const conf = confidenceBadge(zone.confidence);
          return (
            <div
              key={zone.name}
              style={{
                border: "1px solid var(--border)",
                borderRadius: "0.625rem",
                padding: "0.75rem",
                background: "var(--bg-subtle, #faf7f4)",
              }}
            >
              {/* Zone header row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  marginBottom: "0.35rem",
                }}
              >
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary, #1a1a1a)" }}>
                  {zone.name}
                </span>
                <span
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    background: conf.bg,
                    color: conf.color,
                    padding: "0.15rem 0.45rem",
                    borderRadius: "9999px",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {conf.label}
                </span>
              </div>

              {/* Summary */}
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                  margin: "0 0 0.5rem",
                }}
              >
                {zone.summary}
              </p>

              {/* Best for */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.5rem" }}>
                {zone.best_for.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      padding: "0.15rem 0.5rem",
                      borderRadius: "9999px",
                      background: "#f0fdf4",
                      border: "1px solid #86efac",
                      color: "#15803d",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Good areas */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.5rem" }}>
                {zone.good_areas.map((area) => (
                  <span
                    key={area}
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      padding: "0.15rem 0.5rem",
                      borderRadius: "9999px",
                      background: "var(--bg-card, #fff)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {area}
                  </span>
                ))}
              </div>

              {/* Watch out */}
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.2rem",
                }}
              >
                {zone.watch_out.map((item) => (
                  <li
                    key={item}
                    style={{ fontSize: "0.775rem", color: "var(--text-secondary)", lineHeight: 1.45 }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Zone disclaimer */}
      <p
        style={{
          fontSize: "0.6875rem",
          color: "var(--text-muted)",
          margin: "0.625rem 0 0",
          lineHeight: 1.5,
          fontStyle: "italic",
        }}
      >
        Zone notes are editorial field notes. Always verify recent accommodation and cowork reviews before booking.
      </p>
    </div>
  );
}
