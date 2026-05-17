import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import destinationsDataRaw from "@/data/destinations.json";
import passportsDataRaw from "@/data/passports.json";
import type { ReadyData, Destination, Passport, LocalGem, RealTravelNote, NomadRealityNote, RemoteWorkZonesData } from "@/lib/types";
import { SectionNav }              from "@/components/ready/SectionNav";
import { VisaSection }             from "@/components/ready/VisaSection";
import { InsuranceSection }        from "@/components/ready/InsuranceSection";
import { BestSeasonSection }       from "@/components/ready/BestSeasonSection";
import { BudgetSection }           from "@/components/ready/BudgetSection";
import { AppsSection }             from "@/components/ready/AppsSection";
import { TransportSection }        from "@/components/ready/TransportSection";
import { ScamsSection }            from "@/components/ready/ScamsSection";
import { PhrasesSection }          from "@/components/ready/PhrasesSection";
import { EmergencySection }        from "@/components/ready/EmergencySection";
import { ChecklistSection }        from "@/components/ready/ChecklistSection";
import { TravelScoreSection }      from "@/components/ready/TravelScoreSection";
import { LocalGemsSection }        from "@/components/ready/LocalGemsSection";
import { RealTravelNotesSection }  from "@/components/ready/RealTravelNotesSection";
import { ProfileSummaryCard }      from "@/components/ready/ProfileSummaryCard";
import { RemoteWorkZonesGuide }    from "@/components/ready/RemoteWorkZonesGuide";
import { NomadRealitySection }     from "@/components/ready/NomadRealitySection";
import { ScrollReveal }            from "@/components/motion/ScrollReveal";
import type { BudgetTier }         from "@/lib/types";

const destinations = destinationsDataRaw as Destination[];
const passports    = passportsDataRaw    as Passport[];

// Eagerly load all ready JSON files
const readyFiles = import.meta.glob<ReadyData>("../data/ready/*.json", {
  eager: true,
  import: "default",
});
const placeFiles = import.meta.glob<LocalGem[]>("../data/places/*.json", {
  eager: true,
  import: "default",
});
const notesFiles = import.meta.glob<RealTravelNote[]>("../data/notes/*.json", {
  eager: true,
  import: "default",
});
const nomadRealityFiles = import.meta.glob<NomadRealityNote[]>("../data/nomad-reality/*.json", {
  eager: true,
  import: "default",
});
const zonesFiles = import.meta.glob<RemoteWorkZonesData>("../data/remote-work-zones/*.json", {
  eager: true,
  import: "default",
});

const DEST_HERO_PHOTOS: Record<string, string> = {
  thailand:      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1400&q=85&auto=format&fit=crop",
  malaysia:      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1400&q=85&auto=format&fit=crop",
  indonesia:     "/assets/editorial/panels/panel-indonesia.png",
  georgia:       "https://images.unsplash.com/photo-1565008887274-377b4a6c4e03?w=1400&q=85&auto=format&fit=crop",
  turkey:        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1400&q=85&auto=format&fit=crop",
  vietnam:       "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1400&q=85&auto=format&fit=crop",
  philippines:   "https://images.unsplash.com/photo-1518509562904-e7ef99cdce86?w=1400&q=85&auto=format&fit=crop",
  japan:         "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1400&q=85&auto=format&fit=crop",
  "south-korea": "https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=1400&q=85&auto=format&fit=crop",
};

function heroPhoto(destinationId: string): string {
  return DEST_HERO_PHOTOS[destinationId] ?? DEST_HERO_PHOTOS.thailand;
}

function heroVisaLabel(visa: ReadyData["visa"]): string {
  const d = visa.duration_days;
  switch (visa.type) {
    case "Visa Exemption":  return `Free · ${d}d`;
    case "e-Visa":          return `e-Visa · ${d}d`;
    case "Visa on Arrival": return `On Arrival · ${d}d`;
    default:                return visa.type;
  }
}

function formatTierAmount(tier: BudgetTier, symbol: string): string {
  const amount = tier.daily_thb ?? tier.daily_myr ?? tier.daily_idr ?? tier.daily_gel ??
    tier.daily_try ?? tier.daily_vnd ?? tier.daily_php ?? tier.daily_jpy ?? tier.daily_krw ?? null;
  return amount != null ? `${symbol}${amount}/d` : "—";
}

function formatMonthRange(months: string[]): string {
  if (!months || months.length === 0) return "—";
  if (months.length === 1) return months[0];
  return `${months[0]}–${months[months.length - 1]}`;
}

const SECTION_OFFSET: React.CSSProperties = { scrollMarginTop: "56px" };

export default function DestinationPage() {
  const params = useParams<{ passport: string; destination: string }>();
  const passportId    = params.passport    ?? "";
  const destinationId = params.destination ?? "";

  const dest = destinations.find((d) => d.id === destinationId);
  const pass = passports.find((p)    => p.id === passportId);

  // Find the ready data
  const readyKey = Object.keys(readyFiles).find((k) =>
    k.endsWith(`/${passportId}-${destinationId}.json`)
  );
  const data = readyKey ? readyFiles[readyKey] : null;

  // Supplemental data
  const gemsKey  = Object.keys(placeFiles).find((k) => k.endsWith(`/${destinationId}.json`));
  const notesKey = Object.keys(notesFiles).find((k) => k.endsWith(`/${destinationId}.json`));
  const realityKey = Object.keys(nomadRealityFiles).find((k) => k.endsWith(`/${destinationId}.json`));
  const zonesKey = Object.keys(zonesFiles).find((k) => k.endsWith(`/${destinationId}.json`));

  const gems        = gemsKey    ? placeFiles[gemsKey]           : null;
  const notes       = notesKey   ? notesFiles[notesKey]          : null;
  const nomadReality = realityKey ? nomadRealityFiles[realityKey] : null;
  const zonesGuide  = zonesKey   ? zonesFiles[zonesKey]          : null;

  if (!dest || !pass || !data) {
    return (
      <main className="page-container flex-1 flex flex-col items-center justify-center gap-6 py-24 text-center">
        <p className="text-5xl">🗺️</p>
        <h1 className="text-2xl font-bold">Destination not found</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          This destination doesn&apos;t exist yet or there&apos;s no data for your passport.
        </p>
        <Link
          to={`/?passport=${passportId}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            background: "var(--accent)",
            color: "#fff",
            borderRadius: "9999px",
            padding: "0.5rem 1.25rem",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        >
          ← Back to home
        </Link>
      </main>
    );
  }

  const reviewedDate = new Date(data.last_reviewed).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <header
        className="dest-hero-header"
        style={{ backgroundColor: dest.cover_color, position: "relative", overflow: "hidden" }}
      >
        <img
          src={heroPhoto(dest.id)}
          alt=""
          aria-hidden="true"
          className="dest-hero-bg"
          fetchPriority="high"
        />
        <div aria-hidden="true" className="dest-hero-overlay" />
        <div aria-hidden="true" className="dest-hero-amber-glow" />
        <div aria-hidden="true" className="dest-hero-vignette" />
        <div
          aria-hidden="true"
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "56px", zIndex: 3, pointerEvents: "none" }}
        >
          <svg viewBox="0 0 1440 56" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <path d="M0 38 Q180 16 360 28 Q540 42 720 22 Q900 6 1080 24 Q1260 40 1440 18 L1440 56 L0 56 Z" fill="var(--bg-base)" />
            <path d="M0 46 Q240 34 480 42 Q720 50 960 38 Q1200 28 1440 36 L1440 56 L0 56 Z" fill="var(--bg-base)" opacity="0.55" />
          </svg>
        </div>

        <div className="page-container ready-hero-content" style={{ position: "relative", zIndex: 4, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "clamp(1.75rem, 5vw, 3.25rem)" }}>
            <Link
              to={`/?passport=${passportId}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "rgba(255,255,255,0.92)",
                background: "rgba(0,0,0,0.36)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                padding: "0.35rem 0.85rem 0.35rem 0.6rem",
                borderRadius: "9999px",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.16)",
                letterSpacing: "0.01em",
              }}
            >
              ← All destinations
            </Link>

            {dest.travel_score && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", background: "rgba(0,0,0,0.34)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: "0.75rem", padding: "0.4rem 0.8rem" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "rgba(255,255,255,0.96)", lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {dest.travel_score.overall}
                </span>
                <span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(217,119,6,0.82)", lineHeight: 1, marginTop: "0.15rem" }}>
                  Field Score
                </span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
            <p style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.60)", margin: 0, textShadow: "0 1px 4px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
              <span aria-hidden>{pass.emoji}</span>
              {pass.label} passport
              <span aria-hidden style={{ opacity: 0.38 }}>·</span>
              {dest.region}
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3.5rem, 13vw, 5.5rem)", fontWeight: 600, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.97)", margin: 0, lineHeight: 0.95, textShadow: "0 2px 36px rgba(0,0,0,0.65), 0 1px 8px rgba(0,0,0,0.40)" }}>
              {dest.label}
            </h1>
            <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.80)", margin: 0, lineHeight: 1.5, maxWidth: "42ch", textShadow: "0 1px 8px rgba(0,0,0,0.35)" }}>
              {dest.hero_tag}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", marginTop: "1.75rem", paddingTop: "0.875rem", borderTop: "1px solid rgba(255,255,255,0.18)" }}>
            {[
              { label: "Visa",        value: heroVisaLabel(data.visa) },
              { label: "Budget from", value: formatTierAmount(data.budget.tiers.budget, data.budget.currency_symbol) },
              { label: "Best season", value: formatMonthRange(data.best_season.overall_best_months) || "—" },
            ].map((item, i) => (
              <div key={item.label} style={{ ...(i > 0 ? { borderLeft: "1px solid rgba(255,255,255,0.14)", paddingLeft: "1rem" } : {}), paddingRight: i < 2 ? "1rem" : undefined }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "rgba(217,119,6,0.80)", margin: "0 0 0.3rem" }}>{item.label}</p>
                <p style={{ fontSize: "0.8125rem", fontWeight: 700, letterSpacing: "0.01em", color: "rgba(255,255,255,0.94)", margin: 0, lineHeight: 1.3, textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}>{item.value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.95)", background: "rgba(0,0,0,0.36)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.20)", padding: "0.28rem 0.75rem", borderRadius: "9999px" }}>
              {dest.region}
            </span>
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.50)", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
              Reviewed {reviewedDate}
            </span>
          </div>
        </div>
      </header>

      <SectionNav
        hasGems={gems !== null}
        hasNotes={notes !== null && notes.length > 0}
        hasRemoteWork={false}
        hasNomadReality={nomadReality !== null && nomadReality.length > 0}
        hasCityMap={zonesGuide !== null}
      />

      <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "1.5rem", paddingBottom: "0.5rem" }}>
        {dest.travel_score && (
          <div id="score" style={SECTION_OFFSET}>
            <TravelScoreSection score={dest.travel_score} />
          </div>
        )}
        <ProfileSummaryCard
          travelScore={dest.travel_score ?? null}
          budgetLow={formatTierAmount(data.budget.tiers.budget, data.budget.currency_symbol)}
          budgetMid={formatTierAmount(data.budget.tiers.mid, data.budget.currency_symbol)}
          bestMonths={formatMonthRange(data.best_season.overall_best_months)}
          hasLocalGems={gems !== null}
        />
        <div id="visa"   style={SECTION_OFFSET}><VisaSection   visa={data.visa} /></div>
        <div id="budget" style={SECTION_OFFSET}><BudgetSection budget={data.budget} passportCurrency={pass.currency} /></div>
      </div>

      <div className="page-container page-container--reading" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "1rem", paddingBottom: "3.5rem" }}>
        <div id="insurance"  style={SECTION_OFFSET}><ScrollReveal><InsuranceSection  insurance={data.insurance} /></ScrollReveal></div>
        <div id="season"     style={SECTION_OFFSET}><ScrollReveal><BestSeasonSection bestSeason={data.best_season} /></ScrollReveal></div>
        <div id="apps"       style={SECTION_OFFSET}><ScrollReveal><AppsSection       apps={data.useful_apps} /></ScrollReveal></div>
        <div id="transport"  style={SECTION_OFFSET}><ScrollReveal><TransportSection  transport={data.transport} /></ScrollReveal></div>
        <div id="scams"      style={SECTION_OFFSET}><ScrollReveal><ScamsSection      scams={data.scams} /></ScrollReveal></div>
        <div id="phrases"    style={SECTION_OFFSET}><ScrollReveal><PhrasesSection    phrases={data.phrases} /></ScrollReveal></div>
        <div id="emergency"  style={SECTION_OFFSET}><ScrollReveal><EmergencySection  emergency={data.emergency} /></ScrollReveal></div>
        <div id="checklist"  style={SECTION_OFFSET}><ScrollReveal><ChecklistSection  checklist={data.checklist} /></ScrollReveal></div>
        {zonesGuide && (
          <div id="city-map" style={SECTION_OFFSET}>
            <ScrollReveal><RemoteWorkZonesGuide data={zonesGuide} /></ScrollReveal>
          </div>
        )}
        {nomadReality && nomadReality.length > 0 && (
          <div id="reality" style={SECTION_OFFSET}>
            <ScrollReveal><NomadRealitySection notes={nomadReality} /></ScrollReveal>
          </div>
        )}
        {notes && notes.length > 0 && (
          <div id="notes" style={SECTION_OFFSET}>
            <ScrollReveal><RealTravelNotesSection notes={notes} /></ScrollReveal>
          </div>
        )}
        {gems && (
          <div id="gems" style={SECTION_OFFSET}>
            <ScrollReveal><LocalGemsSection gems={gems} /></ScrollReveal>
          </div>
        )}
      </div>

      <footer style={{ borderTop: "1px solid var(--border)", padding: "1.25rem var(--page-gutter)" }}>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, textAlign: "center", maxWidth: "52ch", marginInline: "auto", lineHeight: 1.6 }}>
          {data.disclaimer}
        </p>
      </footer>
    </main>
  );
}
