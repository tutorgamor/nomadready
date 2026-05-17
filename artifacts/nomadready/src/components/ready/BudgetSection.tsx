import type { BudgetInfo, BudgetTier, CostAnchor } from "@/lib/types";
import { BudgetCalculator } from "./BudgetCalculator";

const REF_SYMBOLS: Record<string, string> = {
  EUR: "€", GBP: "£", USD: "$", CAD: "C$", AUD: "A$",
};

function getTierLocalAmount(tier: BudgetTier, currency: string): number | undefined {
  const key = `daily_${currency.toLowerCase()}` as keyof BudgetTier;
  const v = tier[key];
  return typeof v === "number" ? v : undefined;
}

function getAnchorAmount(anchor: CostAnchor, currency: string): number | undefined {
  const key = currency.toLowerCase() as keyof CostAnchor;
  const v = anchor[key];
  return typeof v === "number" ? v : undefined;
}

// Stepped background tones — each tier gains subtle warmth
const TIER_BG = [
  "transparent",
  "rgba(254,249,243,0.55)",
  "rgba(249,243,232,0.70)",
];

interface BudgetSectionProps {
  budget: BudgetInfo;
  passportCurrency: string;
}

export function BudgetSection({ budget, passportCurrency }: BudgetSectionProps) {
  const { currency, currency_symbol, exchange_rates, tiers, cost_anchors } = budget;
  const rate    = exchange_rates[passportCurrency];
  const refSym  = REF_SYMBOLS[passportCurrency] ?? passportCurrency;
  const tierList = [tiers.budget, tiers.mid, tiers.high];

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>

      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.375rem 1rem",
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
          Budget
        </p>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: 0 }}>
          <strong
            style={{
              color: "var(--text-primary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {currency} ({currency_symbol})
          </strong>
          {rate != null && (
            <> · 1&nbsp;{passportCurrency}&nbsp;≈&nbsp;{currency_symbol}{rate}</>
          )}
        </p>
      </div>

      {/* ── Tariff rows — vertical stepped tiers ── */}
      <div>
        {tierList.map((tier, i) => {
          const localAmt = getTierLocalAmount(tier, currency);
          const refAmt =
            rate != null && localAmt != null
              ? Math.round(localAmt / rate)
              : undefined;

          return (
            <div
              key={tier.label}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "start",
                gap: "0.375rem 1.5rem",
                padding: `${0.875 + i * 0.0625}rem 1.375rem`,
                paddingLeft: `${1.375 + i * 0.125}rem`,
                borderBottom: i < tierList.length - 1 ? "1px solid var(--border)" : "none",
                background: TIER_BG[i],
              }}
            >
              {/* Left: tier label + includes */}
              <div>
                <p
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    margin: "0 0 0.2rem",
                  }}
                >
                  {tier.label}
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    margin: 0,
                    lineHeight: 1.45,
                  }}
                >
                  {tier.includes}
                </p>
              </div>

              {/* Right: reference + local amounts */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "var(--text-primary)",
                    margin: 0,
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {refAmt != null ? (
                    <>
                      ~{refSym}{refAmt}
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 400,
                          color: "var(--text-muted)",
                          fontFamily: "inherit",
                        }}
                      >
                        /day
                      </span>
                    </>
                  ) : "—"}
                </p>
                {localAmt != null && (
                  <p
                    style={{
                      fontFamily: "var(--font-geist-mono), monospace",
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      margin: "0.15rem 0 0",
                      whiteSpace: "nowrap",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {currency_symbol}{localAmt.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Price anchors — market ledger ── */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <p
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            margin: 0,
            padding: "0.875rem 1.375rem 0.375rem",
          }}
        >
          Price anchors
        </p>
        {cost_anchors.map((anchor: CostAnchor, i: number) => {
          const amt = getAnchorAmount(anchor, currency);
          return (
            <div
              key={anchor.item}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                gap: "1rem",
                padding: "0.4rem 1.375rem",
                borderTop: i === 0 ? "none" : "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                {anchor.item}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  flexShrink: 0,
                  letterSpacing: "-0.01em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {currency_symbol}{amt?.toLocaleString() ?? "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Budget calculator ── */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <BudgetCalculator budget={budget} passportCurrency={passportCurrency} />
      </div>

      {/* ── Verify warning ── */}
      {budget.verify_required && (
        <div
          role="note"
          style={{
            margin: "0 1.375rem 1.25rem",
            padding: "0.75rem 1rem",
            background: "rgba(254,243,199,0.60)",
            border: "1px solid rgba(217,119,6,0.32)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.8125rem",
            color: "var(--accent-dark)",
            lineHeight: 1.55,
          }}
        >
          {budget.verify_note}
        </div>
      )}
    </div>
  );
}
