import { Switch, Route, Router as WouterRouter } from "wouter";
import { ProfileProvider } from "@/components/ProfileProvider";
import HomePage from "@/pages/HomePage";
import DestinationPage from "@/pages/DestinationPage";
import "@/globals.css";

function NotFound() {
  return (
    <main className="page-container flex-1 flex flex-col items-center justify-center gap-6 py-24 text-center" style={{ minHeight: "100dvh" }}>
      <p className="text-5xl">🗺️</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p style={{ color: "var(--text-secondary)" }}>
        This destination doesn&apos;t exist yet.
      </p>
      <a
        href="/"
        style={{
          display: "inline-flex",
          background: "var(--accent)",
          color: "#fff",
          borderRadius: "9999px",
          padding: "0.5rem 1.25rem",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
        }}
      >
        Back to home
      </a>
    </main>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/ready/:passport/:destination" component={DestinationPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ProfileProvider>
      <div className="min-h-dvh flex flex-col">
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </div>
    </ProfileProvider>
  );
}

export default App;
