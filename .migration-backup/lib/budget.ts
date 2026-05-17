import type { BudgetTier } from "@/lib/types";

export const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  GBP: "£",
  USD: "$",
  CAD: "C$",
  AUD: "A$",
};

export function getDailyLocal(tier: BudgetTier, currency: string): number | undefined {
  const key = `daily_${currency.toLowerCase()}` as keyof BudgetTier;
  const value = tier[key];
  return typeof value === "number" ? value : undefined;
}
