import { useEffect, useRef, useState } from "react";

interface Props {
  /** When true, animate as if "listening" (pre-analysis idle pulse). */
  active?: boolean;
  /** Optional audio source URL — if provided, bars react to real audio amplitude during playback. */
  src?: string;
  bars?: number;
  className?: string;
}

/**
 * Waveform visualisation. If `src` is provided and the user plays the audio,
 * the bars react to real audio amplitude via the WebAudio API. Otherwise the
 * bars perform an idle "listening" animation to suggest the AI is processing.
 */
export function Waveform({ active = true, src, bars = 32, className }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [levels, setLevels] = useState<number[]>(() => Array(bars).fill(0.15));
  const [playing, setPlaying] = useState(false);

  // Idle pseudo-random animation
  useEffect(() => {
    if (playing || !active) return;
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.08;
      setLevels((prev) =>
        prev.map((_, i) => {
          const v = Math.sin(t + i * 0.35) * 0.5 + 0.5;
          const noise = Math.random() * 0.25;
          return Math.max(0.1, Math.min(1, v * 0.7 + noise));
        })
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, playing, bars]);

  // Real-audio analysis while playing
  useEffect(() => {
    if (!playing || !audioRef.current) return;
    const audio = audioRef.current;
    let ctx: AudioContext | null = null;
    let raf = 0;
    let analyser: AnalyserNode;
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const next = Array.from({ length: bars }, (_, i) => {
          const idx = Math.floor((i / bars) * data.length);
          return Math.max(0.08, data[idx] / 255);
        });
        setLevels(next);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } catch {
      // already-connected element or unsupported — fall back to idle
    }
    return () => {
      cancelAnimationFrame(raf);
      ctx?.close().catch(() => {});
    };
  }, [playing, bars]);

  return (
    <div className={className}>
      <div className="flex h-24 items-end justify-center gap-[3px]">
        {levels.map((l, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-accent transition-[height] duration-75"
            style={{ height: `${Math.max(8, l * 100)}%` }}
          />
        ))}
      </div>
      {src && (
        <audio
          ref={audioRef}
          src={src}
          controls
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          className="mt-3 w-full"
        />
      )}
    </div>
  );
}
