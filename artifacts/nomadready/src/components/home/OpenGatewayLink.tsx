"use client";

/**
 * OpenGatewayLink — discreet editorial trigger that re-opens the
 * passport gateway from anywhere in the app.
 *
 * On click:
 *  1. Clears the "nr_gateway_passed" sessionStorage flag
 *  2. Dispatches the "nr:show-gateway" CustomEvent on window
 *  3. PassportGatewayHero listens for that event, resets state,
 *     and re-shows itself pre-selecting the current URL passport.
 *
 * Styled as a minimal amber link — fits inside hero-controls-glass
 * below the PassportSelector chip without competing with it.
 */
export function OpenGatewayLink() {
  function openGateway() {
    try { sessionStorage.removeItem("nr_gateway_passed"); } catch { /* private browsing */ }
    window.dispatchEvent(new CustomEvent("nr:show-gateway"));
  }

  return (
    <button
      type="button"
      onClick={openGateway}
      style={{
        background: "none",
        border: "none",
        padding: "1px 0",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.28rem",
        fontSize: "0.68rem",
        fontWeight: 600,
        letterSpacing: "0.04em",
        color: "var(--accent)",
        opacity: 0.58,
        fontFamily: "var(--font-geist-sans)",
        textTransform: "lowercase",
        transition: "opacity 0.15s ease",
        lineHeight: 1,
        marginTop: "-0.1rem",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.58")}
      onFocus={(e)      => (e.currentTarget.style.opacity = "1")}
      onBlur={(e)       => (e.currentTarget.style.opacity = "0.58")}
      aria-label="Re-open the passport selection guide"
    >
      {/* Rotated arrow — "go back to beginning" */}
      <span aria-hidden style={{ fontSize: "0.75rem", lineHeight: 1 }}>↩</span>
      change via guide
    </button>
  );
}
