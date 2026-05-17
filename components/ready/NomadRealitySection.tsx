import { SectionHeading } from './SectionHeading';
import type { NomadRealityNote } from "@/lib/types";

function RealityNoteRow({ note }: { note: NomadRealityNote }) {
  return (
    <div style={{ padding: "0.9375rem 1.375rem" }}>
      <p
        style={{
          fontSize: "0.8125rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.01em",
          margin: "0 0 0.25rem",
          lineHeight: 1.3,
        }}
      >
        {note.title}
      </p>
      <p
        style={{
          fontSize: "0.875rem",
          fontStyle: "italic",
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {note.note}
      </p>
    </div>
  );
}

export function NomadRealitySection({ notes }: { notes: NomadRealityNote[] }) {
  return (
    <div className="card" style={{ overflow: "hidden", padding: 0 }}>
      {/* Header */}
      <div
        style={{
          padding: "1.125rem 1.375rem 0.875rem",
          borderBottom: "1px solid var(--border)",
          background: "linear-gradient(160deg, #f9f7f5 0%, #f2f0ec 100%)",
        }}
      >
        <SectionHeading category="reality" style={{ margin: "0 0 0.125rem" }}>
          Nomad Reality
        </SectionHeading>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Field notes for remote workers and long-stay travelers.
        </p>
      </div>

      {/* Notes — desktop: 2-column editorial diptych */}
      <div className="reality-notes-grid">
        {notes.map((note) => (
          <div key={note.title} className="reality-note-cell">
            <RealityNoteRow note={note} />
          </div>
        ))}
      </div>

      {/* Credibility footer */}
      <p
        style={{
          fontSize: "0.6875rem",
          color: "var(--text-muted)",
          fontStyle: "italic",
          lineHeight: 1.55,
          margin: 0,
          padding: "0.875rem 1.375rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        Based on field experience and recurring public feedback. Conditions can change depending on season, accommodation, and neighborhood.
      </p>
    </div>
  );
}
