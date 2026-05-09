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
        {/* Route constellation — decorative travel map accent (desktop only) */}
        <svg
          aria-hidden="true"
          className="home-hero-deco"
          style={{
            position: "absolute",
            top: "1.75rem",
            right: "var(--page-gutter)",
            opacity: 0.22,
            pointerEvents: "none",
          }}
          width="130"
          height="90"
          viewBox="0 0 130 90"
          fill="none"
        >
          <circle cx="14" cy="14" r="3" fill="var(--accent)" />
          <circle cx="62" cy="7" r="2" fill="var(--accent)" />
          <circle cx="104" cy="20" r="2.5" fill="var(--accent)" />
          <circle cx="118" cy="58" r="2" fill="var(--accent)" />
          <circle cx="36" cy="68" r="2.5" fill="var(--accent)" />
          <circle cx="80" cy="48" r="3.5" fill="var(--accent)" />
          <line x1="14" y1="14" x2="80" y2="48" stroke="var(--accent)" strokeWidth="0.9" strokeDasharray="3.5 5.5" />
          <line x1="80" y1="48" x2="104" y2="20" stroke="var(--accent)" strokeWidth="0.9" strokeDasharray="3.5 5.5" />
          <line x1="80" y1="48" x2="118" y2="58" stroke="var(--accent)" strokeWidth="0.9" strokeDasharray="3.5 5.5" />
          <line x1="80" y1="48" x2="36" y2="68" stroke="var(--accent)" strokeWidth="0.9" strokeDasharray="3.5 5.5" />
          <line x1="14" y1="14" x2="62" y2="7" stroke="var(--accent)" strokeWidth="0.9" strokeDasharray="3.5 5.5" />
        </svg>
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

            {/* ── Right: destination mosaic (desktop only) ── */}
            <div className="home-hero-aside" aria-hidden="true">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.5rem",
                }}
              >
                {availableDestinations.slice(0, 9).map((dest, i) => (
                  <div
                    key={dest.id}
                    style={{
                      width: "66px",
                      height: i % 3 === 1 ? "56px" : "50px",
                      borderRadius: "0.875rem",
                      backgroundColor: dest.cover_color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.35rem",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 2px 10px rgba(28,25,23,0.14), 0 0 0 1px rgba(255,255,255,0.1)",
                      alignSelf: i % 3 === 1 ? "flex-end" : "flex-start",
                    }}
                  >
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(155deg, rgba(255,255,255,0.16) 0%, rgba(0,0,0,0.12) 100%)" }} />
                    {/* Tiny terrain */}
                    <svg viewBox="0 0 66 56" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                      <path d="M-2 38 Q18 22 33 30 Q48 38 68 24 L68 60 L-2 60 Z" fill="rgba(255,255,255,0.12)" />
                      <path d="M-2 46 Q20 36 40 42 Q54 47 68 36 L68 60 L-2 60 Z" fill="rgba(255,255,255,0.08)" />
                    </svg>
                    <span style={{ position: "relative", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.2))" }}>{dest.emoji}</span>
                  </div>
                ))}
              </div>
              {/* Route line below mosaic */}
              <svg width="218" height="14" viewBox="0 0 218 14" fill="none" style={{ marginTop: "0.125rem" }}>
                <line x1="10" y1="7" x2="208" y2="7" stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 6" />
                <circle cx="10" cy="7" r="3.5" fill="var(--accent)" opacity="0.5" />
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

          <h2
            id="destinations-heading"
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span style={{ color: "var(--accent)", opacity: 0.6 }}>✦</span>
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
            <h2
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
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
          <h2
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              margin: 0,
            }}
          >
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
