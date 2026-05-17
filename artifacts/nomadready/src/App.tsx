import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, useParams } from "wouter";
import { ProfileProvider } from "@/components/ProfileProvider";
import { CustomCursor } from "@/components/CustomCursor";
import HomePage from "@/pages/HomePage";
import DestinationPage from "@/pages/DestinationPage";
import CountryPage from "@/pages/CountryPage";
import ThailandPage from "@/pages/ThailandPage";
import "@/globals.css";

const COUNTRIES_WITH_MAPS = new Set(["thailand"]);

function CountryOrDestination() {
  const { destination } = useParams<{ destination: string }>();
  if (COUNTRIES_WITH_MAPS.has(destination ?? "")) return <CountryPage />;
  return <DestinationPage />;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);
  return null;
}

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
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/destinations/thailand" component={ThailandPage} />
        <Route path="/ready/:passport/:country/:city" component={DestinationPage} />
        <Route path="/ready/:passport/:destination" component={CountryOrDestination} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ProfileProvider>
      <CustomCursor />
      <div className="min-h-dvh flex flex-col">
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
      </div>
    </ProfileProvider>
  );
}

export default App;
