import type { ChecklistItem, ChecklistPriority } from "@/lib/types";

const PRIORITY_CONFIG: Record<
  ChecklistPriority,
  { label: string; color: string; bg: string; borderColor: string }
> = {
  critical: { label: "Critical",  color: "var(--danger)",         bg: "#fef2f2",          borderColor: "#fca5a5" },
  high:     { label: "High",      color: "var(--warn)",           bg: "var(--accent-light)", borderColor: "var(--accent)" },
  medium:   { label: "Medium",    color: "var(--text-secondary)", bg: "var(--bg-base)",   borderColor: "var(--border)" },
  low:      { label: "Low",       color: "var(--text-muted)",     bg: "var(--bg-base)",   borderColor: "var(--border)" },
};

const PRIORITY_ORDER: ChecklistPriority[] = ["critical", "high", "medium", "low"];

export function ChecklistSection({ checklist }: { checklist: ChecklistItem[] }) {
  const grouped = PRIORITY_ORDER.reduce<Record<ChecklistPriority, ChecklistItem[]>>(
    (acc, p) => {
      acc[p] = checklist.filter((item) => item.priority === p);
      return acc;
    },
    { critical: [], high: [], medium: [], low: [] }
  );

  return (
    <div className="card">
      <p className="section-heading">Pre-trip Checklist</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {PRIORITY_ORDER.map((priority) => {
          const items = grouped[priority];
          if (items.length === 0) return null;
          const cfg = PRIORITY_CONFIG[priority];
          return (
            <div key={priority}>
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: cfg.color,
                  margin: "0 0 0.5rem",
                }}
              >
                {cfg.label}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                {items.map((item) => (
                  <div
                    key={item.item}
                    style={{
                      display: "flex",
                      gap: "0.625rem",
                      alignItems: "flex-start",
                      background: cfg.bg,
                      border: `1px solid ${cfg.borderColor}`,
                      borderRadius: "0.5rem",
                      padding: "0.5rem 0.75rem",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: cfg.color,
                        flexShrink: 0,
                        marginTop: "0.4rem",
                      }}
                    />
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)",
                        margin: 0,
                        lineHeight: 1.45,
                      }}
                    >
                      {item.item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
