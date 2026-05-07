import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Mic, Pause, Play, Volume2, VolumeX, Camera as CameraIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getDiagnosis, type Diagnosis } from "@/lib/diagnosis";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/coach/$id")({
  head: () => ({
    meta: [
      { title: "Live-Coach – FixScan" },
      { name: "description", content: "Live-Kamera mit KI-Stimme, die dich Schritt für Schritt durch die Reparatur führt." },
    ],
  }),
  component: CoachPage,
});

function CoachPage() {
  const { id } = useParams({ from: "/coach/$id" });
  const [d, setD] = useState<Diagnosis | undefined>();
  const [step, setStep] = useState(0);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [streamErr, setStreamErr] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => { setD(getDiagnosis(id)); }, [id]);

  // Live camera
  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play().catch(() => {});
        }
      } catch (e: any) {
        setStreamErr(e?.message || "Kamera nicht verfügbar");
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Speak current step
  useEffect(() => {
    if (!d || muted || !playing) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const text = `Schritt ${step + 1} von ${d.steps.length}. ${d.steps[step]}`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = 0.95;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
    return () => window.speechSynthesis.cancel();
  }, [d, step, muted, playing]);

  // Voice commands ("weiter", "zurück", "stopp")
  useEffect(() => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR || !listening) return;
    const r = new SR();
    r.lang = "de-DE";
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (ev: any) => {
      const t = ev.results[ev.results.length - 1][0].transcript.toLowerCase();
      if (t.includes("weiter") || t.includes("nächste")) setStep((s) => Math.min((d?.steps.length ?? 1) - 1, s + 1));
      else if (t.includes("zurück")) setStep((s) => Math.max(0, s - 1));
      else if (t.includes("stopp") || t.includes("pause")) setPlaying(false);
      else if (t.includes("weiterlesen") || t.includes("start")) setPlaying(true);
    };
    r.onerror = () => setListening(false);
    try { r.start(); } catch {}
    return () => { try { r.stop(); } catch {} };
  }, [listening, d]);

  if (!d) {
    return (
      <AppShell>
        <p className="mt-12 text-center text-muted-foreground">Diagnose nicht gefunden.</p>
        <Link to="/" className="mt-4 block text-center text-accent">Zur Startseite</Link>
      </AppShell>
    );
  }

  const total = d.steps.length;

  return (
    <div className="min-h-screen bg-foreground text-background">
      <div className="relative h-[100dvh] w-full overflow-hidden">
        {/* Live camera */}
        <video ref={videoRef} muted playsInline className="absolute inset-0 h-full w-full object-cover" />
        {streamErr && (
          <div className="absolute inset-0 grid place-items-center bg-foreground/90 px-6 text-center text-sm">
            <div className="space-y-2">
              <CameraIcon className="mx-auto h-8 w-8" />
              <p>Kamerazugriff nicht möglich.</p>
              <p className="text-xs opacity-70">{streamErr}</p>
            </div>
          </div>
        )}

        {/* AR-Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-foreground/60 via-transparent to-foreground/80" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-3xl border-2 border-accent/70 shadow-[0_0_60px_color-mix(in_oklab,var(--accent)_50%,transparent)]" />

        {/* Header */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <button onClick={() => history.back()} className="flex items-center gap-1 rounded-full bg-background/15 px-3 py-2 text-xs backdrop-blur">
            <ArrowLeft className="h-4 w-4" /> Beenden
          </button>
          <span className="rounded-full bg-background/15 px-3 py-2 text-xs backdrop-blur">Live-Coach · {d.title}</span>
        </div>

        {/* Step bubble */}
        <div className="absolute inset-x-0 top-20 px-4">
          <div className="rounded-2xl bg-background/15 p-4 backdrop-blur">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider opacity-80">
              <span>Schritt {step + 1} / {total}</span>
              <span className="flex items-center gap-1"><Volume2 className="h-3.5 w-3.5" /> KI-Stimme</span>
            </div>
            <p className="mt-2 text-base leading-snug">{d.steps[step]}</p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-background/20">
              <div className="h-full bg-accent transition-[width]" style={{ width: `${((step + 1) / total) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute inset-x-0 bottom-0 space-y-3 p-4 pb-8">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="grid h-12 w-12 place-items-center rounded-full bg-background/15 backdrop-blur disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="grid h-16 w-16 place-items-center rounded-full bg-accent text-accent-foreground shadow-lg"
            >
              {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
            <button
              onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
              disabled={step === total - 1}
              className="grid h-12 w-12 place-items-center rounded-full bg-background/15 backdrop-blur disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setMuted((m) => !m)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-background/15 py-3 text-xs backdrop-blur"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {muted ? "Stimme aus" : "Stimme an"}
            </button>
            <button
              onClick={() => setListening((l) => !l)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs backdrop-blur",
                listening ? "bg-accent text-accent-foreground" : "bg-background/15"
              )}
            >
              <Mic className="h-4 w-4" /> {listening ? "Hört zu…" : "Sprachsteuerung"}
            </button>
          </div>
          <p className="text-center text-[10px] opacity-70">Sage „weiter", „zurück" oder „stopp"</p>
        </div>
      </div>
    </div>
  );
}
