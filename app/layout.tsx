import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ProfileProvider } from "@/components/ProfileProvider";
import "./globals.css";

/* ─── Metadata ───────────────────────────────────────────── */

// VERCEL_URL is auto-set on every Vercel deployment; falls back to localhost for local builds.
const siteUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NomadReady — Travel Readiness for Backpackers",
    template: "%s | NomadReady",
  },
  description:
    "One scroll, one page: visa rules, budget tiers, common scams, local phrases and more — built for French passport holders.",
  keywords: ["backpacker", "travel", "visa", "digital nomad", "travel guide", "travel tips"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "NomadReady",
    title: "NomadReady — Travel Readiness for Backpackers",
    description:
      "One scroll, one page: visa rules, budget tiers, common scams, local phrases and more.",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "NomadReady — Travel Readiness for Backpackers",
    description:
      "One scroll, one page: visa rules, budget tiers, common scams, local phrases and more.",
  },
};

/* ─── Viewport ───────────────────────────────────────────── */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f3ee",
};

/* ─── Layout ─────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        {/* Global layout wrapper — mobile-first, centered */}
        <div className="min-h-dvh flex flex-col">
          <ProfileProvider>{children}</ProfileProvider>
        </div>
      </body>
    </html>
  );
}
