import { useState, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { Link } from "wouter";
import { motion, AnimatePresence } from "motion/react";
import destinationsDataRaw from "@/data/destinations.json";
import passportsDataRaw     from "@/data/passports.json";
import type { ReadyData, Destination, Passport, LocalGem, RealTravelNote, NomadRealityNote, TravelScore } from "@/lib/types";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { WordReveal }     from "@/components/motion/WordReveal";
import { getT }           from "@/lib/i18n";

// ── Data loading ─────────────────────────────────────────────────────────────

const destinations = destinationsDataRaw as Destination[];
const passports    = passportsDataRaw    as Passport[];

const readyFiles   = import.meta.glob<ReadyData>("../data/ready/*.json",        { eager: true, import: "default" });
const placeFiles   = import.meta.glob<LocalGem[]>("../data/places/*.json",      { eager: true, import: "default" });
const notesFiles   = import.meta.glob<RealTravelNote[]>("../data/notes/*.json", { eager: true, import: "default" });
const realityFiles = import.meta.glob<NomadRealityNote[]>("../data/nomad-reality/*.json", { eager: true, import: "default" });

// ── Hero photos ───────────────────────────────────────────────────────────────

const HERO_PHOTOS: Record<string, string> = {
  thailand:      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1600&q=88&auto=format&fit=crop",
  malaysia:      "/images/malaysia-hero.jpg",
  indonesia:     "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&q=88&auto=format&fit=crop",
  georgia:       "/images/georgia-hero.jpg",
  turkey:        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1600&q=88&auto=format&fit=crop",
  vietnam:       "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1600&q=88&auto=format&fit=crop",
  philippines:   "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1600&q=88&auto=format&fit=crop",
  japan:         "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=1600&q=88&auto=format&fit=crop",
  "south-korea": "https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=1600&q=88&auto=format&fit=crop",
};

// ── Cinematic headlines per destination ───────────────────────────────────────

const HEADLINES: Record<string, [string, string, string]> = {
  thailand:      ["Bangkok ne cède",      "pas facilement.",     "Le chaos devient musique. Et puis tu ne veux plus partir."],
  malaysia:      ["La forêt dense,",       "la tour allumée.",    "Kuala Lumpur la nuit. Bornéo au lever du soleil."],
  indonesia:     ["Le volcan fume.",       "Le riz pousse.",      "Bali. Java. Lombok. Chaque île porte une vie différente."],
  georgia:       ["Le vin naît dans",      "les amphores.",       "Tbilisi est vieille. Et elle vibre encore."],
  turkey:        ["Istanbul tient",        "deux continents.",    "Les bazars. Les minarets. La mer à portée de regard."],
  vietnam:       ["Ha Long respire.",      "Hanoi s'agite.",      "Du nord au sud en train de nuit. Le pays s'étire, beau."],
  philippines:   ["L'archipel infini.",    "L'eau turquoise.",    "7 641 îles. Personne ne les a toutes vues. Commence."],
  japan:         ["L'ordre absolu.",       "La beauté totale.",   "Le Shinkansen arrive à 17h01. Exactement."],
  "south-korea": ["Séoul brûle",           "les deux bouts.",     "Cafés à 3h du matin. Palais vieux de cinq siècles."],
};

// ── Editorial field notes ──────────────────────────────────────────────────────

const FIELD_NOTES: Record<string, { note: string; byline: string }> = {
  thailand: {
    note: "La première semaine, tu luttes contre la ville.\nLe bruit, la chaleur, la densité.\nÀ la troisième semaine, tu arrêtes de lutter.\nBangkok a son propre rythme — il fallait juste rester assez longtemps pour l'entendre.",
    byline: "Bangkok · Séjour de 6 semaines",
  },
  malaysia: {
    note: "KL te donne l'impression d'être dans le futur.\nLes tours brillent. Les hawker centres ne dorment pas.\nEt dans la même rue : une mosquée dorée, un temple chinois, une église coloniale.\nIl n'y a nulle part ailleurs comme ça.",
    byline: "Kuala Lumpur · Séjour de 4 semaines",
  },
  indonesia: {
    note: "Bali te ralentit malgré toi.\nLes rizières, les cérémonies, le gamelan le matin.\nTu avais prévu une semaine. Tu es resté trois.\nL'île a cette façon de rendre l'urgent moins urgent.",
    byline: "Ubud, Bali · Séjour de 3 semaines",
  },
  georgia: {
    note: "Tbilisi est la ville la plus authentique que j'aie vue en Europe de l'Est.\nPas de façades. Pas de muséification.\nLes maisons pendent des falaises. Les balcons s'effondrent et restent beaux.\nEt le vin coule à un prix qui rend toute autre destination jalouse.",
    byline: "Tbilisi · Séjour de 5 semaines",
  },
  turkey: {
    note: "Istanbul ne te laisse pas indifférent.\nSoit tu l'aimes immédiatement, soit ça prend trois jours.\nMais une fois que la ville t'a pris, c'est fini.\nTu passes d'un continent à l'autre en prenant le ferry du matin.",
    byline: "Istanbul · Séjour de 3 semaines",
  },
  vietnam: {
    note: "Le Vietnam a une énergie que je n'ai vue nulle part ailleurs.\nLes klaxons, les moteurs, les marchés à 5h du matin.\nEt puis, entre deux villes, le silence absolu des rizières.\nLe contraste ne se fatigue jamais.",
    byline: "Hanoi – Hội An · Traversée nord-sud",
  },
  philippines: {
    note: "L'eau des Philippines est irréelle.\nOn dit ça de beaucoup d'endroits. À El Nido ou Coron, c'est différent.\nTu regardes par-dessus bord et tu vois le fond à 15 mètres.\nBleu, vert, turquoise — il manque des mots.",
    byline: "Palawan · Séjour de 2 semaines",
  },
  japan: {
    note: "Le Japon est le seul pays où j'ai eu honte d'être en retard.\nPas parce qu'on m'a regardé de travers.\nMais parce que tout fonctionne si précisément\nque ta propre imprécision se retrouve exposée dans la lumière du quai.",
    byline: "Tokyo – Kyoto – Osaka · 3 semaines",
  },
  "south-korea": {
    note: "Séoul a deux visages.\nLe jour : palais anciens, marchés couverts, temples perchés sur les collines.\nLa nuit : clubs ouverts jusqu'à midi, cafés 24h, une énergie qui ne se fatigue pas.\nLa ville ne te demande pas de choisir.",
    byline: "Séoul · Séjour de 3 semaines",
  },
};

// ── Cinematic fragments ───────────────────────────────────────────────────────

const FRAGMENTS: Record<string, string[]> = {
  thailand:      ["Un après-midi de pluie à Sarnies Silom. Zoom fermé, carnet ouvert. Le bruit de la rue devient feutre.", "3h du matin. Le marché en bas de l'immeuble est encore vivant. Tu descends sans raison précise.", "Premier matin calme à Bangkok. Le temple sonne au loin. La chaleur n'est pas encore insupportable.", "Le BTS entre Asok et Phrom Phong. Bangkok filtrée par une lumière orange de fin de journée."],
  malaysia:      ["Les Petronas disparaissent dans le brouillard de 7h. Cinq minutes plus tard, elles réapparaissent.", "Roti canai dans une stall derrière Masjid India. 3 MYR. Le meilleur petit-déjeuner du voyage.", "Un kopitiam à Georgetown. Le ventilateur tourne lentement. La ville ralentit autour du café.", "La forêt primaire commence à 45 minutes de KL. On l'oublie vite. Elle est là quand même."],
  indonesia:     ["Le soleil se lève sur Bromo à 4h30. La fumée du volcan monte dans l'air froid du matin.", "Ubud à la saison des pluies — les rizières absorbent tout le bruit. On n'entend plus que l'eau.", "Un warung sur la route de Seminyak. La carte tient sur une feuille A4. C'est le meilleur repas.", "La traversée en ferry vers Gili. L'eau est tellement turquoise que ça paraît faux."],
  georgia:       ["Vino Underground à Tbilisi. Cave, lumières tamisées, vin naturel géorgien pour presque rien.", "Le funiculaire de Narikala à 21h. La ville illuminée, accrochée à la falaise en dessous.", "Kazbegi à l'aube. L'église Tsminda Sameba dans les nuages. Le silence absolu.", "Khinkali dans un restaurant sans menu anglais. Tu commandes en montrant les doigts."],
  turkey:        ["Le Bosphore au coucher du soleil depuis Üsküdar. Istanbul des deux côtés, comme une promesse.", "Le Grand Bazar un mardi matin. Avant les groupes de touristes. Les marchands boivent leur thé.", "Un hammam à Beyoğlu. 45 minutes. La chaleur sèche. Le monde extérieur n'existe plus.", "Le train de nuit Istanbul–Ankara. Les rails, le thé, le défilé de la steppe endormie."],
  vietnam:       ["Un bol de phở à 6h30 à Hanoi. 45 000 VND. Le bouillon mijote depuis la nuit.", "Ha Long Bay hors haute saison. Le brouillard efface les bateaux. On est seul sur l'eau.", "Le train de nuit Hanoi–Da Nang. Couchette haute, fenêtre entrouverte, le pays qui défile.", "Hoi An à 5h du matin avant les lanternes. La vieille ville est vide et silencieuse."],
  philippines:   ["L'eau d'El Nido à marée basse. On ne sait plus où finit la mer, où commence le ciel.", "Un tricycle à travers Coron à 7h du matin. La ville se réveille dans la brume.", "Siargao à la saison calme. La vague roule. Le vent. Presque personne autour.", "Snorkeling sur l'épave au large de Coron. Le bateau entier appartient au récif."],
  japan:         ["Le Shinkansen Tokyo–Kyoto. 2h12. Le Fuji apparaît à mi-chemin, juste là, une seconde.", "Un izakaya sous les rails de Yurakucho. Le train passe toutes les 3 minutes. Ça fait partie du repas.", "Fushimi Inari à 5h30. Avant les touristes. Les torii oranges, le silence, les renards.", "Un onigiri dans un konbini de Shinjuku à 2h du matin. Parfait. Le Japon entier en un geste."],
  "south-korea": ["Dongdaemun à 3h du matin. Les boutiques ouvertes. La ville est pleine.", "Gyeongbokgung un mardi sous la neige. Presque personne. Les gardes en costume, immobiles.", "Hangang Park au coucher du soleil avec du chimaek. Le moment le plus parfait.", "Un café au 9e étage à Hongdae avec vue sur Séoul. Americano, silence."],
};

// ── Per-destination profiles ───────────────────────────────────────────────────

const PROFILES: Record<string, Array<{ profile: string; description: string }>> = {
  thailand:      [{ profile: "Le nomade en transition", description: "Tu viens de quitter un emploi, une ville, une vie. Bangkok est suffisamment vivante pour que tu n'aies pas le temps de douter." }, { profile: "Le remote worker qui cherche la cadence", description: "La ville a un rythme. Les cafés sont sérieux. Le BTS te déplace sans friction. La discipline arrive toute seule." }, { profile: "Le solo-voyageur urbain", description: "Tu aimes les villes qui ne dorment pas. Bangkok ne dormira jamais. Et tu finiras par l'apprécier à 3h du matin." }, { profile: "Le voyageur lent", description: "60 jours d'exemption, prolongeable. Assez de quartiers pour ne jamais t'ennuyer. Assez de sérénité pour vraiment travailler." }],
  malaysia:      [{ profile: "Le digital nomad organisé", description: "KL a l'une des meilleures connectivités d'Asie. Les co-works sont modernes, la nourriture est fantastique à 5m du bureau." }, { profile: "Le voyageur culturellement curieux", description: "Malais, Chinois, Tamil — trois cultures, une même rue. Une mosquée, un temple hindou et une église en 10 minutes à pied." }, { profile: "Le slow traveler", description: "90 jours sans visa, sans procédure. Assez longtemps pour aller à Penang, Langkawi, Bornéo et revenir à KL sans rien bâcler." }, { profile: "L'amoureux nature-ville", description: "La jungle primaire de Taman Negara à 3h de KL. Les Petronas à 20 minutes. Le meilleur des deux mondes, sans choisir." }],
  indonesia:     [{ profile: "Le surfeur et le randonneur", description: "Bali pour la vague. Java pour les volcans. Lombok pour la tranquillité. Trois îles, trois atmosphères, un seul visa." }, { profile: "Le voyageur spirituel", description: "Ubud ralentit tout. Les temples sont partout. Il y a une sérénité dans l'air qui ne ressemble à rien d'autre sur terre." }, { profile: "Le budget-traveler sérieux", description: "L'Indonésie est l'un des pays où ton argent va le plus loin. Street food, transport local, guesthouses — tout est accessible." }, { profile: "Le photographe de paysages", description: "Bromo à l'aube. Kelimutu. Tegalalang. Il n'y a pas de fin aux images ici — juste le problème du stockage." }],
  georgia:       [{ profile: "L'amateur de vin naturel", description: "La Géorgie invente le vin depuis 8 000 ans. Les qvevri, le Rkatsiteli, les caves de Kakhétie — un pays entier qui pense à travers son vin." }, { profile: "Le voyageur lent et économe", description: "Parmi les destinations les moins chères du Caucase. On mange bien, on loge bien — et 90 jours sans visa." }, { profile: "Le randonneur et alpiniste", description: "Le Caucase principal. Kazbegi, Mestia, Ushguli. Des sentiers qui n'ont pas encore vu assez de monde pour être fatigués." }, { profile: "L'amoureux des villes historiques", description: "Tbilisi est stratifiée — perse, russe, soviétique, actuelle. Chaque quartier parle une période différente." }],
  turkey:        [{ profile: "L'historien du monde antique", description: "Éphèse, Troie, Istanbul, Cappadoce. La Turquie est un livre d'histoire sans fin. Et tu le traverses en bus." }, { profile: "Le voyageur urbain d'Istanbul", description: "Istanbul n'est pas une ville, c'est une civilisation. Il faut 3 semaines minimum pour commencer à la comprendre." }, { profile: "Le routard aventurier", description: "Côte Lycienne, Pamukkale, Mont Nemrut. Le pays se déroule sur 1 600 km. Les bus interurbains fonctionnent." }, { profile: "Le digital nomad urbain", description: "Istanbul reste l'une des capitales les moins chères pour vivre correctement. Appartements, restos, transports — bien en dessous de Paris." }],
  vietnam:       [{ profile: "Le baroudeur gastronomique", description: "Phở à Hanoi, Cao lầu à Hội An, Bún bò Huế à Huế. Le Vietnam se mange du nord au sud. Chaque ville a son plat signature." }, { profile: "Le voyageur nord-sud", description: "Le train de nuit Hanoi–Da Nang. Le bus Hoi An–Ho Chi Minh. Parcourir le pays comme une ligne — c'est la façon de le comprendre." }, { profile: "Le digital nomad débutant", description: "Prix accessibles, communauté internationale dense, cafés sérieux à Hanoi et HCMV. Un bon premier pays pour tester la vie nomade." }, { profile: "Le voyageur nature", description: "Ha Long Bay, Sapa, le delta du Mékong, Phong Nha. La géographie du Vietnam est incroyablement variée pour un seul pays." }],
  philippines:   [{ profile: "Le plongeur et snorkeleur", description: "Les Philippines abritent certains des meilleurs sites de plongée du monde. Apo Island, Tubbataha, Coron — une liste sans fin." }, { profile: "L'amoureux des îles", description: "7 641 îles. Chacune avec sa propre atmosphère. El Nido, Siargao, Bohol, Camiguin — il te faudra plusieurs voyages." }, { profile: "Le solo-voyageur sociable", description: "Les Philippins parlent un excellent anglais et ont une hospitalité légendaire. Tu ne seras jamais seul longtemps ici." }, { profile: "Le surfeur", description: "Siargao Cloud 9. La vague est réelle. La saison va de septembre à novembre. Arrive tôt pour trouver un logement abordable." }],
  japan:         [{ profile: "Le perfectionniste du voyage", description: "Le Shinkansen arrive à l'heure. Les combinis ouverts à 3h. Le service est impeccable, toujours. Le Japon récompense l'attention." }, { profile: "Le voyageur culturel sérieux", description: "Temples bouddhistes, jardins zen, culture des sakura — la profondeur culturelle du Japon est sans fond. Prévoir au moins 3 semaines." }, { profile: "Le foodie urbain", description: "Tokyo a plus d'étoiles Michelin que Paris. Mais les meilleures expériences sont dans les izakayas sous les rails, à 18h un mardi." }, { profile: "Le marcheur de villes", description: "Kyoto se marche. Nara se marche. Kanazawa se marche. Le Japon a été conçu pour ceux qui vont à pied et regardent." }],
  "south-korea": [{ profile: "Le noctambule urbain", description: "Séoul à 3h du matin est plus vivante que Paris à 21h. Hongdae, Itaewon, Gangnam — chaque quartier a sa propre heure d'or." }, { profile: "Le digital nomad haute vitesse", description: "La Corée a l'internet le plus rapide au monde. Les cafés sont ouverts 24h/24. La culture du travail tardif y est normale." }, { profile: "Le voyageur K-culture", description: "K-pop, K-drama, K-food, K-beauty. Séoul est l'épicentre d'une culture qui a colonisé la planète. Le voir de l'intérieur change tout." }, { profile: "Le randonneur de montagne", description: "Bukhansan en 3h depuis le centre de Séoul. Seoraksan, Jirisan. La Corée est 70% montagnes — accessibles en transport public." }],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const VIEWPORT = { once: true as const, margin: "-60px" as const };

function trunc(s: string, n: number): string {
  if (s.length <= n) return s;
  const cut = s.lastIndexOf(" ", n);
  return s.slice(0, cut > 0 ? cut : n) + "…";
}

function getDailyAmount(data: ReadyData): number | null {
  const t = data.budget.tiers.budget;
  return t.daily_thb ?? t.daily_myr ?? t.daily_idr ?? t.daily_gel ??
         t.daily_try ?? t.daily_vnd ?? t.daily_php ?? t.daily_jpy ?? t.daily_krw ?? null;
}

function buildPillars(score: TravelScore, data: ReadyData) {
  const sym  = data.budget.currency_symbol;
  const amt  = getDailyAmount(data);
  const isFreeEntry = data.visa.type === "Visa Exemption" || data.visa.type === "Visa Free" || data.visa.type === "Visa-free entry";
  const visaShort =
    isFreeEntry                          ? "Exempt"   :
    data.visa.type === "e-Visa"          ? "e-Visa"   :
    data.visa.type === "Visa on Arrival" ? "Arrivée"  : data.visa.type;

  return [
    { label: "VISA",        value: `${visaShort} · ${data.visa.duration_days}j`,    note: trunc(data.visa.notes, 95),                                          strength: score.visa_ease / 100 },
    { label: "BUDGET",      value: amt != null ? `${sym}${amt}/j` : "—",            note: trunc(data.budget.tiers.budget.includes, 85),                        strength: score.budget / 100 },
    { label: "INTERNET",    value: score.internet >= 80 ? "Solide" : score.internet >= 65 ? "Correct" : "Variable", note: "Tester avant tout appel important — hôtels variables.", strength: score.internet / 100 },
    { label: "SÉCURITÉ",    value: score.safety >= 85 ? "Stable" : score.safety >= 70 ? "Prudence" : "Vigilance",    note: data.scams.length > 0 ? trunc(data.scams[0].description, 90) : "Précautions habituelles.", strength: score.safety / 100 },
    { label: "TRANSPORT",   value: `${score.transport}/100`,                        note: data.transport.length > 0 ? trunc(data.transport[0], 85) : "Infrastructure locale adaptée.", strength: score.transport / 100 },
    { label: "NOMADE",      value: score.nomad_friendly >= 88 ? "Excellent" : score.nomad_friendly >= 78 ? "Fort" : "Correct", note: "Cafés, coworks, rythme de vie et stabilité numérique.", strength: score.nomad_friendly / 100 },
  ];
}

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.66, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Cinematic back-navigation link ────────────────────────────────────────────

function BackLink({ to, className, style, children }: {
  to: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const [, navigate]  = useLocation();
  const [exiting, setExiting] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (exiting) return;
    setExiting(true);
    setTimeout(() => navigate(to), 620);
  }, [exiting, navigate, to]);

  return (
    <>
      <AnimatePresence>
        {exiting && (
          <motion.div
            key="back-curtain"
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.58, ease: [0.76, 0, 0.24, 1] }}
            style={{
              position: "fixed",
              inset: 0,
              background: "linear-gradient(180deg, #0a0800 0%, #1a0e02 55%, #0d0900 100%)",
              zIndex: 9999,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>
      <motion.a
        href={to}
        className={className}
        style={style}
        onClick={handleClick}
        animate={exiting ? { opacity: 0, y: -10, filter: "blur(4px)" } : {}}
        transition={{ duration: 0.22 }}
      >
        {children}
      </motion.a>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DestinationPage() {
  const params        = useParams<{ passport: string; destination: string }>();
  const passportId    = params.passport    ?? "fr";
  const destinationId = params.destination ?? "";
  const t             = getT(passportId);

  const dest = destinations.find((d) => d.id === destinationId);
  const pass = passports.find((p)    => p.id === passportId);

  const readyKey   = Object.keys(readyFiles).find((k)   => k.endsWith(`/${passportId}-${destinationId}.json`));
  const notesKey   = Object.keys(notesFiles).find((k)   => k.endsWith(`/${destinationId}.json`));
  const realityKey = Object.keys(realityFiles).find((k) => k.endsWith(`/${destinationId}.json`));
  const gemsKey    = Object.keys(placeFiles).find((k)   => k.endsWith(`/${destinationId}.json`));

  const data     = readyKey   ? readyFiles[readyKey]     : null;
  const notes    = notesKey   ? notesFiles[notesKey]     : null;
  const reality  = realityKey ? realityFiles[realityKey] : null;
  const gems     = gemsKey    ? placeFiles[gemsKey]      : null;

  void gems; void reality; // may use in future sections

  if (!dest || !pass || !data) {
    return (
      <main className="page-container flex-1 flex flex-col items-center justify-center gap-6 py-24 text-center" style={{ minHeight: "100dvh" }}>
        <p style={{ fontSize: "3rem" }}>🗺️</p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Destination not found</h1>
        <BackLink to={`/?passport=${passportId}&skip_gateway=1`} style={{ display: "inline-flex", background: "var(--accent)", color: "#fff", borderRadius: "9999px", padding: "0.5rem 1.25rem", textDecoration: "none", fontWeight: 600 }}>
          {t.backToAtlas}
        </BackLink>
      </main>
    );
  }

  const score        = dest.travel_score!;
  const pillars      = buildPillars(score, data);
  const profiles     = PROFILES[destinationId] ?? [];
  const fragments    = FRAGMENTS[destinationId] ?? [];
  const fieldNote    = FIELD_NOTES[destinationId];
  const headline     = HEADLINES[destinationId] ?? [dest.label, "", dest.hero_tag];
  const heroPhoto    = HERO_PHOTOS[destinationId] ?? HERO_PHOTOS.thailand;
  const dailyAmt     = getDailyAmount(data);
  const sym          = data.budget.currency_symbol;
  const reviewDate   = new Date(data.last_reviewed).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const bestMonths   = data.best_season.overall_best_months;
  const seasonStr    = bestMonths.length > 0
    ? `${bestMonths[0]}–${bestMonths[bestMonths.length - 1]}`
    : "—";

  const isVisaFree = data.visa.type === "Visa Exemption" || data.visa.type === "Visa Free" || data.visa.type === "Visa-free entry";
  const visaMetaLabel =
    isVisaFree                           ? t.freeEntry  :
    data.visa.type === "Visa on Arrival" ? t.visaOnArrival :
    data.visa.type === "e-Visa"          ? t.eVisa       : data.visa.type;

  return (
    <main style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "var(--bg-base)" }}>

      {/* ═══════════════════════════════════════════════════════
          1 · HERO — Full viewport cinematic
      ═══════════════════════════════════════════════════════ */}
      <section className="th-hero">
        <div className="th-hero-media" aria-hidden>
          <img
            src={heroPhoto}
            alt=""
            className="th-hero-img"
            fetchPriority="high"
            decoding="async"
          />
          <div className="th-hero-overlay" />
          <div className="th-hero-glow"    />
          <div className="th-hero-grain"   />
        </div>

        <div className="th-hero-topbar">
          <BackLink to={`/?passport=${passportId}&skip_gateway=1`} className="th-back-link">
            {t.backToAtlas}
          </BackLink>
          <span className="th-hero-tag">
            {dest.label.toUpperCase()} · {dest.region.toUpperCase()}
          </span>
        </div>

        <div className="th-hero-content page-container">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.90, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="th-hero-text"
          >
            <h1 className="th-hero-h1">
              {headline[0]}<br />
              {headline[1]}
            </h1>
            <p className="th-hero-sub">{headline[2]}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.70, delay: 0.55 }}
            className="th-hero-meta"
          >
            {[
              { label: t.visaLabel,    value: `${visaMetaLabel} · ${data.visa.duration_days}${t.days[0]}` },
              { label: t.budgetLabel,  value: dailyAmt != null ? `${sym}${dailyAmt}${t.perDay}` : "—"      },
              { label: t.bestSeason,   value: seasonStr },
            ].map((m, i) => (
              <div
                key={m.label}
                className="th-hero-meta-item"
                style={i > 0 ? { borderLeft: "1px solid rgba(255,255,255,0.14)", paddingLeft: "1.25rem" } : {}}
              >
                <span className="th-hero-meta-label">{m.label}</span>
                <span className="th-hero-meta-value">{m.value}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="th-hero-wave" aria-hidden>
          <svg viewBox="0 0 1440 64" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
            <path d="M0 32 Q200 10 400 26 Q620 44 820 18 Q1020 0 1220 22 Q1360 36 1440 20 L1440 64 L0 64 Z" fill="var(--bg-base)" />
            <path d="M0 46 Q300 32 600 42 Q900 52 1200 40 Q1360 32 1440 40 L1440 64 L0 64 Z" fill="var(--bg-base)" opacity="0.55" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2 · FIELD NOTE — personal editorial fragment
      ═══════════════════════════════════════════════════════ */}
      {fieldNote && (
        <section className="th-section th-section--light">
          <div className="page-container th-section-inner">
            <Reveal>
              <p className="th-eyebrow">{t.fieldNoteEyebrow}</p>
            </Reveal>
            <Reveal delay={0.10}>
              <blockquote className="th-field-note">
                {fieldNote.note.split("\n").map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </blockquote>
            </Reveal>
            <Reveal delay={0.20}>
              <p className="th-field-note-byline">
                {t.travelFieldGuide.toLowerCase()} · {fieldNote.byline}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          3 · READINESS INTELLIGENCE — 6 animated pillars
      ═══════════════════════════════════════════════════════ */}
      <section className="th-section th-section--dark">
        <div className="page-container th-section-inner">
          <Reveal>
            <p className="th-eyebrow th-eyebrow--amber">{t.intelligenceEyebrow}</p>
            <h2 className="th-section-h2 th-section-h2--light">
              <WordReveal
                text={t.intelligenceTitle.replace("\n", " ")}
                staggerDelay={0.06}
              />
            </h2>
          </Reveal>

          <div className="th-pillars-grid">
            {pillars.map((p, i) => (
              <Reveal key={p.label} delay={i * 0.07}>
                <div className="th-pillar">
                  <div className="th-pillar-track">
                    <motion.div
                      className="th-pillar-fill"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${p.strength * 100}%` }}
                      viewport={VIEWPORT}
                      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.12 + i * 0.05 }}
                    />
                  </div>
                  <p className="th-pillar-label">{p.label}</p>
                  <p className="th-pillar-value">{p.value}</p>
                  <p className="th-pillar-note">{p.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          4 · WHO IT'S FOR — identity profiles
      ═══════════════════════════════════════════════════════ */}
      {profiles.length > 0 && (
        <section className="th-section th-section--light">
          <div className="page-container th-section-inner">
            <Reveal>
              <p className="th-eyebrow">02 · {t.forWhoEyebrow}</p>
              <h2 className="th-section-h2">
                <WordReveal
                  text={t.forWhoTitle.replace("\n", " ")}
                  staggerDelay={0.07}
                />
              </h2>
            </Reveal>
            <div className="th-forwho-grid">
              {profiles.map((fw, i) => (
                <Reveal key={fw.profile} delay={i * 0.08}>
                  <div className="th-forwho-card">
                    <h3 className="th-forwho-title">{fw.profile}</h3>
                    <p className="th-forwho-text">{fw.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          5 · FRAGMENTS — numbered cinematic text
      ═══════════════════════════════════════════════════════ */}
      {fragments.length > 0 && (
        <section className="th-section th-section--dark">
          <div className="page-container th-section-inner">
            <Reveal>
              <p className="th-eyebrow th-eyebrow--amber">{t.fragmentsEyebrow} · {dest.label.toUpperCase()}</p>
            </Reveal>
            <div className="th-memories-list">
              {fragments.map((text, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="th-memory">
                    <span className="th-memory-num">0{i + 1}</span>
                    <p className="th-memory-text">{text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          6 · TERRAIN REALITY — field notes (when available)
      ═══════════════════════════════════════════════════════ */}
      {notes && notes.length > 0 && (
        <section className="th-section th-section--light">
          <div className="page-container th-section-inner">
            <Reveal>
              <p className="th-eyebrow">03 · {t.realityEyebrow}</p>
              <h2 className="th-section-h2">
                <WordReveal text={t.realityTitle} staggerDelay={0.055} />
              </h2>
            </Reveal>
            <div className="th-reality-list">
              {notes.map((note, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <div className="th-reality-item">
                    <span className="th-reality-type">{(note.type ?? "note").toUpperCase()}</span>
                    <div className="th-reality-body">
                      <h4 className="th-reality-title">{note.title}</h4>
                      <p className="th-reality-note">{note.note}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          7 · ANIMATED METRICS — Visa + Budget, dark band
      ═══════════════════════════════════════════════════════ */}
      <section className="th-section th-section--dark">
        <div className="page-container th-section-inner">
          <Reveal>
            <p className="th-eyebrow th-eyebrow--amber">{t.visaLabel} & {t.budgetLabel}</p>
          </Reveal>

          {/* Visa metric */}
          <Reveal delay={0.05}>
            <div className="guide-metric-row">
              <div className="guide-metric-number-block">
                <div className="guide-metric-big">
                  <AnimatedNumber
                    value={data.visa.duration_days}
                    duration={1.4}
                    className="guide-metric-num"
                  />
                  <span className="guide-metric-unit">{t.days}</span>
                </div>
                <p className="guide-metric-sublabel">{visaMetaLabel}</p>
                <div className="guide-metric-bar">
                  <motion.div
                    className="guide-metric-bar-fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${score.visa_ease}%` }}
                    viewport={VIEWPORT}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  />
                </div>
              </div>
              <div className="guide-metric-detail">
                <p className="guide-metric-detail-text">{data.visa.notes}</p>
                <div className="guide-metric-badges">
                  {data.visa.multiple_entry && <span className="guide-badge guide-badge--green">{t.multipleEntry}</span>}
                  {data.visa.extendable     && <span className="guide-badge guide-badge--amber">{t.extendable} +{data.visa.extension_days ?? 30}j</span>}
                  {data.visa.verify_required && <span className="guide-badge guide-badge--gray">{t.verifyNote}</span>}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Budget tiers — organic 3-column */}
          <Reveal delay={0.10}>
            <div className="guide-budget-band">
              {([
                { key: "budget", label: t.budget,  tier: data.budget.tiers.budget },
                { key: "mid",    label: t.mid,      tier: data.budget.tiers.mid    },
                { key: "high",   label: t.comfort,  tier: data.budget.tiers.high   },
              ] as const).map(({ key, label, tier }) => {
                const amt = tier.daily_thb ?? tier.daily_myr ?? tier.daily_idr ?? tier.daily_gel ??
                            tier.daily_try ?? tier.daily_vnd ?? tier.daily_php ?? tier.daily_jpy ?? tier.daily_krw;
                return (
                  <motion.div
                    key={key}
                    className="guide-budget-tier"
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 340, damping: 18 }}
                  >
                    <span className="guide-budget-tier-label">{label}</span>
                    <div className="guide-budget-tier-amount">
                      {amt != null ? (
                        <>
                          <AnimatedNumber value={amt} duration={1.2} className="guide-budget-num" />
                          <span className="guide-budget-sym">{sym}</span>
                        </>
                      ) : "—"}
                    </div>
                    <span className="guide-budget-perday">{t.perDay}</span>
                    <p className="guide-budget-includes">{tier.includes}</p>
                  </motion.div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          8 · PRACTICAL DATA — Apps · Transport · Scams · Phrases
      ═══════════════════════════════════════════════════════ */}
      <section className="th-section th-section--light">
        <div className="page-container th-section-inner">

          {/* Apps */}
          {data.useful_apps && data.useful_apps.length > 0 && (
            <Reveal>
              <p className="th-eyebrow">{t.appsLabel}</p>
              <div className="guide-apps-grid">
                {data.useful_apps.slice(0, 6).map((app, i) => (
                  <motion.div
                    key={app.name}
                    className="guide-app-card"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={VIEWPORT}
                    transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -3 }}
                  >
                    <span className="guide-app-name">{app.name}</span>
                    <span className="guide-app-use">{app.use}</span>
                    <span className="guide-app-platform">{app.platform}</span>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          )}

          {/* Transport */}
          {data.transport && data.transport.length > 0 && (
            <Reveal delay={0.05}>
              <p className="th-eyebrow" style={{ marginTop: "0.5rem" }}>{t.transportLabel}</p>
              <div className="guide-transport-list">
                {data.transport.map((item, i) => (
                  <motion.p
                    key={i}
                    className="guide-transport-item"
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={VIEWPORT}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="guide-transport-dot" aria-hidden />
                    {item}
                  </motion.p>
                ))}
              </div>
            </Reveal>
          )}

          {/* Scams — amber warning band */}
          {data.scams && data.scams.length > 0 && (
            <Reveal delay={0.08}>
              <p className="th-eyebrow" style={{ color: "rgba(217,119,6,0.72)", marginTop: "0.5rem" }}>{t.scamsLabel}</p>
              <div className="guide-scams-list">
                {data.scams.map((scam, i) => (
                  <motion.div
                    key={scam.name}
                    className="guide-scam-item"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={VIEWPORT}
                    transition={{ duration: 0.45, delay: i * 0.06 }}
                  >
                    <span className="guide-scam-name">{scam.name}</span>
                    <p className="guide-scam-desc">{scam.description}</p>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          )}

          {/* Phrases */}
          {data.phrases && data.phrases.length > 0 && (
            <Reveal delay={0.10}>
              <p className="th-eyebrow" style={{ marginTop: "0.5rem" }}>{t.phrasesLabel}</p>
              <div className="guide-phrases-grid">
                {data.phrases.map((ph, i) => (
                  <motion.div
                    key={ph.phrase}
                    className="guide-phrase-card"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={VIEWPORT}
                    transition={{ duration: 0.45, delay: i * 0.05 }}
                    whileHover={{ background: "rgba(217,119,6,0.06)" }}
                  >
                    <span className="guide-phrase-local">{ph.phrase}</span>
                    <span className="guide-phrase-pronun">{ph.pronunciation}</span>
                    <span className="guide-phrase-meaning">{ph.meaning}</span>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          9 · CTA — continue exploring
      ═══════════════════════════════════════════════════════ */}
      <section className="th-section th-section--dark">
        <div className="page-container th-section-inner">
          <Reveal>
            <p className="th-eyebrow th-eyebrow--amber">{t.continueEyebrow}</p>
            <h2 className="th-section-h2 th-section-h2--light">
              <WordReveal text={t.continueTitle} staggerDelay={0.08} />
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="th-cta-actions">
              <BackLink to={`/?passport=${passportId}&skip_gateway=1`} className="th-cta-primary">
                {t.backToAtlas.replace("← ", "")} →
              </BackLink>
              {destinationId !== "thailand" && (
                <Link to={`/ready/${passportId}/thailand`} className="th-cta-secondary">
                  Comparer avec la Thaïlande →
                </Link>
              )}
              {destinationId !== "japan" && (
                <Link to={`/ready/${passportId}/japan`} className="th-cta-tertiary">
                  Explorer le Japon →
                </Link>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="th-footer">
        <div className="page-container">
          <p className="th-footer-text">{data.disclaimer}</p>
          <p className="th-footer-date">{t.reviewedOn} · {reviewDate}</p>
        </div>
      </footer>

    </main>
  );
}
