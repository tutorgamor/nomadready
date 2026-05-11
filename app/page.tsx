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

const HERO_IMGS = {
  main:   "https://images.unsplash.com/photo-1464822759844-d150ad6a8c1d?w=640&q=82&auto=format&fit=crop",
  tropic: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=78&auto=format&fit=crop",
  nomad:  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=320&q=75&auto=format&fit=crop",
  japan:  "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&q=78&auto=format&fit=crop",
} as const;

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

            {/* ── Right: Cinematic photo composition (desktop only) ── */}
            <div className="home-hero-aside" aria-hidden="true">

              {/* Layered editorial photo collage */}
              <div style={{ position: "relative", width: "400px", height: "340px" }}>

                {/* Main scene — Adventure & Mountains (background anchor) */}
                <div
                  style={{
                    position: "absolute",
                    top: "50px",
                    right: 0,
                    width: "272px",
                    height: "234px",
                    borderRadius: "1.25rem",
                    overflow: "hidden",
                    boxShadow: "0 24px 60px -10px rgba(0,0,0,0.40), 0 8px 20px rgba(0,0,0,0.18)",
                    zIndex: 1,
                  }}
                >
                  <img
                    src={HERO_IMGS.main}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    fetchPriority="high"
                    decoding="async"
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 42%, rgba(0,0,0,0.3) 100%)" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.18) 0%, transparent 45%)" }} />
                </div>

                {/* Polaroid snap — Tropical Explorer (top-left, primary scatter card) */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    transform: "rotate(-7deg)",
                    background: "#ffffff",
                    padding: "8px 8px 28px",
                    borderRadius: "3px",
                    width: "158px",
                    boxShadow: "0 14px 40px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.1)",
                    zIndex: 10,
                  }}
                >
                  <img
                    src={HERO_IMGS.tropic}
                    alt=""
                    style={{ width: "100%", height: "106px", objectFit: "cover", display: "block" }}
                    loading="lazy"
                    decoding="async"
                  />
                  <p style={{ margin: "6px 0 0", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", textAlign: "center" }}>
                    ✦ Into the wild
                  </p>
                </div>

                {/* Polaroid snap — Japan Street (bottom-left, slight angle) */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "32px",
                    transform: "rotate(5deg)",
                    background: "#ffffff",
                    padding: "7px 7px 24px",
                    borderRadius: "3px",
                    width: "136px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.08)",
                    zIndex: 9,
                  }}
                >
                  <img
                    src={HERO_IMGS.japan}
                    alt=""
                    style={{ width: "100%", height: "94px", objectFit: "cover", display: "block" }}
                    loading="lazy"
                    decoding="async"
                  />
                  <p style={{ margin: "5px 0 0", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", textAlign: "center" }}>
                    ✦ Golden hour
                  </p>
                </div>

                {/* Stamp card — Digital Nomad workspace (pinned over main photo top) */}
                <div
                  style={{
                    position: "absolute",
                    top: "14px",
                    right: "6px",
                    transform: "rotate(2.5deg)",
                    width: "92px",
                    height: "70px",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.26), 0 0 0 2.5px rgba(255,255,255,0.72)",
                    zIndex: 12,
                  }}
                >
                  <img
                    src={HERO_IMGS.nomad}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    loading="lazy"
                    decoding="async"
                  />
                </div>

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

          {/* ── Mobile illustrated scene (hidden on desktop) ── */}
          <div className="home-hero-mobile-scene" aria-hidden="true">
            <div style={{ position: "relative", width: "100%", height: "200px", borderRadius: "1rem", overflow: "hidden" }}>

              {/* Full-bleed main photo */}
              <img
                src={HERO_IMGS.main}
                alt=""
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                loading="lazy"
                decoding="async"
              />
              {/* Cinematic gradient overlays */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 38%, rgba(0,0,0,0.35) 100%)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.14) 0%, transparent 55%)" }} />

              {/* Polaroid snap — Japan Street (top-right) */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  transform: "rotate(3.5deg)",
                  background: "#ffffff",
                  padding: "5px 5px 18px",
                  borderRadius: "3px",
                  width: "82px",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
                  zIndex: 10,
                }}
              >
                <img
                  src={HERO_IMGS.japan}
                  alt=""
                  style={{ width: "100%", height: "54px", objectFit: "cover", display: "block" }}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Small stamp — Tropical Explorer (top-left) */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  transform: "rotate(-3deg)",
                  width: "68px",
                  height: "52px",
                  borderRadius: "6px",
                  overflow: "hidden",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.65)",
                  zIndex: 10,
                }}
              >
                <img
                  src={HERO_IMGS.tropic}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Destination count pill */}
              <div style={{ position: "absolute", bottom: "10px", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                <span
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.9)",
                    background: "rgba(0,0,0,0.32)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    padding: "0.2rem 0.75rem",
                    borderRadius: "9999px",
                  }}
                >
                  {availableDestinations.length} destinations
                </span>
              </div>

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
