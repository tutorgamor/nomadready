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
import type { Place, BudgetTier, RealTravelNote } from "@/lib/types";

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

export default async function ReadyPage({ params }: Props) {
  const { passport: passportId, destination } = await params;

  const dest = destinations.find((d) => d.id === destination);
  const pass = passports.find((p) => p.id === passportId);
  const filePath = path.join(process.cwd(), "data", "ready", `${passportId}-${destination}.json`);

  if (!dest || !pass || !fs.existsSync(filePath)) notFound();

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as ReadyData;

  const placesPath = path.join(process.cwd(), "data", "places", `${destination}.json`);
  const places: Place[] | null = fs.existsSync(placesPath)
    ? (JSON.parse(fs.readFileSync(placesPath, "utf-8")) as Place[])
    : null;

  const notesPath = path.join(process.cwd(), "data", "notes", `${destination}.json`);
  const notes: RealTravelNote[] | null = fs.existsSync(notesPath)
    ? (JSON.parse(fs.readFileSync(notesPath, "utf-8")) as RealTravelNote[])
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
        style={{
          backgroundColor: dest.cover_color,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Diagonal depth overlay */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(155deg, rgba(255,255,255,0.14) 0%, rgba(0,0,0,0.28) 100%)",
          }}
        />
        {/* Bottom-to-top dark vignette for text contrast */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(0deg, rgba(0,0,0,0.38) 0%, transparent 55%)",
          }}
        />
        {/* Sun glow — atmospheric light source */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-20%",
            right: "10%",
            width: "45%",
            paddingBottom: "45%",
            background: "radial-gradient(ellipse, rgba(255,255,255,0.22) 0%, transparent 65%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
        {/* Distant mountain silhouette — adds depth layer before main terrain wave */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "56px",
            left: 0,
            right: 0,
            height: "38px",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <svg
            viewBox="0 0 1440 38"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            <path
              d="M0 26 Q120 6 280 18 Q400 26 520 10 Q620 0 740 8 Q860 18 980 6 Q1100 -2 1220 10 Q1340 20 1440 8 L1440 38 L0 38 Z"
              fill="rgba(255,255,255,0.08)"
            />
          </svg>
        </div>
        {/* Terrain wave — organic landscape horizon at hero bottom */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "56px",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <svg
            viewBox="0 0 1440 56"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            <path
              d="M0 38 Q180 16 360 28 Q540 42 720 22 Q900 6 1080 24 Q1260 40 1440 18 L1440 56 L0 56 Z"
              fill="var(--bg-base)"
            />
            <path
              d="M0 46 Q240 34 480 42 Q720 50 960 38 Q1200 28 1440 36 L1440 56 L0 56 Z"
              fill="var(--bg-base)"
              opacity="0.55"
            />
          </svg>
        </div>

        <div
          className="page-container ready-hero-content"
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Back link — preserves active passport in URL */}
          <Link
            href={`/?passport=${passportId}`}
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "#ffffff",
              background: "rgba(0, 0, 0, 0.28)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              padding: "0.35rem 0.85rem 0.35rem 0.6rem",
              borderRadius: "9999px",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            ← All destinations
          </Link>

          {/* Emoji + routing line + title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            <span style={{ fontSize: "4.5rem", lineHeight: 1, filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.25))" }} aria-hidden="true">
              {dest.emoji}
            </span>

            <div>
              {/* Route label */}
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.7)",
                  margin: "0 0 0.35rem",
                }}
              >
                {pass.emoji} {pass.label} →
              </p>

              {/* Destination name */}
              <h1
                style={{
                  fontSize: "clamp(2.25rem, 10vw, 2.75rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.045em",
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: 1.0,
                  textShadow: "0 2px 8px rgba(0,0,0,0.22)",
                }}
              >
                {dest.label}
              </h1>

              {/* Hero tag */}
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "rgba(255,255,255,0.85)",
                  margin: "0.5rem 0 0",
                  lineHeight: 1.45,
                  maxWidth: "36ch",
                }}
              >
                {dest.hero_tag}
              </p>
            </div>
          </div>

          {/* Meta row: region badge + last reviewed */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.92)",
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "0.25rem 0.7rem",
                borderRadius: "9999px",
              }}
            >
              {dest.region}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.62)",
              }}
            >
              Reviewed {reviewedDate}
            </span>
          </div>
        </div>
      </header>

      {/* ── Sticky section nav ────────────────────────────────── */}
      <SectionNav hasGems={places !== null} hasNotes={notes !== null && notes.length > 0} />

      {/* ── All 10 sections ───────────────────────────────────── */}
      <div
        className="page-container page-container--reading"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          paddingTop: "1.25rem",
          paddingBottom: "3.5rem",
        }}
      >
        {dest.travel_score && <TravelScoreSection score={dest.travel_score} />}
        <ProfileSummaryCard
          travelScore={dest.travel_score ?? null}
          budgetLow={formatTierAmount(data.budget.tiers.budget, data.budget.currency_symbol)}
          budgetMid={formatTierAmount(data.budget.tiers.mid, data.budget.currency_symbol)}
          bestMonths={formatMonthRange(data.best_season.overall_best_months)}
          hasLocalGems={places !== null}
        />
        <div id="visa"       style={SECTION_OFFSET}><VisaSection       visa={data.visa} /></div>
        <div id="insurance"  style={SECTION_OFFSET}><InsuranceSection  insurance={data.insurance} /></div>
        <div id="season"     style={SECTION_OFFSET}><BestSeasonSection bestSeason={data.best_season} /></div>
        <div id="budget"     style={SECTION_OFFSET}><BudgetSection     budget={data.budget} passportCurrency={pass.currency} /></div>
        <div id="apps"       style={SECTION_OFFSET}><AppsSection       apps={data.useful_apps} /></div>
        <div id="transport"  style={SECTION_OFFSET}><TransportSection  transport={data.transport} /></div>
        <div id="scams"      style={SECTION_OFFSET}><ScamsSection      scams={data.scams} /></div>
        <div id="phrases"    style={SECTION_OFFSET}><PhrasesSection    phrases={data.phrases} /></div>
        <div id="emergency"  style={SECTION_OFFSET}><EmergencySection  emergency={data.emergency} /></div>
        <div id="checklist"  style={SECTION_OFFSET}><ChecklistSection  checklist={data.checklist} /></div>
        {notes && notes.length > 0 && (
          <div id="notes" style={SECTION_OFFSET}>
            <RealTravelNotesSection notes={notes} />
          </div>
        )}
        {places && (
          <div id="gems" style={SECTION_OFFSET}>
            <LocalGemsSection places={places} />
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
