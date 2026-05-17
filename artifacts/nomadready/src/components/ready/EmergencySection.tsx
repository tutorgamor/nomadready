import { SectionHeading } from './SectionHeading';
import type { EmergencyInfo, EmbassyInfo } from "@/lib/types";

type EmbassyKey =
  | "french_embassy_bangkok"
  | "french_embassy_kuala_lumpur"
  | "french_embassy_jakarta"
  | "french_consulate_bali"
  | "french_embassy_tbilisi"
  | "french_embassy_ankara"
  | "french_consulate_istanbul";

const EMBASSY_ENTRIES: { key: EmbassyKey; label: string }[] = [
  { key: "french_embassy_bangkok",       label: "French Embassy — Bangkok" },
  { key: "french_embassy_kuala_lumpur",  label: "French Embassy — Kuala Lumpur" },
  { key: "french_embassy_jakarta",       label: "French Embassy — Jakarta" },
  { key: "french_consulate_bali",        label: "French Consulate — Bali" },
  { key: "french_embassy_tbilisi",       label: "French Embassy — Tbilisi" },
  { key: "french_embassy_ankara",        label: "French Embassy — Ankara" },
  { key: "french_consulate_istanbul",    label: "French Consulate — Istanbul" },
];

export function EmergencySection({ emergency }: { emergency: EmergencyInfo }) {
  const numbers = [
    { label: "Police",    value: emergency.police },
    { label: "Ambulance", value: emergency.ambulance },
    { label: "Fire",      value: emergency.fire },
    ...(emergency.unified_emergency       ? [{ label: "Emergency",              value: emergency.unified_emergency }]       : []),
    ...(emergency.tourist_police          ? [{ label: "Tourist Police",          value: emergency.tourist_police }]          : []),
    ...(emergency.tourist_hotline         ? [{ label: "Tourist Hotline",         value: emergency.tourist_hotline }]         : []),
    ...(emergency.search_and_rescue       ? [{ label: "Search & Rescue",         value: emergency.search_and_rescue }]       : []),
    ...(emergency.tourist_police_istanbul ? [{ label: "Tourist Police Istanbul", value: emergency.tourist_police_istanbul }] : []),
  ];

  const frEmbassyEntry = EMBASSY_ENTRIES.find((e) => emergency[e.key] != null);
  const embassyLabel = frEmbassyEntry ? frEmbassyEntry.label : (emergency.embassy_label ?? null);
  const embassy = frEmbassyEntry
    ? (emergency[frEmbassyEntry.key] as EmbassyInfo)
    : (emergency.embassy ?? null);

  return (
    <div className="card">
      <SectionHeading category="emergency" style={{ marginBottom: "0.875rem" }}>Emergency Contacts</SectionHeading>

      {/* Numbers grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 130px), 1fr))",
          gap: "0.5rem",
          marginBottom: "1.25rem",
        }}
      >
        {numbers.map((n) => (
          <div
            key={n.label}
            style={{
              background: "var(--bg-base)",
              border: "1px solid var(--border)",
              borderRadius: "0.625rem",
              padding: "0.625rem 0.75rem",
            }}
          >
            <p
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                margin: "0 0 0.2rem",
              }}
            >
              {n.label}
            </p>
            <p
              style={{
                fontSize: "1.375rem",
                fontWeight: 700,
                color: "var(--danger)",
                letterSpacing: "-0.02em",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {n.value}
            </p>
          </div>
        ))}
      </div>

      {/* Embassy */}
      {embassy && embassyLabel && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", marginBottom: "1rem" }}>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              margin: "0 0 0.5rem",
            }}
          >
            {embassyLabel}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
              📞 {embassy.phone}
            </p>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: 0 }}>
              📍 {embassy.address}
            </p>
          </div>
          {embassy.verify_required && (
            <div
              style={{
                marginTop: "0.75rem",
                background: "var(--accent-light)",
                border: "1px solid var(--accent)",
                borderRadius: "0.5rem",
                padding: "0.5rem 0.75rem",
                fontSize: "0.8125rem",
                color: "var(--accent-dark)",
                display: "flex",
                gap: "0.5rem",
                alignItems: "flex-start",
              }}
            >
              <span aria-hidden="true">⚠️</span>
              <span>Verify contact details before travel.</span>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
        {emergency.notes}
      </p>
    </div>
  );
}
