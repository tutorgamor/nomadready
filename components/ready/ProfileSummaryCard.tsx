"use client";

import { useProfileContext } from "@/lib/profile";
import type { TravelScore } from "@/lib/types";

interface ProfileSummaryCardProps {
  travelScore: TravelScore | null;
  budgetLow: string;
  budgetMid: string;
  bestMonths: string;
  hasLocalGems: boolean;
}

interface StatItem { label: string; value: string }

export function ProfileSummaryCard({
  travelScore,
  budgetLow,
  budgetMid,
  bestMonths,
  hasLocalGems,
}: ProfileSummaryCardProps) {
  const { profile } = useProfileContext();

  let summaryLine = "";
  let statItems: StatItem[] = [];

  switch (profile.id) {
    case "backpacker":
      summaryLine = "Focus on the cheapest daily budget and hostel-friendly transport.";
      statItems = [
        { label: "Budget from", value: budgetLow },
        { label: "Budget score", value: travelScore ? `${travelScore.budget}/100` : "—" },
      ];
      break;
    case "digital_nomad":
      summaryLine = "Check internet reliability and the local nomad scene before booking.";
      statItems = [
        { label: "Internet score", value: travelScore ? `${travelScore.internet}/100` : "—" },
        { label: "Nomad-friendly", value: travelScore ? `${travelScore.nomad_friendly}/100` : "—" },
      ];
      break;
    case "food_explorer":
      summaryLine = "Dive into the Local Gems section for curated food picks.";
      statItems = [
        { label: "Budget from", value: budgetLow },
        { label: "Local gems", value: hasLocalGems ? "Curated" : "Coming soon" },
      ];
      break;
    case "comfort":
      summaryLine = "Prioritize mid-tier stays — safety and transport matter most.";
      statItems = [
        { label: "Safety score", value: travelScore ? `${travelScore.safety}/100` : "—" },
        { label: "Transport score", value: travelScore ? `${travelScore.transport}/100` : "—" },
      ];
      break;
    case "adventure":
      summaryLine = "Check transport access for islands, hikes, and remote spots.";
      statItems = [
        { label: "Transport score", value: travelScore ? `${travelScore.transport}/100` : "—" },
        { label: "Best months", value: bestMonths },
      ];
      break;
  }

  return (
    <div
      className="card"
      style={{
        border: "1px solid var(--accent, #c8824a)",
        background: "var(--accent-light, #fdf6ee)",
      }}
    >
      <p
        style={{
          fontSize: "0.6875rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--accent-dark, #7c4b2a)",
          margin: "0 0 0.375rem",
        }}
      >
        For {profile.label} travelers
      </p>
      <p
        style={{
          fontSize: "0.8125rem",
          color: "var(--text-secondary)",
          margin: "0 0 0.875rem",
          lineHeight: 1.5,
        }}
      >
        {summaryLine}
      </p>
      <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
        {statItems.map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "rgba(255,255,255,0.7)",
              border: "1px solid var(--border)",
              borderRadius: "0.625rem",
              padding: "0.5rem 0.875rem",
              minWidth: "80px",
            }}
          >
            <p
              style={{
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                margin: "0 0 0.2rem",
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
