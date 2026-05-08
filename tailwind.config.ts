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
        ink: "#1c1917",       // near-black for headings
        mist: "#f7f3ee",      // warm off-white background
        ember: "#d97706",     // amber accent
        sage: "#6b7c6b",      // muted green for tags
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
      // --- Border radius for card components ---
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      // --- Max width for mobile-first content ---
      maxWidth: {
        "mobile": "430px",
        "content": "680px",
      },
    },
  },
  plugins: [typography],
};

export default config;
