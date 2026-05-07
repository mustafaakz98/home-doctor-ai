import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Video, Mic, Upload, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Waveform } from "@/components/Waveform";
import { analyzeMedia, saveDiagnosis, type MediaKind } from "@/lib/diagnosis";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Diagnose starten – FixScan" },
      { name: "description", content: "Foto, Video oder Geräuschaufnahme starten und Problem analysieren lassen." },
    ],
  }),
  component: ScanPage,
});

const modes: { kind: MediaKind; label: string; icon: typeof Camera; accept: string; capture?: "user" | "environment" }[] = [
  { kind: "photo", label: "Foto", icon: Camera, accept: "image/*", capture: "environment" },
  { kind: "video", label: "Video", icon: Video, accept: "video/*", capture: "environment" },
  { kind: "audio", label: "Audio", icon: Mic, accept: "audio/*" },
];

function ScanPage() {
  const navigate = useNavigate();
  const [kind, setKind] = useState<MediaKind>("photo");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const current = modes.find((m) => m.kind === kind)!;

  function pickFile() {
    inputRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    if (f.type.startsWith("image/") || f.type.startsWith("video/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  async function startAnalysis() {
    setAnalyzing(true);
    setProgress(0);
    const steps = ["Eingabe verarbeiten…", "Muster vergleichen…", "Diagnose erstellen…", "Ersatzteile suchen…"];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % steps.length;
      setStep(steps[i]);
      setProgress((p) => Math.min(95, p + 8 + Math.random() * 10));
    }, 280);
    try {
      const d = await analyzeMedia({ kind, preview: preview ?? undefined, notes: notes.trim() || undefined });
      saveDiagnosis(d);
      setProgress(100);
      navigate({ to: "/diagnosis/$id", params: { id: d.id } });
    } finally {
      clearInterval(t);
      setAnalyzing(false);
    }
  }

  return (
    <AppShell>
      <button onClick={() => history.back()} className="flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Zurück
      </button>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">Diagnose starten</h1>
      <p className="mt-1 text-sm text-muted-foreground">Wähle eine Aufnahmeart und lade dein Material hoch.</p>

      <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-1 shadow-soft">
        {modes.map((m) => (
          <button
            key={m.kind}
            onClick={() => { setKind(m.kind); setPreview(null); setFileName(null); }}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl py-3 text-xs font-medium transition-colors",
              kind === m.kind ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary",
            )}
          >
            <m.icon className="h-5 w-5" />
            {m.label}
          </button>
        ))}
      </div>

      <div className="relative mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <div className="relative aspect-[4/5] w-full bg-secondary">
          {preview && kind === "photo" && (
            <img src={preview} alt="Vorschau" className="h-full w-full object-cover" />
          )}
          {preview && kind === "video" && (
            <video src={preview} controls className="h-full w-full object-cover" />
          )}
          {!preview && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-background shadow-neu">
                  <current.icon className="h-9 w-9 text-foreground" />
                </div>
                <p className="text-sm">Noch keine Aufnahme</p>
              </div>
            </div>
          )}

          {analyzing && (
            <>
              <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="scan-line absolute inset-x-0 h-24 animate-scan" />
              </div>
              <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-3 px-6 text-background">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm font-medium">{step || "KI analysiert…"}</p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/20">
                  <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </>
          )}
        </div>

        <input ref={inputRef} type="file" accept={current.accept} capture={current.capture} className="hidden" onChange={onFile} />

        <div className="grid grid-cols-2 gap-2 p-3">
          <button onClick={pickFile} disabled={analyzing} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-medium hover:bg-secondary disabled:opacity-50">
            <current.icon className="h-4 w-4" /> Aufnehmen
          </button>
          <button onClick={pickFile} disabled={analyzing} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-medium hover:bg-secondary disabled:opacity-50">
            <Upload className="h-4 w-4" /> Hochladen
          </button>
        </div>
        {fileName && <p className="px-4 pb-3 text-xs text-muted-foreground truncate">📎 {fileName}</p>}
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <label htmlFor="notes" className="text-sm font-semibold">Zusätzliche Infos (optional)</label>
        <p className="mt-0.5 text-xs text-muted-foreground">Beschreibe das Problem in eigenen Worten – z.B. wann es auftritt, welche Geräusche etc.</p>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Z.B. Heizung gluckert seit gestern, besonders morgens…"
          className="mt-3 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <p className="mt-1 text-right text-[10px] text-muted-foreground">{notes.length}/500</p>
      </div>

      <button
        onClick={startAnalysis}
        disabled={analyzing}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-base font-semibold text-background shadow-soft transition-transform active:scale-[0.99] disabled:opacity-60"
      >
        {analyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        {analyzing ? "Analysiere…" : preview || fileName ? "Jetzt diagnostizieren" : "Demo-Diagnose starten"}
      </button>
      <p className="mt-2 text-center text-xs text-muted-foreground">Ohne Upload nutzen wir Demo-Daten zur Vorschau.</p>
    </AppShell>
  );
}
