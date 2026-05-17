import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // --- Color palette: warm, earthy, premium travel ---
      colors: {
        sand: {
          50: "#fdf8f0",
          100: "#faf0dc",
          200: "#f5ddb0",
          300: "#edc878",
          400: "#e4ab45",
          500: "#d4882a",
          600: "#b86a1e",
          700: "#8f4e18",
          800: "#6b3916",
          900: "#4a2810",
        },
        slate: {
          850: "#1a2130",
        },
        // Expanded to full scale — DEFAULT preserves existing `ink` utilities
        ink: {
          DEFAULT: "#1c1917",
          50:  "var(--ink-50)",
          100: "var(--ink-100)",
          200: "var(--ink-200)",
          300: "var(--ink-300)",
          400: "var(--ink-400)",
          500: "var(--ink-500)",
          600: "var(--ink-600)",
          700: "var(--ink-700)",
          800: "var(--ink-800)",
          900: "var(--ink-900)",
        },
        mist: "#f7f3ee",
        // Expanded to full scale — DEFAULT preserves existing `ember` utilities
        ember: {
          DEFAULT: "#d97706",
          50:  "var(--ember-50)",
          100: "var(--ember-100)",
          200: "var(--ember-200)",
          300: "var(--ember-300)",
          400: "var(--ember-400)",
          500: "var(--ember-500)",
          600: "var(--ember-600)",
          700: "var(--ember-700)",
          800: "var(--ember-800)",
          900: "var(--ember-900)",
        },
        sage: "#6b7c6b",
        // New palette entries
        parchment: {
          50:  "var(--parchment-50)",
          100: "var(--parchment-100)",
          200: "var(--parchment-200)",
          300: "var(--parchment-300)",
          400: "var(--parchment-400)",
        },
        forest: {
          50:  "var(--forest-50)",
          100: "var(--forest-100)",
          200: "var(--forest-200)",
          300: "var(--forest-300)",
          400: "var(--forest-400)",
          500: "var(--forest-500)",
          600: "var(--forest-600)",
          700: "var(--forest-700)",
          800: "var(--forest-800)",
          900: "var(--forest-900)",
        },
      },
      // --- Typography ---
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      // --- Spacing extras for mobile comfort ---
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-top": "env(safe-area-inset-top)",
      },
      // --- Border radius scale ---
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "var(--radius-4xl)",
      },
      // --- Max width for mobile-first content ---
      maxWidth: {
        "mobile": "430px",
        "content": "680px",
      },
      // --- Shadow system — wired to CSS token tiers ---
      boxShadow: {
        flush:         "var(--shadow-flush)",
        subtle:        "var(--shadow-subtle)",
        card:          "var(--shadow-card)",
        elevated:      "var(--shadow-elevated)",
        float:         "var(--shadow-float)",
        cinematic:     "var(--shadow-cinematic)",
        "amber-glow":  "var(--shadow-amber-glow)",
        inset:         "var(--shadow-inset)",
      },
      // --- Motion: duration scale ---
      transitionDuration: {
        instant:   "var(--duration-instant)",
        quick:     "var(--duration-quick)",
        moderate:  "var(--duration-moderate)",
        slow:      "var(--duration-slow)",
        cinematic: "var(--duration-cinematic)",
        dramatic:  "var(--duration-dramatic)",
      },
      // --- Motion: easing curves ---
      transitionTimingFunction: {
        smooth:    "var(--ease-smooth)",
        snappy:    "var(--ease-snappy)",
        spring:    "var(--ease-spring)",
        cinematic: "var(--ease-cinematic)",
        "in-smooth": "var(--ease-in-smooth)",
      },
    },
  },
  plugins: [typography],
};

export default config;
