import type { BudgetInfo, BudgetTier, CostAnchor } from "@/lib/types";

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  GBP: "£",
  USD: "$",
  CAD: "C$",
  AUD: "A$",
};

function getTierLocalAmount(tier: BudgetTier, currency: string): number | undefined {
  const key = `daily_${currency.toLowerCase()}` as keyof BudgetTier;
  const value = tier[key];
  return typeof value === "number" ? value : undefined;
}

function getAnchorAmount(anchor: CostAnchor, currency: string): number | undefined {
  const key = currency.toLowerCase() as keyof CostAnchor;
  const value = anchor[key];
  return typeof value === "number" ? value : undefined;
}

interface BudgetSectionProps {
  budget: BudgetInfo;
  passportCurrency: string;
}

export function BudgetSection({ budget, passportCurrency }: BudgetSectionProps) {
  const { currency, currency_symbol, exchange_rates, tiers, cost_anchors } = budget;

  const rate = exchange_rates[passportCurrency];
  const refSymbol = CURRENCY_SYMBOLS[passportCurrency] ?? passportCurrency;

  const tierList = [tiers.budget, tiers.mid, tiers.high];

  return (
    <div className="card">
      <p className="section-heading">💸 Budget</p>

      <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: "0 0 1rem" }}>
        Currency:{" "}
        <strong style={{ color: "var(--text-primary)" }}>
          {currency} ({currency_symbol})
        </strong>
        {rate != null && (
          <>
            {" "}— approx. 1 {passportCurrency} ={" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {currency_symbol}{rate}
            </strong>
          </>
        )}
      </p>

      {/* Tier cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.625rem",
          marginBottom: "1.25rem",
        }}
      >
        {tierList.map((tier) => {
          const localAmt = getTierLocalAmount(tier, currency);
          const refAmt = rate != null && localAmt != null
            ? Math.round(localAmt / rate)
            : undefined;

          return (
            <div
              key={tier.label}
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                padding: "0.75rem 0.875rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  margin: "0 0 0.3rem",
                }}
              >
                {tier.label}
              </p>
              <p
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.03em",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {refAmt != null ? (
                  <>
                    ~{refSymbol}{refAmt}
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 400,
                        color: "var(--text-muted)",
                        letterSpacing: 0,
                      }}
                    >
                      /day
                    </span>
                  </>
                ) : "—"}
              </p>
              {localAmt != null && (
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.1rem 0 0.4rem" }}>
                  {currency_symbol}{localAmt.toLocaleString()}
                </p>
              )}
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-secondary)",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {tier.includes}
              </p>
            </div>
          );
        })}
      </div>

      {/* Cost anchors */}
      <div>
        <p
          style={{
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: "0 0 0.5rem",
          }}
        >
          Price anchors
        </p>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {cost_anchors.map((anchor, i) => {
            const amt = getAnchorAmount(anchor, currency);
            return (
              <div
                key={anchor.item}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--border)",
                  fontSize: "0.8125rem",
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>{anchor.item}</span>
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    flexShrink: 0,
                    marginLeft: "1rem",
                  }}
                >
                  {currency_symbol}{amt?.toLocaleString() ?? "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {budget.verify_required && (
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
          <span>{budget.verify_note}</span>
        </div>
      )}
    </div>
  );
}
