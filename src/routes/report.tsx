import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/heritage/TopBar";
import { Panel } from "@/components/heritage/Panel";
import { CheckCircle2, AlertTriangle, ShieldAlert, Wrench } from "lucide-react";

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "Half-Yearly Heritage Report — Taj Heritage Command" }] }),
  component: ReportPage,
});

function ReportPage() {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <TopBar />
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-6xl mx-auto w-full">
        <div className="glass corner-frame rounded-md p-5">
          <div className="text-[10px] tracking-[0.3em] text-cyan">ARCHAEOLOGICAL SURVEY OF INDIA · HERITAGE COMMAND</div>
          <h1 className="text-3xl font-bold neon-text mt-1">Half-Yearly Heritage Report</h1>
          <div className="text-sm text-muted-foreground mt-1">Taj Mahal Complex · Agra · H1 FY 2025–26</div>
          <div className="grid grid-cols-4 gap-3 mt-4 text-xs">
            <div><div className="text-muted-foreground">Reporting Period</div><div className="text-cyan">Apr – Sep 2025</div></div>
            <div><div className="text-muted-foreground">Visitors Logged</div><div className="text-cyan tabular-nums">2,184,930</div></div>
            <div><div className="text-muted-foreground">Incidents Resolved</div><div className="text-cyan tabular-nums">1,247</div></div>
            <div><div className="text-muted-foreground">Preservation Index</div><div className="text-safe tabular-nums">87.4 / 100</div></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Panel title="Quarterly Report Card">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground text-[10px] tracking-widest">
                <tr><th className="text-left py-1">METRIC</th><th>Q1</th><th>Q2</th><th>Trend</th></tr>
              </thead>
              <tbody className="tabular-nums">
                {[
                  ["Visitors", "1,021K", "1,164K", "▲"],
                  ["Avg AQI", "112", "97", "▼"],
                  ["Incidents", "684", "563", "▼"],
                  ["Critical Alerts", "21", "12", "▼"],
                  ["Maintenance Hrs", "412", "498", "▲"],
                  ["Preservation Index", "88.1", "87.4", "▼"],
                ].map(r => (
                  <tr key={r[0]} className="border-t border-white/5">
                    <td className="py-1.5 text-muted-foreground">{r[0]}</td>
                    <td className="text-center">{r[1]}</td>
                    <td className="text-center">{r[2]}</td>
                    <td className="text-center text-cyan">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Degradation Summary">
            <ul className="text-xs space-y-2">
              <Item tone="warn" text="Marble yellowing observed on the southern facade due to elevated SO₂ exposure during May." />
              <Item tone="danger" text="Minor mortar erosion detected at the eastern minaret base after July monsoon." />
              <Item tone="safe" text="Inlay restoration in mausoleum hall progressing on schedule (78% complete)." />
              <Item tone="warn" text="Reflecting pool tile discoloration linked to algae bloom during humid weeks." />
            </ul>
          </Panel>

          <Panel title="Crowd Stress Summary">
            <ul className="text-xs space-y-2">
              <Item tone="warn" text="Peak load 19,420 visitors recorded on Eid weekend (97% capacity)." />
              <Item tone="danger" text="3 congestion events at the Great Gate exceeded 4 minute clearance threshold." />
              <Item tone="safe" text="Average dwell time decreased 11% after revised one-way pathway introduced in June." />
            </ul>
          </Panel>

          <Panel title="Weather Impact Summary">
            <ul className="text-xs space-y-2">
              <Item tone="warn" text="42 high-humidity days (>80%) accelerated micro-fungal growth on north corridor." />
              <Item tone="danger" text="Dust storm on 12 June reduced visibility to 180m for 4 hours; 1 patrol unit re-routed." />
              <Item tone="safe" text="Air purifier ring around mausoleum cut local PM2.5 by 38%." />
            </ul>
          </Panel>

          <Panel title="Security Incident Summary" className="col-span-2">
            <div className="grid grid-cols-4 gap-3 text-xs">
              <Tile icon={<ShieldAlert className="size-4 text-danger" />} label="Restricted Breaches" value="14" />
              <Tile icon={<AlertTriangle className="size-4 text-warn" />} label="Suspicious Gatherings" value="38" />
              <Tile icon={<CheckCircle2 className="size-4 text-safe" />} label="Resolved < 5 min" value="92%" />
              <Tile icon={<Wrench className="size-4 text-cyan" />} label="False Positives" value="6.4%" />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              All restricted area breaches were contained without artifact damage. Average response time across all units improved by 22% versus previous half-year.
            </div>
          </Panel>

          <Panel title="Recommendations & Preventive Actions" className="col-span-2">
            <ol className="text-xs space-y-2 list-decimal pl-5">
              <li>Install additional dehumidification units in the mausoleum chamber before next monsoon.</li>
              <li>Extend the 500m emission-restricted buffer zone around the complex to include the eastern industrial corridor.</li>
              <li>Deploy two additional patrol units (Foxtrot, Golf) to cover river-edge blind spots identified by CAM-10.</li>
              <li>Schedule a half-day mock-drill per quarter for medical and lost-child response.</li>
              <li>Replace the 11 oldest analog cameras with neural-edge units capable of on-device anomaly detection.</li>
              <li>Begin pilot of timed-entry slots during Oct–Dec festival season to cap peak crowd density.</li>
            </ol>
          </Panel>

          <Panel title="Maintenance Suggestions" className="col-span-2">
            <ul className="text-xs space-y-1.5">
              <Item tone="cyan" text="Mud-pack therapy on south facade — schedule for late October when humidity drops below 55%." />
              <Item tone="cyan" text="Replace pump impellers in reflecting pool circulation system (vendor quote received)." />
              <Item tone="cyan" text="Re-paint all directional signage with low-VOC paint by end of Q3." />
              <Item tone="cyan" text="Inspect and seal expansion joints on Great Gate marble flooring before next monsoon." />
            </ul>
          </Panel>
        </div>

        <div className="text-[10px] text-muted-foreground text-center pb-6">
          Document classification: ASI-INTERNAL · Generated by Heritage Command System v2.4.1
        </div>
      </div>
    </div>
  );
}

function Item({ tone, text }: { tone: "warn" | "danger" | "safe" | "cyan"; text: string }) {
  const c = tone === "warn" ? "text-warn" : tone === "danger" ? "text-danger" : tone === "safe" ? "text-safe" : "text-cyan";
  return (
    <li className="flex gap-2">
      <span className={`mt-1 size-1.5 rounded-full shrink-0 ${tone === "warn" ? "bg-warn" : tone === "danger" ? "bg-danger" : tone === "safe" ? "bg-safe" : "bg-cyan"}`} />
      <span><span className={`${c} font-semibold`}>•</span> {text}</span>
    </li>
  );
}
function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded border border-white/10 bg-black/30 p-3">
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground tracking-widest">{icon}{label}</div>
      <div className="text-2xl font-bold neon-text mt-1 tabular-nums">{value}</div>
    </div>
  );
}
