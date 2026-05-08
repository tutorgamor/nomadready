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

export default async function ReadyPage({ params }: Props) {
  const { passport: passportId, destination } = await params;

  const dest = destinations.find((d) => d.id === destination);
  const pass = passports.find((p) => p.id === passportId);
  const filePath = path.join(process.cwd(), "data", "ready", `${passportId}-${destination}.json`);

  if (!dest || !pass || !fs.existsSync(filePath)) notFound();

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as ReadyData;

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
        {/* Depth overlay */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.32) 100%)",
          }}
        />

        <div
          className="page-container"
          style={{
            position: "relative",
            paddingTop: "1.25rem",
            paddingBottom: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Back link — preserves active passport in URL */}
          <Link
            href={`/?passport=${passportId}`}
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "#ffffff",
              background: "rgba(0, 0, 0, 0.22)",
              padding: "0.3rem 0.75rem 0.3rem 0.5rem",
              borderRadius: "9999px",
              textDecoration: "none",
            }}
          >
            ← All destinations
          </Link>

          {/* Emoji + routing line + title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "3.25rem", lineHeight: 1 }} aria-hidden="true">
              {dest.emoji}
            </span>

            <div>
              {/* Route label */}
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.65)",
                  margin: "0 0 0.3rem",
                }}
              >
                {pass.emoji} {pass.label} →
              </p>

              {/* Destination name */}
              <h1
                style={{
                  fontSize: "clamp(2rem, 9vw, 2.5rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: 1.05,
                  textShadow: "0 1px 4px rgba(0,0,0,0.18)",
                }}
              >
                {dest.label}
              </h1>

              {/* Hero tag */}
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "rgba(255,255,255,0.82)",
                  margin: "0.4rem 0 0",
                  lineHeight: 1.4,
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
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.9)",
                background: "rgba(0,0,0,0.2)",
                padding: "0.2rem 0.6rem",
                borderRadius: "9999px",
              }}
            >
              {dest.region}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Reviewed {reviewedDate}
            </span>
          </div>
        </div>
      </header>

      {/* ── Sticky section nav ────────────────────────────────── */}
      <SectionNav />

      {/* ── All 10 sections ───────────────────────────────────── */}
      <div
        className="page-container"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          paddingTop: "1.25rem",
          paddingBottom: "3.5rem",
        }}
      >
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
