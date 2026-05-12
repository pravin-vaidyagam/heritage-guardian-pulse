// Static configuration for the Taj Mahal Heritage Protection dashboard.
// Coordinates are percentages over the aerial base image (0-100).

export type Coord = { x: number; y: number };

export type Camera = {
  id: string;
  name: string;
  zone: string;
  pos: Coord;
  facing: number; // degrees
  status: "online" | "offline" | "alert";
};

export type GuardPost = {
  id: string;
  name: string;
  pos: Coord;
  patrol: Coord[];
  status: "available" | "investigating" | "emergency";
};

export type Zone = {
  id: string;
  name: string;
  type: "restricted" | "monument" | "garden" | "entry";
  // polygon as percentage points
  poly: Coord[];
};

export type CrowdCluster = {
  id: string;
  pos: Coord;
  intensity: number; // 0..1
  label: string;
};

export const CAMERAS: Camera[] = [
  { id: "CAM-01", name: "Great Gate Cam", zone: "Main Entrance", pos: { x: 50, y: 88 }, facing: 0, status: "online" },
  { id: "CAM-05", name: "Mausoleum Plaza", zone: "Monument Inner Ring", pos: { x: 50, y: 38 }, facing: 180, status: "online" },
  { id: "CAM-06", name: "Minaret NW", zone: "Monument Inner Ring", pos: { x: 38, y: 30 }, facing: 135, status: "online" },
  { id: "CAM-07", name: "Minaret NE", zone: "Monument Inner Ring", pos: { x: 62, y: 30 }, facing: 225, status: "online" },
  { id: "CAM-08", name: "Mosque West", zone: "Garden West", pos: { x: 18, y: 45 }, facing: 90, status: "online" },
  { id: "CAM-09", name: "Jawab East", zone: "Garden East", pos: { x: 82, y: 45 }, facing: -90, status: "online" },
  { id: "CAM-10", name: "River Edge", zone: "River Edge", pos: { x: 50, y: 16 }, facing: 180, status: "online" },
  { id: "CAM-11", name: "Basement Access", zone: "Basement Entrance", pos: { x: 56, y: 36 }, facing: 90, status: "alert" },
  { id: "CAM-12", name: "South Wall West", zone: "Garden West", pos: { x: 28, y: 78 }, facing: 45, status: "online" },
  { id: "CAM-13", name: "South Wall East", zone: "Garden East", pos: { x: 88, y: 78 }, facing: -45, status: "online" },
  { id: "CAM-14", name: "Northwest Tower", zone: "River Edge", pos: { x: 24, y: 28 }, facing: 135, status: "online" },
  { id: "CAM-15", name: "Northeast Tower", zone: "River Edge", pos: { x: 76, y: 28 }, facing: -135, status: "online" },
];

export const GUARDS: GuardPost[] = [
  {
    id: "G-α", name: "Alpha Squad", pos: { x: 50, y: 84 }, status: "available",
    patrol: [{ x: 50, y: 84 }, { x: 35, y: 78 }, { x: 65, y: 78 }, { x: 50, y: 84 }],
  },
  {
    id: "G-β", name: "Bravo Squad", pos: { x: 30, y: 50 }, status: "available",
    patrol: [{ x: 30, y: 50 }, { x: 30, y: 70 }, { x: 22, y: 60 }, { x: 30, y: 50 }],
  },
  {
    id: "G-γ", name: "Gamma Squad", pos: { x: 70, y: 50 }, status: "investigating",
    patrol: [{ x: 70, y: 50 }, { x: 70, y: 70 }, { x: 78, y: 60 }, { x: 70, y: 50 }],
  },
  {
    id: "G-δ", name: "Delta Squad", pos: { x: 50, y: 30 }, status: "available",
    patrol: [{ x: 50, y: 30 }, { x: 40, y: 36 }, { x: 60, y: 36 }, { x: 50, y: 30 }],
  },
  {
    id: "G-ε", name: "Echo Squad", pos: { x: 50, y: 18 }, status: "available",
    patrol: [{ x: 40, y: 18 }, { x: 60, y: 18 }, { x: 50, y: 22 }, { x: 40, y: 18 }],
  },
];

export const ZONES: Zone[] = [
  {
    id: "Z-MON", name: "Mausoleum Protected Core", type: "restricted",
    poly: [{ x: 42, y: 26 }, { x: 58, y: 26 }, { x: 60, y: 42 }, { x: 40, y: 42 }],
  },
  {
    id: "Z-BAS", name: "Basement Restricted", type: "restricted",
    poly: [{ x: 53, y: 33 }, { x: 60, y: 33 }, { x: 60, y: 39 }, { x: 53, y: 39 }],
  },
  {
    id: "Z-GAR", name: "Charbagh Gardens", type: "garden",
    poly: [{ x: 25, y: 46 }, { x: 75, y: 46 }, { x: 75, y: 78 }, { x: 25, y: 78 }],
  },
  {
    id: "Z-ENT", name: "Great Gate Entry", type: "entry",
    poly: [{ x: 42, y: 82 }, { x: 58, y: 82 }, { x: 58, y: 96 }, { x: 42, y: 96 }],
  },
];

export const CROWD_BASE: CrowdCluster[] = [
  { id: "C1", pos: { x: 50, y: 86 }, intensity: 0.9, label: "Entry Queue" },
  { id: "C2", pos: { x: 50, y: 60 }, intensity: 0.6, label: "Reflecting Pool" },
  { id: "C3", pos: { x: 50, y: 44 }, intensity: 0.75, label: "Plaza Steps" },
  { id: "C4", pos: { x: 35, y: 70 }, intensity: 0.4, label: "West Path" },
  { id: "C5", pos: { x: 65, y: 70 }, intensity: 0.45, label: "East Path" },
  { id: "C6", pos: { x: 22, y: 48 }, intensity: 0.3, label: "Mosque Court" },
  { id: "C7", pos: { x: 78, y: 48 }, intensity: 0.3, label: "Jawab Court" },
];

export const INCIDENT_TYPES = [
  { key: "breach",     label: "Restricted Area Breach",     color: "danger", severity: 4, icon: "ShieldAlert" },
  { key: "gathering",  label: "Suspicious Gathering",       color: "warn",   severity: 3, icon: "Users" },
  { key: "litter",     label: "Littering Detected",         color: "warn",   severity: 1, icon: "Trash2" },
  { key: "touch",      label: "Object Touch Attempt",       color: "danger", severity: 2, icon: "Hand" },
  { key: "basement",   label: "Unauthorized Basement Access", color: "danger", severity: 4, icon: "Lock" },
  { key: "congestion", label: "Crowd Congestion",           color: "warn",   severity: 2, icon: "UsersRound" },
  { key: "lostchild",  label: "Lost Child Report",          color: "cyan",   severity: 2, icon: "Baby" },
  { key: "medical",    label: "Medical Emergency",          color: "cyan",   severity: 3, icon: "HeartPulse" },
  { key: "patrolfail", label: "Patrol Route Failure",       color: "warn",   severity: 2, icon: "AlertTriangle" },
] as const;

export type IncidentKey = (typeof INCIDENT_TYPES)[number]["key"];

export const SIM_MODES = [
  "Normal Day", "Tourist Rush", "Monsoon Day", "Security Threat", "Festival Day", "Mixed Incident",
] as const;
export type SimMode = (typeof SIM_MODES)[number];