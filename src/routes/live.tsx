import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mic, MicOff, Camera as CameraIcon, Loader2, Sparkles, X } from "lucide-react";
import { askLiveAssistant } from "@/server/live.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live-Assistent – FixScan" },
      { name: "description", content: "Live-Kamera + Sprache: Zeige dein Problem, der KI-Assistent antwortet sofort." },
    ],
  }),
  component: LivePage,
});

interface Turn {
  role: "user" | "assistant";
  content: string;
}

function LivePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const historyRef = useRef<Turn[]>([]);

  const [streamErr, setStreamErr] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interim, setInterim] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  // Camera
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) { s.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play().catch(() => {});
        }
      } catch (e: any) {
        setStreamErr(e?.message || "Kamera nicht verfügbar");
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      window.speechSynthesis?.cancel();
      try { recognitionRef.current?.stop(); } catch {}
    };
  }, []);

  function captureFrame(): string | undefined {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || !v.videoWidth) return undefined;
    const maxW = 720;
    const scale = Math.min(1, maxW / v.videoWidth);
    c.width = Math.round(v.videoWidth * scale);
    c.height = Math.round(v.videoHeight * scale);
    const ctx = c.getContext("2d");
    if (!ctx) return undefined;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.7);
  }

  function speak(text: string) {
    if (mutedRef.current) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "de-DE";
    u.rate = 1.05;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  async function ask(userText: string) {
    const trimmed = userText.trim();
    if (!trimmed) return;
    const userTurn: Turn = { role: "user", content: trimmed };
    const newTurns = [...historyRef.current, userTurn];
    historyRef.current = newTurns;
    setTurns(newTurns);
    setThinking(true);
    try {
      const image = captureFrame();
      const res = await askLiveAssistant({
        data: {
          userText: trimmed,
          imageBase64: image,
          history: historyRef.current.slice(-10, -1),
        },
      });
      const reply = res.reply || "Entschuldige, ich konnte keine Antwort generieren.";
      const next = [...historyRef.current, { role: "assistant" as const, content: reply }];
      historyRef.current = next;
      setTurns(next);
      speak(reply);
    } catch (e: any) {
      const msg = "Verbindung zur KI nicht möglich. Versuche es erneut.";
      const next = [...historyRef.current, { role: "assistant" as const, content: msg }];
      historyRef.current = next;
      setTurns(next);
      console.error(e);
    } finally {
      setThinking(false);
    }
  }

  function startListening() {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Spracheingabe wird in diesem Browser nicht unterstützt. Bitte Chrome verwenden.");
      return;
    }
    const r = new SR();
    r.lang = "de-DE";
    r.interimResults = true;
    r.continuous = false;
    r.onstart = () => setListening(true);
    r.onresult = (ev: any) => {
      let txt = "";
      let isFinal = false;
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        txt += ev.results[i][0].transcript;
        if (ev.results[i].isFinal) isFinal = true;
      }
      setInterim(txt);
      if (isFinal) {
        setInterim("");
        r.stop();
        ask(txt);
      }
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    try { r.start(); } catch {}
  }

  function stopListening() {
    try { recognitionRef.current?.stop(); } catch {}
    setListening(false);
  }

  const lastAssistant = [...turns].reverse().find((t) => t.role === "assistant");
  const lastUser = [...turns].reverse().find((t) => t.role === "user");

  return (
    <div className="min-h-screen bg-foreground text-background">
      <div className="relative h-[100dvh] w-full overflow-hidden">
        <video ref={videoRef} muted playsInline className="absolute inset-0 h-full w-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        {streamErr && (
          <div className="absolute inset-0 grid place-items-center bg-foreground/90 px-6 text-center text-sm">
            <div className="space-y-2">
              <CameraIcon className="mx-auto h-8 w-8" />
              <p>Kamerazugriff nicht möglich.</p>
              <p className="text-xs opacity-70">{streamErr}</p>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-foreground/70 via-transparent to-foreground/85" />

        {/* Header */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Link to="/" className="grid h-10 w-10 place-items-center rounded-full bg-background/15 backdrop-blur">
            <X className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-background/15 px-3 py-2 text-xs backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> Live-Assistent
          </div>
          <button
            onClick={() => { setMuted((m) => !m); window.speechSynthesis?.cancel(); }}
            className={cn("grid h-10 w-10 place-items-center rounded-full backdrop-blur", muted ? "bg-destructive text-destructive-foreground" : "bg-background/15")}
            aria-label="Stimme ein/aus"
          >
            {muted ? <MicOff className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          </button>
        </div>

        {/* Conversation bubble */}
        <div className="absolute inset-x-0 top-20 space-y-2 px-4">
          {lastUser && (
            <div className="ml-auto max-w-[85%] rounded-2xl bg-background/15 px-4 py-2 text-right text-sm backdrop-blur">
              {lastUser.content}
            </div>
          )}
          {(lastAssistant || thinking) && (
            <div className="max-w-[90%] rounded-2xl bg-accent px-4 py-3 text-sm text-accent-foreground shadow-lg">
              {thinking ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> denkt nach…</span>
              ) : (
                lastAssistant!.content
              )}
            </div>
          )}
          {interim && (
            <div className="ml-auto max-w-[85%] rounded-2xl bg-background/10 px-4 py-2 text-right text-xs italic opacity-80 backdrop-blur">
              {interim}…
            </div>
          )}
        </div>

        {/* Status orb */}
        <div className="absolute inset-x-0 bottom-44 grid place-items-center">
          <div className="relative">
            {(listening || speaking) && (
              <span className={cn(
                "absolute inset-0 -m-4 rounded-full animate-pulse-ring",
                listening ? "bg-accent/40" : "bg-sky-400/40"
              )} />
            )}
            <div className={cn(
              "relative grid h-24 w-24 place-items-center rounded-full text-background shadow-glow transition-colors",
              thinking ? "bg-amber-500" : speaking ? "bg-sky-500" : listening ? "bg-accent text-accent-foreground" : "bg-background/15 backdrop-blur"
            )}>
              {thinking ? <Loader2 className="h-10 w-10 animate-spin" /> :
               speaking ? <Sparkles className="h-10 w-10" /> :
               listening ? <Mic className="h-10 w-10" /> :
               <Sparkles className="h-10 w-10" />}
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute inset-x-0 bottom-0 space-y-3 p-6 pb-10">
          <button
            onClick={listening ? stopListening : startListening}
            disabled={thinking}
            className={cn(
              "flex w-full items-center justify-center gap-3 rounded-full py-4 text-base font-semibold shadow-glow transition-all active:scale-[0.98] disabled:opacity-60",
              listening ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground"
            )}
          >
            {listening ? <><MicOff className="h-5 w-5" /> Stop</> : <><Mic className="h-5 w-5" /> Frage stellen</>}
          </button>
          <p className="text-center text-[11px] opacity-70">
            Halte das Problem in die Kamera und stelle deine Frage – z.B. „Was ist hier kaputt?"
          </p>
        </div>
      </div>
    </div>
  );
}
