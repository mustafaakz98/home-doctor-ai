import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Scan, History, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/scan", label: "Scan", icon: Scan, primary: true },
  { to: "/pros", label: "Profis", icon: Wrench },
  { to: "/history", label: "Historie", icon: History },
];

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl">
      <ul className="mx-auto grid max-w-xl grid-cols-4 px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {items.map((it) => {
          const active = path === it.to;
          const Icon = it.icon;
          return (
            <li key={it.to} className="flex justify-center">
              <Link
                to={it.to}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-4 py-2 text-xs font-medium transition-colors",
                  it.primary && "relative -mt-6 h-14 w-14 justify-center bg-foreground text-background shadow-glow",
                  !it.primary && (active ? "text-foreground" : "text-muted-foreground"),
                )}
              >
                <Icon className={cn(it.primary ? "h-6 w-6" : "h-5 w-5")} />
                {!it.primary && <span>{it.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
