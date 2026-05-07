import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Video, Mic, Sparkles, ShieldCheck, Zap, Droplet, Flame, Wind, Plug } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FixScan – KI-Diagnose für Hausreparaturen" },
      { name: "description", content: "Foto, Video oder Geräusch aufnehmen – KI erkennt das Problem in Sanitär, Heizung, Klima und Elektro in Sekunden." },
      { property: "og:title", content: "FixScan – KI-Diagnose für Hausreparaturen" },
      { property: "og:description", content: "Shazam für Reparaturen. Diagnose in Sekunden." },
    ],
  }),
  component: Home,
});

const categories = [
  { icon: Droplet, label: "Sanitär", tone: "text-sky-500" },
  { icon: Flame, label: "Heizung", tone: "text-orange-500" },
  { icon: Wind, label: "Klima", tone: "text-cyan-500" },
  { icon: Plug, label: "Elektro", tone: "text-amber-500" },
];

function Home() {
  return (
    <AppShell>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-foreground text-background">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">FixScan</span>
        </div>
        <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          Beta
        </span>
      </header>

      <section className="mt-10">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">KI-Diagnose</p>
        <h1 className="mt-2 text-4xl font-bold leading-[1.05] text-foreground">
          Was ist mit deinem<br />
          <span className="text-muted-foreground">Zuhause</span> los?
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Aufnehmen, hochladen, hören. Unsere KI erkennt das Problem – samt Ersatzteilen und Anleitung.
        </p>
      </section>

      <section className="mt-8">
        <Link
          to="/scan"
          className="group relative grid h-44 w-full place-items-center overflow-hidden rounded-[2rem] bg-foreground text-background shadow-soft transition-transform active:scale-[0.99]"
        >
          <span className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
            style={{ background: "radial-gradient(circle at 50% 50%, oklch(0.72 0.17 155 / 0.35), transparent 60%)" }} />
          <div className="relative flex flex-col items-center gap-3">
            <div className="relative">
              <span className="absolute inset-0 -m-3 rounded-full bg-accent/30 animate-pulse-ring" />
              <div className="relative grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-foreground shadow-glow">
                <Sparkles className="h-7 w-7" />
              </div>
            </div>
            <span className="text-lg font-semibold">Diagnose starten</span>
          </div>
        </Link>

        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            { to: "/scan", icon: Camera, label: "Foto" },
            { to: "/scan", icon: Video, label: "Video" },
            { to: "/scan", icon: Mic, label: "Audio" },
          ].map((q) => (
            <Link
              key={q.label}
              to={q.to}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-3 py-4 text-sm font-medium shadow-soft transition-colors hover:bg-secondary"
            >
              <q.icon className="h-5 w-5 text-foreground" />
              {q.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Bereiche</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {categories.map((c) => (
            <div key={c.label} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary">
                <c.icon className={`h-5 w-5 ${c.tone}`} />
              </div>
              <span className="font-medium">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-accent" /> So funktioniert's
        </div>
        <ol className="mt-4 space-y-3 text-sm">
          {[
            { icon: Camera, t: "Aufnahme machen", d: "Foto, Video oder Geräusch erfassen." },
            { icon: Zap, t: "KI analysiert", d: "Sekundenschneller Scan deiner Eingabe." },
            { icon: Sparkles, t: "Lösung erhalten", d: "Ersatzteile, Anleitung oder Profi." },
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-secondary">
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">{s.t}</p>
                <p className="text-muted-foreground">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </AppShell>
  );
}
