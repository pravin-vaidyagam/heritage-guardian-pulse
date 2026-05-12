import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "@/components/heritage/TopBar";
import { LeftSidebar } from "@/components/heritage/LeftSidebar";
import { RightSidebar } from "@/components/heritage/RightSidebar";
import { MapArea } from "@/components/heritage/MapArea";
import { useSimulator, ALL_MODES } from "@/lib/simulator";
import type { SimMode } from "@/lib/heritage-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Taj Mahal Heritage Protection — Command Center" },
      { name: "description", content: "Real-time heritage monitoring, crowd analytics and incident response for the Taj Mahal." },
    ],
  }),
  component: CommandCenter,
});

function CommandCenter() {
  const [mode, setMode] = useState<SimMode>("Normal Day");
  const { state, triggerIncident } = useSimulator(mode);

  const cycleMode = () => {
    const i = ALL_MODES.indexOf(mode);
    setMode(ALL_MODES[(i + 1) % ALL_MODES.length]);
  };

  const onAction = (a: string) => {
    if (a === "incident") triggerIncident();
    if (a === "deploy") triggerIncident("gathering");
    if (a === "announce") triggerIncident("congestion");
    if (a === "cctv") triggerIncident("breach");
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <LeftSidebar state={state} onTriggerAction={onAction} />
        <MapArea state={state} mode={mode} onModeNext={cycleMode} />
        <RightSidebar state={state} mode={mode} onMode={setMode} />
      </div>
    </div>
  );
}
