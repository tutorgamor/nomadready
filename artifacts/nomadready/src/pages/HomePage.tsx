import { useMemo } from "react";
import { useSearch } from "wouter";
import passportsDataRaw from "@/data/passports.json";
import destinationsDataRaw from "@/data/destinations.json";
import type { Passport, Destination, ReadyData } from "@/lib/types";
import { PassportSidebar } from "@/components/PassportSidebar";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { ProfileNote } from "@/components/ProfileNote";
import { InsightsPanel } from "@/components/InsightsPanel";
import { AmbientLayer } from "@/components/home/AmbientLayer";
import { PassportGatewayHero } from "@/components/home/PassportGatewayHero";
import { OpenGatewayLink } from "@/components/home/OpenGatewayLink";
import { HeroCrossfade } from "@/components/home/HeroCrossfade";
import { HeroReel } from "@/components/home/HeroReel";
import { DestinationPicker, type DestSummary } from "@/components/home/DestinationPicker";
import { GlobeMap } from "@/components/motion/GlobeMap";
import { FieldNote } from "@/components/home/FieldNote";
import { getT } from "@/lib/i18n";
import { InView } from "@/components/motion-primitives/in-view";
import type { UseInViewOptions } from "motion/react";

const passports = passportsDataRaw as Passport[];
const destinations = destinationsDataRaw as Destination[];

// Eagerly load all ready JSON files at build time
const readyFiles = import.meta.glob<ReadyData>("../data/ready/*.json", {
  eager: true,
  import: "default",
});

function formatVisa(visa: ReadyData["visa"]): string {
  const d = `· ${visa.duration_days}d`;
  switch (visa.type) {
    case "Visa Exemption":  return `Free ${d}`;
    case "e-Visa":          return `e-Visa ${d}`;
    case "Visa on Arrival": return `On arrival ${d}`;
    default:                return visa.type;
  }
}

function formatBudget(budget: ReadyData["budget"]): string {
  const tier = budget.tiers.budget;
  const amount = tier.daily_thb ?? tier.daily_myr ?? tier.daily_idr ?? tier.daily_gel ?? tier.daily_try ?? tier.daily_vnd ?? tier.daily_php ?? tier.daily_jpy ?? tier.daily_krw ?? null;
  return amount != null ? `${budget.currency_symbol}${amount}/d` : "—";
}

function formatMonths(months: ReadyData["best_season"]["overall_best_months"]): string {
  if (!months || months.length === 0) return "—";
  if (months.length === 1) return months[0];
  return `${months[0]}–${months[months.length - 1]}`;
}

const HERO_IMGS = {
  main:   "/assets/hero/hero-cinematic.jpg",
  tropic: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=78&auto=format&fit=crop",
  japan:  "/assets/hero/polaroid-japan.webp",
};

const REVEAL = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0  },
};
const REVEAL_TX   = { duration: 0.55, ease: [0.25, 1, 0.5, 1] };
const REVEAL_OPTS: UseInViewOptions = { once: true, amount: 0.2 };

function getReadyData(passportId: string): {
  summaries: Map<string, DestSummary>;
  budgetRecord: Record<string, ReadyData["budget"]>;
  availableDestinations: Destination[];
} {
  const summaries = new Map<string, DestSummary>();
  const budgetRecord: Record<string, ReadyData["budget"]> = {};
  const availableIds = new Set<string>();

  for (const [path, data] of Object.entries(readyFiles)) {
    const filename = path.split("/").pop()!;
    if (!filename.startsWith(`${passportId}-`)) continue;
    const destId = filename.slice(passportId.length + 1, -5);
    availableIds.add(destId);
    try {
      summaries.set(destId, {
        visaLabel:  formatVisa(data.visa),
        budgetFrom: formatBudget(data.budget),
        bestMonths: formatMonths(data.best_season.overall_best_months),
      });
      budgetRecord[destId] = data.budget;
    } catch {
      // skip missing/unreadable data
    }
  }

  const availableDestinations = destinations.filter((d) => availableIds.has(d.id));
  return { summaries, budgetRecord, availableDestinations };
}

export default function HomePage() {
  const search = useSearch();
  const params = new URLSearchParams(search ?? "");
  const passportParam = params.get("passport");
  const activePassportId = passports.some((p) => p.id === passportParam)
    ? passportParam!
    : "fr";
  const passportCurrency = passports.find((p) => p.id === activePassportId)?.currency ?? "EUR";
  const t = getT(activePassportId);

  const { summaries, budgetRecord, availableDestinations } = useMemo(
    () => getReadyData(activePassportId),
    [activePassportId]
  );

  return (
    <main style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <PassportGatewayHero defaultPassportId={activePassportId} />
      <AmbientLayer />

      <header
        className="home-header"
        style={{
          background: "var(--bg-base)",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <HeroCrossfade />
        <PassportSidebar passports={passports} activeId={activePassportId} />
        <div className="home-hero-overlay" aria-hidden="true" />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "55%",
            height: "100%",
            background: "radial-gradient(ellipse 75% 65% at 85% 25%, rgba(217,119,6,0.13) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "44px",
            zIndex: 3,
            pointerEvents: "none",
          }}
        >
          <svg viewBox="0 0 1440 44" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <path d="M0 28 Q240 8 480 22 Q720 36 960 14 Q1200 0 1440 18 L1440 44 L0 44 Z" fill="var(--bg-base)" />
            <path d="M0 36 Q360 28 720 34 Q1080 40 1440 30 L1440 44 L0 44 Z" fill="var(--bg-base)" opacity="0.6" />
          </svg>
        </div>

        {/* ── Editorial masthead — desktop only, pub-style top bar ── */}
        <div className="home-hero-wordmark anim-fade-down" aria-label="NomadReady">
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.96)" }}>
                Nomad<span style={{ color: "var(--accent)" }}>Ready</span>
              </span>
            </div>
            <span aria-hidden="true" style={{ width: "1px", height: "14px", background: "rgba(255,255,255,0.18)", display: "block", flexShrink: 0 }} />
            <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)" }}>
              Travel Field Guide
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <span style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(255,255,255,0.30)" }}>
              Vol. I · 2026
            </span>
          </div>
        </div>

        <div className="page-container" style={{ position: "relative", zIndex: 4, flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div className="home-hero-layout">
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div className="home-wordmark-inline anim-fade-down" style={{ alignItems: "center", gap: "0.4rem" }}>
                <span className="hero-text-light" style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.03em" }}>Nomad</span>
                <span style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--accent)" }}>Ready</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <p className="anim-fade-up anim-delay-1" style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", margin: 0 }}>
                  Travel field guide
                </p>
                <h1 className="hero-heading-light anim-reveal" style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3rem, 6.5vw, 6.5rem)",
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.0,
                  margin: 0,
                }}>
                  {t.headlineLine1}<br />{t.headlineLine2}
                </h1>
                <p className="hero-text-light-sub anim-fade-up anim-delay-3" style={{ fontSize: "0.9375rem", margin: 0, maxWidth: "34ch", lineHeight: 1.55 }}>
                  {t.subtitle}
                </p>
              </div>

              <div className="hero-controls-glass anim-fade-up anim-delay-5">
                <ProfileDropdown />
                <ProfileNote field="insightLine" />
                <OpenGatewayLink />
              </div>
            </div>

            <div className="home-hero-aside anim-fade-up anim-delay-2" aria-hidden="true">
              <HeroReel destCount={availableDestinations.length} />
            </div>
          </div>

          <div className="home-hero-mobile-scene" aria-hidden="true">
            <div style={{ position: "relative", width: "100%", height: "185px", borderRadius: "1rem", overflow: "hidden" }}>
              <img src={HERO_IMGS.main} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" decoding="async" />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 38%, rgba(0,0,0,0.35) 100%)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.14) 0%, transparent 55%)" }} />
              <div style={{ position: "absolute", top: "10px", right: "10px", transform: "rotate(3.5deg)", background: "#ffffff", padding: "5px 5px 18px", borderRadius: "3px", width: "82px", boxShadow: "0 6px 18px rgba(0,0,0,0.3)", zIndex: 10 }}>
                <img src={HERO_IMGS.japan} alt="" style={{ width: "100%", height: "54px", objectFit: "cover", display: "block" }} loading="lazy" decoding="async" />
              </div>
              <div style={{ position: "absolute", top: "10px", left: "10px", transform: "rotate(-3deg)", width: "68px", height: "52px", borderRadius: "6px", overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.65)", zIndex: 10 }}>
                <img src={HERO_IMGS.tropic} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" decoding="async" />
              </div>
              <div style={{ position: "absolute", bottom: "10px", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                <span style={{ fontSize: "0.625rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)", background: "rgba(0,0,0,0.32)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", padding: "0.2rem 0.75rem", borderRadius: "9999px" }}>
                  {availableDestinations.length} destinations
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Destination picker — all destinations ───────────── */}
      <section style={{ paddingTop: "3.5rem", paddingBottom: "0.5rem" }} aria-label="Destinations">
        <InView variants={REVEAL} transition={{ ...REVEAL_TX, delay: 0.08 }} viewOptions={REVEAL_OPTS}>
          <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <h2 className="section-label-editorial">
              {availableDestinations.length} destinations — explore the map
            </h2>
            <DestinationPicker
              destinations={availableDestinations}
              summaries={summaries}
              passportId={activePassportId}
            />
          </div>
        </InView>
      </section>

      {/* ── Field Note — editorial pause between grid and globe ── */}
      <section style={{ paddingTop: "1rem", paddingBottom: "3.5rem" }}>
        <InView variants={REVEAL} transition={{ ...REVEAL_TX, delay: 0.05 }} viewOptions={REVEAL_OPTS}>
          <div className="page-container">
            <FieldNote />
          </div>
        </InView>
      </section>

      <section style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>
        <InView variants={REVEAL} transition={REVEAL_TX} viewOptions={REVEAL_OPTS}>
          <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <h2 className="section-label-editorial">
                <span aria-hidden="true" style={{ color: "var(--accent)", opacity: 0.5 }}>⊞</span>
                {t.quickComparison}
              </h2>
              <ProfileNote field="comparisonNote" />
            </div>

            <GlobeMap />

            <InsightsPanel
              destinations={availableDestinations}
              summaries={summaries}
              budgets={budgetRecord}
              passportCurrency={passportCurrency}
            />
          </div>
        </InView>
      </section>

      <footer style={{ borderTop: "1px solid rgba(180,130,65,0.22)", paddingBlock: "1.5rem" }}>
        <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-muted)" }}>NomadReady</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, textAlign: "right", lineHeight: 1.5 }}>
            Always verify visa and entry rules with official sources before booking.
            NomadReady is a research aid, not legal advice.
          </p>
        </div>
      </footer>
    </main>
  );
}
