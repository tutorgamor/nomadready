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
  currency: string; // e.g. "EUR", "GBP" — reference currency for budget display
}

export interface TravelScore {
  overall: number;       // 0–100 composite
  visa_ease: number;
  budget: number;
  safety: number;
  internet: number;
  transport: number;
  nomad_friendly: number;
}

export interface Destination {
  id: string;           // e.g. "thailand"
  label: string;        // e.g. "Thailand"
  emoji: string;        // e.g. "🇹🇭"
  hero_tag: string;     // e.g. "Temples, beaches & street food"
  cover_color: string;  // hex, used for card accent
  region: string;       // e.g. "Southeast Asia"
  travel_score?: TravelScore;
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
  cost_idr?: number;
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
  includes: string;
  // Local currency daily amount (only one will be present per destination)
  daily_thb?: number;
  daily_myr?: number;
  daily_idr?: number;
  daily_gel?: number;
  daily_try?: number;
  daily_vnd?: number;
  daily_php?: number;
  daily_jpy?: number;
  daily_krw?: number;
}

export interface CostAnchor {
  item: string;
  // One of these will be present per destination
  thb?: number;
  myr?: number;
  idr?: number;
  gel?: number;
  try?: number;
  vnd?: number;
  php?: number;
  jpy?: number;
  krw?: number;
}

export interface BudgetInfo extends Verifiable {
  currency: string;
  currency_symbol: string;
  // Maps reference currency codes to their rate: 1 unit = X units of local currency
  // e.g. { "EUR": 38, "GBP": 45 } means 1 EUR = 38 THB, 1 GBP = 45 THB
  exchange_rates: Record<string, number>;
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
  // Generic embassy field for non-French passports
  embassy_label?: string;
  embassy?: EmbassyInfo;
  // French-passport-specific embassy fields (legacy)
  french_embassy_bangkok?: EmbassyInfo;
  french_embassy_kuala_lumpur?: EmbassyInfo;
  french_embassy_jakarta?: EmbassyInfo;
  french_consulate_bali?: EmbassyInfo;
  french_embassy_tbilisi?: EmbassyInfo;
  french_embassy_ankara?: EmbassyInfo;
  french_consulate_istanbul?: EmbassyInfo;
  notes: string;
}

// ─── Local Gems ───────────────────────────────────────────────

export type PlaceCategory =
  | "restaurant" | "bakery" | "cafe" | "scooter_rental"
  | "beach" | "snorkeling" | "viewpoint" | "temple"
  | "monument" | "museum" | "transport" | "practical";

export type PriceLevel = "free" | "budget" | "mid" | "splurge";

export interface Place {
  id: string;
  name: string;
  country: string;
  city_or_area: string;
  category: PlaceCategory;
  tags: string[];
  personal_note: string;
  google_maps_url: string;  // empty string when URL not yet added
  recommended_by: string;
  price_level: PriceLevel;
  best_for: string[];
}

// ─── Checklist ────────────────────────────────────────────────

export type ChecklistPriority = "critical" | "high" | "medium" | "low";

export interface ChecklistItem {
  item: string;
  priority: ChecklistPriority;
}

// ─── Real Travel Notes ────────────────────────────────────────

export interface RealTravelNote {
  type: string;   // e.g. "wifi", "transport", "money" — drives display icon
  title: string;
  note: string;
}

// ─── Remote Work Readiness ────────────────────────────────────

export interface RemoteWork {
  overall: number;
  wifi_reliability: number;
  mobile_data: number;
  quiet_for_calls: number;
  cowork_availability: number;
  cafe_work_friendly: number;
  night_work_friendly: number;
  long_stay_suitability: number;
  best_for: string[];
  watch_out: string[];
  field_notes: string[];
  confidence: "low" | "medium" | "high";
  source_type: string[];
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
