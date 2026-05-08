import type { InsuranceInfo } from "@/lib/types";

export function InsuranceSection({ insurance }: { insurance: InsuranceInfo }) {
  return (
    <div className="card">
      <p className="section-heading">🏥 Insurance</p>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: "0.8125rem",
            fontWeight: 500,
            padding: "0.2rem 0.6rem",
            borderRadius: "9999px",
            background: insurance.required ? "#fef2f2" : "#f0fdf4",
            color: insurance.required ? "var(--danger)" : "var(--ok)",
            border: `1px solid ${insurance.required ? "var(--danger)" : "var(--ok)"}`,
          }}
        >
          {insurance.required ? "Required by law" : "Not legally required"}
        </span>
        {insurance.recommended && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: "0.8125rem",
              fontWeight: 500,
              padding: "0.2rem 0.6rem",
              borderRadius: "9999px",
              background: "var(--accent-light)",
              color: "var(--accent-dark)",
              border: "1px solid var(--accent)",
            }}
          >
            Strongly recommended
          </span>
        )}
      </div>

      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
        {insurance.notes}
      </p>
    </div>
  );
}
