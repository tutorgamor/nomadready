import type { VisaInfo } from "@/lib/types";

export function VisaSection({ visa }: { visa: VisaInfo }) {
  const costLabel =
    visa.cost_eur === 0   ? "Free"
    : visa.cost_eur != null ? `€${visa.cost_eur}`
    : visa.cost_usd != null ? `$${visa.cost_usd}`
    : "—";

  const isFree = visa.cost_eur === 0;

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: "hidden",
        border: "1px solid rgba(217,119,6,0.30)",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: "0.875rem 1.375rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <p
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          Visa &amp; Entry
        </p>
      </div>

      <div style={{ padding: "1.25rem 1.375rem" }}>
        {/* ── Visa type — display heading ── */}
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.75rem, 4vw, 2.375rem)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            margin: "0 0 1.125rem",
            lineHeight: 1.05,
          }}
        >
          {visa.type}
        </h2>

        {/* ── Three key fact callouts ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(72px, auto))",
            justifyContent: "start",
            gap: "0 2.25rem",
            paddingBottom: "1.125rem",
            borderBottom: "1px dashed rgba(180,130,65,0.3)",
            marginBottom: "1.125rem",
          }}
        >
          {/* Duration */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "1.875rem",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "var(--text-primary)",
                margin: 0,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {visa.duration_days}
            </p>
            <p
              style={{
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                margin: "0.25rem 0 0",
              }}
            >
              Days
            </p>
          </div>

          {/* Cost */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "1.875rem",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: isFree ? "var(--ok)" : "var(--text-primary)",
                margin: 0,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {costLabel}
            </p>
            <p
              style={{
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                margin: "0.25rem 0 0",
              }}
            >
              Cost
            </p>
          </div>

          {/* Multiple entry */}
          {visa.multiple_entry && (
            <div>
              <p
                style={{
                  fontSize: "1.875rem",
                  fontWeight: 700,
                  color: "var(--ok)",
                  margin: 0,
                  lineHeight: 1,
                }}
                aria-label="Multiple entry permitted"
              >
                ✓
              </p>
              <p
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  margin: "0.25rem 0 0",
                }}
              >
                Multi-entry
              </p>
            </div>
          )}
        </div>

        {/* ── Extension row ── */}
        {visa.extendable && (
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.625rem",
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                flexShrink: 0,
              }}
            >
              Extension
            </span>
            <span
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                lineHeight: 1.45,
              }}
            >
              +{visa.extension_days} days
              {visa.extension_fee_thb != null &&
                ` · ฿${visa.extension_fee_thb} at any immigration office`}
            </span>
          </div>
        )}

        {/* ── Notes body ── */}
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
            margin: 0,
            lineHeight: 1.65,
          }}
        >
          {visa.notes}
        </p>

        {/* ── Verify warning ── */}
        {visa.verify_required && (
          <div
            role="note"
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1rem",
              background: "rgba(254,243,199,0.60)",
              border: "1px solid rgba(217,119,6,0.32)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.8125rem",
              color: "var(--accent-dark)",
              lineHeight: 1.55,
            }}
          >
            {visa.verify_note}
          </div>
        )}
      </div>
    </div>
  );
}
