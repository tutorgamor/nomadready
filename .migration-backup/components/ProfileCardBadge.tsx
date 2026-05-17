"use client";

import { useProfileContext } from "@/lib/profile";
import type { TravelScore } from "@/lib/types";

type BadgeConfig = { label: string; scoreKey: keyof TravelScore | null };

const BADGE_CONFIG: Record<string, BadgeConfig> = {
  backpacker:    { label: "Budget",    scoreKey: "budget" },
  digital_nomad: { label: "Internet",  scoreKey: "internet" },
  food_explorer: { label: "Local gems", scoreKey: null },
  comfort:       { label: "Transport", scoreKey: "transport" },
  adventure:     { label: "Transport", scoreKey: "transport" },
};

export function ProfileCardBadge({ travelScore }: { travelScore?: TravelScore }) {
  const { profile } = useProfileContext();
  const config = BADGE_CONFIG[profile.id] ?? BADGE_CONFIG.backpacker;
  const score = config.scoreKey && travelScore ? travelScore[config.scoreKey] : null;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: "0.6875rem",
        fontWeight: 600,
        letterSpacing: "0.04em",
        color: "var(--accent-dark, #7c4b2a)",
        background: "var(--accent-light, #fdf6ee)",
        border: "1px solid var(--accent, #c8824a)",
        borderRadius: "9999px",
        padding: "0.2rem 0.6rem",
      }}
    >
      {score != null ? `${config.label} · ${score}` : config.label}
    </span>
  );
}
