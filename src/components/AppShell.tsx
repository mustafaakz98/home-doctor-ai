import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background bg-mesh">
      <main className="mx-auto max-w-xl px-5 pb-32 pt-8">{children}</main>
      <BottomNav />
    </div>
  );
}
