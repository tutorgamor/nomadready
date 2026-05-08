import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import passportsData from "@/data/passports.json";
import destinationsData from "@/data/destinations.json";
import type { Passport, Destination } from "@/lib/types";
import { PassportSelector } from "@/components/PassportSelector";
import { DestinationCard } from "@/components/DestinationCard";

export const metadata: Metadata = {
  title: { absolute: "NomadReady — Travel Readiness for Backpackers" },
  description:
    "One scroll, one page: visa rules, budget tiers, common scams, local phrases and more — tailored to your passport.",
};

const passports = passportsData as Passport[];
const destinations = destinationsData as Destination[];

interface HomePageProps {
  searchParams: Promise<{ passport?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const activePassportId = passports.some((p) => p.id === params.passport)
    ? params.passport!
    : "fr";

  const dir = path.join(process.cwd(), "data", "ready");
  const availableIds = new Set(
    fs
      .readdirSync(dir)
      .filter((f) => f.startsWith(`${activePassportId}-`) && f.endsWith(".json"))
      .map((f) => f.slice(activePassportId.length + 1, -5))
  );
  const availableDestinations = destinations.filter((d) => availableIds.has(d.id));

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
        style={{
          background: "linear-gradient(180deg, #f0e9df 0%, var(--bg-base) 100%)",
          borderBottom: "1px solid var(--border)",
          paddingTop: "3rem",
          paddingBottom: "2rem",
        }}
      >
        <div className="page-container" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Brand wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }} aria-hidden="true">🌍</span>
            <span
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              NomadReady
            </span>
          </div>

          {/* Headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <h1
              style={{
                fontSize: "clamp(1.75rem, 6vw, 2.25rem)",
                fontWeight: 700,
                letterSpacing: "-0.035em",
                color: "var(--text-primary)",
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Where are you<br />heading next?
            </h1>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--text-secondary)",
                margin: 0,
                maxWidth: "30ch",
                lineHeight: 1.5,
              }}
            >
              Get your full travel brief in one scroll — visa, budget, scams and more.
            </p>
          </div>

          {/* Passport selector */}
          <PassportSelector passports={passports} activeId={activePassportId} />

        </div>
      </header>

      {/* ── Destination grid ──────────────────────────────────── */}
      <section
        style={{ flex: 1, paddingTop: "1.75rem", paddingBottom: "3rem" }}
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

          {/* Cards — single column on mobile, 2-col on wider screens */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: "0.875rem",
            }}
          >
            {availableDestinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} passportId={activePassportId} />
            ))}
          </div>

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
