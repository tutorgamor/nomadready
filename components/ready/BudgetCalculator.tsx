"use client";

import { useState } from "react";
import type { BudgetInfo, BudgetTier } from "@/lib/types";

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  GBP: "£",
  USD: "$",
  CAD: "C$",
  AUD: "A$",
};

type Style = "Backpacker" | "Comfort" | "Boutique";
const STYLES: Style[] = ["Backpacker", "Comfort", "Boutique"];

function getDailyLocal(tier: BudgetTier, currency: string): number | undefined {
  const key = `daily_${currency.toLowerCase()}` as keyof BudgetTier;
  const value = tier[key];
  return typeof value === "number" ? value : undefined;
}

interface Props {
  budget: BudgetInfo;
  passportCurrency: string;
}

const stepperBtn: React.CSSProperties = {
  width: "1.75rem",
  height: "1.75rem",
  borderRadius: "50%",
  border: "1px solid var(--border)",
  background: "var(--bg-base)",
  color: "var(--text-secondary)",
  fontSize: "1rem",
  lineHeight: 1,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

export function BudgetCalculator({ budget, passportCurrency }: Props) {
  const [days, setDays] = useState(7);
  const [style, setStyle] = useState<Style>("Comfort");

  const { currency, currency_symbol, exchange_rates, tiers } = budget;
  const rate = exchange_rates[passportCurrency];
  const refSymbol = CURRENCY_SYMBOLS[passportCurrency] ?? passportCurrency;

  const tierMap: Record<Style, BudgetTier> = {
    Backpacker: tiers.budget,
    Comfort: tiers.mid,
    Boutique: tiers.high,
  };

  const dailyLocal = getDailyLocal(tierMap[style], currency);
  const totalLocal = dailyLocal != null ? dailyLocal * days : undefined;
  const totalRef = totalLocal != null && rate != null ? Math.round(totalLocal / rate) : undefined;

  return (
    <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
      <p
        style={{
          fontSize: "0.72rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          margin: "0 0 0.875rem",
        }}
      >
        Trip estimator
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {/* Days stepper */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", minWidth: "4.5rem" }}>
            Duration
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button onClick={() => setDays((d) => Math.max(1, d - 1))} aria-label="Decrease days" style={stepperBtn}>
              −
            </button>
            <span
              style={{
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                minWidth: "2rem",
                textAlign: "center",
              }}
            >
              {days}
            </span>
            <button onClick={() => setDays((d) => Math.min(365, d + 1))} aria-label="Increase days" style={stepperBtn}>
              +
            </button>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>days</span>
          </div>
        </div>

        {/* Style selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", minWidth: "4.5rem" }}>
            Style
          </span>
          <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
            {STYLES.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                style={{
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  borderRadius: "9999px",
                  border: "1px solid",
                  cursor: "pointer",
                  borderColor: style === s ? "var(--accent)" : "var(--border)",
                  background: style === s ? "var(--accent-light)" : "transparent",
                  color: style === s ? "var(--accent-dark)" : "var(--text-secondary)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      {totalRef != null && totalLocal != null && (
        <div
          style={{
            marginTop: "0.875rem",
            background: "var(--bg-base)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
            padding: "0.875rem 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                margin: "0 0 0.2rem",
              }}
            >
              Estimated total
            </p>
            <p
              style={{
                fontSize: "1.375rem",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "var(--text-primary)",
                margin: 0,
                lineHeight: 1,
              }}
            >
              ~{refSymbol}{totalRef.toLocaleString()}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>
              {currency_symbol}{totalLocal.toLocaleString()} {currency}
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
              {days} day{days !== 1 ? "s" : ""} · {style}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.1rem 0 0" }}>
              ~{refSymbol}{Math.round(totalRef / days).toLocaleString()}/day
            </p>
          </div>
        </div>
      )}

      <p
        style={{
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          margin: "0.625rem 0 0",
          lineHeight: 1.5,
        }}
      >
        Estimates are approximate. Prices vary by season, city, and travel style.
      </p>
    </div>
  );
}
