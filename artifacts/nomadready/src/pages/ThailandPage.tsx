"use client";

/**
 * /destinations/thailand
 * ─────────────────────────────────────────────────────────────────────────────
 * Flagship editorial page for Thailand. This is not a data dashboard.
 * It's a cinematic field guide chapter — emotional, restrained, editorial.
 *
 * Sections
 *   1. Cinematic hero      — full-viewport, Ken Burns photo, warm overlay
 *   2. Field note          — personal editorial fragment, 5 lines max
 *   3. Readiness intel     — 6 pillars, dark cinematic band
 *   4. Who it's for        — 4 identity profiles
 *   5. Micro memories      — numbered cinematic text fragments
 *   6. Practical reality   — grounded field observations from real data
 *   7. CTA                 — continue exploring
 */

import React from "react";
import { motion } from "motion/react";
import { Link } from "wouter";
import type { RealTravelNote } from "@/lib/types";

// ── Direct data imports ───────────────────────────────────────────────────────
import readyDataRaw from "@/data/ready/fr-thailand.json";
import notesDataRaw from "@/data/notes/thailand.json";

const readyData = readyDataRaw as { disclaimer: string; last_reviewed: string };
const notes     = notesDataRaw as RealTravelNote[];

// ── Motion helpers ────────────────────────────────────────────────────────────
const VIEWPORT = { once: true as const, margin: "-60px" as const };

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Content ───────────────────────────────────────────────────────────────────

const PILLARS = [
  {
    label:    "VISA",
    value:    "Libre · 60 jours",
    note:     "Exemption sur présentation du passeport. Prolongeable 30 jours pour 1 900 ฿.",
    strength: 1.0,
  },
  {
    label:    "BUDGET",
    value:    "฿900 / jour",
    note:     "Backpacker confortable. Le confort démarre à ฿2 000 — encore raisonnable.",
    strength: 0.92,
  },
  {
    label:    "INTERNET",
    value:    "Correct · Variable",
    note:     "Villes rapides, hôtels imprévisibles. Toujours tester au bureau avant le premier call.",
    strength: 0.68,
  },
  {
    label:    "SÉCURITÉ",
    value:    "Stable",
    note:     "Faible criminalité violente. Arnaques touristiques concentrées près des temples majeurs.",
    strength: 0.80,
  },
  {
    label:    "ÉNERGIE",
    value:    "Haute · Stimulante",
    note:     "Bangkok donne de l'élan à certains, épuise les autres. La résistance s'installe à la 3e semaine.",
    strength: 0.76,
  },
  {
    label:    "PRODUCTIVITÉ",
    value:    "Forte si ancré",
    note:     "Café culture dense et sérieuse. BTS pour se déplacer sans friction. Routine possible dès j+10.",
    strength: 0.84,
  },
];

const FOR_WHO = [
  {
    profile:     "Le nomade en transition",
    description: "Tu viens de quitter un emploi, une ville, une vie. Bangkok est suffisamment vivante pour que tu n'aies pas le temps de douter.",
  },
  {
    profile:     "Le remote worker qui cherche la cadence",
    description: "La ville a un rythme. Les cafés sont sérieux. Le BTS te déplace sans friction. La discipline arrive toute seule.",
  },
  {
    profile:     "Le solo-voyageur qui aime les villes",
    description: "Tu aimes les villes qui ne dorment pas. Bangkok ne dormira jamais. Et tu finiras par l'apprécier à 3h du matin.",
  },
  {
    profile:     "Le voyageur lent",
    description: "60 jours d'exemption. Prolongeable. Assez de quartiers pour ne jamais t'ennuyer. Assez de sérénité pour vraiment travailler.",
  },
];

const MEMORIES = [
  "Un après-midi de pluie à Sarnies Silom. Zoom fermé, carnet ouvert. Le bruit de la rue devient feutre.",
  "3h du matin. Le marché en bas de l'immeuble est encore vivant. Tu descends sans raison précise.",
  "Premier matin calme à Bangkok. Le temple sonne au loin. La chaleur n'est pas encore insupportable.",
  "Le BTS entre Asok et Phrom Phong. Bangkok par la vitre, filtrée par une lumière orange de fin de journée.",
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ThailandPage() {
  const reviewedDate = new Date(readyData.last_reviewed).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <main style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--bg-base)" }}>

      {/* ════════════════════════════════════════════════════════════
          1 · HERO
          Cinematic Bangkok temple photo with Ken Burns + warm overlay.
      ════════════════════════════════════════════════════════════ */}
      <section className="th-hero">
        {/* Background media */}
        <div className="th-hero-media" aria-hidden>
          <img
            src="https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1600&q=88&auto=format&fit=crop"
            alt=""
            className="th-hero-img"
            fetchPriority="high"
            decoding="async"
          />
          <div className="th-hero-overlay" />
          <div className="th-hero-glow"    />
          <div className="th-hero-grain"   />
        </div>

        {/* Top nav bar */}
        <div className="th-hero-topbar">
          <Link to="/" className="th-back-link">
            ← Retour à l'atlas
          </Link>
          <span className="th-hero-tag">THAÏLANDE · ASIE DU SUD-EST</span>
        </div>

        {/* Main text content — anchored to bottom */}
        <div className="th-hero-content page-container">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.90, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="th-hero-text"
          >
            <h1 className="th-hero-h1">
              Bangkok ne cède<br />pas facilement.
            </h1>
            <p className="th-hero-sub">
              Le chaos devient musique.<br />
              Le temps ralentit. Et puis<br />
              tu ne veux plus partir.
            </p>
          </motion.div>

          {/* Metadata strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.70, delay: 0.55 }}
            className="th-hero-meta"
          >
            {[
              { label: "VISA",    value: "Exempt · 60j" },
              { label: "BUDGET",  value: "฿900 / jour"  },
              { label: "SAISON",  value: "Nov – Mar"    },
            ].map((m, i) => (
              <div
                key={m.label}
                className="th-hero-meta-item"
                style={i > 0 ? { borderLeft: "1px solid rgba(255,255,255,0.14)", paddingLeft: "1.25rem" } : {}}
              >
                <span className="th-hero-meta-label">{m.label}</span>
                <span className="th-hero-meta-value">{m.value}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Wave transition to first section */}
        <div className="th-hero-wave" aria-hidden>
          <svg viewBox="0 0 1440 64" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <path d="M0 32 Q200 10 400 26 Q620 44 820 18 Q1020 0 1220 22 Q1360 36 1440 20 L1440 64 L0 64 Z" fill="var(--bg-base)" />
            <path d="M0 46 Q300 32 600 42 Q900 52 1200 40 Q1360 32 1440 40 L1440 64 L0 64 Z" fill="var(--bg-base)" opacity="0.55" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          2 · FIELD NOTE
          A personal editorial fragment. 5 lines, restrained.
      ════════════════════════════════════════════════════════════ */}
      <section className="th-section th-section--light">
        <div className="page-container th-section-inner">
          <Reveal>
            <p className="th-eyebrow">01 · NOTE DE TERRAIN</p>
          </Reveal>
          <Reveal delay={0.10}>
            <blockquote className="th-field-note">
              La première semaine, tu luttes contre la ville.<br />
              Le bruit, la chaleur, la densité.<br />
              À la troisième semaine, tu arrêtes de lutter.<br />
              Bangkok a son propre rythme.<br />
              Il fallait juste rester assez longtemps pour l'entendre.
            </blockquote>
          </Reveal>
          <Reveal delay={0.20}>
            <p className="th-field-note-byline">
              Observations · Bangkok · Séjour de 6 semaines
            </p>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3 · READINESS INTELLIGENCE
          6 pillars. Dark cinematic band. Travel artifacts, not widgets.
      ════════════════════════════════════════════════════════════ */}
      <section className="th-section th-section--dark">
        <div className="page-container th-section-inner">
          <Reveal>
            <p className="th-eyebrow th-eyebrow--amber">INTELLIGENCE DE TERRAIN</p>
            <h2 className="th-section-h2 th-section-h2--light">
              Six dimensions.<br />Une lecture honnête.
            </h2>
          </Reveal>

          <div className="th-pillars-grid">
            {PILLARS.map((p, i) => (
              <Reveal key={p.label} delay={i * 0.07}>
                <div className="th-pillar">
                  <div className="th-pillar-track">
                    <motion.div
                      className="th-pillar-fill"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${p.strength * 100}%` }}
                      viewport={VIEWPORT}
                      transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.05 }}
                    />
                  </div>
                  <p className="th-pillar-label">{p.label}</p>
                  <p className="th-pillar-value">{p.value}</p>
                  <p className="th-pillar-note">{p.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4 · WHO IT'S FOR
          Identity profiles — not bullet points.
      ════════════════════════════════════════════════════════════ */}
      <section className="th-section th-section--light">
        <div className="page-container th-section-inner">
          <Reveal>
            <p className="th-eyebrow">02 · POUR QUI</p>
            <h2 className="th-section-h2">
              Ce n'est pas pour tout le monde.<br />
              Mais peut-être pour toi.
            </h2>
          </Reveal>

          <div className="th-forwho-grid">
            {FOR_WHO.map((fw, i) => (
              <Reveal key={fw.profile} delay={i * 0.08}>
                <div className="th-forwho-card">
                  <h3 className="th-forwho-title">{fw.profile}</h3>
                  <p className="th-forwho-text">{fw.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5 · MICRO MEMORIES
          Numbered cinematic text fragments. Large italic Cormorant.
      ════════════════════════════════════════════════════════════ */}
      <section className="th-section th-section--dark">
        <div className="page-container th-section-inner">
          <Reveal>
            <p className="th-eyebrow th-eyebrow--amber">FRAGMENTS · THAÏLANDE</p>
          </Reveal>
          <div className="th-memories-list">
            {MEMORIES.map((text, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="th-memory">
                  <span className="th-memory-num">0{i + 1}</span>
                  <p className="th-memory-text">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          6 · PRACTICAL REALITY
          Real field observations — grounded, honest, sourced from data.
      ════════════════════════════════════════════════════════════ */}
      <section className="th-section th-section--light">
        <div className="page-container th-section-inner">
          <Reveal>
            <p className="th-eyebrow">03 · RÉALITÉ DU TERRAIN</p>
            <h2 className="th-section-h2">
              Ce que personne ne dit<br />dans les guides touristiques.
            </h2>
          </Reveal>

          <div className="th-reality-list">
            {notes.map((note, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div className="th-reality-item">
                  <span className="th-reality-type">
                    {(note.type ?? "note").toUpperCase()}
                  </span>
                  <div className="th-reality-body">
                    <h4 className="th-reality-title">{note.title}</h4>
                    <p className="th-reality-note">{note.note}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          7 · CTA
          Continue exploring — or go deeper on Thailand.
      ════════════════════════════════════════════════════════════ */}
      <section className="th-section th-section--dark">
        <div className="page-container th-section-inner">
          <Reveal>
            <p className="th-eyebrow th-eyebrow--amber">CONTINUER</p>
            <h2 className="th-section-h2 th-section-h2--light">
              La Thaïlande en détail.<br />Ou explorer ailleurs.
            </h2>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="th-cta-actions">
              <Link to="/ready/fr/thailand" className="th-cta-primary">
                Guide complet Thaïlande
                <span aria-hidden style={{ marginLeft: "0.5em", opacity: 0.75 }}>→</span>
              </Link>
              <Link to="/ready/fr/indonesia" className="th-cta-secondary">
                Comparer avec l'Indonésie →
              </Link>
              <Link to="/" className="th-cta-tertiary">
                Retour à l'atlas →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="th-footer">
        <div className="page-container">
          <p className="th-footer-text">{readyData.disclaimer}</p>
          <p className="th-footer-date">Dernière révision · {reviewedDate}</p>
        </div>
      </footer>

    </main>
  );
}
