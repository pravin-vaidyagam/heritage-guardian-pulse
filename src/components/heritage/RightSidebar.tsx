import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, Users, ShieldCheck } from "lucide-react";
import { Panel } from "./Panel";
import type { SimState } from "@/lib/simulator";
import { ALL_MODES } from "@/lib/simulator";
import { Link } from "@tanstack/react-router";

export function RightSidebar({ state, mode, onMode }: { state: SimState; mode: string; onMode: (m: any) => void }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const activeUnits = state.guards.filter(g => g.status !== "available").length + 7;
  const totalUnits = 20;

  return (
    <aside className="w-[320px] shrink-0 h-full overflow-y-auto p-3 space-y-3">
      <div className="glass rounded-md p-3 corner-frame">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan tabular-nums text-2xl font-bold neon-text">
              <Clock className="size-4 opacity-70" />
              {now.toLocaleTimeString([], { hour12: false })}
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Calendar className="size-3" /> {now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-muted-foreground tracking-widest">OPERATOR</div>
            <div className="text-xs">CMD-7 · A. SHARMA</div>
          </div>
        </div>
      </div>

      <Panel title="Simulation Mode">
        <div className="grid grid-cols-2 gap-1.5">
          {ALL_MODES.map(m => (
            <button key={m} onClick={() => onMode(m)}
              className={`text-[10px] tracking-widest px-2 py-1.5 rounded border transition ${mode === m ? "border-cyan/60 bg-cyan/15 text-cyan" : "border-white/10 bg-black/30 hover:bg-cyan/5"}`}>
              {m.toUpperCase()}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Crowd Density Heatmap">
        <div className="relative aspect-square rounded overflow-hidden border border-white/5 bg-black/40">
          <div className="absolute inset-0 grid-bg opacity-40" />
          {state.crowds.map(c => {
            const color = c.intensity > 0.75 ? "239,68,68" : c.intensity > 0.5 ? "251,146,60" : c.intensity > 0.3 ? "250,204,21" : "34,197,94";
            const size = 40 + c.intensity * 70;
            return (
              <div key={c.id} className="absolute rounded-full"
                style={{
                  left: `${c.pos.x}%`, top: `${c.pos.y}%`,
                  width: size, height: size, transform: "translate(-50%,-50%)",
                  background: `radial-gradient(circle, rgba(${color},${0.7 * c.intensity}) 0%, rgba(${color},0) 70%)`,
                }}
              />
            );
          })}
          <div className="absolute bottom-1 left-1 right-1 flex justify-between text-[8px] tracking-widest text-muted-foreground">
            <span className="text-emerald-400">LOW</span>
            <span className="text-amber-400">MED</span>
            <span className="text-rose-400">HIGH</span>
          </div>
        </div>
      </Panel>

      <Panel title="Patrol Units">
        <div className="flex items-center gap-3">
          <div className="relative size-20">
            <svg viewBox="0 0 36 36" className="size-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="oklch(1 0 0 / 8%)" strokeWidth="3" />
              <motion.circle
                cx="18" cy="18" r="15" fill="none" stroke="var(--color-cyan)" strokeWidth="3"
                strokeLinecap="round" strokeDasharray={`${(activeUnits / totalUnits) * 94.25} 94.25`}
                initial={false} animate={{ strokeDasharray: `${(activeUnits / totalUnits) * 94.25} 94.25` }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-lg font-bold tabular-nums">{activeUnits}</div>
                <div className="text-[8px] text-muted-foreground tracking-widest">/ {totalUnits}</div>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-1.5 text-[11px]">
            <UnitRow icon={<Users className="size-3 text-safe" />} label="Available" value={totalUnits - activeUnits} />
            <UnitRow icon={<ShieldCheck className="size-3 text-warn" />} label="Investigating" value={state.guards.filter(g => g.status === "investigating").length + 4} />
            <UnitRow icon={<ShieldCheck className="size-3 text-danger" />} label="Emergency" value={state.guards.filter(g => g.status === "emergency").length} />
          </div>
        </div>
      </Panel>

      <Panel title="Recent Events" right={<Link to="/analytics" className="text-cyan hover:underline">VIEW ALL →</Link>}>
        <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
          {state.incidents.slice(0, 16).map(i => (
            <motion.div key={i.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-between text-[10px] px-2 py-1 rounded bg-black/30 border border-white/5">
              <div className="min-w-0">
                <div className="truncate">{i.label}</div>
                <div className="text-muted-foreground text-[9px]">{i.zone}</div>
              </div>
              <div className="text-right text-muted-foreground tabular-nums text-[9px]">
                {new Date(i.ts).toLocaleTimeString([], { hour12: false })}
              </div>
            </motion.div>
          ))}
          {state.incidents.length === 0 && (
            <div className="text-center text-muted-foreground text-[10px] py-4">No events yet</div>
          )}
        </div>
      </Panel>

      <Panel title="Heritage Preservation">
        <div className="space-y-1.5 text-[10px]">
          <Bar label="Marble Integrity" value={state.preservationScore} color="var(--color-safe)" />
          <Bar label="Humidity Stress" value={Math.min(100, state.weather.humidity)} color="var(--color-cyan)" />
          <Bar label="Pollution Load" value={Math.min(100, state.weather.aqi / 3)} color="var(--color-warn)" />
          <Bar label="Crowd Stress" value={Math.min(100, (state.visitors / state.capacity) * 100)} color="var(--color-danger)" />
        </div>
      </Panel>
    </aside>
  );
}

function UnitRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-muted-foreground">{icon}{label}</div>
      <div className="tabular-nums">{value}</div>
    </div>
  );
}
function Bar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-muted-foreground"><span>{label}</span><span className="tabular-nums" style={{ color }}>{value.toFixed(0)}</span></div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <motion.div className="h-full" animate={{ width: `${Math.min(100, value)}%` }} style={{ background: color }} />
      </div>
    </div>
  );
}
