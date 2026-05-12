import { motion } from "framer-motion";
import clsx from "clsx";

export type IncidentStage = "DETECTED" | "ACKNOWLEDGED" | "RESPONSE_DISPATCHED" | "UNDER_CONTROL" | "RESOLVED";

export const INCIDENT_STAGES: IncidentStage[] = [
  "DETECTED",
  "ACKNOWLEDGED",
  "RESPONSE_DISPATCHED",
  "UNDER_CONTROL",
  "RESOLVED",
];

const STAGE_SHORT_LABELS: Record<IncidentStage, string> = {
  DETECTED: "D",
  ACKNOWLEDGED: "A",
  RESPONSE_DISPATCHED: "R",
  UNDER_CONTROL: "U",
  RESOLVED: "✓",
};

const STAGE_COLORS: Record<IncidentStage, string> = {
  DETECTED: "bg-red-500 shadow-red-500/20",
  ACKNOWLEDGED: "bg-amber-400 shadow-amber-400/20",
  RESPONSE_DISPATCHED: "bg-emerald-500 shadow-emerald-500/20",
  UNDER_CONTROL: "bg-cyan-500 shadow-cyan-500/20",
  RESOLVED: "bg-emerald-600 shadow-emerald-600/20",
};

const INACTIVE_DOT = "bg-slate-600/70";
const INACTIVE_LINE = "bg-slate-600/30";

export function getStageIndex(stage: IncidentStage) {
  return INCIDENT_STAGES.indexOf(stage);
}

export function getIncidentStageFromStatus(status: "active" | "responding" | "resolved") {
  if (status === "resolved") return "RESOLVED";
  if (status === "responding") return "RESPONSE_DISPATCHED";
  return "DETECTED";
}

export function IncidentProgress({ stage }: { stage: IncidentStage }) {
  const currentIndex = getStageIndex(stage);
  const progressWidth = currentIndex > 0 ? (currentIndex / (INCIDENT_STAGES.length - 1)) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-1 w-[132px]">
      <div className="relative w-full">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px rounded-full bg-slate-600/30" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-px rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-cyan-500"
          style={{ width: `${progressWidth}%` }}
        />
        <div className="grid grid-cols-5 items-center justify-items-center relative">
          {INCIDENT_STAGES.map((item, index) => {
            const isActive = index === currentIndex;
            const isComplete = index < currentIndex;
            const dotClass = isActive || isComplete ? STAGE_COLORS[item] : INACTIVE_DOT;
            return (
              <motion.span
                key={item}
                animate={isActive ? { scale: [1, 1.15, 1] } : undefined}
                transition={isActive ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : undefined}
                className={clsx(
                  "relative z-10 inline-flex h-1.5 w-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.08)]",
                  dotClass,
                )}
              />
            );
          })}
        </div>
      </div>
      <div className="grid w-full grid-cols-5 text-[8px] leading-none font-mono uppercase tracking-[0.24em] text-slate-400/80">
        {INCIDENT_STAGES.map((item) => (
          <span key={item} className="text-center">
            {STAGE_SHORT_LABELS[item]}
          </span>
        ))}
      </div>
    </div>
  );
}
