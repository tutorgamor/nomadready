"use client";

import { useState } from "react";
import type { Destination, BudgetInfo } from "@/lib/types";
import { getDailyLocal, CURRENCY_SYMBOLS } from "@/lib/budget";

type Style = "Backpacker" | "Comfort" | "Boutique";
const STYLES: Style[] = ["Backpacker", "Comfort", "Boutique"];
const AFFORDABILITY: Record<Style, string> = {
  Backpacker: "Budget-friendly",
  Comfort: "Moderate",
  Boutique: "Premium",
};

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

interface TripPlannerProps {
  destinations: Destination[];
  budgets: Record<string, BudgetInfo>;
  passportCurrency: string;
}

export function TripPlanner({ destinations, budgets, passportCurrency }: TripPlannerProps) {
  const [days, setDays] = useState(7);
  const [style, setStyle] = useState<Style>("Comfort");

  const refSymbol = CURRENCY_SYMBOLS[passportCurrency] ?? passportCurrency;

  return (
    <div className="card">
      {/* Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.125rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", minWidth: "4.5rem" }}>
            Duration
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={() => setDays((d) => Math.max(1, d - 1))}
              aria-label="Decrease days"
              style={stepperBtn}
            >
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
            <button
              onClick={() => setDays((d) => Math.min(365, d + 1))}
              aria-label="Increase days"
              style={stepperBtn}
            >
              +
            </button>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>days</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", minWidth: "4.5rem" }}>
            Style
          </span>
          <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
            {STYLES.map((s) => {
              const isActive = style === s;
              return (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  style={{
                    padding: "0.3rem 0.75rem",
                    fontSize: "0.75rem",
                    fontWeight: isActive ? 700 : 500,
                    borderRadius: "9999px",
                    border: isActive ? "1px solid var(--text-primary)" : "1px solid var(--border)",
                    background: isActive ? "var(--text-primary)" : "transparent",
                    color: isActive ? "#fff" : "var(--text-muted)",
                    cursor: "pointer",
                    letterSpacing: "0.02em",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Per-destination estimates */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.875rem" }}>
        {destinations.map((dest, i) => {
          const budget = budgets[dest.id];
          const isLast = i === destinations.length - 1;
          const rowStyle = {
            borderTop: i === 0 ? "none" : "1px solid var(--border)",
            paddingTop: i === 0 ? 0 : "0.75rem",
            paddingBottom: isLast ? 0 : "0.75rem",
          };

          if (!budget) {
            return (
              <div key={dest.id} style={rowStyle}>
                <span
                  style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}
                >
                  {dest.emoji} {dest.label}
                </span>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontStyle: "italic", margin: "0.2rem 0 0" }}>
                  Not available yet
                </p>
              </div>
            );
          }

          const tierMap = {
            Backpacker: budget.tiers.budget,
            Comfort: budget.tiers.mid,
            Boutique: budget.tiers.high,
          };
          const dailyLocal = getDailyLocal(tierMap[style], budget.currency);
          const totalLocal = dailyLocal != null ? dailyLocal * days : null;
          const rate = budget.exchange_rates[passportCurrency];
          const totalRef = totalLocal != null && rate != null ? Math.round(totalLocal / rate) : null;

          return (
            <div key={dest.id} style={rowStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  marginBottom: "0.2rem",
                }}
              >
                <span
                  style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}
                >
                  {dest.emoji} {dest.label}
                </span>
                <span
                  style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", flexShrink: 0 }}
                >
                  {totalRef != null ? `~${refSymbol}${totalRef.toLocaleString()}` : "—"}
                </span>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>
                {totalLocal != null ? (
                  <>
                    {budget.currency_symbol}{totalLocal.toLocaleString()}
                    <span style={{ margin: "0 0.3rem", opacity: 0.4 }}>·</span>
                    {AFFORDABILITY[style]}
                  </>
                ) : (
                  <em>Rate not available for this currency</em>
                )}
              </p>
            </div>
          );
        })}
      </div>

      <p
        style={{
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          margin: "0.875rem 0 0",
          lineHeight: 1.5,
        }}
      >
        Estimates are approximate. Prices vary by season, city, and travel style.
      </p>
    </div>
  );
}
