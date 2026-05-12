"use client";

import { useEffect, useRef, useState } from "react";

const BASE_SECTIONS = [
  { id: "visa",       label: "🛂 Visa" },
  { id: "insurance",  label: "🏥 Insurance" },
  { id: "season",     label: "🌤️ Season" },
  { id: "budget",     label: "💸 Budget" },
  { id: "apps",       label: "📱 Apps" },
  { id: "transport",  label: "🚌 Transport" },
  { id: "scams",      label: "⚠️ Scams" },
  { id: "phrases",    label: "🗣️ Phrases" },
  { id: "emergency",  label: "🆘 Emergency" },
  { id: "checklist",  label: "✅ Checklist" },
] as const;

const NOTES_SECTION   = { id: "notes",   label: "📌 Notes"   } as const;
const GEMS_SECTION    = { id: "gems",    label: "💎 Gems"    } as const;
const REMOTE_SECTION  = { id: "remote",  label: "💻 Remote"  } as const;
const REALITY_SECTION = { id: "reality", label: "🧭 Reality" } as const;

type SectionId = (typeof BASE_SECTIONS)[number]["id"] | "notes" | "gems" | "remote" | "reality";

export function SectionNav({ hasGems = false, hasNotes = false, hasRemoteWork = false, hasNomadReality = false }: { hasGems?: boolean; hasNotes?: boolean; hasRemoteWork?: boolean; hasNomadReality?: boolean }) {
  const sections = [
    ...BASE_SECTIONS,
    ...(hasRemoteWork   ? [REMOTE_SECTION]  : []),
    ...(hasNomadReality ? [REALITY_SECTION] : []),
    ...(hasNotes        ? [NOTES_SECTION]   : []),
    ...(hasGems         ? [GEMS_SECTION]    : []),
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
      {sections.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <a
            key={id}
            href={`#${id}`}
            data-section={id}
            aria-current={isActive ? "true" : undefined}
            style={{
              display: "inline-flex",
              alignItems: "center",
              whiteSpace: "nowrap",
              flexShrink: 0,
              fontSize: "0.8125rem",
              fontWeight: isActive ? 600 : 400,
              padding: "0.3rem 0.75rem",
              borderRadius: "9999px",
              border: "1px solid",
              borderColor: isActive ? "var(--accent)" : "var(--border)",
              background: isActive ? "var(--accent-light)" : "var(--bg-card)",
              color: isActive ? "var(--accent-dark)" : "var(--text-secondary)",
              textDecoration: "none",
              transition: "background 0.12s, color 0.12s, border-color 0.12s, font-weight 0s",
            }}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
