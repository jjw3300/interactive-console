import { useEffect, useRef, useState } from "react";

export default function Game1() {
  const [beats, setBeats] = useState<boolean[]>(Array(16).fill(false));
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ROWS = ["BD", "SD", "HH", "CY"];
  const [grid, setGrid] = useState<boolean[][]>(
    Array(4)
      .fill(null)
      .map(() => Array(16).fill(false)),
  );

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setStep((s) => (s + 1) % 16);
      }, 150);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing]);

  const toggleCell = (row: number, col: number) => {
    setGrid((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = !next[row][col];
      return next;
    });
  };

  const ROW_COLORS = ["#ef4444", "#f97316", "#eab308", "#ec4899"];

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-8 p-8"
      style={{
        background:
          "radial-gradient(ellipse at center, #1a0a0a 0%, #0a0208 100%)",
      }}
    >
      <div className="text-center">
        <p
          className="text-[10px] tracking-[0.4em] mb-1"
          style={{ color: "#ef444488" }}
        >
          ● BEAT SEQUENCER
        </p>
        <h1
          className="text-4xl font-black tracking-widest"
          style={{ color: "#ef4444", textShadow: "0 0 20px #ef444466" }}
        >
          BIT DRUM
        </h1>
      </div>

      {/* Grid */}
      <div className="flex flex-col gap-2">
        {ROWS.map((rowName, ri) => (
          <div key={ri} className="flex items-center gap-3">
            <span
              className="text-xs font-bold w-6 text-right"
              style={{ color: ROW_COLORS[ri] }}
            >
              {rowName}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: 16 }).map((_, ci) => {
                const isActive = grid[ri][ci];
                const isCurrent = playing && step === ci;
                return (
                  <button
                    key={ci}
                    onClick={() => toggleCell(ri, ci)}
                    className="w-8 h-8 rounded-sm border cursor-pointer transition-all"
                    style={{
                      background: isActive
                        ? isCurrent
                          ? "#fff"
                          : ROW_COLORS[ri]
                        : isCurrent
                          ? ROW_COLORS[ri] + "44"
                          : "#1a1a2e",
                      borderColor: isActive ? ROW_COLORS[ri] : "#2a2a4a",
                      boxShadow:
                        isActive && isCurrent
                          ? `0 0 10px ${ROW_COLORS[ri]}`
                          : "none",
                      transform:
                        isActive && isCurrent ? "scale(1.1)" : "scale(1)",
                    }}
                  />
                );
              })}
            </div>
            {/* Beat group dividers */}
          </div>
        ))}
      </div>

      {/* Playhead indicator */}
      <div className="flex gap-1">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="w-8 h-1 rounded-full transition-all"
            style={{
              background: playing && step === i ? "#ef4444" : "#2a2a4a",
              boxShadow: playing && step === i ? "0 0 6px #ef4444" : "none",
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="px-8 py-3 font-black text-sm tracking-widest rounded cursor-pointer transition-all"
          style={{
            background: playing ? "#ef4444" : "transparent",
            border: "2px solid #ef4444",
            color: playing ? "#fff" : "#ef4444",
            boxShadow: playing ? "0 0 16px #ef444466" : "none",
          }}
        >
          {playing ? "■ STOP" : "▶ PLAY"}
        </button>
        <button
          onClick={() => {
            setGrid(
              Array(4)
                .fill(null)
                .map(() => Array(16).fill(false)),
            );
            setStep(0);
          }}
          className="px-6 py-3 font-black text-sm tracking-widest rounded cursor-pointer"
          style={{
            background: "transparent",
            border: "2px solid #4a2a2a",
            color: "#4a2a2a",
          }}
        >
          RESET
        </button>
      </div>
    </div>
  );
}
