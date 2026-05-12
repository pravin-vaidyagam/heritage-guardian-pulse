import { useEffect, useRef, useState, useCallback } from "react";
import { CAMERAS, CROWD_BASE, GUARDS, INCIDENT_TYPES, SIM_MODES, type CrowdCluster, type GuardPost, type IncidentKey, type SimMode, type Coord } from "./heritage-data";

export type Incident = {
  id: string;
  key: IncidentKey;
  label: string;
  color: string;
  severity: number;
  zone: string;
  pos: Coord;
  ts: number;
  status: "active" | "responding" | "resolved";
  guardId?: string;
};

export type Weather = {
  tempC: number; humidity: number; aqi: number; windKph: number; condition: "Clear" | "Haze" | "Fog" | "Rain" | "Hot";
};

export type RiskLevel = "SAFE" | "ELEVATED" | "HIGH ALERT" | "CRITICAL";

export type SimState = {
  mode: SimMode;
  visitors: number;
  capacity: number;
  visitorTrend: number[];
  weather: Weather;
  crowds: CrowdCluster[];
  incidents: Incident[];
  guards: GuardPost[];
  riskScore: number;
  risk: RiskLevel;
  activeIncidents: number;
  preservationScore: number;
  lastTick: number;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

function modeWeather(mode: SimMode): Weather {
  switch (mode) {
    case "Monsoon Day": return { tempC: 27, humidity: 88, aqi: 72, windKph: 22, condition: "Rain" };
    case "Tourist Rush": return { tempC: 34, humidity: 55, aqi: 138, windKph: 9, condition: "Haze" };
    case "Festival Day": return { tempC: 31, humidity: 60, aqi: 156, windKph: 8, condition: "Haze" };
    case "Security Threat": return { tempC: 30, humidity: 50, aqi: 110, windKph: 12, condition: "Clear" };
    default: return { tempC: 32, humidity: 48, aqi: 96, windKph: 11, condition: "Clear" };
  }
}

function modeBaseline(mode: SimMode) {
  switch (mode) {
    case "Tourist Rush": return { visitors: 17800, crowdMul: 1.4, incidentRate: 0.55 };
    case "Festival Day": return { visitors: 19200, crowdMul: 1.55, incidentRate: 0.7 };
    case "Monsoon Day": return { visitors: 6400, crowdMul: 0.6, incidentRate: 0.35 };
    case "Security Threat": return { visitors: 11000, crowdMul: 0.95, incidentRate: 0.85 };
    case "Mixed Incident": return { visitors: 13500, crowdMul: 1.1, incidentRate: 0.9 };
    default: return { visitors: 12450, crowdMul: 1.0, incidentRate: 0.25 };
  }
}

function nearestGuard(pos: Coord, guards: GuardPost[]) {
  let best = guards[0]; let bestD = Infinity;
  for (const g of guards) {
    const d = (g.pos.x - pos.x) ** 2 + (g.pos.y - pos.y) ** 2;
    if (d < bestD && g.status !== "emergency") { best = g; bestD = d; }
  }
  return best;
}

function computeRisk(s: Omit<SimState, "risk" | "riskScore">): { risk: RiskLevel; riskScore: number } {
  const crowdLoad = s.visitors / s.capacity;
  const incidentLoad = Math.min(1, s.incidents.filter(i => i.status !== "resolved").length / 6);
  const sevLoad = Math.min(1, s.incidents.filter(i => i.status !== "resolved").reduce((a, i) => a + i.severity, 0) / 14);
  const wx = (s.weather.humidity > 80 ? 0.15 : 0) + (s.weather.aqi > 130 ? 0.15 : 0) + (s.weather.condition === "Rain" ? 0.1 : 0);
  const score = Math.min(1, crowdLoad * 0.35 + incidentLoad * 0.25 + sevLoad * 0.3 + wx);
  let risk: RiskLevel = "SAFE";
  if (score > 0.78) risk = "CRITICAL";
  else if (score > 0.6) risk = "HIGH ALERT";
  else if (score > 0.38) risk = "ELEVATED";
  return { risk, riskScore: Math.round(score * 100) };
}

export function initialState(mode: SimMode = "Normal Day"): SimState {
  const base = modeBaseline(mode);
  const weather = modeWeather(mode);
  const crowds = CROWD_BASE.map(c => ({ ...c, intensity: Math.min(1, c.intensity * base.crowdMul) }));
  const guards = GUARDS.map(g => ({ ...g }));
  const partial = {
    mode, visitors: base.visitors, capacity: 20000,
    visitorTrend: Array.from({ length: 24 }, (_, i) => Math.round(base.visitors * (0.4 + 0.6 * Math.sin(i / 24 * Math.PI)))),
    weather, crowds, incidents: [] as Incident[], guards,
    activeIncidents: 0, preservationScore: 87, lastTick: Date.now(),
  };
  const r = computeRisk(partial as any);
  return { ...partial, ...r };
}

export function useSimulator(mode: SimMode) {
  const [state, setState] = useState<SimState>(() => initialState(mode));
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
    setState(s => {
      const fresh = initialState(mode);
      return { ...fresh, incidents: s.incidents.slice(0, 6) };
    });
  }, [mode]);

  const triggerIncident = useCallback((key?: IncidentKey) => {
    setState(s => {
      const t = INCIDENT_TYPES.find(x => x.key === key) ?? pick(INCIDENT_TYPES);
      const cluster = pick(s.crowds);
      const pos = { x: cluster.pos.x + rand(-4, 4), y: cluster.pos.y + rand(-4, 4) };
      const camera = CAMERAS.reduce((a, c) => {
        const d = (c.pos.x - pos.x) ** 2 + (c.pos.y - pos.y) ** 2;
        return d < ((a.pos.x - pos.x) ** 2 + (a.pos.y - pos.y) ** 2) ? c : a;
      });
      const guard = nearestGuard(pos, s.guards);
      const inc: Incident = {
        id: `INC-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        key: t.key, label: t.label, color: t.color, severity: t.severity,
        zone: camera.zone, pos, ts: Date.now(), status: "responding", guardId: guard.id,
      };
      const newStatus: GuardPost["status"] = t.severity >= 3 ? "emergency" : "investigating";
      const guards: GuardPost[] = s.guards.map(g => g.id === guard.id ? { ...g, status: newStatus } : g);
      const next = { ...s, incidents: [inc, ...s.incidents].slice(0, 40), guards };
      return { ...next, ...computeRisk(next) };
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setState(s => {
        const visitors = Math.max(0, Math.min(s.capacity * 1.05,
          s.visitors + Math.round(rand(-120, 160) * (s.mode === "Tourist Rush" ? 1.5 : 1))));
        const visitorTrend = [...s.visitorTrend.slice(1), visitors];
        const w = s.weather;
        const weather: Weather = {
          ...w,
          tempC: +(w.tempC + rand(-0.3, 0.3)).toFixed(1),
          humidity: Math.max(20, Math.min(98, +(w.humidity + rand(-0.6, 0.6)).toFixed(0))),
          aqi: Math.max(30, Math.min(280, Math.round(w.aqi + rand(-3, 3)))),
          windKph: Math.max(0, +(w.windKph + rand(-0.5, 0.5)).toFixed(1)),
        };
        const crowds = s.crowds.map(c => ({
          ...c,
          intensity: Math.max(0.05, Math.min(1, c.intensity + rand(-0.06, 0.06))),
          pos: { x: c.pos.x + rand(-0.4, 0.4), y: c.pos.y + rand(-0.4, 0.4) },
        }));
        const now = Date.now();
        const incidents = s.incidents.map(i => {
          const age = now - i.ts;
          if (i.status === "responding" && age > 8000) return { ...i, status: "resolved" as const };
          return i;
        });
        const activeGuardIds = new Set(incidents.filter(i => i.status !== "resolved").map(i => i.guardId));
        const guards = s.guards.map(g => activeGuardIds.has(g.id) ? g : { ...g, status: "available" as const });
        const wxStress = (weather.humidity > 80 ? 0.04 : 0) + (weather.aqi > 140 ? 0.05 : 0) + (weather.condition === "Rain" ? 0.03 : 0);
        const preservationScore = Math.max(50, Math.min(100, +(s.preservationScore - wxStress + 0.01).toFixed(2)));
        const next: SimState = {
          ...s, visitors, visitorTrend, weather, crowds, incidents, guards,
          activeIncidents: incidents.filter(i => i.status !== "resolved").length,
          preservationScore, lastTick: now,
        };
        return { ...next, ...computeRisk(next) };
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const base = modeBaseline(modeRef.current);
      if (Math.random() < base.incidentRate) {
        let key: IncidentKey | undefined;
        if (modeRef.current === "Security Threat") key = pick(["breach", "basement", "gathering"] as IncidentKey[]);
        else if (modeRef.current === "Tourist Rush") key = pick(["congestion", "lostchild", "litter"] as IncidentKey[]);
        else if (modeRef.current === "Monsoon Day") key = pick(["medical", "patrolfail"] as IncidentKey[]);
        else if (modeRef.current === "Festival Day") key = pick(["congestion", "gathering", "lostchild", "litter"] as IncidentKey[]);
        triggerIncident(key);
      }
    }, 4500);
    return () => clearInterval(id);
  }, [triggerIncident]);

  return { state, triggerIncident, setMode: (m: SimMode) => (modeRef.current = m) };
}

export const ALL_MODES = SIM_MODES;
