"use client";

import { useProfileContext, type TravelerProfile } from "@/lib/profile";

interface ProfileNoteProps {
  field: keyof Pick<
    TravelerProfile,
    "insightLine" | "comparisonNote" | "plannerBlurb" | "scoreBlurb" | "gemsBlurb"
  >;
}

export function ProfileNote({ field }: ProfileNoteProps) {
  const { profile } = useProfileContext();
  return (
    <p
      style={{
        fontSize: "0.8rem",
        color: "var(--accent-dark, #7c4b2a)",
        margin: 0,
        fontStyle: "italic",
        opacity: 0.8,
        lineHeight: 1.5,
      }}
    >
      {profile[field]}
    </p>
  );
}
