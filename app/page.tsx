import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import passportsData from "@/data/passports.json";
import destinationsData from "@/data/destinations.json";
import type { Passport, Destination, ReadyData } from "@/lib/types";
import { PassportSelector } from "@/components/PassportSelector";
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
  const amount = tier.daily_thb ?? tier.daily_myr ?? tier.daily_idr ?? tier.daily_gel ?? tier.daily_try ?? tier.daily_vnd ?? null;
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
          background: "linear-gradient(180deg, #ede4d7 0%, #f2ebe1 55%, var(--bg-base) 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
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
                {availableDestinations.slice(0, 9).map((dest) => (
                  <div
                    key={dest.id}
                    style={{
                      width: "64px",
                      height: "52px",
                      borderRadius: "0.75rem",
                      backgroundColor: dest.cover_color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.4rem",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(28,25,23,0.12)",
                    }}
                  >
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(0,0,0,0.1) 100%)" }} />
                    <span style={{ position: "relative", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.18))" }}>{dest.emoji}</span>
                  </div>
                ))}
              </div>
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
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              margin: 0,
            }}
          >
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
