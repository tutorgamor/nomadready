import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import passportsDataRaw from "@/data/passports.json";
import destinationsDataRaw from "@/data/destinations.json";
import type { Passport, Destination, ReadyData } from "@/lib/types";
import type { DestinationSummary } from "@/components/DestinationCard";
import { PassportSelector } from "@/components/PassportSelector";
import { ProfileSelector } from "@/components/ProfileSelector";
import { ProfileNote } from "@/components/ProfileNote";
import { DestinationGrid } from "@/components/DestinationGrid";
import { ComparisonStrip } from "@/components/ComparisonStrip";
import { TripPlanner } from "@/components/TripPlanner";
import { AmbientLayer } from "@/components/home/AmbientLayer";
import { PassportGatewayHero } from "@/components/home/PassportGatewayHero";
import { OpenGatewayLink } from "@/components/home/OpenGatewayLink";
import { Link } from "wouter";
import { InView } from "@/components/motion-primitives/in-view";
import { CoverPatternSVG } from "@/components/DestinationCoverPattern";
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
  summaries: Map<string, DestinationSummary>;
  budgetRecord: Record<string, ReadyData["budget"]>;
  availableDestinations: Destination[];
} {
  const summaries = new Map<string, DestinationSummary>();
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
  const [location] = useLocation();
  const params = new URLSearchParams(location.includes("?") ? location.split("?")[1] : "");
  const passportParam = params.get("passport");
  const activePassportId = passports.some((p) => p.id === passportParam)
    ? passportParam!
    : "fr";
  const passportCurrency = passports.find((p) => p.id === activePassportId)?.currency ?? "EUR";

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
        <img
          className="home-hero-bg"
          src="/assets/hero/hero-cinematic.jpg"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
        />
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
              <span aria-hidden="true" style={{ fontSize: "0.75rem", color: "var(--accent)", lineHeight: 1 }}>✦</span>
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
                <span style={{ fontSize: "0.9rem", color: "var(--accent)", lineHeight: 1, marginTop: "1px" }} aria-hidden="true">✦</span>
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
                  Where are you<br />heading next?
                </h1>
                <p className="hero-text-light-sub anim-fade-up anim-delay-3" style={{ fontSize: "0.9375rem", margin: 0, maxWidth: "34ch", lineHeight: 1.55 }}>
                  Choose your passport, pick a destination — visa rules, budget tiers, and field notes in one scroll.
                </p>
              </div>

              <div className="hero-controls-glass anim-fade-up anim-delay-5">
                <div>
                  <PassportSelector passports={passports} activeId={activePassportId} />
                  <OpenGatewayLink />
                </div>
                <ProfileSelector />
                <ProfileNote field="insightLine" />
              </div>
            </div>

            <div className="home-hero-aside anim-fade-up anim-delay-2" aria-hidden="true">
              {/* ── Editorial panel — portrait composition, no rotation ── */}
              <div className="hero-editorial-panel">
                {/* Main image frame */}
                <div className="hero-editorial-frame" style={{ position: "relative" }}>
                  <img
                    src="/assets/editorial/panels/panel-indonesia.png"
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", display: "block", position: "absolute", inset: 0 }}
                    fetchPriority="high"
                    decoding="async"
                  />

                  {/* Warm cinematic vignette */}
                  <div className="hero-editorial-frame-vignette" />

                  {/* Thin top rule — editorial header line */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(217,119,6,0.45) 30%, rgba(217,119,6,0.45) 70%, transparent)", zIndex: 4 }} />

                  {/* Bottom label zone */}
                  <div className="hero-editorial-frame-label">
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                      <span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(217,119,6,0.85)", lineHeight: 1 }}>
                        Indonesia
                      </span>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.92)", lineHeight: 1.1 }}>
                        Southeast Asia
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.15rem" }}>
                      <span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(217,119,6,0.70)", lineHeight: 1 }}>
                        Field Score
                      </span>
                      <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "rgba(255,255,255,0.94)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                        77
                      </span>
                    </div>
                  </div>

                  {/* Passport — tucked bottom-left, partially overlapping the frame */}
                  <div className="hero-editorial-passport">
                    <div className="anim-float-gentle">
                      <img
                        src="/assets/editorial/old%20passport/old-passport.png"
                        alt=""
                        style={{ width: "88px", height: "auto", borderRadius: "3px", boxShadow: "0 8px 28px rgba(0,0,0,0.50), 0 2px 6px rgba(0,0,0,0.30)", display: "block" }}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                </div>

                {/* Metadata row below frame */}
                <div className="hero-editorial-meta">
                  <svg viewBox="0 0 320 10" fill="none" style={{ flex: 1, height: "10px", display: "block" }}>
                    <line x1="6" y1="5" x2="314" y2="5" stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="3 5" />
                    <circle cx="6"  cy="5" r="2.5" fill="var(--accent)" opacity="0.55" />
                    <circle cx="160" cy="5" r="1.8" fill="var(--accent)" opacity="0.35" />
                    <circle cx="314" cy="5" r="2.5" fill="var(--accent)" opacity="0.55" />
                  </svg>
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", flexShrink: 0 }}>
                    {availableDestinations.length} destinations
                  </span>
                </div>
              </div>
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

      {/* ── Step 3: Featured Destination Panel ──────────────── */}
      {(() => {
        const indonesia = destinations.find(d => d.id === "indonesia");
        const turkey = destinations.find(d => d.id === "turkey");
        if (!indonesia || !turkey) return null;
        const featured = [
          { dest: indonesia, imgSrc: "/assets/editorial/panels/panel-indonesia.png" },
          { dest: turkey,    imgSrc: null },
        ] as const;
        return (
          <InView variants={REVEAL} transition={{ ...REVEAL_TX, delay: 0.08 }} viewOptions={REVEAL_OPTS}>
            <section style={{ paddingTop: "3.5rem", paddingBottom: "0" }} aria-label="Featured destinations">
              <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
                <h2 className="section-label-editorial">
                  <span style={{ color: "var(--accent)", opacity: 0.6 }} aria-hidden="true">✦</span>
                  Field picks
                </h2>
                <div className="feat-dest-grid">
                  {featured.map(({ dest, imgSrc }) => (
                    <Link
                      key={dest.id}
                      to={`/ready/${activePassportId}/${dest.id}`}
                      className="feat-dest-card"
                      aria-label={`Field guide for ${dest.label}`}
                    >
                      {/* Background — photo or color+pattern */}
                      {imgSrc ? (
                        <img src={imgSrc} alt="" className="feat-dest-card-bg" fetchPriority="low" decoding="async" />
                      ) : (
                        <>
                          <div style={{ position: "absolute", inset: 0, backgroundColor: dest.cover_color, zIndex: 0 }} />
                          <svg viewBox="0 0 560 360" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }} aria-hidden="true">
                            <CoverPatternSVG id={dest.id} region={dest.region} />
                          </svg>
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.30) 100%)", zIndex: 1 }} />
                        </>
                      )}

                      {/* Vignette */}
                      <div className="feat-dest-card-vignette" />

                      {/* Region stamp */}
                      <div className="feat-dest-card-region">{dest.region}</div>

                      {/* Score pill */}
                      {dest.travel_score && (
                        <div className="feat-dest-card-score">
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "rgba(255,255,255,0.96)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                            {dest.travel_score.overall}
                          </span>
                          <span style={{ fontSize: "0.5rem", fontWeight: 500, color: "rgba(255,255,255,0.72)", lineHeight: 1 }}>/100</span>
                        </div>
                      )}

                      {/* Content — bottom zone */}
                      <div className="feat-dest-card-content">
                        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "0.75rem" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(217,119,6,0.90)", margin: 0, lineHeight: 1 }}>
                              {dest.emoji} {dest.region}
                            </p>
                            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3.5vw, 2.125rem)", fontWeight: 700, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.97)", margin: 0, lineHeight: 1.0 }}>
                              {dest.label}
                            </h3>
                            <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.68)", margin: 0, lineHeight: 1.35, letterSpacing: "-0.01em" }}>
                              {dest.hero_tag}
                            </p>
                          </div>
                          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "0.35rem", background: "rgba(217,119,6,0.18)", border: "1px solid rgba(217,119,6,0.40)", borderRadius: "var(--radius-full)", padding: "0.35rem 0.875rem", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.01em", lineHeight: 1 }}>Read guide</span>
                            <span style={{ fontSize: "0.8rem", color: "var(--accent)", lineHeight: 1 }} aria-hidden="true">→</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </InView>
        );
      })()}

      <section style={{ flex: 1, paddingTop: "4.5rem", paddingBottom: "3.5rem" }} aria-labelledby="destinations-heading">
        <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          <InView variants={REVEAL} transition={REVEAL_TX} viewOptions={REVEAL_OPTS}>
            <h2 id="destinations-heading" className="section-label-editorial">
              <span style={{ color: "var(--accent)", opacity: 0.6 }} aria-hidden="true">✦</span>
              {availableDestinations.length} destinations mapped for your passport
            </h2>
          </InView>
          <InView variants={REVEAL} transition={{ ...REVEAL_TX, delay: 0.1 }} viewOptions={REVEAL_OPTS}>
            <DestinationGrid destinations={availableDestinations} passportId={activePassportId} summaries={summaries} />
          </InView>
        </div>
      </section>

      <section style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
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

      <section style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
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

      <footer style={{ borderTop: "1px solid rgba(180,130,65,0.22)", paddingBlock: "1.5rem" }}>
        <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
            <span style={{ fontSize: "0.7rem", color: "var(--accent)" }} aria-hidden="true">✦</span>
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
