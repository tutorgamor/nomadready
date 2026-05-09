import { createContext, useContext } from "react";

// ─── Types ────────────────────────────────────────────────

export type TravelerProfileId =
  | "backpacker"
  | "digital_nomad"
  | "food_explorer"
  | "comfort"
  | "adventure";

export interface TravelerProfile {
  id: TravelerProfileId;
  label: string;
  emoji: string;
  tagline: string;
  comparisonNote: string;
  plannerBlurb: string;
  scoreHighlight: string[];
  scoreBlurb: string;
  gemsFilter: string;
  gemsBlurb: string;
}

// ─── Profile config ───────────────────────────────────────

export const PROFILES: TravelerProfile[] = [
  {
    id: "backpacker",
    label: "Backpacker",
    emoji: "🎒",
    tagline: "Max flexibility, minimal spend",
    comparisonNote: "Sorted for budget & flexibility.",
    plannerBlurb: "Hostels, street food & local buses — your budget here.",
    scoreHighlight: ["budget"],
    scoreBlurb: "Budget score matters most for backpackers.",
    gemsFilter: "All",
    gemsBlurb: "Curated picks — cheap eats, local hangs & budget-friendly spots.",
  },
  {
    id: "digital_nomad",
    label: "Digital Nomad",
    emoji: "💻",
    tagline: "Work-friendly stays & fast wifi",
    comparisonNote: "Highlighting nomad scene & internet scores.",
    plannerBlurb: "Mid-stay estimates including cowork day passes & reliable internet.",
    scoreHighlight: ["internet", "nomad_friendly"],
    scoreBlurb: "Internet speed & nomad scene are key for remote workers.",
    gemsFilter: "Food",
    gemsBlurb: "Cafes, cowork spots & the best places to plug in.",
  },
  {
    id: "food_explorer",
    label: "Food Explorer",
    emoji: "🍜",
    tagline: "Eat local, eat well",
    comparisonNote: "Emphasizing food scenes & local markets.",
    plannerBlurb: "Budget includes dining out, market grazing & street food.",
    scoreHighlight: ["budget"],
    scoreBlurb: "Budget score reflects how far your food spend goes.",
    gemsFilter: "Food",
    gemsBlurb: "Local eats, bakeries, cafes & market finds.",
  },
  {
    id: "comfort",
    label: "Comfort",
    emoji: "🛋️",
    tagline: "Convenience & quality first",
    comparisonNote: "Highlighting safety & transport scores.",
    plannerBlurb: "Hotel stays & reliable transport — comfort budget here.",
    scoreHighlight: ["safety", "transport"],
    scoreBlurb: "Safety & transport reliability matter most for comfort travelers.",
    gemsFilter: "All",
    gemsBlurb: "Curated spots — quality, reliable and hassle-free.",
  },
  {
    id: "adventure",
    label: "Adventure",
    emoji: "🏄",
    tagline: "Islands, trails & open roads",
    comparisonNote: "Highlighting transport flexibility & nature access.",
    plannerBlurb: "Includes activity costs — snorkeling, hikes & gear rentals.",
    scoreHighlight: ["transport"],
    scoreBlurb: "Transport flexibility is key for reaching remote spots.",
    gemsFilter: "Nature",
    gemsBlurb: "Trails, beaches, snorkeling spots & wild places.",
  },
];

export const PROFILE_MAP = new Map<TravelerProfileId, TravelerProfile>(
  PROFILES.map((p) => [p.id, p])
);

export const DEFAULT_PROFILE_ID: TravelerProfileId = "backpacker";
export const LS_KEY = "nomadready_profile";

// ─── Context ──────────────────────────────────────────────

export interface ProfileContextValue {
  profile: TravelerProfile;
  setProfileId: (id: TravelerProfileId) => void;
}

export const ProfileContext = createContext<ProfileContextValue>({
  profile: PROFILE_MAP.get(DEFAULT_PROFILE_ID)!,
  setProfileId: () => {},
});

export function useProfileContext() {
  return useContext(ProfileContext);
}
