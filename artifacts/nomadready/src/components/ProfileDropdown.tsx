"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PROFILES, useProfileContext } from "@/lib/profile";

export function ProfileDropdown() {
  const { profile, setProfileId } = useProfileContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.32)" }}>
        Travel style
      </span>

      <div style={{ position: "relative" }}>
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.7rem",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.13)",
            borderRadius: "9px",
            cursor: "pointer",
            color: "rgba(255,255,255,0.88)",
          }}
        >
          <span style={{ fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}>{profile.emoji}</span>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, flex: 1, textAlign: "left", letterSpacing: "-0.01em" }}>
            {profile.label}
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ fontSize: "0.65rem", opacity: 0.45, flexShrink: 0, lineHeight: 1 }}
          >
            ▼
          </motion.span>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scaleY: 0.92 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -4, scaleY: 0.94 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute",
                bottom: "calc(100% + 6px)",
                left: 0,
                right: 0,
                background: "rgba(8,13,28,0.94)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "10px",
                padding: "4px",
                zIndex: 200,
                transformOrigin: "bottom center",
                boxShadow: "0 8px 28px rgba(0,0,0,0.55), 0 0 0 1px rgba(217,119,6,0.08)",
              }}
            >
              {PROFILES.map((p) => {
                const active = profile.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setProfileId(p.id); setOpen(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.55rem",
                      width: "100%",
                      padding: "0.45rem 0.6rem",
                      borderRadius: "7px",
                      border: "none",
                      cursor: "pointer",
                      background: active ? "rgba(217,119,6,0.16)" : "transparent",
                      textAlign: "left",
                      transition: "background 0.12s",
                    }}
                  >
                    <span style={{ fontSize: "0.95rem", lineHeight: 1, flexShrink: 0 }}>{p.emoji}</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: active ? 700 : 500, color: active ? "rgba(255,200,80,0.95)" : "rgba(255,255,255,0.80)", lineHeight: 1.2 }}>
                        {p.label}
                      </span>
                      <span style={{ fontSize: "0.64rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.insightLine}
                      </span>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
