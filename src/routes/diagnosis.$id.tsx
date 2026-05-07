import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Clock, Wallet, ShoppingCart, Wrench, Play, MapPin, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { categoryLabels, difficultyLabels, getDiagnosis, type Diagnosis } from "@/lib/diagnosis";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/diagnosis/$id")({
  head: () => ({
    meta: [
      { title: "Diagnose-Ergebnis – FixScan" },
      { name: "description", content: "Detaillierte KI-Diagnose mit Ersatzteilen, Anleitung und Profi-Suche." },
    ],
  }),
  component: DiagnosisPage,
});

const difficultyTone: Record<string, string> = {
  easy: "bg-success/15 text-success-foreground border-success/30",
  medium: "bg-amber-100 text-amber-900 border-amber-200",
  pro: "bg-destructive/10 text-destructive border-destructive/30",
};

function DiagnosisPage() {
  const { id } = useParams({ from: "/diagnosis/$id" });
  const [d, setD] = useState<Diagnosis | undefined>();
  const [tab, setTab] = useState<"diy" | "parts" | "pro">("diy");

  useEffect(() => { setD(getDiagnosis(id)); }, [id]);

  if (!d) {
    return (
      <AppShell>
        <p className="mt-12 text-center text-muted-foreground">Diagnose nicht gefunden.</p>
        <Link to="/" className="mt-4 block text-center text-accent">Zur Startseite</Link>
      </AppShell>
    );
  }

  const ytUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(d.youtubeQuery)}`;

  return (
    <AppShell>
      <button onClick={() => history.back()} className="flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Zurück
      </button>

      <div className="mt-4 flex items-center gap-2">
        <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium">
          {categoryLabels[d.category]}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success-foreground">
          <BadgeCheck className="h-3.5 w-3.5" /> {Math.round(d.confidence * 100)}% sicher
        </span>
      </div>

      <h1 className="mt-3 text-2xl font-bold tracking-tight">{d.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{d.summary}</p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Stat icon={Wallet} label="Kosten" value={d.estimatedCost} />
        <Stat icon={Clock} label="Dauer" value={d.estimatedTime} />
        <div className={cn("flex flex-col items-start gap-1 rounded-2xl border p-3 shadow-soft", difficultyTone[d.difficulty])}>
          <Wrench className="h-4 w-4" />
          <span className="text-[10px] uppercase tracking-wider opacity-70">Level</span>
          <span className="text-sm font-semibold">{difficultyLabels[d.difficulty]}</span>
        </div>
      </div>

      {d.difficulty === "pro" && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Für deine Sicherheit empfehlen wir, diese Reparatur einer Fachkraft zu überlassen.</p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1 shadow-soft">
        {([
          ["diy", "Anleitung"],
          ["parts", "Ersatzteile"],
          ["pro", "Profi"],
        ] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "rounded-xl py-2 text-sm font-medium transition-colors",
              tab === k ? "bg-foreground text-background" : "text-muted-foreground"
            )}
          >{l}</button>
        ))}
      </div>

      {tab === "diy" && (
        <section className="mt-5 space-y-5">
          <Link
            to="/coach/$id"
            params={{ id: d.id }}
            className="flex items-center gap-3 rounded-2xl bg-foreground p-4 text-background shadow-soft"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Play className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Live-Coach starten</p>
              <p className="text-xs opacity-70">Kamera + KI-Stimme führt dich Schritt für Schritt</p>
            </div>
            <span>→</span>
          </Link>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="aspect-video bg-foreground">
              <iframe
                title="Tutorial"
                src={ytUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
              <Play className="h-3.5 w-3.5" /> YouTube-Tutorials zu „{d.youtubeQuery}"
            </div>
          </div>

          <ol className="space-y-3">
            {d.steps.map((s, i) => (
              <li key={i} className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-foreground text-xs font-semibold text-background">
                  {i + 1}
                </span>
                <span className="text-sm">{s}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {tab === "parts" && (
        <section className="mt-5 space-y-3">
          {d.parts.map((p) => (
            <a key={p.sku} href={p.shopUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft hover:bg-secondary">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">SKU {p.sku}</p>
              </div>
              <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">{p.price}</span>
            </a>
          ))}
        </section>
      )}

      {tab === "pro" && (
        <section className="mt-5">
          <Link to="/pros" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Fachbetriebe in deiner Nähe</p>
              <p className="text-xs text-muted-foreground">Karte öffnen & Termin anfragen</p>
            </div>
            <span className="text-accent">→</span>
          </Link>
        </section>
      )}
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex flex-col items-start gap-1 rounded-2xl border border-border bg-card p-3 shadow-soft">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
