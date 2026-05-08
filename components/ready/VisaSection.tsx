import type { VisaInfo } from "@/lib/types";

export function VisaSection({ visa }: { visa: VisaInfo }) {
  return (
    <div className="card">
      <p className="section-heading">🛂 Visa &amp; Entry</p>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <span className="badge">{visa.type}</span>
        <span className="badge">{visa.duration_days} days</span>
        <span className="badge">
          {visa.cost_eur === 0 ? "Free" : visa.cost_eur != null ? `€${visa.cost_eur}` : visa.cost_usd != null ? `$${visa.cost_usd}` : ""}
        </span>
        {visa.multiple_entry && <span className="badge">Multiple entry</span>}
      </div>

      {visa.extendable && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "0.3rem 0.875rem",
            marginBottom: "0.875rem",
            fontSize: "0.8125rem",
          }}
        >
          <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Extension</span>
          <span style={{ color: "var(--text-secondary)" }}>
            +{visa.extension_days} days
            {visa.extension_fee_thb != null && ` (฿${visa.extension_fee_thb} at any immigration office)`}
          </span>
        </div>
      )}

      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
        {visa.notes}
      </p>

      {visa.verify_required && (
        <div
          style={{
            marginTop: "0.875rem",
            background: "var(--accent-light)",
            border: "1px solid var(--accent)",
            borderRadius: "0.5rem",
            padding: "0.625rem 0.875rem",
            fontSize: "0.8125rem",
            color: "var(--accent-dark)",
            display: "flex",
            gap: "0.5rem",
            alignItems: "flex-start",
            lineHeight: 1.5,
          }}
        >
          <span aria-hidden="true">⚠️</span>
          <span>{visa.verify_note}</span>
        </div>
      )}
    </div>
  );
}
