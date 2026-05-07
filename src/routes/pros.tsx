import { createFileRoute } from "@tanstack/react-router";
import { Phone, Star, MapPin, Clock, Search } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pros")({
  head: () => ({
    meta: [
      { title: "Profis in der Nähe – FixScan" },
      { name: "description", content: "Lokale SHK- und Elektro-Fachbetriebe in deiner Umgebung finden." },
    ],
  }),
  component: ProsPage,
});

const pros = [
  { name: "Müller SHK GmbH", trade: "Sanitär & Heizung", rating: 4.8, reviews: 213, distance: "1,2 km", eta: "Heute 16:00", phone: "+49 30 1234567", x: 32, y: 38 },
  { name: "Elektro Schmidt", trade: "Elektroinstallation", rating: 4.7, reviews: 156, distance: "2,4 km", eta: "Morgen 09:00", phone: "+49 30 7654321", x: 60, y: 55 },
  { name: "KlimaTech Berlin", trade: "Klima & Lüftung", rating: 4.9, reviews: 98, distance: "3,1 km", eta: "Mi 11:30", phone: "+49 30 9988776", x: 48, y: 22 },
  { name: "Bäder & Mehr", trade: "Sanitär", rating: 4.5, reviews: 341, distance: "4,0 km", eta: "Do 14:00", phone: "+49 30 5544332", x: 75, y: 70 },
];

function ProsPage() {
  const [active, setActive] = useState(pros[0].name);

  return (
    <AppShell>
      <h1 className="text-3xl font-bold tracking-tight">Profis</h1>
      <p className="mt-1 text-sm text-muted-foreground">Geprüfte Fachbetriebe in deiner Nähe.</p>

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input className="w-full bg-transparent text-sm outline-none" placeholder="PLZ oder Stadt eingeben" defaultValue="10115 Berlin" />
      </div>

      <div className="relative mt-5 overflow-hidden rounded-3xl border border-border shadow-soft"
        style={{
          height: 240,
          backgroundImage:
            "linear-gradient(oklch(0.92 0.02 240) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.02 240) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          backgroundColor: "oklch(0.97 0.01 240)",
        }}
      >
        <div className="absolute inset-0" style={{
          background: "radial-gradient(circle at 50% 50%, oklch(0.72 0.17 155 / 0.12), transparent 70%)",
        }} />
        {pros.map((p) => (
          <button
            key={p.name}
            onClick={() => setActive(p.name)}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <span className={cn(
              "grid h-10 w-10 place-items-center rounded-full border-2 border-background shadow-soft transition-transform",
              active === p.name ? "bg-foreground text-background scale-110" : "bg-accent text-accent-foreground"
            )}>
              <MapPin className="h-5 w-5" />
            </span>
          </button>
        ))}
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500 ring-4 ring-sky-500/30" />
      </div>

      <ul className="mt-5 space-y-3">
        {pros.map((p) => (
          <li
            key={p.name}
            onClick={() => setActive(p.name)}
            className={cn(
              "rounded-2xl border bg-card p-4 shadow-soft transition-colors",
              active === p.name ? "border-foreground" : "border-border"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.trade}</p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {p.rating}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.distance}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {p.eta}</span>
              <span>{p.reviews} Bewertungen</span>
            </div>
            <a href={`tel:${p.phone}`} className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-medium text-background">
              <Phone className="h-4 w-4" /> Anrufen
            </a>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
