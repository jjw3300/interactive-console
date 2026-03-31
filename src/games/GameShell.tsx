import React, { useEffect, useState } from "react";

interface CartridgeData {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  body: string;
  dark: string;
}

interface GameShellProps {
  cartridge: CartridgeData;
  onExit: () => void;
  children: React.ReactNode;
}

export default function GameShell({ cartridge, onExit, children }: GameShellProps) {
  const [tick, setTick] = useState(0);
  const [time, setTime] = useState(0);

  // Blinking cursor tick
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, []);

  // Play time counter
  useEffect(() => {
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div
      className="w-full h-screen flex flex-col overflow-hidden"
      style={{
        background: "#0a0a12",
        fontFamily: "'Courier New', monospace",
        imageRendering: "pixelated",
      }}
    >
      {/* ── TOP HUD BAR ── */}
      <div
        className="flex items-center justify-between px-6 py-2 shrink-0"
        style={{
          background: "linear-gradient(to bottom, #1a1a2e, #12122a)",
          borderBottom: `2px solid ${cartridge.dark}`,
          boxShadow: `0 2px 12px ${cartridge.dark}66`,
        }}
      >
        {/* Back button */}
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-1.5 rounded transition-all cursor-pointer group"
          style={{
            background: "transparent",
            border: `2px solid ${cartridge.dark}`,
            color: cartridge.accent,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = cartridge.dark + "44";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <span className="text-xs font-bold tracking-widest">◀ EXIT</span>
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: cartridge.accent, boxShadow: `0 0 6px ${cartridge.accent}` }}
          />
          <span
            className="text-sm font-black tracking-[0.3em]"
            style={{ color: cartridge.accent }}
          >
            {cartridge.title}
          </span>
          <span className="text-xs tracking-widest" style={{ color: cartridge.dark }}>
            {tick % 2 === 0 ? "▌" : " "}
          </span>
        </div>

        {/* Right info */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[8px] tracking-widest" style={{ color: cartridge.dark }}>
              PLAY TIME
            </div>
            <div className="text-xs font-bold" style={{ color: cartridge.accent }}>
              {formatTime(time)}
            </div>
          </div>
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: cartridge.accent,
              boxShadow: `0 0 8px ${cartridge.accent}, 0 0 16px ${cartridge.accent}66`,
            }}
          />
        </div>
      </div>

      {/* ── GAME CONTENT ── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)",
          }}
        />
        {children}
      </div>

      {/* ── BOTTOM STATUS BAR ── */}
      <div
        className="flex items-center justify-between px-6 py-1.5 shrink-0"
        style={{
          background: "linear-gradient(to top, #1a1a2e, #12122a)",
          borderTop: `1px solid ${cartridge.dark}44`,
        }}
      >
        <span className="text-[8px] tracking-widest" style={{ color: cartridge.dark }}>
          {cartridge.subtitle}
        </span>
        <div className="flex gap-4">
          <span className="text-[8px] tracking-widest" style={{ color: cartridge.dark }}>
            [A] ACTION
          </span>
          <span className="text-[8px] tracking-widest" style={{ color: cartridge.dark }}>
            [B] BACK
          </span>
          <span className="text-[8px] tracking-widest" style={{ color: cartridge.dark }}>
            [START] PAUSE
          </span>
        </div>
        <span className="text-[8px] font-mono" style={{ color: cartridge.dark + "88" }}>
          RETRO PLAY v1.0
        </span>
      </div>
    </div>
  );
}
