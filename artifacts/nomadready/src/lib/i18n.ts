// ─── NomadReady i18n ──────────────────────────────────────
// Pure function — no context needed.
// Call getT(passportId) to get translated strings for the
// active passport's language.

export interface T {
  // Gateway
  eyebrow:          string;
  headlineLine1:    string;
  headlineLine2:    string;
  subtitle:         string;
  yourPassport:     string;
  enterGuide:       string;
  orClickPassport:  string;
  // Home
  readGuide:        string;
  destinations:     string;
  exploreMap:       string;
  quickComparison:  string;
  travelFieldGuide: string;
  // Guide navigation
  backToAtlas:      string;
  // Guide sections — eyebrows
  fieldNoteEyebrow:      string;
  intelligenceEyebrow:   string;
  forWhoEyebrow:         string;
  fragmentsEyebrow:      string;
  realityEyebrow:        string;
  continueEyebrow:       string;
  // Guide sections — headings
  intelligenceTitle:  string;
  forWhoTitle:        string;
  realityTitle:       string;
  continueTitle:      string;
  // Metric labels
  days:              string;
  perDay:            string;
  freeEntry:         string;
  visaOnArrival:     string;
  eVisa:             string;
  bestSeason:        string;
  fieldScore:        string;
  reviewedOn:        string;
  // Data section labels
  visaLabel:         string;
  budgetLabel:       string;
  appsLabel:         string;
  transportLabel:    string;
  scamsLabel:        string;
  phrasesLabel:      string;
  emergencyLabel:    string;
  checklistLabel:    string;
  // Misc
  passport:          string;
  budget:            string;
  mid:               string;
  comfort:           string;
  extendable:        string;
  multipleEntry:     string;
  verifyNote:        string;
  continent:         string;
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
    backToAtlas:      "← Back to Atlas",
    fieldNoteEyebrow:     "01 · FIELD NOTE",
    intelligenceEyebrow:  "TERRAIN INTELLIGENCE",
    forWhoEyebrow:        "WHO IT'S FOR",
    fragmentsEyebrow:     "FRAGMENTS",
    realityEyebrow:       "TERRAIN REALITY",
    continueEyebrow:      "CONTINUE",
    intelligenceTitle:    "Six dimensions.\nAn honest reading.",
    forWhoTitle:          "Not for everyone.\nMaybe for you.",
    realityTitle:         "What no tourist guide ever tells you.",
    continueTitle:        "Continue exploring.",
    days:              "days",
    perDay:            "/day",
    freeEntry:         "Visa Free",
    visaOnArrival:     "On Arrival",
    eVisa:             "e-Visa",
    bestSeason:        "BEST SEASON",
    fieldScore:        "Field Score",
    reviewedOn:        "Last reviewed",
    visaLabel:         "VISA",
    budgetLabel:       "BUDGET",
    appsLabel:         "APPS & TOOLS",
    transportLabel:    "TRANSPORT",
    scamsLabel:        "WATCH OUT",
    phrasesLabel:      "LOCAL PHRASES",
    emergencyLabel:    "EMERGENCY",
    checklistLabel:    "CHECKLIST",
    passport:          "passport",
    budget:            "Budget",
    mid:               "Mid-range",
    comfort:           "Comfort",
    extendable:        "Extendable",
    multipleEntry:     "Multiple entry",
    verifyNote:        "Verify before travel",
    continent:         "TRAVEL GUIDE",
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
    backToAtlas:      "← Retour à l'atlas",
    fieldNoteEyebrow:     "01 · NOTE DE TERRAIN",
    intelligenceEyebrow:  "INTELLIGENCE DE TERRAIN",
    forWhoEyebrow:        "POUR QUI",
    fragmentsEyebrow:     "FRAGMENTS",
    realityEyebrow:       "RÉALITÉ DU TERRAIN",
    continueEyebrow:      "CONTINUER",
    intelligenceTitle:    "Six dimensions.\nUne lecture honnête.",
    forWhoTitle:          "Pas pour tout le monde.\nPeut-être pour toi.",
    realityTitle:         "Ce que personne ne dit dans les guides.",
    continueTitle:        "Continuer l'exploration.",
    days:              "jours",
    perDay:            "/jour",
    freeEntry:         "Exempt",
    visaOnArrival:     "À l'arrivée",
    eVisa:             "e-Visa",
    bestSeason:        "SAISON",
    fieldScore:        "Field Score",
    reviewedOn:        "Dernière révision",
    visaLabel:         "VISA",
    budgetLabel:       "BUDGET",
    appsLabel:         "APPS & OUTILS",
    transportLabel:    "TRANSPORT",
    scamsLabel:        "ATTENTION",
    phrasesLabel:      "PHRASES LOCALES",
    emergencyLabel:    "URGENCES",
    checklistLabel:    "CHECKLIST",
    passport:          "passeport",
    budget:            "Budget",
    mid:               "Intermédiaire",
    comfort:           "Confort",
    extendable:        "Prolongeable",
    multipleEntry:     "Entrées multiples",
    verifyNote:        "Vérifier avant voyage",
    continent:         "GUIDE DE VOYAGE",
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
    backToAtlas:      "← Zurück zum Atlas",
    fieldNoteEyebrow:     "01 · REISENOTIZ",
    intelligenceEyebrow:  "REISE-ANALYSE",
    forWhoEyebrow:        "FÜR WEN",
    fragmentsEyebrow:     "FRAGMENTE",
    realityEyebrow:       "REISEREALITÄT",
    continueEyebrow:      "WEITER",
    intelligenceTitle:    "Sechs Dimensionen.\nEine ehrliche Einschätzung.",
    forWhoTitle:          "Nicht für jeden.\nVielleicht für dich.",
    realityTitle:         "Was kein Reiseführer je erzählt.",
    continueTitle:        "Weiter erkunden.",
    days:              "Tage",
    perDay:            "/Tag",
    freeEntry:         "Visumfrei",
    visaOnArrival:     "Bei Ankunft",
    eVisa:             "e-Visum",
    bestSeason:        "SAISON",
    fieldScore:        "Field Score",
    reviewedOn:        "Zuletzt geprüft",
    visaLabel:         "VISUM",
    budgetLabel:       "BUDGET",
    appsLabel:         "APPS & TOOLS",
    transportLabel:    "TRANSPORT",
    scamsLabel:        "ACHTUNG",
    phrasesLabel:      "LOKALE PHRASEN",
    emergencyLabel:    "NOTRUF",
    checklistLabel:    "CHECKLISTE",
    passport:          "Reisepass",
    budget:            "Günstig",
    mid:               "Mittelklasse",
    comfort:           "Komfort",
    extendable:        "Verlängerbar",
    multipleEntry:     "Mehrfacheinreise",
    verifyNote:        "Vor Reise prüfen",
    continent:         "REISEFÜHRER",
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
    backToAtlas:      "← Volver al atlas",
    fieldNoteEyebrow:     "01 · NOTA DE CAMPO",
    intelligenceEyebrow:  "INTELIGENCIA DE CAMPO",
    forWhoEyebrow:        "PARA QUIÉN",
    fragmentsEyebrow:     "FRAGMENTOS",
    realityEyebrow:       "REALIDAD DEL TERRENO",
    continueEyebrow:      "CONTINUAR",
    intelligenceTitle:    "Seis dimensiones.\nUna lectura honesta.",
    forWhoTitle:          "No para todos.\nQuizás para ti.",
    realityTitle:         "Lo que ninguna guía te cuenta.",
    continueTitle:        "Seguir explorando.",
    days:              "días",
    perDay:            "/día",
    freeEntry:         "Sin visado",
    visaOnArrival:     "A la llegada",
    eVisa:             "e-Visa",
    bestSeason:        "TEMPORADA",
    fieldScore:        "Field Score",
    reviewedOn:        "Última revisión",
    visaLabel:         "VISADO",
    budgetLabel:       "PRESUPUESTO",
    appsLabel:         "APPS Y HERRAMIENTAS",
    transportLabel:    "TRANSPORTE",
    scamsLabel:        "CUIDADO",
    phrasesLabel:      "FRASES LOCALES",
    emergencyLabel:    "EMERGENCIAS",
    checklistLabel:    "LISTA",
    passport:          "pasaporte",
    budget:            "Económico",
    mid:               "Intermedio",
    comfort:           "Confort",
    extendable:        "Prorrogable",
    multipleEntry:     "Entradas múltiples",
    verifyNote:        "Verificar antes de viajar",
    continent:         "GUÍA DE VIAJE",
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
    backToAtlas:      "← Torna all'atlante",
    fieldNoteEyebrow:     "01 · NOTA DI CAMPO",
    intelligenceEyebrow:  "INTELLIGENCE DI CAMPO",
    forWhoEyebrow:        "PER CHI",
    fragmentsEyebrow:     "FRAMMENTI",
    realityEyebrow:       "REALTÀ DEL TERRITORIO",
    continueEyebrow:      "CONTINUA",
    intelligenceTitle:    "Sei dimensioni.\nUna lettura onesta.",
    forWhoTitle:          "Non per tutti.\nForse per te.",
    realityTitle:         "Ciò che nessuna guida racconta.",
    continueTitle:        "Continuare l'esplorazione.",
    days:              "giorni",
    perDay:            "/giorno",
    freeEntry:         "Senza visto",
    visaOnArrival:     "All'arrivo",
    eVisa:             "e-Visto",
    bestSeason:        "STAGIONE",
    fieldScore:        "Field Score",
    reviewedOn:        "Ultima revisione",
    visaLabel:         "VISTO",
    budgetLabel:       "BUDGET",
    appsLabel:         "APP E STRUMENTI",
    transportLabel:    "TRASPORTI",
    scamsLabel:        "ATTENZIONE",
    phrasesLabel:      "FRASI LOCALI",
    emergencyLabel:    "EMERGENZE",
    checklistLabel:    "LISTA",
    passport:          "passaporto",
    budget:            "Economico",
    mid:               "Intermedio",
    comfort:           "Confort",
    extendable:        "Prorogabile",
    multipleEntry:     "Ingressi multipli",
    verifyNote:        "Verificare prima del viaggio",
    continent:         "GUIDA DI VIAGGIO",
  },
} as const;

export type Lang = keyof typeof TRANSLATIONS;

export function getLang(passportId: string): Lang {
  return LANG_MAP[passportId] ?? "en";
}

export function getT(passportId: string): T {
  return TRANSLATIONS[getLang(passportId)] as T;
}
