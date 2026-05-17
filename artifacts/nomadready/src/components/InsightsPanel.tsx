import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Destination, BudgetInfo } from "@/lib/types";
import type { DestSummary } from "@/components/home/DestinationPicker";
import { getDailyLocal, CURRENCY_SYMBOLS } from "@/lib/budget";
import { useProfileContext } from "@/lib/profile";

type BudgetStyle = "Backpacker" | "Comfort" | "Boutique";
const STYLES: BudgetStyle[] = ["Backpacker", "Comfort", "Boutique"];
const AFFORDABILITY: Record<BudgetStyle, string> = {
  Backpacker: "Budget-friendly",
  Comfort: "Moderate",
  Boutique: "Premium",
};

function visaColor(label: string): string {
  const l = label.toLowerCase();
  if (l.startsWith("free")) return "rgba(34,197,94,0.90)";
  if (l.includes("e-visa")) return "rgba(251,191,36,0.90)";
  if (l.includes("arrival")) return "rgba(96,165,250,0.90)";
  return "var(--text-secondary)";
}

const slideVariants = {
  enter: (d: number) => ({
    x: d > 0 ? 32 : -32,
    opacity: 0,
    filter: "blur(3px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
  },
  exit: (d: number) => ({
    x: d > 0 ? -24 : 24,
    opacity: 0,
    filter: "blur(3px)",
    transition: { duration: 0.22 },
  }),
};

interface InsightsPanelProps {
  destinations: Destination[];
  summaries: Map<string, DestSummary>;
  budgets: Record<string, BudgetInfo>;
  passportCurrency: string;
}

export function InsightsPanel({
  destinations,
  summaries,
  budgets,
  passportCurrency,
}: InsightsPanelProps) {
  const [tab, setTab] = useState<"visa" | "budget">("visa");
  const [dir, setDir]  = useState(1);
  const [days, setDays]   = useState(7);
  const [style, setStyle] = useState<BudgetStyle>("Comfort");
  const { profile } = useProfileContext();

  const refSymbol = CURRENCY_SYMBOLS[passportCurrency] ?? passportCurrency;

  function switchTab(next: "visa" | "budget") {
    if (next === tab) return;
    setDir(next === "budget" ? 1 : -1);
    setTab(next);
  }

  const tabBtn = (id: "visa" | "budget", label: string) => {
    const active = tab === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => switchTab(id)}
        style={{
          flex: 1,
          padding: "0.4rem 0",
          fontSize: "0.72rem",
          fontWeight: active ? 700 : 500,
          letterSpacing: "0.03em",
          border: "none",
          borderRadius: "6px",
          background: active ? "var(--text-primary)" : "transparent",
          color: active ? "#fff" : "var(--text-muted)",
          cursor: "pointer",
          transition: "background 0.2s, color 0.2s",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          background: "var(--surface-raised)",
          borderRadius: "8px",
          padding: "3px",
          marginBottom: "1rem",
          gap: "2px",
        }}
      >
        {tabBtn("visa", "Visa & Scores")}
        {tabBtn("budget", "Trip Budget")}
      </div>

      {/* Animated content */}
      <div style={{ overflow: "hidden", minHeight: "320px" }}>
        <AnimatePresence custom={dir} mode="wait">
          {tab === "visa" ? (
            <motion.div
              key="visa"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {destinations.map((dest, i) => {
                const sum     = summaries.get(dest.id);
                const isLast  = i === destinations.length - 1;
                const score   = dest.travel_score?.overall;
                return (
                  <div
                    key={dest.id}
                    style={{
                      borderTop: i === 0 ? "none" : "1px solid var(--border)",
                      paddingTop: i === 0 ? 0 : "0.8rem",
                      paddingBottom: isLast ? 0 : "0.8rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.22rem" }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                        {dest.emoji} {dest.label}
                      </span>
                      {score != null && (
                        <span style={{ flexShrink: 0 }}>
                          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.03em" }}>
                            {score}
                          </span>
                          <span style={{ fontSize: "0.62rem", fontWeight: 400, color: "var(--text-muted)" }}>/100</span>
                        </span>
                      )}
                    </div>
                    {sum ? (
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                        <span style={{ fontWeight: 700, color: visaColor(sum.visaLabel) }}>{sum.visaLabel}</span>
                        <span style={{ margin: "0 0.3rem", opacity: 0.35 }}>·</span>
                        <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{sum.budgetFrom}</span>
                        <span style={{ margin: "0 0.3rem", opacity: 0.35 }}>·</span>
                        {sum.bestMonths}
                      </p>
                    ) : (
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic", margin: 0 }}>
                        Not available yet
                      </p>
                    )}
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="budget"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* Controls */}
              <p style={{ fontSize: "0.75rem", color: "var(--accent-dark, #7c4b2a)", margin: "0 0 0.875rem", fontStyle: "italic", opacity: 0.8, lineHeight: 1.5 }}>
                {profile.plannerBlurb}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", minWidth: "4.5rem" }}>Duration</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                    <button
                      onClick={() => setDays((d) => Math.max(1, d - 1))}
                      aria-label="Decrease days"
                      style={{ width: "1.6rem", height: "1.6rem", borderRadius: "50%", border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-secondary)", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                    >−</button>
                    <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", minWidth: "1.8rem", textAlign: "center" }}>
                      {days}
                    </span>
                    <button
                      onClick={() => setDays((d) => Math.min(365, d + 1))}
                      aria-label="Increase days"
                      style={{ width: "1.6rem", height: "1.6rem", borderRadius: "50%", border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-secondary)", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                    >+</button>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>days</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", minWidth: "4.5rem" }}>Style</span>
                  <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                    {STYLES.map((s) => {
                      const active = style === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setStyle(s)}
                          style={{
                            padding: "0.25rem 0.65rem",
                            fontSize: "0.72rem",
                            fontWeight: active ? 700 : 500,
                            borderRadius: "9999px",
                            border: active ? "1px solid var(--text-primary)" : "1px solid var(--border)",
                            background: active ? "var(--text-primary)" : "transparent",
                            color: active ? "#fff" : "var(--text-muted)",
                            cursor: "pointer",
                          }}
                        >{s}</button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Budget rows */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.875rem" }}>
                {destinations.map((dest, i) => {
                  const budget  = budgets[dest.id];
                  const isLast  = i === destinations.length - 1;
                  const rowStyle = {
                    borderTop: i === 0 ? "none" : "1px solid var(--border)",
                    paddingTop: i === 0 ? 0 : "0.7rem",
                    paddingBottom: isLast ? 0 : "0.7rem",
                  };

                  if (!budget) {
                    return (
                      <div key={dest.id} style={rowStyle}>
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                          {dest.emoji} {dest.label}
                        </span>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic", margin: "0.15rem 0 0" }}>
                          Not available yet
                        </p>
                      </div>
                    );
                  }

                  const tierMap = {
                    Backpacker: budget.tiers.budget,
                    Comfort:    budget.tiers.mid,
                    Boutique:   budget.tiers.high,
                  };
                  const dailyLocal = getDailyLocal(tierMap[style], budget.currency);
                  const totalLocal = dailyLocal != null ? dailyLocal * days : null;
                  const rate       = budget.exchange_rates[passportCurrency];
                  const totalRef   = totalLocal != null && rate != null
                    ? Math.round(totalLocal / rate)
                    : null;

                  return (
                    <div key={dest.id} style={rowStyle}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.15rem" }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                          {dest.emoji} {dest.label}
                        </span>
                        <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.03em", flexShrink: 0 }}>
                          {totalRef != null ? `~${refSymbol}${totalRef.toLocaleString()}` : "—"}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
                        {totalLocal != null ? (
                          <>
                            <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                              {budget.currency_symbol}{totalLocal.toLocaleString()}
                            </span>
                            <span style={{ margin: "0 0.3rem", opacity: 0.35 }}>·</span>
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

              <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", margin: "0.875rem 0 0", lineHeight: 1.5 }}>
                Estimates are approximate. Prices vary by season, city, and travel style.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
