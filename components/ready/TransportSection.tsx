export function TransportSection({ transport }: { transport: string[] }) {
  return (
    <div className="card">
      <p className="section-heading">Transport</p>
      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.625rem",
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}
      >
        {transport.map((tip, i) => (
          <li
            key={i}
            style={{
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
              lineHeight: 1.55,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                flexShrink: 0,
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "var(--accent)",
                marginTop: "0.6rem",
              }}
            />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
