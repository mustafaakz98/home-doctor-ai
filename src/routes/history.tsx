import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Sparkles, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { categoryLabels, clearHistory, difficultyLabels, loadHistory, type Diagnosis } from "@/lib/diagnosis";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Historie – FixScan" },
      { name: "description", content: "Deine vergangenen Diagnosen im Überblick." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<Diagnosis[]>([]);
  useEffect(() => { setItems(loadHistory()); }, []);

  return (
    <AppShell>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historie</h1>
          <p className="mt-1 text-sm text-muted-foreground">{items.length} Diagnosen gespeichert</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => { clearHistory(); setItems([]); }}
            className="flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" /> Leeren
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
            <Sparkles className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Noch keine Diagnosen.<br />Starte deinen ersten Scan.</p>
          <Link to="/scan" className="rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background">
            Scan starten
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((d) => (
            <li key={d.id}>
              <Link to="/diagnosis/$id" params={{ id: d.id }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-xs font-semibold uppercase text-foreground">
                  {categoryLabels[d.category].slice(0, 3)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{d.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(d.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })} · {difficultyLabels[d.difficulty]}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
