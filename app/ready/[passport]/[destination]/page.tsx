import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import destinationsData from "@/data/destinations.json";
import passportsData from "@/data/passports.json";
import type { ReadyData, Destination, Passport } from "@/lib/types";
import { SectionNav }        from "@/components/ready/SectionNav";
import { VisaSection }       from "@/components/ready/VisaSection";
import { InsuranceSection }  from "@/components/ready/InsuranceSection";
import { BestSeasonSection } from "@/components/ready/BestSeasonSection";
import { BudgetSection }     from "@/components/ready/BudgetSection";
import { AppsSection }       from "@/components/ready/AppsSection";
import { TransportSection }  from "@/components/ready/TransportSection";
import { ScamsSection }      from "@/components/ready/ScamsSection";
import { PhrasesSection }    from "@/components/ready/PhrasesSection";
import { EmergencySection }  from "@/components/ready/EmergencySection";
import { ChecklistSection }  from "@/components/ready/ChecklistSection";
import { TravelScoreSection }   from "@/components/ready/TravelScoreSection";
import { LocalGemsSection }          from "@/components/ready/LocalGemsSection";
import { RealTravelNotesSection }    from "@/components/ready/RealTravelNotesSection";
import { ProfileSummaryCard }        from "@/components/ready/ProfileSummaryCard";
import { RemoteWorkZonesGuide }      from "@/components/ready/RemoteWorkZonesGuide";
import { NomadRealitySection }       from "@/components/ready/NomadRealitySection";
import { ScrollReveal }              from "@/components/motion/ScrollReveal";
import type { LocalGem, BudgetTier, RealTravelNote, NomadRealityNote, RemoteWorkZonesData } from "@/lib/types";

const destinations = destinationsData as Destination[];
const passports = passportsData as Passport[];

export const dynamicParams = false;

interface Props {
  params: Promise<{ passport: string; destination: string }>;
}

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), "data", "ready");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const stem = f.slice(0, -5);
      const dashIndex = stem.indexOf("-");
      return {
        passport: stem.slice(0, dashIndex),
        destination: stem.slice(dashIndex + 1),
      };
    });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { passport, destination } = await params;
  const dest = destinations.find((d) => d.id === destination);
  const pass = passports.find((p) => p.id === passport);
  if (!dest) return { title: "Not Found" };
  return {
    title: `${dest.label} Travel Guide`,
    description: `Everything a ${pass?.label ?? "passport"} holder needs to know before travelling to ${dest.label}.`,
  };
}

const SECTION_OFFSET: React.CSSProperties = { scrollMarginTop: "56px" };

function formatTierAmount(tier: BudgetTier, symbol: string): string {
  const amount =
    tier.daily_thb ?? tier.daily_myr ?? tier.daily_idr ?? tier.daily_gel ??
    tier.daily_try ?? tier.daily_vnd ?? tier.daily_php ?? tier.daily_jpy ??
    tier.daily_krw ?? null;
  return amount != null ? `${symbol}${amount}/d` : "—";
}

function formatMonthRange(months: string[]): string {
  if (!months || months.length === 0) return "—";
  if (months.length === 1) return months[0];
  return `${months[0]}–${months[months.length - 1]}`;
}

// ─── Destination hero photography ─────────────────────────────────────────────
// Curated Unsplash CDN URLs per destination — chosen for atmospheric quality
// and cinematic color temperature matching the brand register.
// Local assets in /public/assets/hero/dest-{id}.webp take priority automatically.

const DEST_HERO_PHOTOS: Record<string, string> = {
  thailand:      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1400&q=85&auto=format&fit=crop",
  malaysia:      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1400&q=85&auto=format&fit=crop",
  indonesia:     "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1400&q=85&auto=format&fit=crop",
  georgia:       "https://images.unsplash.com/photo-1565008887274-377b4a6c4e03?w=1400&q=85&auto=format&fit=crop",
  turkey:        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1400&q=85&auto=format&fit=crop",
  vietnam:       "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1400&q=85&auto=format&fit=crop",
  philippines:   "https://images.unsplash.com/photo-1518509562904-e7ef99cdce86?w=1400&q=85&auto=format&fit=crop",
  japan:         "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1400&q=85&auto=format&fit=crop",
  "south-korea": "https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=1400&q=85&auto=format&fit=crop",
};

/** Returns the hero photo URL — local asset when present, Unsplash CDN fallback. */
function heroPhoto(destinationId: string): string {
  const localFile = `dest-${destinationId}.webp`;
  const localPath = path.join(process.cwd(), "public", "assets", "hero", localFile);
  if (fs.existsSync(localPath)) return `/assets/hero/${localFile}`;
  return DEST_HERO_PHOTOS[destinationId] ?? DEST_HERO_PHOTOS.thailand;
}

/** Short visa label for the hero signal strip. */
function heroVisaLabel(visa: ReadyData["visa"]): string {
  const d = visa.duration_days;
  switch (visa.type) {
    case "Visa Exemption":  return `Free · ${d}d`;
    case "e-Visa":          return `e-Visa · ${d}d`;
    case "Visa on Arrival": return `On Arrival · ${d}d`;
    default:                return visa.type;
  }
}

export default async function ReadyPage({ params }: Props) {
  const { passport: passportId, destination } = await params;

  const dest = destinations.find((d) => d.id === destination);
  const pass = passports.find((p) => p.id === passportId);
  const filePath = path.join(process.cwd(), "data", "ready", `${passportId}-${destination}.json`);

  if (!dest || !pass || !fs.existsSync(filePath)) notFound();

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as ReadyData;

  const placesPath = path.join(process.cwd(), "data", "places", `${destination}.json`);
  const gems: LocalGem[] | null = fs.existsSync(placesPath)
    ? (JSON.parse(fs.readFileSync(placesPath, "utf-8")) as LocalGem[])
    : null;

  const notesPath = path.join(process.cwd(), "data", "notes", `${destination}.json`);
  const notes: RealTravelNote[] | null = fs.existsSync(notesPath)
    ? (JSON.parse(fs.readFileSync(notesPath, "utf-8")) as RealTravelNote[])
    : null;

  const nomadRealityPath = path.join(process.cwd(), "data", "nomad-reality", `${destination}.json`);
  const nomadReality: NomadRealityNote[] | null = fs.existsSync(nomadRealityPath)
    ? (JSON.parse(fs.readFileSync(nomadRealityPath, "utf-8")) as NomadRealityNote[])
    : null;

  const zonesGuidePath = path.join(process.cwd(), "data", "remote-work-zones", `${destination}.json`);
  const zonesGuide: RemoteWorkZonesData | null = fs.existsSync(zonesGuidePath)
    ? (JSON.parse(fs.readFileSync(zonesGuidePath, "utf-8")) as RemoteWorkZonesData)
    : null;

  const reviewedDate = new Date(data.last_reviewed).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <header
        className="dest-hero-header"
        style={{
          backgroundColor: dest.cover_color,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Per-destination hero photograph — Unsplash CDN fallback until
            /public/assets/hero/dest-{id}.webp assets are added          */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroPhoto(dest.id)}
          alt=""
          aria-hidden="true"
          className="dest-hero-bg"
          fetchPriority="high"
        />

        {/* Directional cinematic overlay — dark top-left for legibility */}
        <div aria-hidden="true" className="dest-hero-overlay" />

        {/* Warm amber atmospheric glow — top-right light source */}
        <div aria-hidden="true" className="dest-hero-amber-glow" />

        {/* Bottom vignette — eases into terrain wave */}
        <div aria-hidden="true" className="dest-hero-vignette" />

        {/* Terrain wave — organic transition to page content */}
        <div
          aria-hidden="true"
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "56px", zIndex: 3, pointerEvents: "none" }}
        >
          <svg viewBox="0 0 1440 56" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <path d="M0 38 Q180 16 360 28 Q540 42 720 22 Q900 6 1080 24 Q1260 40 1440 18 L1440 56 L0 56 Z" fill="var(--bg-base)" />
            <path d="M0 46 Q240 34 480 42 Q720 50 960 38 Q1200 28 1440 36 L1440 56 L0 56 Z" fill="var(--bg-base)" opacity="0.55" />
          </svg>
        </div>

        <div
          className="page-container ready-hero-content"
          style={{ position: "relative", zIndex: 4, display: "flex", flexDirection: "column" }}
        >

          {/* ── Top row: back link + field score ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "clamp(1.75rem, 5vw, 3.25rem)",
            }}
          >
            {/* Back link */}
            <Link
              href={`/?passport=${passportId}`}
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

            {/* Field score — editorial stamp, not a metric widget */}
            {dest.travel_score && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  background: "rgba(0,0,0,0.34)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  borderRadius: "0.75rem",
                  padding: "0.4rem 0.8rem",
                }}
              >
                <span
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.96)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    fontFamily: "var(--font-geist-sans)",
                  }}
                >
                  {dest.travel_score.overall}
                </span>
                <span
                  style={{
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    color: "rgba(217,119,6,0.82)",
                    lineHeight: 1,
                    marginTop: "0.15rem",
                  }}
                >
                  Field Score
                </span>
              </div>
            )}
          </div>

          {/* ── Destination identity block ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>

            {/* Eyebrow: passport + region breadcrumb */}
            <p
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.60)",
                margin: 0,
                textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                flexWrap: "wrap",
              }}
            >
              <span aria-hidden>{pass.emoji}</span>
              {pass.label} passport
              <span aria-hidden style={{ opacity: 0.38 }}>·</span>
              {dest.region}
            </p>

            {/* Destination name — Cormorant Garamond display */}
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3.5rem, 13vw, 5.5rem)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: "rgba(255,255,255,0.97)",
                margin: 0,
                lineHeight: 0.95,
                textShadow: "0 2px 36px rgba(0,0,0,0.65), 0 1px 8px rgba(0,0,0,0.40)",
              }}
            >
              {dest.label}
            </h1>

            {/* Hero tag */}
            <p
              style={{
                fontSize: "1rem",
                color: "rgba(255,255,255,0.80)",
                margin: 0,
                lineHeight: 1.5,
                maxWidth: "42ch",
                textShadow: "0 1px 8px rgba(0,0,0,0.35)",
              }}
            >
              {dest.hero_tag}
            </p>
          </div>

          {/* ── Editorial caption band: 3-column fact strip ──
              Visa / Budget floor / Best season — answers "can I go / cost / when"
              in a horizontal editorial register, not frosted pills.        */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              marginTop: "1.75rem",
              paddingTop: "0.875rem",
              borderTop: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            {/* Visa */}
            <div style={{ paddingRight: "1rem" }}>
              <p
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: "rgba(217,119,6,0.80)",
                  margin: "0 0 0.3rem",
                }}
              >
                Visa
              </p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                  color: "rgba(255,255,255,0.94)",
                  margin: 0,
                  lineHeight: 1.3,
                  textShadow: "0 1px 6px rgba(0,0,0,0.4)",
                }}
              >
                {heroVisaLabel(data.visa)}
              </p>
            </div>

            {/* Budget */}
            <div
              style={{
                borderLeft: "1px solid rgba(255,255,255,0.14)",
                paddingLeft: "1rem",
                paddingRight: "1rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: "rgba(217,119,6,0.80)",
                  margin: "0 0 0.3rem",
                }}
              >
                Budget from
              </p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                  color: "rgba(255,255,255,0.94)",
                  margin: 0,
                  lineHeight: 1.3,
                  textShadow: "0 1px 6px rgba(0,0,0,0.4)",
                }}
              >
                {formatTierAmount(data.budget.tiers.budget, data.budget.currency_symbol)}
              </p>
            </div>

            {/* Best season */}
            <div
              style={{
                borderLeft: "1px solid rgba(255,255,255,0.14)",
                paddingLeft: "1rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: "rgba(217,119,6,0.80)",
                  margin: "0 0 0.3rem",
                }}
              >
                Best season
              </p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                  color: "rgba(255,255,255,0.94)",
                  margin: 0,
                  lineHeight: 1.3,
                  textShadow: "0 1px 6px rgba(0,0,0,0.4)",
                }}
              >
                {formatMonthRange(data.best_season.overall_best_months) || "—"}
              </p>
            </div>
          </div>

          {/* ── Bottom meta: region + reviewed date ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginTop: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.95)",
                background: "rgba(0,0,0,0.36)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.20)",
                padding: "0.28rem 0.75rem",
                borderRadius: "9999px",
              }}
            >
              {dest.region}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.50)",
                textShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }}
            >
              Reviewed {reviewedDate}
            </span>
          </div>
        </div>
      </header>

      {/* ── Sticky section nav ────────────────────────────────── */}
      <SectionNav
        hasGems={gems !== null}
        hasNotes={notes !== null && notes.length > 0}
        hasRemoteWork={false}
        hasNomadReality={nomadReality !== null && nomadReality.length > 0}
        hasCityMap={zonesGuide !== null}
      />

      {/* ── Primary editorial zone — wider container (Score, Visa, Budget) ── */}
      <div
        className="page-container"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          paddingTop: "1.5rem",
          paddingBottom: "0.5rem",
        }}
      >
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

      {/* ── Reading zone — field-guide width for long-form content ── */}
      <div
        className="page-container page-container--reading"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          paddingTop: "1rem",
          paddingBottom: "3.5rem",
        }}
      >
        <div id="insurance"  style={SECTION_OFFSET}><ScrollReveal delay={0}><InsuranceSection  insurance={data.insurance} /></ScrollReveal></div>
        <div id="season"     style={SECTION_OFFSET}><ScrollReveal delay={0}><BestSeasonSection bestSeason={data.best_season} /></ScrollReveal></div>
        <div id="apps"       style={SECTION_OFFSET}><ScrollReveal delay={0}><AppsSection       apps={data.useful_apps} /></ScrollReveal></div>
        <div id="transport"  style={SECTION_OFFSET}><ScrollReveal delay={0}><TransportSection  transport={data.transport} /></ScrollReveal></div>
        <div id="scams"      style={SECTION_OFFSET}><ScrollReveal delay={0}><ScamsSection      scams={data.scams} /></ScrollReveal></div>
        <div id="phrases"    style={SECTION_OFFSET}><ScrollReveal delay={0}><PhrasesSection    phrases={data.phrases} /></ScrollReveal></div>
        <div id="emergency"  style={SECTION_OFFSET}><ScrollReveal delay={0}><EmergencySection  emergency={data.emergency} /></ScrollReveal></div>
        <div id="checklist"  style={SECTION_OFFSET}><ScrollReveal delay={0}><ChecklistSection  checklist={data.checklist} /></ScrollReveal></div>
        {zonesGuide && (
          <div id="city-map" style={SECTION_OFFSET}>
            <ScrollReveal delay={0}><RemoteWorkZonesGuide data={zonesGuide} /></ScrollReveal>
          </div>
        )}
        {nomadReality && nomadReality.length > 0 && (
          <div id="reality" style={SECTION_OFFSET}>
            <ScrollReveal delay={0}><NomadRealitySection notes={nomadReality} /></ScrollReveal>
          </div>
        )}
        {notes && notes.length > 0 && (
          <div id="notes" style={SECTION_OFFSET}>
            <ScrollReveal delay={0}><RealTravelNotesSection notes={notes} /></ScrollReveal>
          </div>
        )}
        {gems && (
          <div id="gems" style={SECTION_OFFSET}>
            <ScrollReveal delay={0}><LocalGemsSection gems={gems} /></ScrollReveal>
          </div>
        )}
      </div>

      {/* ── Disclaimer footer ─────────────────────────────────── */}
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
            maxWidth: "52ch",
            marginInline: "auto",
            lineHeight: 1.6,
          }}
        >
          {data.disclaimer}
        </p>
      </footer>

    </main>
  );
}
