// ─── NomadReady i18n ──────────────────────────────────────
// Pure function — no context needed.
// Call getT(passportId) to get translated strings for the
// active passport's language.

export interface T {
  eyebrow:        string;
  headlineLine1:  string;
  headlineLine2:  string;
  subtitle:       string;
  yourPassport:   string;
  enterGuide:     string;
  orClickPassport: string;
  readGuide:      string;
  destinations:   string;
  exploreMap:     string;
  quickComparison: string;
  travelFieldGuide: string;
}

const LANG_MAP: Record<string, keyof typeof TRANSLATIONS> = {
  fr: "fr", be: "fr",
  uk: "en", us: "en", ca: "en", au: "en", nl: "en",
  de: "de",
  es: "es",
  it: "it",
};

const TRANSLATIONS = {
  en: {
    eyebrow:          "Travel Field Guide",
    headlineLine1:    "Where are you",
    headlineLine2:    "heading next?",
    subtitle:         "Choose your passport, pick a destination — visa rules, budget tiers, and field notes in one scroll.",
    yourPassport:     "Your passport",
    enterGuide:       "Enter the Guide",
    orClickPassport:  "or click the passport",
    readGuide:        "Read guide",
    destinations:     "destinations",
    exploreMap:       "explore the map",
    quickComparison:  "Quick comparison · Plan by trip length",
    travelFieldGuide: "Travel Field Guide",
  },
  fr: {
    eyebrow:          "Guide de voyage",
    headlineLine1:    "Où allez-vous",
    headlineLine2:    "ensuite ?",
    subtitle:         "Choisissez votre passeport, choisissez une destination — règles de visa, budgets et notes de terrain en un scroll.",
    yourPassport:     "Votre passeport",
    enterGuide:       "Entrer dans le guide",
    orClickPassport:  "ou cliquez sur le passeport",
    readGuide:        "Lire le guide",
    destinations:     "destinations",
    exploreMap:       "explorer la carte",
    quickComparison:  "Comparatif rapide · Planifier par durée",
    travelFieldGuide: "Guide de voyage",
  },
  de: {
    eyebrow:          "Reiseführer",
    headlineLine1:    "Wohin reist du",
    headlineLine2:    "als Nächstes?",
    subtitle:         "Wähle deinen Reisepass, wähle ein Ziel — Visa-Regeln, Budgets und Reisetipps auf einen Blick.",
    yourPassport:     "Dein Reisepass",
    enterGuide:       "Zum Reiseführer",
    orClickPassport:  "oder tippe auf den Reisepass",
    readGuide:        "Guide lesen",
    destinations:     "Reiseziele",
    exploreMap:       "Karte erkunden",
    quickComparison:  "Schnellvergleich · Nach Reisedauer planen",
    travelFieldGuide: "Reiseführer",
  },
  es: {
    eyebrow:          "Guía de viaje",
    headlineLine1:    "¿A dónde vas",
    headlineLine2:    "después?",
    subtitle:         "Elige tu pasaporte, elige un destino — reglas de visado, presupuestos y notas de campo en un scroll.",
    yourPassport:     "Tu pasaporte",
    enterGuide:       "Entrar a la guía",
    orClickPassport:  "o haz clic en el pasaporte",
    readGuide:        "Leer guía",
    destinations:     "destinos",
    exploreMap:       "explorar el mapa",
    quickComparison:  "Comparativa rápida · Planear por duración",
    travelFieldGuide: "Guía de viaje",
  },
  it: {
    eyebrow:          "Guida di viaggio",
    headlineLine1:    "Dove vai",
    headlineLine2:    "adesso?",
    subtitle:         "Scegli il tuo passaporto, scegli una destinazione — regole visto, budget e note di campo in uno scroll.",
    yourPassport:     "Il tuo passaporto",
    enterGuide:       "Entra nella guida",
    orClickPassport:  "o clicca sul passaporto",
    readGuide:        "Leggi guida",
    destinations:     "destinazioni",
    exploreMap:       "esplora la mappa",
    quickComparison:  "Confronto rapido · Pianifica per durata",
    travelFieldGuide: "Guida di viaggio",
  },
} as const;

export type Lang = keyof typeof TRANSLATIONS;

export function getLang(passportId: string): Lang {
  return LANG_MAP[passportId] ?? "en";
}

export function getT(passportId: string): T {
  return TRANSLATIONS[getLang(passportId)] as T;
}
