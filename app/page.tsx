import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import passportsData from "@/data/passports.json";
import destinationsData from "@/data/destinations.json";
import type { Passport, Destination, ReadyData } from "@/lib/types";
import { PassportSelector } from "@/components/PassportSelector";
import { ProfileSelector } from "@/components/ProfileSelector";
import { ProfileNote } from "@/components/ProfileNote";
import { DestinationCard } from "@/components/DestinationCard";
import type { DestinationSummary } from "@/components/DestinationCard";
import { ComparisonStrip } from "@/components/ComparisonStrip";
import { TripPlanner } from "@/components/TripPlanner";

export const metadata: Metadata = {
  title: { absolute: "NomadReady — Travel Readiness for Backpackers" },
  description:
    "One scroll, one page: visa rules, budget tiers, common scams, local phrases and more — tailored to your passport.",
};

const passports = passportsData as Passport[];
const destinations = destinationsData as Destination[];

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

interface AtlasCard {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  rotate: string;
  w: string;
  h: string;
}

const ATLAS_CARDS: AtlasCard[] = [
  { top: "10px",   left: "10px",   rotate: "-3deg",   w: "86px",  h: "70px"  },
  { top: "18px",   right: "10px",  rotate: "2.5deg",  w: "84px",  h: "68px"  },
  { top: "108px",  left: "120px",  rotate: "-1.5deg", w: "100px", h: "82px"  },
  { bottom: "20px", left: "16px",  rotate: "2deg",    w: "84px",  h: "68px"  },
  { bottom: "28px", right: "12px", rotate: "-2.5deg", w: "86px",  h: "70px"  },
];

interface HomePageProps {
  searchParams: Promise<{ passport?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const activePassportId = passports.some((p) => p.id === params.passport)
    ? params.passport!
    : "fr";
  const passportCurrency = passports.find((p) => p.id === activePassportId)?.currency ?? "EUR";

  const dir = path.join(process.cwd(), "data", "ready");
  const availableIds = new Set(
    fs
      .readdirSync(dir)
      .filter((f) => f.startsWith(`${activePassportId}-`) && f.endsWith(".json"))
      .map((f) => f.slice(activePassportId.length + 1, -5))
  );
  const availableDestinations = destinations.filter((d) => availableIds.has(d.id));

  const summaries = new Map<string, DestinationSummary>();
  const budgetRecord: Record<string, ReadyData["budget"]> = {};
  for (const dest of availableDestinations) {
    try {
      const data = JSON.parse(
        fs.readFileSync(path.join(dir, `${activePassportId}-${dest.id}.json`), "utf-8")
      ) as ReadyData;
      summaries.set(dest.id, {
        visaLabel:  formatVisa(data.visa),
        budgetFrom: formatBudget(data.budget),
        bestMonths: formatMonths(data.best_season.overall_best_months),
      });
      budgetRecord[dest.id] = data.budget;
    } catch {
      // missing or unreadable file — card renders without highlights
    }
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Hero / header section ─────────────────────────────── */}
      <header
        className="home-header"
        style={{
          background: "linear-gradient(175deg, #e8ddd0 0%, #ede4d7 28%, #f2ebe1 62%, var(--bg-base) 100%)",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Amber radial glow — warm atmospheric light */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "55%",
            height: "100%",
            background: "radial-gradient(ellipse 75% 65% at 85% 25%, rgba(217,119,6,0.07) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {/* Terrain wave — landscape horizon transition to content */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "44px",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <svg
            viewBox="0 0 1440 44"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            <path
              d="M0 28 Q240 8 480 22 Q720 36 960 14 Q1200 0 1440 18 L1440 44 L0 44 Z"
              fill="var(--bg-base)"
            />
            <path
              d="M0 36 Q360 28 720 34 Q1080 40 1440 30 L1440 44 L0 44 Z"
              fill="var(--bg-base)"
              opacity="0.6"
            />
          </svg>
        </div>
        <div className="page-container">
          <div className="home-hero-layout">

            {/* ── Left: text + selector ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* Brand wordmark */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.9rem", color: "var(--accent)", lineHeight: 1, marginTop: "1px" }} aria-hidden="true">✦</span>
                <span style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>Nomad</span>
                <span style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--accent)" }}>Ready</span>
              </div>

              {/* Headline */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", margin: 0, opacity: 0.85 }}>
                  Travel field guide
                </p>
                <h1 style={{ fontSize: "clamp(2rem, 7vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.045em", color: "var(--text-primary)", lineHeight: 1.1, margin: 0 }}>
                  Where are you<br />heading next?
                </h1>
                <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", margin: 0, maxWidth: "32ch", lineHeight: 1.55 }}>
                  Get your full travel brief in one scroll — visa, budget, scams and more.
                </p>
              </div>

              {/* Passport selector */}
              <PassportSelector passports={passports} activeId={activePassportId} />

              {/* Profile selector */}
              <ProfileSelector />

              {/* Personalized insight line */}
              <ProfileNote field="insightLine" />

            </div>

            {/* ── Right: Illustrated travel atlas composition (desktop only) ── */}
            <div className="home-hero-aside" aria-hidden="true">

              {/* Travel atlas scene — layered illustrated landscape with floating destinations */}
              <div style={{ position: "relative", width: "340px", height: "300px" }}>

                {/* Layered landscape background */}
                <svg
                  viewBox="0 0 340 300"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    borderRadius: "1.25rem",
                    overflow: "hidden",
                  }}
                >
                  <defs>
                    <linearGradient id="heroSceneSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#bde0f4" />
                      <stop offset="38%" stopColor="#cce8d6" />
                      <stop offset="100%" stopColor="#e2d9c6" />
                    </linearGradient>
                  </defs>
                  {/* Sky fill */}
                  <rect width="340" height="300" rx="20" ry="20" fill="url(#heroSceneSky)" />
                  {/* Sun glow */}
                  <circle cx="292" cy="55" r="26" fill="rgba(255,185,50,0.15)" />
                  <circle cx="292" cy="55" r="15" fill="rgba(255,210,70,0.28)" />
                  {/* Cloud clusters */}
                  <ellipse cx="56"  cy="42" rx="40" ry="13" fill="rgba(255,255,255,0.55)" />
                  <ellipse cx="74"  cy="33" rx="28" ry="10" fill="rgba(255,255,255,0.42)" />
                  <ellipse cx="230" cy="28" rx="36" ry="12" fill="rgba(255,255,255,0.50)" />
                  <ellipse cx="250" cy="20" rx="24" ry="8"  fill="rgba(255,255,255,0.38)" />
                  <ellipse cx="290" cy="36" rx="22" ry="7"  fill="rgba(255,255,255,0.30)" />
                  {/* Background mountain ridge */}
                  <path d="M0 145 Q45 88 108 122 Q148 145 196 100 Q238 62 290 96 Q318 114 340 90 L340 195 L0 195 Z" fill="rgba(155,201,165,0.28)" />
                  {/* Midground terrain */}
                  <path d="M0 185 Q65 155 160 174 Q238 190 340 160 L340 300 L0 300 Z" fill="rgba(155,201,165,0.42)" />
                  {/* Foreground water */}
                  <path d="M0 248 Q82 232 188 242 Q268 250 340 236 L340 300 L0 300 Z" fill="rgba(167,213,247,0.45)" />
                  <path d="M0 268 Q108 256 224 264 Q294 270 340 258 L340 300 L0 300 Z" fill="rgba(167,213,247,0.28)" />
                  {/* Dotted travel routes between destinations */}
                  <path d="M55 80 Q88 118 163 170"   stroke="rgba(217,119,6,0.30)" strokeWidth="1.5" strokeDasharray="4 6" fill="none" />
                  <path d="M177 165 Q212 112 266 82"  stroke="rgba(217,119,6,0.30)" strokeWidth="1.5" strokeDasharray="4 6" fill="none" />
                  <path d="M148 192 Q102 218 62 248"  stroke="rgba(217,119,6,0.22)" strokeWidth="1.5" strokeDasharray="4 6" fill="none" />
                  <path d="M192 192 Q232 220 268 244" stroke="rgba(217,119,6,0.22)" strokeWidth="1.5" strokeDasharray="4 6" fill="none" />
                </svg>

                {/* Floating destination cards — positioned at scene landmarks */}
                {availableDestinations.slice(0, 5).map((dest, i) => {
                  const cfg = ATLAS_CARDS[i];
                  const isFocal = i === 2;
                  return (
                    <div
                      key={dest.id}
                      style={{
                        position: "absolute",
                        top: cfg.top,
                        bottom: cfg.bottom,
                        left: cfg.left,
                        right: cfg.right,
                        transform: `rotate(${cfg.rotate})`,
                        width: cfg.w,
                        height: cfg.h,
                        backgroundColor: dest.cover_color,
                        borderRadius: "0.75rem",
                        overflow: "hidden",
                        boxShadow: isFocal
                          ? "0 8px 28px rgba(0,0,0,0.22), 0 0 0 2px rgba(255,255,255,0.38)"
                          : "0 4px 14px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.22)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: "0.4rem 0.5rem",
                      }}
                    >
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(150deg, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.12) 100%)" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.28) 0%, transparent 60%)" }} />
                      <svg viewBox="0 0 100 82" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                        <ellipse cx="70" cy="18" rx="20" ry="6" fill="rgba(255,255,255,0.10)" />
                        <path d="M-5 50 Q22 28 50 42 Q76 56 105 36 L105 90 L-5 90 Z" fill="rgba(255,255,255,0.12)" />
                        <path d="M-5 64 Q30 52 65 60 Q85 66 105 56 L105 90 L-5 90 Z" fill="rgba(255,255,255,0.08)" />
                      </svg>
                      <span style={{ position: "relative", fontSize: isFocal ? "1.7rem" : "1.375rem", lineHeight: 1, filter: "drop-shadow(0 1px 5px rgba(0,0,0,0.25))" }}>
                        {dest.emoji}
                      </span>
                      <span style={{ position: "relative", fontSize: "0.6rem", fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: "0.02em", lineHeight: 1.2, marginTop: "0.15rem", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                        {dest.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Route decoration + destination count */}
              <svg width="218" height="14" viewBox="0 0 218 14" fill="none">
                <line x1="10" y1="7" x2="208" y2="7" stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 6" />
                <circle cx="10"  cy="7" r="3.5" fill="var(--accent)" opacity="0.5" />
                <circle cx="109" cy="7" r="2.5" fill="var(--accent)" opacity="0.35" />
                <circle cx="208" cy="7" r="3.5" fill="var(--accent)" opacity="0.5" />
              </svg>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-muted)", margin: 0 }}>
                {availableDestinations.length} destinations
              </p>

            </div>

          </div>
        </div>
      </header>

      {/* ── Destination grid ──────────────────────────────────── */}
      <section
        style={{ flex: 1, paddingTop: "1.75rem", paddingBottom: "1.75rem" }}
        aria-labelledby="destinations-heading"
      >
        <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          <h2 id="destinations-heading" className="section-label-editorial">
            <span style={{ color: "var(--accent)", opacity: 0.6 }} aria-hidden="true">✦</span>
            {availableDestinations.length} destination{availableDestinations.length !== 1 ? "s" : ""} available
          </h2>

          {/* Cards — responsive grid: 1-col mobile, 2-col tablet, 3-col desktop */}
          <div className="dest-grid">
            {availableDestinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} passportId={activePassportId} summary={summaries.get(dest.id)} />
            ))}
          </div>

        </div>
      </section>

      {/* ── Comparison strip ─────────────────────────────────── */}
      <section style={{ paddingBottom: "3rem" }}>
        <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <h2 className="section-label-editorial">
              <span aria-hidden="true" style={{ color: "var(--accent)", opacity: 0.5 }}>⊞</span>
              Quick comparison
            </h2>
            <ProfileNote field="comparisonNote" />
          </div>
          <ComparisonStrip destinations={availableDestinations} summaries={summaries} />
        </div>
      </section>

      {/* ── Trip planner ─────────────────────────────────────── */}
      <section style={{ paddingBottom: "3rem" }}>
        <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h2 className="section-label-editorial">
            <span aria-hidden="true" style={{ color: "var(--accent)", opacity: 0.5 }}>◷</span>
            Plan by trip length
          </h2>
          <TripPlanner
            destinations={availableDestinations}
            budgets={budgetRecord}
            passportCurrency={passportCurrency}
          />
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "1.25rem var(--page-gutter)",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            margin: 0,
            textAlign: "center",
            maxWidth: "50ch",
            marginInline: "auto",
          }}
        >
          Always verify visa and entry rules with official sources before booking.
          NomadReady is a research aid, not legal advice.
        </p>
      </footer>

    </main>
  );
}
