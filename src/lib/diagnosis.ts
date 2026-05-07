export type Difficulty = "easy" | "medium" | "pro";
export type Category = "plumbing" | "heating" | "hvac" | "electrical";
export type MediaKind = "photo" | "video" | "audio";

export interface Part {
  name: string;
  sku: string;
  price: string;
  shopUrl: string;
}

export type Hazard = "electrical" | "gas" | "water" | "heat";

export interface Diagnosis {
  id: string;
  createdAt: string;
  category: Category;
  title: string;
  summary: string;
  confidence: number;
  difficulty: Difficulty;
  estimatedCost: string;
  estimatedTime: string;
  parts: Part[];
  steps: string[];
  youtubeQuery: string;
  mediaKind: MediaKind;
  mediaPreview?: string;
  hazards?: Hazard[];
  hazardNote?: string;
}

const MOCK_DIAGNOSES: Omit<Diagnosis, "id" | "createdAt" | "mediaKind" | "mediaPreview">[] = [
  {
    category: "heating",
    title: "Defekte Umwälzpumpe",
    summary: "Das schleifende Geräusch deutet auf einen verschlissenen Rotor in der Heizungs-Umwälzpumpe hin. Lager und Dichtungen sind ausgeschlagen.",
    confidence: 0.92,
    difficulty: "medium",
    estimatedCost: "€ 180 – 280",
    estimatedTime: "ca. 45 Min.",
    parts: [
      { name: "Hocheffizienz-Umwälzpumpe 25-60", sku: "GR-UPS-2560", price: "€ 159,90", shopUrl: "https://shop.example.com/ups2560" },
      { name: "Dichtungssatz O-Ring", sku: "DS-OR-22", price: "€ 6,40", shopUrl: "https://shop.example.com/dsor22" },
    ],
    steps: [
      "Heizungsanlage ausschalten und vom Stromnetz trennen.",
      "Absperrhähne vor und nach der Pumpe schließen.",
      "Wasser im Pumpengehäuse vorsichtig ablassen.",
      "Alte Pumpe demontieren, Dichtflächen reinigen.",
      "Neue Pumpe mit O-Ringen einsetzen und verschrauben.",
      "Anlage entlüften und Druck prüfen.",
    ],
    youtubeQuery: "Heizungspumpe wechseln Anleitung",
  },
  {
    category: "plumbing",
    title: "Tropfender Wasserhahn – Kartusche defekt",
    summary: "Sichtbare Kalkablagerungen und gleichmäßiges Tropfen weisen auf eine verschlissene Keramik-Kartusche im Einhebelmischer hin.",
    confidence: 0.88,
    difficulty: "easy",
    estimatedCost: "€ 15 – 35",
    estimatedTime: "ca. 20 Min.",
    parts: [
      { name: "Universal-Keramikkartusche 35mm", sku: "KK-35-UNI", price: "€ 14,90", shopUrl: "https://shop.example.com/kk35" },
    ],
    steps: [
      "Eckventile unter dem Waschbecken schließen.",
      "Hebelkappe abhebeln, Madenschraube lösen.",
      "Hebel und Klemmring entfernen.",
      "Alte Kartusche herausnehmen.",
      "Neue Kartusche einsetzen und alles in umgekehrter Reihenfolge montieren.",
    ],
    youtubeQuery: "Wasserhahn Kartusche wechseln",
  },
  {
    category: "electrical",
    title: "Steckdose ohne Spannung – FI-Schalter ausgelöst",
    summary: "Der angeschlossene Verbraucher hat vermutlich einen Isolationsfehler. Der FI-Schutzschalter hat korrekt ausgelöst.",
    confidence: 0.81,
    difficulty: "pro",
    estimatedCost: "€ 80 – 220",
    estimatedTime: "30 – 90 Min.",
    parts: [
      { name: "FI/LS-Kombi 16A 30mA", sku: "FI-LS-1630", price: "€ 64,50", shopUrl: "https://shop.example.com/fils" },
    ],
    steps: [
      "Achtung: Arbeiten an der Elektrik nur durch Fachkraft!",
      "Alle Verbraucher vom Stromkreis trennen.",
      "FI testen und nacheinander Geräte zuschalten, um Verursacher zu finden.",
      "Defektes Gerät reparieren oder ersetzen.",
    ],
    youtubeQuery: "FI Schalter löst aus Ursache finden",
    hazards: ["electrical"],
    hazardNote: "Achtung: Arbeiten an Starkstrom-Anlagen sind lebensgefährlich und gesetzlich nur durch Elektrofachkräfte zulässig. Schalte den Stromkreis ab und kontaktiere einen Profi.",
  },
  {
    category: "hvac",
    title: "Klimaanlage kühlt nicht – Filter verschmutzt",
    summary: "Reduzierter Luftstrom und Eisbildung am Verdampfer durch stark verschmutzte Innenfilter.",
    confidence: 0.95,
    difficulty: "easy",
    estimatedCost: "€ 0 – 25",
    estimatedTime: "ca. 15 Min.",
    parts: [
      { name: "Ersatz-Luftfilter Split-Klima", sku: "AF-SPL-01", price: "€ 19,90", shopUrl: "https://shop.example.com/afspl" },
    ],
    steps: [
      "Klimaanlage ausschalten.",
      "Frontklappe öffnen und Filter entnehmen.",
      "Filter mit lauwarmem Wasser ausspülen oder ersetzen.",
      "Trocknen lassen, einsetzen, Klappe schließen.",
    ],
    youtubeQuery: "Klimaanlage Filter reinigen",
  },
];

export async function analyzeMedia(input: { kind: MediaKind; preview?: string; notes?: string }): Promise<Diagnosis> {
  // Simulate AI latency. Replace with real call to GPT-4o / Gemini Vision later.
  await new Promise((r) => setTimeout(r, 2400));
  const pick = MOCK_DIAGNOSES[Math.floor(Math.random() * MOCK_DIAGNOSES.length)];
  return {
    ...pick,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    mediaKind: input.kind,
    mediaPreview: input.preview,
  };
}

const KEY = "fixscan.history.v1";

export function loadHistory(): Diagnosis[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function saveDiagnosis(d: Diagnosis) {
  if (typeof window === "undefined") return;
  const list = loadHistory();
  list.unshift(d);
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 30)));
}
export function getDiagnosis(id: string): Diagnosis | undefined {
  return loadHistory().find((d) => d.id === id);
}
export function clearHistory() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

export const categoryLabels: Record<Category, string> = {
  plumbing: "Sanitär",
  heating: "Heizung",
  hvac: "Klima",
  electrical: "Elektro",
};

export const difficultyLabels: Record<Difficulty, string> = {
  easy: "Easy DIY",
  medium: "Mittel",
  pro: "Profi nötig",
};
