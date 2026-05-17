import type { Scam } from "@/lib/types";

export function ScamsSection({ scams }: { scams: Scam[] }) {
  return (
    <div className="card">
      <p className="section-heading">Common Scams</p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {scams.map((scam, i) => (
          <div
            key={scam.name}
            style={{
              padding: i === 0 ? "0 0 0.875rem" : "0.875rem 0",
              borderTop: i === 0 ? "none" : "1px solid var(--border)",
            }}
          >
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: "0 0 0.25rem",
              }}
            >
              {scam.name}
            </p>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-secondary)",
                margin: 0,
                lineHeight: 1.55,
              }}
            >
              {scam.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
