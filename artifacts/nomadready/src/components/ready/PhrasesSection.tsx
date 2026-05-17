import { SectionHeading } from './SectionHeading';
import type { Phrase } from "@/lib/types";

export function PhrasesSection({ phrases }: { phrases: Phrase[] }) {
  return (
    <div className="card">
      <SectionHeading category="phrases" style={{ marginBottom: "0.875rem" }}>Local Phrases</SectionHeading>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {phrases.map((p, i) => (
          <div
            key={p.phrase}
            style={{
              padding: i === 0 ? "0 0 0.75rem" : "0.75rem 0",
              borderTop: i === 0 ? "none" : "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.5rem",
                flexWrap: "wrap",
                marginBottom: "0.15rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {p.phrase}
              </span>
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                  fontStyle: "italic",
                }}
              >
                {p.pronunciation}
              </span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: 0 }}>
              {p.meaning}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
