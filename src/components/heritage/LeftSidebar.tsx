import { motion, AnimatePresence } from "framer-motion";
import { Activity, Shield, Wind, Droplets, Thermometer, Gauge, Megaphone, UserCheck, Cctv, AlertTriangle, ShieldAlert, Users, Trash2, Hand, Lock, UsersRound, Baby, HeartPulse } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { Panel } from "./Panel";
import type { SimState, Incident } from "@/lib/simulator";

const ICON: Record<string, any> = { ShieldAlert, Users, Trash2, Hand, Lock, UsersRound, Baby, HeartPulse, AlertTriangle };

function severityColor(level: SimState["risk"]) {
  if (level === "CRITICAL") return "text-danger";
  if (level === "HIGH ALERT") return "text-danger";
  if (level === "ELEVATED") return "text-warn";
  return "text-safe";
}
function severityBg(level: SimState["risk"]) {
  if (level === "CRITICAL") return "from-red-600/40 to-red-900/10 border-red-500/40";
  if (level === "HIGH ALERT") return "from-orange-500/40 to-red-900/10 border-orange-500/40";
  if (level === "ELEVATED") return "from-amber-400/30 to-amber-900/10 border-amber-400/40";
  return "from-emerald-400/30 to-emerald-900/10 border-emerald-400/30";
}

export function LeftSidebar({ state, onTriggerAction }: { state: SimState; onTriggerAction: (a: string) => void }) {
  const trendData = state.visitorTrend.map((v, i) => ({ i, v }));
  return (
    <aside className="w-[320px] shrink-0 h-full overflow-y-auto p-3 space-y-3">
      <div className="glass rounded-md p-4 corner-frame">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-md bg-cyan/10 border border-cyan/40 grid place-items-center">
            <Shield className="size-5 text-cyan" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-widest neon-text">TAJ MAHAL</div>
            <div className="text-[10px] text-muted-foreground tracking-[0.18em]">HERITAGE PROTECTION SYSTEM</div>
            <div className="text-[10px] text-muted-foreground">AGRA · UTTAR PRADESH · IND</div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 pulse-ring" />
            <span className="relative inline-flex rounded-full size-2 bg-emerald-400" />
          </span>
          <span className="text-emerald-300 tracking-widest">SYSTEM ACTIVE</span>
          <span className="ml-auto text-muted-foreground">v2.4.1</span>
        </div>
      </div>

      <Panel title="Visitor Analytics" right="LIVE">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold neon-text tabular-nums">{state.visitors.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">/ {state.capacity.toLocaleString()} capacity</div>
          </div>
          <div className="text-right text-[10px] text-cyan">
            {Math.round((state.visitors / state.capacity) * 100)}% LOAD
          </div>
        </div>
        <div className="h-2 mt-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500"
            animate={{ width: `${Math.min(100, (state.visitors / state.capacity) * 100)}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <div className="h-16 mt-2">
          <ResponsiveContainer>
            <LineChart data={trendData}>
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <Line type="monotone" dataKey="v" stroke="var(--color-cyan)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Weather & Environment">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Stat icon={<Thermometer className="size-3.5" />} label="Temp" value={`${state.weather.tempC}°C`} />
          <Stat icon={<Droplets className="size-3.5" />} label="Humidity" value={`${state.weather.humidity}%`} />
          <Stat icon={<Wind className="size-3.5" />} label="Wind" value={`${state.weather.windKph} kph`} />
          <Stat icon={<Gauge className="size-3.5" />} label="AQI" value={`${state.weather.aqi}`} />
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground flex justify-between">
          <span>Condition</span><span className="text-cyan">{state.weather.condition.toUpperCase()}</span>
        </div>
        <div className="mt-2 text-[10px] flex justify-between">
          <span className="text-muted-foreground">Marble Preservation Score</span>
          <span className="text-safe tabular-nums">{state.preservationScore.toFixed(1)}</span>
        </div>
      </Panel>

      <Panel title="Security Status">
        <div className={`rounded-md p-3 border bg-gradient-to-br ${severityBg(state.risk)}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-muted-foreground tracking-widest">CURRENT THREAT LEVEL</div>
              <div className={`text-xl font-extrabold tracking-wider ${severityColor(state.risk)}`}>{state.risk}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground">SCORE</div>
              <div className="text-2xl font-bold tabular-nums">{state.riskScore}</div>
            </div>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-black/40 overflow-hidden">
            <motion.div animate={{ width: `${state.riskScore}%` }} className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500" />
          </div>
        </div>
        <div className="grid grid-cols-3 mt-2 text-center text-[10px]">
          <div><div className="text-cyan tabular-nums">{state.activeIncidents}</div><div className="text-muted-foreground">ACTIVE</div></div>
          <div><div className="text-cyan tabular-nums">{state.guards.filter(g => g.status !== "available").length}</div><div className="text-muted-foreground">ENGAGED</div></div>
          <div><div className="text-cyan tabular-nums">{state.guards.length}</div><div className="text-muted-foreground">UNITS</div></div>
        </div>
      </Panel>

      <Panel title="Active Alerts" right={`${state.activeIncidents} OPEN`}>
        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
          <AnimatePresence initial={false}>
            {state.incidents.slice(0, 12).map(inc => (
              <AlertRow key={inc.id} inc={inc} />
            ))}
          </AnimatePresence>
          {state.incidents.length === 0 && (
            <div className="text-[10px] text-muted-foreground text-center py-4">No active alerts</div>
          )}
        </div>
      </Panel>

      <Panel title="Quick Actions">
        <div className="grid grid-cols-1 gap-1.5">
          <ActionButton icon={<UserCheck className="size-3.5" />} label="Deploy Guard" onClick={() => onTriggerAction("deploy")} />
          <ActionButton icon={<Megaphone className="size-3.5" />} label="Public Announcement" onClick={() => onTriggerAction("announce")} />
          <ActionButton icon={<Cctv className="size-3.5" />} label="View CCTV Grid" onClick={() => onTriggerAction("cctv")} />
          <ActionButton icon={<Activity className="size-3.5" />} label="Trigger Drill Incident" onClick={() => onTriggerAction("incident")} />
        </div>
      </Panel>
    </aside>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded bg-white/5 border border-white/5 px-2 py-1.5">
      <div className="flex items-center gap-1 text-muted-foreground text-[10px]">{icon}{label}</div>
      <div className="text-sm tabular-nums">{value}</div>
    </div>
  );
}

function AlertRow({ inc }: { inc: Incident }) {
  const Icon = ICON[iconForKey(inc.key)] ?? AlertTriangle;
  const color = inc.color === "danger" ? "text-danger border-danger/40" : inc.color === "warn" ? "text-warn border-warn/40" : "text-cyan border-cyan/40";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className={`flex items-center gap-2 px-2 py-1.5 rounded border bg-black/30 ${color}`}
    >
      <Icon className="size-3.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] truncate">{inc.label}</div>
        <div className="text-[9px] text-muted-foreground truncate">{inc.zone} · {inc.id}</div>
      </div>
      <div className="text-[9px] text-muted-foreground tabular-nums">
        {new Date(inc.ts).toLocaleTimeString([], { hour12: false })}
      </div>
      {inc.status === "resolved" ? (
        <span className="text-[9px] text-emerald-400">✓</span>
      ) : (
        <span className="size-1.5 rounded-full bg-current blink" />
      )}
    </motion.div>
  );
}

function iconForKey(k: string) {
  return ({
    breach: "ShieldAlert", gathering: "Users", litter: "Trash2", touch: "Hand",
    basement: "Lock", congestion: "UsersRound", lostchild: "Baby", medical: "HeartPulse",
    patrolfail: "AlertTriangle",
  } as Record<string, string>)[k] ?? "AlertTriangle";
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded border border-cyan/20 bg-cyan/5 hover:bg-cyan/15 hover:border-cyan/60 text-xs tracking-wider transition-colors"
    >
      <span className="text-cyan">{icon}</span>
      <span>{label}</span>
      <span className="ml-auto text-cyan text-[10px]">›</span>
    </motion.button>
  );
}
