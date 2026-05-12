import { Link, useLocation } from "@tanstack/react-router";
import { Shield } from "lucide-react";

export function TopBar() {
  const loc = useLocation();
  const tabs = [
    { to: "/", label: "Live Command" },
    { to: "/analytics", label: "Historical Analytics" },
    { to: "/report", label: "Half-Yearly Report" },
  ];
  return (
    <header className="h-12 shrink-0 px-3 flex items-center gap-3 border-b border-white/5 bg-black/30 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Shield className="size-4 text-cyan" />
        <span className="text-[11px] tracking-[0.3em] text-cyan">ASI · HERITAGE COMMAND</span>
      </div>
      <span className="text-muted-foreground text-[10px]">CLASSIFIED · INTERNAL USE ONLY</span>
      <nav className="ml-auto flex items-center gap-1">
        {tabs.map(t => {
          const active = loc.pathname === t.to;
          return (
            <Link key={t.to} to={t.to}
              className={`px-3 py-1.5 rounded text-[11px] tracking-widest border transition ${active ? "border-cyan/60 bg-cyan/15 text-cyan" : "border-white/10 hover:bg-white/5"}`}>
              {t.label.toUpperCase()}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
