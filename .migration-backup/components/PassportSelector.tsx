"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Passport } from "@/lib/types";

interface PassportSelectorProps {
  passports: Passport[];
  activeId: string;
}

export function PassportSelector({ passports, activeId }: PassportSelectorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = passports.find((p) => p.id === activeId) ?? passports[0];

  // Close on outside pointer down
  useEffect(() => {
    if (!open) return;
    function close(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  // Focus active option when dropdown opens
  useEffect(() => {
    if (!open) return;
    const idx = passports.findIndex((p) => p.id === activeId);
    optionRefs.current[idx >= 0 ? idx : 0]?.focus();
  }, [open, activeId, passports]);

  function handleTriggerKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function handleOptionKey(e: React.KeyboardEvent, idx: number) {
    if (e.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      optionRefs.current[Math.min(idx + 1, passports.length - 1)]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (idx === 0) {
        setOpen(false);
        triggerRef.current?.focus();
      } else {
        optionRefs.current[idx - 1]?.focus();
      }
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  function select(id: string) {
    router.push(`/?passport=${id}`);
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width: "fit-content" }}>
      <span className="passport-selector-label">Your passport</span>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleTriggerKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Passport: ${active.label}. Tap to change`}
        className={`passport-trigger${open ? " passport-trigger--open" : ""}`}
      >
        <span className="passport-trigger-inner">
          <span className="passport-trigger-flag" aria-hidden="true">{active.emoji}</span>
          <span className="passport-trigger-name">{active.label}</span>
          <span className="passport-trigger-suffix">passport</span>
        </span>
        <span className="passport-trigger-chevron" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select your passport"
          className="passport-dropdown anim-fade-down"
        >
          {passports.map((p, idx) => {
            const isActive = p.id === activeId;
            return (
              <button
                key={p.id}
                id={`passport-opt-${p.id}`}
                ref={(el) => { optionRefs.current[idx] = el; }}
                role="option"
                aria-selected={isActive}
                type="button"
                onClick={() => select(p.id)}
                onKeyDown={(e) => handleOptionKey(e, idx)}
                className={`passport-option${isActive ? " passport-option--active" : ""}`}
              >
                <span className="passport-option-flag" aria-hidden="true">{p.emoji}</span>
                <span className="passport-option-info">
                  <span className="passport-option-name">{p.label}</span>
                  <span className="passport-option-region">{p.region}</span>
                </span>
                {isActive && (
                  <svg className="passport-option-check" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
