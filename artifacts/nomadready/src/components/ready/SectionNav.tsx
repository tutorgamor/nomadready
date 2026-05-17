"use client";

import { useEffect, useRef, useState } from "react";
import { Magnetic } from "@/components/motion-primitives/magnetic";
import { CategoryIcon, type CategoryType } from "@/components/ready/CategoryIcon";

const SPRING = { stiffness: 26.7, damping: 4.1, mass: 0.2 };

const BASE_SECTIONS = [
  { id: "visa",       label: "Visa",       category: "visa"       as CategoryType },
  { id: "insurance",  label: "Insurance",  category: "insurance"  as CategoryType },
  { id: "season",     label: "Season",     category: "season"     as CategoryType },
  { id: "budget",     label: "Budget",     category: "budget"     as CategoryType },
  { id: "apps",       label: "Apps",       category: "apps"       as CategoryType },
  { id: "transport",  label: "Transport",  category: "transport"  as CategoryType },
  { id: "scams",      label: "Scams",      category: "scams"      as CategoryType },
  { id: "phrases",    label: "Phrases",    category: "phrases"    as CategoryType },
  { id: "emergency",  label: "Emergency",  category: "emergency"  as CategoryType },
  { id: "checklist",  label: "Checklist",  category: "checklist"  as CategoryType },
] as const;

const NOTES_SECTION   = { id: "notes",    label: "Notes",   category: "notes"     as CategoryType } as const;
const GEMS_SECTION    = { id: "gems",     label: "Gems",    category: "gems"      as CategoryType } as const;
const REMOTE_SECTION  = { id: "remote",   label: "Remote",  category: "remote"    as CategoryType } as const;
const REALITY_SECTION = { id: "reality",  label: "Reality", category: "reality"   as CategoryType } as const;
const MAP_SECTION     = { id: "city-map", label: "Map",     category: "map"       as CategoryType } as const;

type SectionId = (typeof BASE_SECTIONS)[number]["id"] | "notes" | "gems" | "remote" | "reality" | "city-map";

export function SectionNav({ hasGems = false, hasNotes = false, hasRemoteWork = false, hasNomadReality = false, hasCityMap = false }: { hasGems?: boolean; hasNotes?: boolean; hasRemoteWork?: boolean; hasNomadReality?: boolean; hasCityMap?: boolean }) {
  const sections = [
    ...BASE_SECTIONS,
    ...(hasRemoteWork   ? [REMOTE_SECTION]  : []),
    ...(hasNomadReality ? [REALITY_SECTION] : []),
    ...(hasNotes        ? [NOTES_SECTION]   : []),
    ...(hasGems         ? [GEMS_SECTION]    : []),
    ...(hasCityMap      ? [MAP_SECTION]     : []),
  ];
  const [active, setActive] = useState<SectionId>(BASE_SECTIONS[0].id);
  const navRef = useRef<HTMLElement>(null);

  // Track which section is in the top portion of the viewport
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (!el) continue;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id as SectionId);
        },
        // Section is "active" when it enters the top quarter of the viewport
        { rootMargin: "-10% 0px -78% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  // Keep the active pill horizontally centered inside the nav strip
  useEffect(() => {
    const nav = navRef.current;
    const pill = nav?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (!nav || !pill) return;

    const navRect = nav.getBoundingClientRect();
    const pillRect = pill.getBoundingClientRect();
    const targetLeft =
      nav.scrollLeft +
      pillRect.left -
      navRect.left -
      navRect.width / 2 +
      pillRect.width / 2;

    nav.scrollTo({ left: targetLeft, behavior: "smooth" });
  }, [active]);

  return (
    <nav
      ref={navRef}
      aria-label="Page sections"
      className="hide-scrollbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        display: "flex",
        gap: "0.375rem",
        overflowX: "auto",
        padding: "0.5rem var(--page-gutter)",
        background: "rgba(247, 243, 238, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {sections.map(({ id, label, category }) => {
        const isActive = active === id;
        return (
          <Magnetic key={id} intensity={0.2} range={80} actionArea="self" springOptions={SPRING}>
            <a
              href={`#${id}`}
              data-section={id}
              aria-current={isActive ? "true" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                whiteSpace: "nowrap",
                flexShrink: 0,
                fontSize: "0.75rem",
                fontWeight: isActive ? 600 : 500,
                letterSpacing: isActive ? "0.01em" : "0.005em",
                padding: "0.3rem 0.75rem 0.3rem 0.55rem",
                borderRadius: "9999px",
                border: "1.5px solid",
                borderColor: isActive ? "var(--accent)" : "var(--border-strong)",
                background: isActive ? "var(--accent)" : "var(--bg-card)",
                color: isActive ? "#ffffff" : "var(--text-secondary)",
                textDecoration: "none",
                transition: "background 150ms ease, color 150ms ease, border-color 150ms ease",
              }}
            >
              <CategoryIcon
                type={category}
                scale={0.72}
                color={isActive ? "rgba(255,255,255,0.92)" : undefined}
              />
              {label}
            </a>
          </Magnetic>
        );
      })}
    </nav>
  );
}
