import type { UsefulApp } from "@/lib/types";

export function AppsSection({ apps }: { apps: UsefulApp[] }) {
  return (
    <div className="card">
      <p className="section-heading">Useful Apps</p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {apps.map((app, i) => (
          <div
            key={app.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
              padding: "0.625rem 0",
              borderTop: i === 0 ? "none" : "1px solid var(--border)",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  margin: "0 0 0.15rem",
                }}
              >
                {app.name}
              </p>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: 0 }}>
                {app.use}
              </p>
            </div>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 500,
                color: "var(--text-muted)",
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: "9999px",
                padding: "0.15rem 0.5rem",
                whiteSpace: "nowrap",
                flexShrink: 0,
                marginTop: "2px",
              }}
            >
              {app.platform}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
