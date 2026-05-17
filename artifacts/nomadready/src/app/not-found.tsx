import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-container flex-1 flex flex-col items-center justify-center gap-6 py-24 text-center">
      <p className="text-5xl">🗺️</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p style={{ color: "var(--text-secondary)" }}>
        This destination doesn't exist yet.
      </p>
      <Link
        href="/"
        className="badge text-sm px-4 py-2"
        style={{
          background: "var(--accent)",
          color: "#fff",
          borderRadius: "9999px",
        }}
      >
        Back to home
      </Link>
    </main>
  );
}
