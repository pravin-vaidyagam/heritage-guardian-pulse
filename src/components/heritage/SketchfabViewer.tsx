import { motion } from "framer-motion";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import tajImg from "@/assets/taj-aerial.jpg";

const modelUid = "d02e8cdef15946408be6613fc5d1f0ff";
const sketchfabApiScriptUrl = "https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js";

type SketchfabApi = {
  start: () => void;
  addEventListener: (eventName: string, handler: () => void) => void;
};

type FpvCameraState = {
  x: number;
  y: number;
  z: number;
  pitch: number;
  yaw: number;
  roll: number;
};

type InputMode = "Keyboard" | "Gamepad";

declare global {
  interface Window {
    Sketchfab?: new (iframe: HTMLIFrameElement) => {
      init: (
        uid: string,
        options: {
          success: (api: SketchfabApi) => void;
          error?: () => void;
          autostart?: number;
          transparent?: number;
          ui_controls?: number;
          ui_infos?: number;
          ui_stop?: number;
          ui_watermark?: number;
        }
      ) => void;
    };
  }
}

const DEFAULT_CAMERA: FpvCameraState = {
  x: 0,
  y: 0,
  z: 1,
  pitch: 0,
  yaw: 0,
  roll: 0,
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const applyDeadzone = (value: number, deadzone = 0.15) => {
  if (Math.abs(value) < deadzone) {
    return 0;
  }

  const scaled = (Math.abs(value) - deadzone) / (1 - deadzone);
  return Math.sign(value) * scaled;
};

export default function SketchfabViewer() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const sketchfabApiRef = useRef<SketchfabApi | null>(null);
  const gamepadFrameRef = useRef<number | null>(null);
  const patrolFrameRef = useRef<number | null>(null);
  const patrolPointRef = useRef(0);
  const [scriptReady, setScriptReady] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [viewerReady, setViewerReady] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [controllerConnected, setControllerConnected] = useState(false);
  const [keyboardActive, setKeyboardActive] = useState(false);
  const [speed] = useState(12);
  const [inputMode, setInputMode] = useState<InputMode>("Keyboard");
  const [autoPatrol, setAutoPatrol] = useState(false);
  const [showHUD, setShowHUD] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);
  const [fpv, setFpv] = useState<FpvCameraState>(DEFAULT_CAMERA);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (presentationMode) {
      setShowHUD(false);
    }
  }, [presentationMode]);

  useEffect(() => {
    if (window.Sketchfab) {
      setApiAvailable(true);
      setScriptReady(true);
      return;
    }

    const existingScript = document.querySelector(`script[src="${sketchfabApiScriptUrl}"]`);
    if (existingScript) {
      const handleLoad = () => {
        setApiAvailable(true);
        setScriptReady(true);
      };
      const handleError = () => setApiError(true);
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.src = sketchfabApiScriptUrl;
    script.async = true;
    script.onload = () => {
      setApiAvailable(true);
      setScriptReady(true);
    };
    script.onerror = () => setApiError(true);
    document.body.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  useEffect(() => {
    if (!scriptReady || !iframeRef.current || !window.Sketchfab || sketchfabApiRef.current) {
      return;
    }

    const client = new window.Sketchfab(iframeRef.current);
    client.init(modelUid, {
      autostart: 1,
      transparent: 0,
      ui_controls: 1,
      ui_infos: 0,
      ui_stop: 0,
      ui_watermark: 0,
      success: api => {
        api.start();
        api.addEventListener("viewerready", () => {
          sketchfabApiRef.current = api;
          setViewerReady(true);
          setApiError(false);
        });
      },
      error: () => setApiError(true),
    });
  }, [scriptReady]);

  const resetCamera = () => {
    setAutoPatrol(false);
    setFpv(DEFAULT_CAMERA);
  };

  const setPreset = (preset: "top" | "basement" | "garden") => {
    setAutoPatrol(false);

    if (preset === "top") {
      setFpv({ x: 0, y: -25, z: 1.45, pitch: 38, yaw: 0, roll: 0 });
      return;
    }

    if (preset === "basement") {
      setFpv({ x: 8, y: 24, z: 1.2, pitch: -18, yaw: -14, roll: 0 });
      return;
    }

    setFpv({ x: -20, y: -8, z: 1.12, pitch: 8, yaw: 22, roll: 0 });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const scrollKeys = ["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "spacebar"];
      const supported = [
        "h",
        "p",
        "w",
        "a",
        "s",
        "d",
        "q",
        "e",
        "z",
        "c",
        "r",
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
      ];

      if (scrollKeys.includes(key)) {
        event.preventDefault();
      }

      if (!supported.includes(key)) {
        return;
      }

      event.preventDefault();

      if (key === "h") {
        if (presentationMode) {
          setPresentationMode(false);
          setShowHUD(true);
        } else {
          setShowHUD(prev => !prev);
        }
        return;
      }

      if (key === "p") {
        setPresentationMode(prev => {
          const next = !prev;
          setShowHUD(!next);
          return next;
        });
        return;
      }

      setKeyboardActive(true);
      setInputMode("Keyboard");
      setAutoPatrol(false);

      setFpv(prev => {
        if (key === "r") {
          return DEFAULT_CAMERA;
        }

        const moveStep = speed;
        const rotateStep = 2;
        const rollStep = 1.5;
        const zoomStep = 0.05;

        let next = { ...prev };

        if (key === "w") next.y -= moveStep;
        if (key === "s") next.y += moveStep;
        if (key === "a") next.x -= moveStep;
        if (key === "d") next.x += moveStep;

        if (key === "q") next.z = clamp(next.z + zoomStep, 0.6, 2.5);
        if (key === "e") next.z = clamp(next.z - zoomStep, 0.6, 2.5);

        if (key === "arrowup") next.pitch = clamp(next.pitch - rotateStep, -60, 60);
        if (key === "arrowdown") next.pitch = clamp(next.pitch + rotateStep, -60, 60);
        if (key === "arrowleft") next.yaw = clamp(next.yaw - rotateStep, -180, 180);
        if (key === "arrowright") next.yaw = clamp(next.yaw + rotateStep, -180, 180);

        if (key === "z") next.roll = clamp(next.roll - rollStep, -35, 35);
        if (key === "c") next.roll = clamp(next.roll + rollStep, -35, 35);

        return next;
      });
    };

    const handleKeyUp = () => {
      setKeyboardActive(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [speed]);

  useEffect(() => {
    const pollGamepad = () => {
      const gamepads = navigator.getGamepads?.() ?? [];
      const gamepad = Array.from(gamepads).find(gp => Boolean(gp?.connected));
      const connected = Boolean(gamepad);
      setControllerConnected(connected);

      if (gamepad) {
        const leftX = applyDeadzone(gamepad.axes[0] ?? 0);
        const leftY = applyDeadzone(gamepad.axes[1] ?? 0);
        const rightX = applyDeadzone(gamepad.axes[2] ?? 0);
        const rightY = applyDeadzone(gamepad.axes[3] ?? 0);
        const lt = gamepad.buttons[6]?.value ?? 0;
        const rt = gamepad.buttons[7]?.value ?? 0;
        const resetPressed = Boolean(gamepad.buttons[0]?.pressed);

        if (resetPressed) {
          resetCamera();
        } else if (
          Math.abs(leftX) > 0 ||
          Math.abs(leftY) > 0 ||
          Math.abs(rightX) > 0 ||
          Math.abs(rightY) > 0 ||
          lt > 0.02 ||
          rt > 0.02
        ) {
          setInputMode("Gamepad");
          setKeyboardActive(false);
          setAutoPatrol(false);

          setFpv(prev => ({
            x: clamp(prev.x + leftX * speed * 0.7, -280, 280),
            y: clamp(prev.y + leftY * speed * 0.7, -220, 220),
            z: clamp(prev.z + (rt - lt) * 0.04, 0.6, 2.5),
            pitch: clamp(prev.pitch + rightY * 2.2, -60, 60),
            yaw: clamp(prev.yaw + rightX * 2.4, -180, 180),
            roll: prev.roll,
          }));
        }
      }

      gamepadFrameRef.current = window.requestAnimationFrame(pollGamepad);
    };

    gamepadFrameRef.current = window.requestAnimationFrame(pollGamepad);

    return () => {
      if (gamepadFrameRef.current !== null) {
        window.cancelAnimationFrame(gamepadFrameRef.current);
      }
    };
  }, [speed]);

  useEffect(() => {
    if (!autoPatrol) {
      if (patrolFrameRef.current !== null) {
        window.cancelAnimationFrame(patrolFrameRef.current);
      }
      return;
    }

    const points: FpvCameraState[] = [
      { x: 0, y: -36, z: 1.18, pitch: 8, yaw: 0, roll: 0 },
      { x: 30, y: -4, z: 1.35, pitch: -5, yaw: 24, roll: 0 },
      { x: -32, y: 18, z: 1.12, pitch: 16, yaw: -28, roll: 0 },
      { x: 8, y: 28, z: 1.26, pitch: -12, yaw: 10, roll: 0 },
    ];

    const patrolTick = () => {
      setFpv(prev => {
        const target = points[patrolPointRef.current];
        const lerp = 0.03;
        const next: FpvCameraState = {
          x: prev.x + (target.x - prev.x) * lerp,
          y: prev.y + (target.y - prev.y) * lerp,
          z: prev.z + (target.z - prev.z) * lerp,
          pitch: prev.pitch + (target.pitch - prev.pitch) * lerp,
          yaw: prev.yaw + (target.yaw - prev.yaw) * lerp,
          roll: prev.roll + (target.roll - prev.roll) * lerp,
        };

        const reached =
          Math.abs(next.x - target.x) < 1.1 &&
          Math.abs(next.y - target.y) < 1.1 &&
          Math.abs(next.z - target.z) < 0.02 &&
          Math.abs(next.pitch - target.pitch) < 0.9 &&
          Math.abs(next.yaw - target.yaw) < 0.9;

        if (reached) {
          patrolPointRef.current = (patrolPointRef.current + 1) % points.length;
        }

        return next;
      });

      patrolFrameRef.current = window.requestAnimationFrame(patrolTick);
    };

    patrolFrameRef.current = window.requestAnimationFrame(patrolTick);

    return () => {
      if (patrolFrameRef.current !== null) {
        window.cancelAnimationFrame(patrolFrameRef.current);
      }
    };
  }, [autoPatrol]);

  const viewerUnavailable = apiError || (!apiAvailable && !scriptReady);
  const loadingViewer = !viewerUnavailable && !viewerReady;

  const fpvTransform: CSSProperties = {
    transform: `perspective(1800px) translate3d(${fpv.x}px, ${fpv.y}px, 0) scale(${fpv.z}) rotateX(${fpv.pitch}deg) rotateY(${fpv.yaw}deg) rotateZ(${fpv.roll}deg)`,
    transformStyle: "preserve-3d",
    transition: "transform 80ms linear",
    willChange: "transform",
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="relative w-full h-full rounded-2xl overflow-hidden border border-cyan-500/20 bg-slate-900 shadow-2xl outline-none"
    >
      <div className="absolute inset-0" style={fpvTransform}>
        <iframe
          ref={iframeRef}
          className="h-full w-full"
          title="Taj Mahal Digital Twin"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />

        {viewerUnavailable && (
          <div className="absolute inset-0 z-20 overflow-hidden">
            <img src={tajImg} alt="Taj Mahal simulation map" className="absolute inset-0 h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,12,24,0.58),rgba(5,12,24,0.8))]" />
            <div className="absolute inset-0 grid-bg opacity-35" />
            <div className="absolute inset-0 scanline opacity-70" />

            <motion.div
              className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/45"
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/25"
              animate={{ rotate: -360 }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10"
              animate={{ scale: [0.92, 1.06, 0.92], opacity: [0.35, 0.15, 0.35] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="absolute right-4 top-24 z-30 space-y-2 text-right text-[10px] font-mono uppercase tracking-[0.24em] text-cyan-200">
              <div className="glass-soft rounded border border-cyan-400/30 px-3 py-1.5">12 Cameras Connected</div>
              <div className="glass-soft rounded border border-cyan-400/30 px-3 py-1.5">Active Incidents</div>
              <div className="glass-soft rounded border border-cyan-400/30 px-3 py-1.5">Structural Monitoring Mode</div>
            </div>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_62%,rgba(2,6,23,0.56)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_45%),linear-gradient(180deg,rgba(2,6,23,0.2),rgba(2,6,23,0.55))]" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-25" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-40 h-16 w-16 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-cyan-300/35" />
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-cyan-300/35" />
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/60 bg-cyan-300/30" />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 h-px w-[70%] -translate-x-1/2 bg-cyan-400/20" />
      <div className="pointer-events-none absolute left-1/2 top-[58%] z-30 h-px w-[60%] -translate-x-1/2 bg-cyan-400/15" />

      {loadingViewer && (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6 text-center pointer-events-none">
          <div className="max-w-md rounded-2xl border border-cyan-400/30 bg-slate-950/75 px-4 py-3 text-cyan-200 font-mono text-sm leading-6 backdrop-blur-sm shadow-[0_0_24px_rgba(34,211,238,0.12)]">
            Initializing 3D Digital Twin...
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute left-4 top-4 z-40 rounded-full border border-cyan-400/50 bg-slate-950/80 px-3 py-1 text-[10px] font-semibold tracking-[0.28em] text-cyan-200 backdrop-blur-sm"
      >
        TAJ MAHAL DIGITAL TWIN
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="absolute bottom-4 right-4 z-40 rounded-full border border-cyan-400/50 bg-slate-950/80 px-3 py-1 text-[10px] font-semibold tracking-[0.28em] text-cyan-200 backdrop-blur-sm"
      >
        LIVE 3D MONITORING
      </motion.div>

      <div className="absolute right-4 top-4 z-40 w-[240px] rounded-xl border border-cyan-400/40 bg-slate-950/80 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.18)] backdrop-blur-sm">
        <div className="mb-1 font-semibold text-cyan-100">FPV HUD</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <span>X</span>
          <span className="text-right">{fpv.x.toFixed(1)}</span>
          <span>Y</span>
          <span className="text-right">{fpv.y.toFixed(1)}</span>
          <span>Z</span>
          <span className="text-right">{fpv.z.toFixed(2)}</span>
          <span>Pitch</span>
          <span className="text-right">{fpv.pitch.toFixed(1)}°</span>
          <span>Yaw</span>
          <span className="text-right">{fpv.yaw.toFixed(1)}°</span>
          <span>Roll</span>
          <span className="text-right">{fpv.roll.toFixed(1)}°</span>
          <span>Input</span>
          <span className="text-right">{inputMode}</span>
          <span>Speed</span>
          <span className="text-right">{speed}</span>
          <span>Controller</span>
          <span className="text-right">{controllerConnected ? "Connected" : "Offline"}</span>
        </div>
      </div>

      <div className="absolute bottom-40 left-4 z-40 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.22em]">
        <button
          onClick={resetCamera}
          className="rounded border border-cyan-400/40 bg-slate-950/80 px-2.5 py-1 text-cyan-200 hover:bg-cyan-500/15"
        >
          Reset
        </button>
        <button
          onClick={() => setPreset("top")}
          className="rounded border border-cyan-400/40 bg-slate-950/80 px-2.5 py-1 text-cyan-200 hover:bg-cyan-500/15"
        >
          Top View
        </button>
        <button
          onClick={() => setPreset("basement")}
          className="rounded border border-cyan-400/40 bg-slate-950/80 px-2.5 py-1 text-cyan-200 hover:bg-cyan-500/15"
        >
          Basement View
        </button>
        <button
          onClick={() => setPreset("garden")}
          className="rounded border border-cyan-400/40 bg-slate-950/80 px-2.5 py-1 text-cyan-200 hover:bg-cyan-500/15"
        >
          Garden View
        </button>
        <button
          onClick={() => setAutoPatrol(v => !v)}
          className={`rounded border px-2.5 py-1 ${autoPatrol ? "border-cyan-300/70 bg-cyan-400/20 text-cyan-100" : "border-cyan-400/40 bg-slate-950/80 text-cyan-200 hover:bg-cyan-500/15"}`}
        >
          Auto Patrol
        </button>
      </div>

      {/* <div className="absolute bottom-4 left-4 z-40 w-[330px] rounded-2xl border border-cyan-400/30 bg-slate-950/75 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.24em] text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.12)] backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between text-cyan-300">
          <span>FPV Camera Controls</span>
          <span className="rounded-full border border-cyan-400/30 px-2 py-1 text-[9px] tracking-[0.2em] text-cyan-200">
            {keyboardActive ? "Keyboard Active" : controllerConnected ? "Controller Connected" : "Input Ready"}
          </span>
        </div>
        <div className="space-y-2 text-cyan-100/90">
          <div className="flex items-center justify-between gap-3">
            <span>W/S · A/D</span>
            <span className="text-cyan-300">Move / Strafe</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Q / E</span>
            <span className="text-cyan-300">Ascend / Descend</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Arrows</span>
            <span className="text-cyan-300">Pitch / Yaw</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Z / C</span>
            <span className="text-cyan-300">Roll</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Gamepad</span>
            <span className="text-cyan-300">Sticks + Triggers</span>
          </div>
        </div> */}
      {/* </div> */}
    </div>
  );
}