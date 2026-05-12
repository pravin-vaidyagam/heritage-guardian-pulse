import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Cctv, Shield, MapPin, Radio, Maximize2 } from "lucide-react";
import SketchfabViewer from "@/components/heritage/SketchfabViewer";
import tajImg from "@/assets/taj-aerial.jpg";
import { CAMERAS, GUARDS, ZONES, type Camera } from "@/lib/heritage-data";
import type { Incident, SimState } from "@/lib/simulator";

const polyToPoints = (poly: { x: number; y: number }[]) =>
  poly.map(p => `${p.x},${p.y}`).join(" ");

const colorForIncident = (c: string) =>
  c === "danger" ? "var(--color-danger)" : c === "warn" ? "var(--color-warn)" : "var(--color-cyan)";

const guardColor = (s: string) =>
  s === "emergency" ? "var(--color-danger)" : s === "investigating" ? "var(--color-warn)" : "var(--color-safe)";

export function MapArea({ state, mode, onModeNext }: { state: SimState; mode: string; onModeNext: () => void }) {
  const [selectedCam, setSelectedCam] = useState<Camera | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showCams, setShowCams] = useState(true);
  const [showGuards, setShowGuards] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");

  const buttonBaseClass =
    "rounded-md border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.28em] transition font-mono";

  const buttonClassName = (active: boolean) =>
    `${buttonBaseClass} ${active
      ? "border-cyan-300/70 bg-cyan-400/15 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.28)]"
      : "border-white/10 bg-black/35 text-muted-foreground hover:border-cyan-400/40 hover:text-cyan-100 hover:bg-cyan-400/10"}`;

  const CurrentMapContent = () => (
    <>
      {/* Base aerial layer */}
      <img src={tajImg} alt="Taj Mahal aerial view" className="absolute inset-0 w-full h-full object-cover opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0.04_250/0.45)] via-[oklch(0.16_0.04_250/0.15)] to-[oklch(0.16_0.04_250/0.55)]" />
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* HUD top */}
      <div className="absolute top-3 left-3 right-3 flex items-center gap-2 z-20">
        <div className="glass-soft px-3 py-1.5 rounded text-[11px] tracking-widest flex items-center gap-2">
          <Radio className="size-3 text-cyan blink" />
          <span className="text-cyan">LIVE FEED</span>
          <span className="text-muted-foreground">·</span>
          <span>SECTOR 7G</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-cyan">{mode.toUpperCase()}</span>
        </div>
        <button onClick={onModeNext} className="glass-soft px-3 py-1.5 rounded text-[11px] tracking-widest hover:bg-cyan/10 transition">
          CYCLE MODE →
        </button>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setViewMode("2d")} className={buttonClassName(viewMode === "2d")}>
            2D VIEW
          </button>
          <button onClick={() => setViewMode("3d")} className={buttonClassName(viewMode === "3d")}>
            3D DIGITAL TWIN
          </button>
        </div>
        <div className="ml-auto flex gap-1.5">
          <Toggle on={showHeatmap} onClick={() => setShowHeatmap(v => !v)} label="HEATMAP" />
          <Toggle on={showCams} onClick={() => setShowCams(v => !v)} label="CAMERAS" />
          <Toggle on={showGuards} onClick={() => setShowGuards(v => !v)} label="UNITS" />
          <Toggle on={showZones} onClick={() => setShowZones(v => !v)} label="ZONES" />
        </div>
      </div>

      {/* HUD bottom-left compass */}
      <div className="absolute bottom-3 left-3 glass-soft rounded p-2 z-20 text-[10px] tracking-widest text-cyan">
        <div className="size-12 rounded-full border border-cyan/50 relative grid place-items-center">
          <div className="absolute -top-0.5 text-[9px]">N</div>
          <div className="absolute -bottom-0.5 text-[9px]">S</div>
          <div className="absolute -left-1 text-[9px]">W</div>
          <div className="absolute -right-1 text-[9px]">E</div>
          <MapPin className="size-3" />
        </div>
      </div>
      <div className="absolute bottom-3 right-3 glass-soft rounded p-2 z-20 text-[10px] tracking-widest">
        <div>27.1751° N · 78.0421° E</div>
        <div className="text-cyan">ALT 171m · ZOOM 18x</div>
      </div>

      {/* Overlay SVG */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-10">
        {/* Zones */}
        {showZones && ZONES.map(z => (
          <g key={z.id}>
            <polygon
              points={polyToPoints(z.poly)}
              fill={z.type === "restricted" ? "var(--color-danger)" : z.type === "entry" ? "var(--color-cyan)" : "var(--color-safe)"}
              fillOpacity={z.type === "restricted" ? 0.12 : 0.06}
              stroke={z.type === "restricted" ? "var(--color-danger)" : "var(--color-cyan)"}
              strokeOpacity={0.6}
              strokeWidth={0.15}
              strokeDasharray={z.type === "restricted" ? "0.8 0.4" : "0.4 0.4"}
            />
          </g>
        ))}

        {/* Patrol routes */}
        {showGuards && GUARDS.map(g => (
          <polyline
            key={g.id + "-route"}
            points={g.patrol.map(p => `${p.x},${p.y}`).join(" ")}
            fill="none" stroke={guardColor(g.status)} strokeOpacity={0.7}
            strokeWidth={0.2} strokeDasharray="0.6 0.6"
            className="dash-animate"
          />
        ))}

        {/* Incident response lines */}
        {state.incidents.filter(i => i.status !== "resolved" && i.guardId).map(i => {
          const g = state.guards.find(x => x.id === i.guardId);
          if (!g) return null;
          return (
            <line key={i.id + "-line"} x1={g.pos.x} y1={g.pos.y} x2={i.pos.x} y2={i.pos.y}
              stroke={colorForIncident(i.color)} strokeWidth={0.18} strokeDasharray="0.4 0.4" opacity={0.85}
            />
          );
        })}

        {/* Camera FOV cones */}
        {showCams && CAMERAS.map(c => {
          const r = 8;
          const a1 = (c.facing - 25) * Math.PI / 180;
          const a2 = (c.facing + 25) * Math.PI / 180;
          const x1 = c.pos.x + Math.sin(a1) * r;
          const y1 = c.pos.y - Math.cos(a1) * r;
          const x2 = c.pos.x + Math.sin(a2) * r;
          const y2 = c.pos.y - Math.cos(a2) * r;
          return (
            <polygon key={c.id + "-fov"} points={`${c.pos.x},${c.pos.y} ${x1},${y1} ${x2},${y2}`}
              fill="var(--color-cyan)" fillOpacity={c.status === "alert" ? 0.18 : 0.08} stroke="none" />
          );
        })}
      </svg>

      {/* Heatmap overlay (DOM blobs) */}
      {showHeatmap && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {state.crowds.map(c => {
            const color = c.intensity > 0.75 ? "239,68,68" : c.intensity > 0.5 ? "251,146,60" : c.intensity > 0.3 ? "250,204,21" : "34,197,94";
            const size = 90 + c.intensity * 160;
            return (
              <motion.div key={c.id}
                className="absolute rounded-full"
                style={{
                  left: `${c.pos.x}%`, top: `${c.pos.y}%`,
                  width: size, height: size, transform: "translate(-50%,-50%)",
                  background: `radial-gradient(circle, rgba(${color},${0.55 * c.intensity}) 0%, rgba(${color},0) 70%)`,
                  mixBlendMode: "screen",
                }}
                animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 3, repeat: Infinity }}
              />
            );
          })}
        </div>
      )}

      {/* Cameras */}
      {showCams && CAMERAS.map(c => (
        <button
          key={c.id}
          onClick={() => setSelectedCam(c)}
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 group"
          style={{ left: `${c.pos.x}%`, top: `${c.pos.y}%` }}
        >
          <span className={`absolute inset-0 rounded-full ${c.status === "alert" ? "bg-danger/40" : "bg-cyan/30"} pulse-ring`} />
          <span className={`relative grid place-items-center size-6 rounded-full border ${c.status === "alert" ? "border-danger bg-danger/30" : "border-cyan bg-cyan/20"} backdrop-blur-sm`}>
            <Cctv className={`size-3 ${c.status === "alert" ? "text-danger" : "text-cyan"}`} />
          </span>
          <span className="absolute left-1/2 -translate-x-1/2 top-7 text-[9px] tracking-widest text-cyan opacity-0 group-hover:opacity-100 transition whitespace-nowrap glass-soft px-1.5 py-0.5 rounded">
            {c.id} · {c.zone}
          </span>
        </button>
      ))}

      {/* Guards */}
      {showGuards && state.guards.map(g => (
        <div key={g.id} className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${g.pos.x}%`, top: `${g.pos.y}%` }}>
          <span className="absolute inset-0 rounded-full pulse-ring"
            style={{ background: guardColor(g.status), opacity: 0.4 }} />
          <span className="relative grid place-items-center size-6 rounded-full border-2 backdrop-blur-sm"
            style={{ borderColor: guardColor(g.status), background: `color-mix(in oklab, ${guardColor(g.status)} 25%, transparent)` }}>
            <Shield className="size-3" style={{ color: guardColor(g.status) }} />
          </span>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-3.5 text-[9px] tracking-widest whitespace-nowrap" style={{ color: guardColor(g.status) }}>
            {g.id}
          </div>
        </div>
      ))}

      {/* Incidents */}
      <AnimatePresence>
        {state.incidents.filter(i => i.status !== "resolved").map(inc => (
          <motion.div key={inc.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute z-30 -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${inc.pos.x}%`, top: `${inc.pos.y}%` }}>
            <span className="absolute inset-0 rounded-full pulse-ring"
              style={{ background: colorForIncident(inc.color), opacity: 0.6 }} />
            <span className="absolute inset-0 rounded-full pulse-ring"
              style={{ background: colorForIncident(inc.color), opacity: 0.4, animationDelay: "0.6s" }} />
            <span className="relative grid place-items-center size-7 rounded-full border-2 blink"
              style={{ borderColor: colorForIncident(inc.color), background: `color-mix(in oklab, ${colorForIncident(inc.color)} 35%, transparent)` }}>
              <span className="text-[10px] font-bold" style={{ color: colorForIncident(inc.color) }}>!</span>
            </span>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 whitespace-nowrap glass-soft px-1.5 py-0.5 rounded text-[9px] tracking-widest opacity-0 group-hover:opacity-100 transition"
              style={{ color: colorForIncident(inc.color) }}>
              {inc.label} · {inc.id}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Camera popup */}
      <AnimatePresence>
        {selectedCam && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="absolute z-40 top-16 left-1/2 -translate-x-1/2 w-80 glass rounded-md p-3 corner-frame">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[10px] tracking-widest text-cyan">CCTV FEED</div>
                <div className="text-sm font-semibold">{selectedCam.id} · {selectedCam.name}</div>
              </div>
              <button onClick={() => setSelectedCam(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
            </div>
            <div className="aspect-video relative rounded overflow-hidden border border-cyan/30">
              <img src={tajImg} alt="" className="absolute inset-0 w-full h-full object-cover scale-[2.5]"
                style={{ objectPosition: `${selectedCam.pos.x}% ${selectedCam.pos.y}%`, filter: "saturate(0.6) contrast(1.1)" }} />
              <div className="absolute inset-0 scanline" />
              <div className="absolute top-1 left-1 right-1 flex justify-between text-[9px] text-cyan tracking-widest">
                <span className="blink">● REC</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="absolute bottom-1 left-1 right-1 flex justify-between text-[9px] text-cyan tracking-widest">
                <span>{selectedCam.zone}</span>
                <span><Maximize2 className="size-2.5 inline" /> 1080P</span>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
              <div className="glass-soft rounded p-1.5">
                <div className="text-muted-foreground">STATUS</div>
                <div className={selectedCam.status === "alert" ? "text-danger" : "text-safe"}>{selectedCam.status.toUpperCase()}</div>
              </div>
              <div className="glass-soft rounded p-1.5">
                <div className="text-muted-foreground">RECENT INCIDENTS</div>
                <div>{state.incidents.filter(i => i.zone === selectedCam.zone).length}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <div className="relative flex-1 h-full p-3">
      <div className="relative h-full glass rounded-lg overflow-hidden corner-frame scanline">
        {viewMode === "2d" ? (
          <CurrentMapContent />
        ) : (
          <SketchfabViewer />
        )}
      </div>
    </div>
  );
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`px-2 py-1 rounded text-[10px] tracking-widest border transition ${on ? "border-cyan/60 bg-cyan/15 text-cyan" : "border-white/10 bg-black/30 text-muted-foreground hover:text-foreground"}`}>
      {label}
    </button>
  );
}
