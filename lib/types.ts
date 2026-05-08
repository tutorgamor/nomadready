/**
 * /lib/types.ts
 *
 * TypeScript interfaces for NomadReady data structures.
 * Matches the JSON schema defined in /data/ready/fr-*.json
 */

// ─── Reference Data ───────────────────────────────────────────

export interface Passport {
  id: string;       // e.g. "fr"
  label: string;    // e.g. "France"
  emoji: string;    // e.g. "🇫🇷"
  region: string;   // e.g. "European Union"
}

export interface Destination {
  id: string;           // e.g. "thailand"
  label: string;        // e.g. "Thailand"
  emoji: string;        // e.g. "🇹🇭"
  hero_tag: string;     // e.g. "Temples, beaches & street food"
  cover_color: string;  // hex, used for card accent
  region: string;       // e.g. "Southeast Asia"
  ready_file: string;   // e.g. "fr-thailand"
}

// ─── Shared ───────────────────────────────────────────────────

/** Marks a field whose value should be re-verified from official sources */
export interface Verifiable {
  verify_required?: boolean;
  verify_note?: string;
}

// ─── Visa ─────────────────────────────────────────────────────

export interface VisaInfo extends Verifiable {
  type: string;               // e.g. "Visa Exemption", "e-Visa", "Visa on Arrival"
  duration_days: number;
  within_days?: number;       // e.g. 90 days within 180
  extendable: boolean;
  extension_days?: number;
  extension_fee_thb?: number;
  cost_eur?: number;
  cost_usd?: number;
  cost_eur_approx?: number;
  multiple_entry: boolean;
  apply_url?: string;
  notes: string;
}

// ─── Insurance ────────────────────────────────────────────────

export interface InsuranceInfo extends Verifiable {
  required: boolean;
  recommended: boolean;
  notes: string;
}

// ─── Best Season ──────────────────────────────────────────────

export type Month = "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun"
                  | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec";

export interface RegionSeason {
  area: string;
  best: Month[];
  avoid: Month[];
  notes: string;
}

export interface BestSeason {
  overall_best_months: Month[];
  regions: RegionSeason[];
}

// ─── Budget ───────────────────────────────────────────────────

export interface BudgetTier {
  label: string;
  daily_eur_approx: number;
  includes: string;
  // Currency-specific fields (only one will be present per destination)
  daily_thb?: number;
  daily_myr?: number;
  daily_idr?: number;
  daily_gel?: number;
  daily_try?: number;
}

export interface CostAnchor {
  item: string;
  // One of these will be present per destination
  thb?: number;
  myr?: number;
  idr?: number;
  gel?: number;
  try?: number;
}

export interface BudgetInfo extends Verifiable {
  currency: string;
  currency_symbol: string;
  approx_eur_rate: number;
  tiers: {
    budget: BudgetTier;
    mid: BudgetTier;
    high: BudgetTier;
  };
  cost_anchors: CostAnchor[];
}

// ─── Apps ─────────────────────────────────────────────────────

export interface UsefulApp {
  name: string;
  use: string;
  platform: string;
}

// ─── Scams ────────────────────────────────────────────────────

export interface Scam {
  name: string;
  description: string;
}

// ─── Phrases ──────────────────────────────────────────────────

export interface Phrase {
  phrase: string;
  pronunciation: string;
  meaning: string;
}

// ─── Emergency ────────────────────────────────────────────────

export interface EmbassyInfo extends Verifiable {
  phone: string;
  address: string;
  note?: string;
}

export interface EmergencyInfo {
  police: string;
  ambulance: string;
  fire: string;
  unified_emergency?: string;
  tourist_police?: string;
  tourist_hotline?: string;
  search_and_rescue?: string;
  tourist_police_istanbul?: string;
  french_embassy_bangkok?: EmbassyInfo;
  french_embassy_kuala_lumpur?: EmbassyInfo;
  french_embassy_jakarta?: EmbassyInfo;
  french_consulate_bali?: EmbassyInfo;
  french_embassy_tbilisi?: EmbassyInfo;
  french_embassy_ankara?: EmbassyInfo;
  french_consulate_istanbul?: EmbassyInfo;
  notes: string;
}

// ─── Checklist ────────────────────────────────────────────────

export type ChecklistPriority = "critical" | "high" | "medium" | "low";

export interface ChecklistItem {
  item: string;
  priority: ChecklistPriority;
}

// ─── Root ReadyData ───────────────────────────────────────────

export interface ReadyData {
  passport: string;
  destination: string;
  last_reviewed: string;        // ISO date string e.g. "2026-05-08"
  disclaimer: string;
  visa: VisaInfo;
  insurance: InsuranceInfo;
  best_season: BestSeason;
  budget: BudgetInfo;
  useful_apps: UsefulApp[];
  transport: string[];
  scams: Scam[];
  phrases: Phrase[];
  emergency: EmergencyInfo;
  checklist: ChecklistItem[];
}
