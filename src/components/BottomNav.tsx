import { Link, useRouterState } from "@tanstack/react-router";
import { Home, History, Wrench, Sparkles, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const left = [
  { to: "/" as const, label: "Home", icon: Home },
  { to: "/pros" as const, label: "Profis", icon: Wrench },
];
const right = [
  { to: "/live" as const, label: "Live", icon: Radio },
  { to: "/history" as const, label: "Historie", icon: History },
];

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  const Item = ({ to, label, icon: Icon }: { to: "/" | "/pros" | "/live" | "/history"; label: string; icon: typeof Home }) => {
    const active = path === to;
    return (
      <Link
        to={to}
        className={cn(
          "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-xl items-end px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {left.map((it) => <Item key={it.to} {...it} />)}

        {/* Centered FAB */}
        <div className="flex w-20 justify-center">
          <Link
            to="/scan"
            aria-label="Scan starten"
            className="relative -mt-8 grid h-16 w-16 place-items-center rounded-full bg-foreground text-background shadow-glow ring-4 ring-background transition-transform active:scale-95"
          >
            <span className="absolute inset-0 -m-2 rounded-full bg-accent/30 animate-pulse-ring" />
            <Sparkles className="relative h-7 w-7" />
          </Link>
        </div>

        {right.map((it) => <Item key={it.to} {...it} />)}
      </div>
    </nav>
  );
}
