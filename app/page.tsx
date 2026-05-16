import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import passportsData from "@/data/passports.json";
import destinationsData from "@/data/destinations.json";
import type { Passport, Destination, ReadyData } from "@/lib/types";
import { PassportSelector } from "@/components/PassportSelector";
import { ProfileSelector } from "@/components/ProfileSelector";
import { ProfileNote } from "@/components/ProfileNote";
import type { DestinationSummary } from "@/components/DestinationCard";
import { DestinationGrid } from "@/components/DestinationGrid";
import { ComparisonStrip } from "@/components/ComparisonStrip";
import { TripPlanner } from "@/components/TripPlanner";
import { AtlasMapSection } from "@/components/home/AtlasMapSection";
import { AmbientLayer } from "@/components/home/AmbientLayer";
import { PassportGatewayHero } from "@/components/home/PassportGatewayHero";
import { InView } from "@/components/motion-primitives/in-view";
import type { UseInViewOptions } from "motion/react";
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

// Resolves a hero asset from /public/assets/hero/ when present,
// otherwise falls back to the Unsplash CDN placeholder.
function heroAsset(filename: string, fallback: string): string {
  return fs.existsSync(path.join(process.cwd(), "public", "assets", "hero", filename))
    ? `/assets/hero/${filename}`
    : fallback;
}

const HERO_IMGS = {
  // Slot: hero-main-bg.webp — main cinematic scene (full-bleed scenic photo)
  main:   heroAsset("hero-main-bg.webp",       "https://images.unsplash.com/photo-1464822759844-d150ad6a8c1d?w=640&q=82&auto=format&fit=crop"),
  // Slot: polaroid-thailand.webp — tropical/beach polaroid snap (top-left)
  tropic: heroAsset("polaroid-thailand.webp",  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=78&auto=format&fit=crop"),
  // Slot: polaroid-community.webp — nomad workspace stamp card (top-right floating)
  nomad:  heroAsset("polaroid-community.webp", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=320&q=75&auto=format&fit=crop"),
  // Slot: polaroid-japan.webp — Japan street mood polaroid (bottom-left)
  japan:  heroAsset("polaroid-japan.webp",     "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&q=78&auto=format&fit=crop"),
  // Slot: passport-stamps.png — worn atlas / map background texture (behind composition)
  map:    heroAsset("passport-stamps.png",     "https://images.unsplash.com/photo-1526178618343-7f6c6c99a1d7?w=480&q=75&auto=format&fit=crop"),
};

// Shared reveal config for below-fold sections
const REVEAL = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0  },
};
const REVEAL_TX   = { duration: 0.55, ease: [0.25, 1, 0.5, 1] };
const REVEAL_OPTS: UseInViewOptions = { once: true, amount: 0.2 };

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
      {/* Cinematic passport entry gateway — fixed overlay, fades away on enter */}
      <PassportGatewayHero defaultPassportId={activePassportId} />

      {/* Atmospheric rendering layer — fixed, zIndex:200, pointerEvents:none.
          Cursor-reactive warm light + static SE Asia zone + editorial grain. */}
      <AmbientLayer />
      {/* ── Hero / header section ─────────────────────────────── */}
      <header
        className="home-header"
        style={{
          background: "var(--bg-base)",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Full-bleed cinematic background — desktop only, graceful fallback via CSS display:none */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="home-hero-bg"
          src={HERO_IMGS.main}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
        />
        {/* Directional warm overlay — preserves text readability on left, reveals photo on right */}
        <div className="home-hero-overlay" aria-hidden="true" />

        {/* Amber radial glow — warm atmospheric accent over the photo */}
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
        {/* Terrain wave — landscape horizon transition to content */}
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
        <div className="page-container" style={{ position: "relative", zIndex: 4 }}>
          <div className="home-hero-layout">

            {/* ── Left: text + selector ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* Brand wordmark */}
              <div className="anim-fade-down" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.9rem", color: "var(--accent)", lineHeight: 1, marginTop: "1px" }} aria-hidden="true">✦</span>
                <span className="hero-text-light" style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.03em" }}>Nomad</span>
                <span style={{ fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--accent)" }}>Ready</span>
              </div>

              {/* Headline */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <p className="anim-fade-up anim-delay-1" style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", margin: 0, opacity: 0.85 }}>
                  Travel field guide
                </p>
                <h1 className="hero-heading-light anim-reveal" style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2.75rem, 8.5vw, 4.75rem)",
                  fontWeight: 300,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                  margin: 0,
                }}>
                  Where are you<br />heading next?
                </h1>
                <p className="hero-text-light-sub anim-fade-up anim-delay-3" style={{ fontSize: "0.9375rem", margin: 0, maxWidth: "34ch", lineHeight: 1.55 }}>
                  Choose your passport, pick a destination — visa rules, budget tiers, and field notes in one scroll.
                </p>
              </div>

              {/* Passport selector + profile selector — frosted glass card on desktop */}
              <div className="hero-controls-glass anim-fade-up anim-delay-5">
                <PassportSelector passports={passports} activeId={activePassportId} />
                <ProfileSelector />
                <ProfileNote field="insightLine" />
              </div>

            </div>

            {/* ── Right: Cinematic photo composition (desktop only) ── */}
            <div className="home-hero-aside anim-fade-up anim-delay-2" aria-hidden="true">

              {/* Layered editorial photo collage */}
              <div style={{ position: "relative", width: "400px", height: "340px" }}>

                {/* Narrative route arcs — dashed travel itinerary connecting photo landmarks */}
                <svg
                  viewBox="0 0 400 340"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 8, pointerEvents: "none", display: "block" }}
                >
                  {/* Arc: Japan polaroid → Tropical polaroid */}
                  <path d="M 168 252 C 185 208 155 185 90 140" stroke="rgba(217,119,6,0.52)" strokeWidth="1.5" strokeDasharray="4 7" fill="none" />
                  {/* Arc: Tropical polaroid top-right → Nomad stamp */}
                  <path d="M 154 14 C 218 2 268 24 302 49" stroke="rgba(217,119,6,0.42)" strokeWidth="1" strokeDasharray="3 6" fill="none" />
                  {/* Pin marker — Tropical polaroid anchor */}
                  <circle cx="90" cy="140" r="3" fill="none" stroke="rgba(217,119,6,0.72)" strokeWidth="1.5" />
                  <circle cx="90" cy="140" r="1.5" fill="rgba(217,119,6,0.88)" />
                  {/* Pin marker — Japan polaroid anchor */}
                  <circle cx="168" cy="252" r="2.5" fill="none" stroke="rgba(217,119,6,0.65)" strokeWidth="1.5" />
                  <circle cx="168" cy="252" r="1.5" fill="rgba(217,119,6,0.78)" />
                </svg>

                {/* Polaroid snap — Thailand (top-left, primary scatter card) */}
                <div className="anim-float-gentle" style={{ position: "absolute", top: "10px", left: "10px", zIndex: 10 }}>
                <div
                  style={{
                    position: "relative",
                    transform: "rotate(-4.5deg)",
                    background: "#ffffff",
                    padding: "8px 8px 28px",
                    borderRadius: "3px",
                    width: "158px",
                    boxShadow: "0 20px 52px rgba(0,0,0,0.40), 0 4px 14px rgba(0,0,0,0.22)",
                  }}
                >
                  {/* Tape strip — travel journal adhesive detail */}
                  <div style={{ position: "absolute", top: "-5px", left: "50%", transform: "translateX(-50%) rotate(1deg)", width: "38px", height: "11px", background: "rgba(217,119,6,0.26)", borderRadius: "1px", zIndex: 11 }} />
                  <img
                    src={HERO_IMGS.tropic}
                    alt=""
                    style={{ width: "100%", height: "106px", objectFit: "cover", display: "block" }}
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Postmark stamp — explorer journal detail */}
                  <div style={{ position: "absolute", top: "10px", right: "8px" }}>
                    <svg width="30" height="30" viewBox="0 0 30 30">
                      <circle cx="15" cy="15" r="12.5" fill="none" stroke="rgba(217,119,6,0.42)" strokeWidth="1.5" strokeDasharray="2 2.5" />
                      <text x="15" y="13" textAnchor="middle" fontSize="4.5" fontWeight="700" letterSpacing="0.8" fill="rgba(217,119,6,0.52)" fontFamily="system-ui,sans-serif">NOMAD</text>
                      <text x="15" y="19" textAnchor="middle" fontSize="4.5" fontWeight="700" letterSpacing="0.8" fill="rgba(217,119,6,0.52)" fontFamily="system-ui,sans-serif">READY</text>
                    </svg>
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", textAlign: "center" }}>
                    ✦ Into the wild
                  </p>
                </div>
                </div>

                {/* Polaroid snap — Japan Street (bottom-left, slight angle) */}
                <div className="anim-float-gentle" style={{ position: "absolute", bottom: "18px", left: "16px", zIndex: 9, animationDelay: "1.4s" }}>
                <div
                  style={{
                    position: "relative",
                    transform: "rotate(4.5deg)",
                    background: "#ffffff",
                    padding: "7px 7px 24px",
                    borderRadius: "3px",
                    width: "136px",
                    boxShadow: "0 16px 44px rgba(0,0,0,0.36), 0 4px 12px rgba(0,0,0,0.18)",
                  }}
                >
                  <img
                    src={HERO_IMGS.japan}
                    alt=""
                    style={{ width: "100%", height: "94px", objectFit: "cover", display: "block" }}
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Page-corner fold — paper memory detail */}
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: "14px", height: "14px", background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.07) 50%)", borderRadius: "0 0 3px 0" }} />
                  <p style={{ margin: "5px 0 0", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)", textAlign: "center" }}>
                    ✦ Golden hour
                  </p>
                </div>
                </div>

                {/* Stamp card — Community / nomad workspace (pinned upper-right) */}
                <div
                  className="anim-scale-in anim-delay-4"
                  style={{
                    position: "absolute",
                    top: "20px",
                    right: "16px",
                    transform: "rotate(2deg)",
                    width: "92px",
                    height: "70px",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.38), 0 0 0 3px rgba(255,255,255,0.88)",
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

                {/* Field notes card — fills the bottom-right void, anchors the composition */}
                <div
                  className="anim-fade-up anim-delay-5"
                  style={{
                    position: "absolute",
                    bottom: "14px",
                    right: "12px",
                    transform: "rotate(-1deg)",
                    background: "#fffef9",
                    borderLeft: "2.5px solid var(--accent)",
                    borderRadius: "0 4px 4px 0",
                    padding: "0.35rem 0.7rem 0.35rem 0.55rem",
                    width: "148px",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.12)",
                    zIndex: 11,
                  }}
                >
                  <p style={{ margin: 0, fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>✦ trip notes</p>
                  <p style={{ margin: "2px 0 0", fontSize: "0.6rem", fontWeight: 600, color: "var(--text-secondary)", lineHeight: 1.3 }}>
                    {availableDestinations.length} destinations mapped
                  </p>
                </div>

              </div>

              {/* Route decoration + destination count */}
              <svg width="218" height="14" viewBox="0 0 218 14" fill="none">
                <line x1="10" y1="7" x2="208" y2="7" stroke="rgba(255,255,255,0.28)" strokeWidth="1" strokeDasharray="4 6" />
                <circle cx="10"  cy="7" r="3.5" fill="var(--accent)" opacity="0.6" />
                <circle cx="109" cy="7" r="2.5" fill="var(--accent)" opacity="0.42" />
                <circle cx="208" cy="7" r="3.5" fill="var(--accent)" opacity="0.6" />
              </svg>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.52)", margin: 0 }}>
                {availableDestinations.length} destinations
              </p>

            </div>

          </div>

          {/* ── Mobile illustrated scene (hidden on desktop) ── */}
          <div className="home-hero-mobile-scene" aria-hidden="true">
            <div style={{ position: "relative", width: "100%", height: "185px", borderRadius: "1rem", overflow: "hidden" }}>

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

      {/* ── Destinations — ambient atlas background + content ───────── */}
      <section
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          paddingTop: "2.5rem",
          paddingBottom: "3.5rem",
        }}
        aria-labelledby="destinations-heading"
      >
        {/* Ambient atlas — absolute background layer, zIndex: 0 */}
        <AtlasMapSection destinationCount={availableDestinations.length} />

        {/* Content floats above the map at zIndex: 1 */}
        <div
          className="page-container"
          style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "1.75rem" }}
        >
          <InView variants={REVEAL} transition={REVEAL_TX} viewOptions={REVEAL_OPTS}>
            <h2 id="destinations-heading" className="section-label-editorial">
              <span style={{ color: "var(--accent)", opacity: 0.6 }} aria-hidden="true">✦</span>
              {availableDestinations.length} destination{availableDestinations.length !== 1 ? "s" : ""} available
            </h2>
          </InView>

          <InView variants={REVEAL} transition={{ ...REVEAL_TX, delay: 0.1 }} viewOptions={REVEAL_OPTS}>
            <DestinationGrid destinations={availableDestinations} passportId={activePassportId} summaries={summaries} />
          </InView>
        </div>
      </section>

      {/* ── Comparison strip ─────────────────────────────────── */}
      <section style={{ paddingBottom: "3rem" }}>
        <InView variants={REVEAL} transition={REVEAL_TX} viewOptions={REVEAL_OPTS}>
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
        </InView>
      </section>

      {/* ── Trip planner ─────────────────────────────────────── */}
      <section style={{ paddingBottom: "3rem" }}>
        <InView variants={REVEAL} transition={REVEAL_TX} viewOptions={REVEAL_OPTS}>
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
        </InView>
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
