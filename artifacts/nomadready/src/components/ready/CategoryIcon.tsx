// Animated SVG icons — one per destination page category.
// Pure SVG + CSS animations: server-renderable, no JS dependency.
// Each icon uses currentColor so the parent element controls hue.

export type CategoryType =
  | "visa" | "insurance" | "season" | "budget" | "apps"
  | "transport" | "scams" | "phrases" | "emergency" | "checklist"
  | "notes" | "gems" | "remote" | "reality" | "map";

const SIZE = 18;
const SW   = 1.5;  // stroke-width

// ── Individual icons ────────────────────────────────────────────

const VisaIcon = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 18 18" fill="none"
    stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect x="3" y="2" width="12" height="14" rx="1.5" className="cat-icon-draw" />
    <circle cx="9" cy="8.5" r="2.8" className="cat-icon-pulse-ring" />
    <path d="M7.2 8.5 L8.4 9.7 L11 7.2" className="cat-icon-check-draw" />
    <line x1="5.5" y1="12.5" x2="12.5" y2="12.5" strokeOpacity="0.4" />
  </svg>
);

const InsuranceIcon = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 18 18" fill="none"
    stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M9 2 L14.5 4.8 L14.5 9.5 Q14.5 13.5 9 16 Q3.5 13.5 3.5 9.5 L3.5 4.8 Z"
      className="cat-icon-draw" />
    <path d="M6.5 9 L8 10.5 L11.5 7" className="cat-icon-check-draw" />
  </svg>
);

const SeasonIcon = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 18 18" fill="none"
    stroke="currentColor" strokeWidth={SW} strokeLinecap="round"
    aria-hidden="true">
    <circle cx="9" cy="9" r="3" />
    <g className="cat-icon-spin-slow" style={{ transformOrigin: "9px 9px" }}>
      <line x1="9" y1="1.5" x2="9" y2="4" />
      <line x1="9" y1="14" x2="9" y2="16.5" />
      <line x1="1.5" y1="9" x2="4" y2="9" />
      <line x1="14" y1="9" x2="16.5" y2="9" />
      <line x1="3.64" y1="3.64" x2="5.41" y2="5.41" />
      <line x1="12.59" y1="12.59" x2="14.36" y2="14.36" />
      <line x1="14.36" y1="3.64" x2="12.59" y2="5.41" />
      <line x1="5.41" y1="12.59" x2="3.64" y2="14.36" />
    </g>
  </svg>
);

const BudgetIcon = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 18 18" fill="none"
    stroke="currentColor" strokeWidth={SW} strokeLinecap="round"
    aria-hidden="true">
    <circle cx="9" cy="9" r="6" className="cat-icon-pulse-ring" />
    <path d="M9 5.5 L9 12.5" />
    <path d="M7 7 Q9 5.5 11 7 Q13 8.5 11 9.5 L9 10 L11 10.5 Q13 11.5 11 12.5 Q9 13.5 7 12.5"
      className="cat-icon-draw" />
  </svg>
);

const AppsIcon = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 18 18" fill="none"
    stroke="currentColor" strokeWidth={SW} strokeLinecap="round"
    aria-hidden="true">
    {[4, 9, 14].flatMap((cx) =>
      [4, 9, 14].map((cy) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.2"
          fill="currentColor" stroke="none"
          className="cat-icon-dot-in"
          style={{ animationDelay: `${(cx + cy) * 0.04}s` }}
        />
      ))
    )}
  </svg>
);

const TransportIcon = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 18 18" fill="none"
    stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <g className="cat-icon-slide-right">
      <line x1="2" y1="9" x2="16" y2="9" />
      <polyline points="11 5 16 9 11 13" />
      <line x1="2" y1="5" x2="7" y2="5" strokeOpacity="0.35" />
      <line x1="2" y1="13" x2="7" y2="13" strokeOpacity="0.35" />
    </g>
  </svg>
);

const ScamsIcon = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 18 18" fill="none"
    stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M9 2.5 L16 14.5 L2 14.5 Z" className="cat-icon-blink-alert" />
    <line x1="9" y1="7.5" x2="9" y2="10.5" />
    <circle cx="9" cy="12.2" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

const PhrasesIcon = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 18 18" fill="none"
    stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M3 4 Q3 2 5 2 L13 2 Q15 2 15 4 L15 10 Q15 12 13 12 L10 12 L7 16 L7 12 L5 12 Q3 12 3 10 Z"
      className="cat-icon-draw" />
    <line x1="6" y1="6" x2="12" y2="6" strokeOpacity="0.5" />
    <line x1="6" y1="8.5" x2="10" y2="8.5" strokeOpacity="0.5" />
  </svg>
);

const EmergencyIcon = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 18 18" fill="none"
    stroke="currentColor" strokeWidth={SW} strokeLinecap="round"
    aria-hidden="true">
    <circle cx="9" cy="9" r="6.5" className="cat-icon-pulse-ring" />
    <line x1="9" y1="5.5" x2="9" y2="12.5" strokeWidth="2" className="cat-icon-draw" />
    <line x1="5.5" y1="9" x2="12.5" y2="9" strokeWidth="2" className="cat-icon-draw" />
  </svg>
);

const ChecklistIcon = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 18 18" fill="none"
    stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect x="3" y="3" width="12" height="12" rx="2" className="cat-icon-draw" />
    <path d="M6 9 L8 11 L12 7" className="cat-icon-check-draw" />
  </svg>
);

const NotesIcon = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 18 18" fill="none"
    stroke="currentColor" strokeWidth={SW} strokeLinecap="round"
    aria-hidden="true">
    <rect x="3.5" y="2" width="11" height="14" rx="1.5" className="cat-icon-draw" />
    <g strokeOpacity="0.55">
      <line x1="6.5" y1="6" x2="11.5" y2="6"
        style={{ strokeDasharray: 6, strokeDashoffset: 6, animation: "cat-draw-line 0.4s ease-out 0.3s forwards" }} />
      <line x1="6.5" y1="9" x2="11.5" y2="9"
        style={{ strokeDasharray: 6, strokeDashoffset: 6, animation: "cat-draw-line 0.4s ease-out 0.5s forwards" }} />
      <line x1="6.5" y1="12" x2="9.5" y2="12"
        style={{ strokeDasharray: 4, strokeDashoffset: 4, animation: "cat-draw-line 0.4s ease-out 0.7s forwards" }} />
    </g>
  </svg>
);

const GemsIcon = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 18 18" fill="none"
    stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <g className="cat-icon-pulse-ring">
      <polygon points="9,2 16,7 13,16 5,16 2,7" className="cat-icon-draw" />
      <line x1="2" y1="7" x2="16" y2="7" strokeOpacity="0.4" />
      <line x1="5" y1="16" x2="9" y2="7" strokeOpacity="0.4" />
      <line x1="13" y1="16" x2="9" y2="7" strokeOpacity="0.4" />
    </g>
  </svg>
);

const RemoteIcon = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 18 18" fill="none"
    stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect x="2" y="3.5" width="14" height="9" rx="1.5" className="cat-icon-draw" />
    <line x1="5.5" y1="14.5" x2="12.5" y2="14.5" />
    <line x1="9" y1="12.5" x2="9" y2="14.5" />
    <line x1="5" y1="7" x2="7" y2="7" strokeOpacity="0.5"
      style={{ strokeDasharray: 2, strokeDashoffset: 2, animation: "cat-draw-line 0.2s ease-out 0.6s forwards, cat-type-cursor 1.2s ease-in-out 0.9s infinite" }} />
  </svg>
);

const RealityIcon = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 18 18" fill="none"
    stroke="currentColor" strokeWidth={SW} strokeLinecap="round"
    aria-hidden="true">
    <circle cx="9" cy="9" r="7" />
    <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
    <g className="cat-icon-spin-medium" style={{ transformOrigin: "9px 9px" }}>
      <line x1="9" y1="4" x2="9" y2="7.5" strokeWidth="2" />
      <line x1="9" y1="10.5" x2="9" y2="14" strokeOpacity="0.35" />
    </g>
    <line x1="3" y1="9" x2="4.5" y2="9" strokeOpacity="0.3" />
    <line x1="13.5" y1="9" x2="15" y2="9" strokeOpacity="0.3" />
  </svg>
);

const MapIcon = () => (
  <svg width={SIZE} height={SIZE} viewBox="0 0 18 18" fill="none"
    stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M9 2 Q13.5 2 13.5 7 Q13.5 11 9 16 Q4.5 11 4.5 7 Q4.5 2 9 2 Z"
      className="cat-icon-drop" />
    <circle cx="9" cy="7.5" r="2" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

// ── Color map ────────────────────────────────────────────────────

export const CATEGORY_COLOR: Record<CategoryType, string> = {
  visa:       "var(--accent)",
  insurance:  "#3A7CA5",
  season:     "#D97B2A",
  budget:     "#2E6B4E",
  apps:       "#3A7CA5",
  transport:  "#5A9672",
  scams:      "var(--danger)",
  phrases:    "var(--accent)",
  emergency:  "var(--danger)",
  checklist:  "var(--ok)",
  notes:      "var(--text-secondary)",
  gems:       "var(--accent)",
  remote:     "#3A7CA5",
  reality:    "#2E6B4E",
  map:        "var(--accent)",
};

const ICON_MAP: Record<CategoryType, () => React.ReactElement> = {
  visa:       VisaIcon,
  insurance:  InsuranceIcon,
  season:     SeasonIcon,
  budget:     BudgetIcon,
  apps:       AppsIcon,
  transport:  TransportIcon,
  scams:      ScamsIcon,
  phrases:    PhrasesIcon,
  emergency:  EmergencyIcon,
  checklist:  ChecklistIcon,
  notes:      NotesIcon,
  gems:       GemsIcon,
  remote:     RemoteIcon,
  reality:    RealityIcon,
  map:        MapIcon,
};

interface CategoryIconProps {
  type: CategoryType;
  /** Override the category color — e.g. "white" for active nav pills */
  color?: string;
  /** Scale factor relative to the base 18px size (default 1) */
  scale?: number;
}

export function CategoryIcon({ type, color, scale = 1 }: CategoryIconProps) {
  const Icon  = ICON_MAP[type];
  const c     = color ?? CATEGORY_COLOR[type];
  return (
    <span
      aria-hidden="true"
      style={{
        color: c,
        display: "inline-flex",
        flexShrink: 0,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "center",
      }}
    >
      <Icon />
    </span>
  );
}
