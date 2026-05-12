import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/heritage/TopBar";
import { Panel } from "@/components/heritage/Panel";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Historical Analytics — Taj Heritage Command" }] }),
  component: Analytics,
});

const days = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (29 - i));
  const visitors = 8000 + Math.round(Math.sin(i / 4) * 4000) + Math.random() * 3000;
  const incidents = Math.max(0, Math.round(2 + Math.sin(i / 3) * 2 + Math.random() * 3));
  const aqi = 80 + Math.round(Math.sin(i / 5) * 40 + Math.random() * 20);
  const humidity = 50 + Math.round(Math.sin(i / 7) * 25 + Math.random() * 10);
  const preservation = 95 - i * 0.1 - Math.random() * 1.5;
  return {
    date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    visitors: Math.round(visitors), incidents, aqi, humidity,
    preservation: +preservation.toFixed(1),
  };
});

const incidentBreakdown = [
  { name: "Congestion", value: 142 },
  { name: "Litter", value: 98 },
  { name: "Touch", value: 64 },
  { name: "Breach", value: 23 },
  { name: "Medical", value: 41 },
  { name: "Lost Child", value: 19 },
  { name: "Basement", value: 6 },
];

// 6 weeks heatmap
const weeks = Array.from({ length: 6 }, () => Array.from({ length: 7 }, () => Math.random()));

function heatColor(v: number) {
  if (v > 0.92) return "bg-black border-rose-500/60";
  if (v > 0.78) return "bg-rose-600/80";
  if (v > 0.55) return "bg-amber-500/80";
  if (v > 0.3) return "bg-emerald-500/70";
  return "bg-emerald-700/40";
}

const tooltipStyle = { background: "oklch(0.18 0.05 252)", border: "1px solid oklch(0.55 0.12 220 / 35%)", borderRadius: 6, fontSize: 11 };

function Analytics() {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <TopBar />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <Stat label="Visitors (30d)" value={days.reduce((a, d) => a + d.visitors, 0).toLocaleString()} sub="+8.2% MoM" tone="cyan" />
          <Stat label="Incidents (30d)" value={days.reduce((a, d) => a + d.incidents, 0).toString()} sub="-3.1% MoM" tone="warn" />
          <Stat label="Avg AQI" value={Math.round(days.reduce((a, d) => a + d.aqi, 0) / days.length).toString()} sub="Moderate" tone="warn" />
          <Stat label="Preservation Index" value={days.at(-1)!.preservation.toFixed(1)} sub="Stable" tone="safe" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Panel title="Daily Visitor Count" className="col-span-2">
            <div className="h-56">
              <ResponsiveContainer>
                <AreaChart data={days}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-cyan)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="var(--color-cyan)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(1 0 0 / 5%)" />
                  <XAxis dataKey="date" stroke="oklch(0.7 0 0)" fontSize={10} />
                  <YAxis stroke="oklch(0.7 0 0)" fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="visitors" stroke="var(--color-cyan)" fill="url(#g1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Incident Frequency">
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={days}>
                  <CartesianGrid stroke="oklch(1 0 0 / 5%)" />
                  <XAxis dataKey="date" stroke="oklch(0.7 0 0)" fontSize={9} interval={3} />
                  <YAxis stroke="oklch(0.7 0 0)" fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="incidents" fill="var(--color-warn)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Panel title="Weather Trends" className="col-span-2">
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={days}>
                  <CartesianGrid stroke="oklch(1 0 0 / 5%)" />
                  <XAxis dataKey="date" stroke="oklch(0.7 0 0)" fontSize={10} />
                  <YAxis stroke="oklch(0.7 0 0)" fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="aqi" stroke="var(--color-warn)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="humidity" stroke="var(--color-cyan)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Incident Breakdown">
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={incidentBreakdown} layout="vertical">
                  <CartesianGrid stroke="oklch(1 0 0 / 5%)" />
                  <XAxis type="number" stroke="oklch(0.7 0 0)" fontSize={10} />
                  <YAxis type="category" dataKey="name" stroke="oklch(0.7 0 0)" fontSize={10} width={70} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="var(--color-cyan)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Panel title="Congestion Heatmap (6 Weeks)" className="col-span-2">
            <div className="space-y-1">
              <div className="flex gap-1 ml-7 text-[9px] text-muted-foreground tracking-widest">
                {["MON","TUE","WED","THU","FRI","SAT","SUN"].map(d => <div key={d} className="size-7 grid place-items-center">{d}</div>)}
              </div>
              {weeks.map((w, wi) => (
                <div key={wi} className="flex items-center gap-1">
                  <div className="w-6 text-[9px] text-muted-foreground">W{wi + 1}</div>
                  {w.map((v, di) => (
                    <div key={di} className={`size-7 rounded-sm border border-white/5 ${heatColor(v)}`} title={`Risk ${(v * 100).toFixed(0)}`} />
                  ))}
                </div>
              ))}
              <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                <Legend2 color="bg-emerald-700/60" label="Safe" />
                <Legend2 color="bg-amber-500/80" label="Medium" />
                <Legend2 color="bg-rose-600/80" label="High" />
                <Legend2 color="bg-black border border-rose-500/60" label="Critical" />
              </div>
            </div>
          </Panel>

          <Panel title="Preservation Degradation">
            <div className="h-56">
              <ResponsiveContainer>
                <AreaChart data={days}>
                  <defs>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-safe)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="var(--color-safe)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(1 0 0 / 5%)" />
                  <XAxis dataKey="date" stroke="oklch(0.7 0 0)" fontSize={9} interval={4} />
                  <YAxis stroke="oklch(0.7 0 0)" fontSize={10} domain={[80, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="preservation" stroke="var(--color-safe)" fill="url(#g2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "cyan" | "warn" | "safe" | "danger" }) {
  const c = tone === "warn" ? "text-warn" : tone === "safe" ? "text-safe" : tone === "danger" ? "text-danger" : "text-cyan";
  return (
    <div className="glass corner-frame rounded-md p-3">
      <div className="panel-title">{label}</div>
      <div className={`text-2xl font-bold neon-text ${c} tabular-nums`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}
function Legend2({ color, label }: { color: string; label: string }) {
  return <div className="flex items-center gap-1"><span className={`size-3 rounded-sm ${color}`} />{label}</div>;
}
