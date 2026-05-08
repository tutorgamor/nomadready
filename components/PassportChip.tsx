import type { Passport } from "@/lib/types";

interface PassportChipProps {
  passport: Passport;
}

/**
 * PassportChip
 *
 * Displays the currently selected passport.
 * In v1 only France is available, so this acts as a display chip.
 * V2 will make this an interactive selector.
 */
export function PassportChip({ passport }: PassportChipProps) {
  return (
    <div className="passport-chip">
      <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>{passport.emoji}</span>
      <span>{passport.label} passport</span>
      {/* Lock icon — indicates only one passport in v1 */}
      <span
        style={{
          marginLeft: "0.15rem",
          fontSize: "0.7rem",
          color: "var(--text-muted)",
        }}
        aria-label="Only passport available in this version"
        title="More passports coming soon"
      >
        🔒
      </span>
    </div>
  );
}
