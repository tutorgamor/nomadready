"use client";

import { useRouter } from "next/navigation";
import type { Passport } from "@/lib/types";

interface PassportSelectorProps {
  passports: Passport[];
  activeId: string;
}

export function PassportSelector({ passports, activeId }: PassportSelectorProps) {
  const router = useRouter();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <span
        style={{
          fontSize: "0.72rem",
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        Your passport
      </span>
      <select
        value={activeId}
        onChange={(e) => router.push(`/?passport=${e.target.value}`)}
        aria-label="Select your passport"
        className="passport-chip"
        style={{ cursor: "pointer", width: "fit-content" }}
      >
        {passports.map((p) => (
          <option key={p.id} value={p.id}>
            {p.emoji} {p.label} passport
          </option>
        ))}
      </select>
    </div>
  );
}
