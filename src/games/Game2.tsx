import { useState } from "react";

const COLORS = [
  "#fb7185",
  "#f43f5e",
  "#fda4af",
  "#fff",
  "#fbbf24",
  "#34d399",
  "#60a5fa",
  "#a78bfa",
  "#000",
];
const CANVAS_W = 32;
const CANVAS_H = 24;

export default function Game2() {
  const [pixels, setPixels] = useState<string[]>(
    Array(CANVAS_W * CANVAS_H).fill("#1a1a2e"),
  );
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "fill">("pen");

  const paint = (index: number) => {
    if (tool === "pen") {
      setPixels((prev) => {
        const next = [...prev];
        next[index] = selectedColor;
        return next;
      });
    } else {
      // Flood fill
      const target = pixels[index];
      if (target === selectedColor) return;
      const next = [...pixels];
      const stack = [index];
      while (stack.length) {
        const i = stack.pop()!;
        if (i < 0 || i >= CANVAS_W * CANVAS_H) continue;
        if (next[i] !== target) continue;
        next[i] = selectedColor;
        const x = i % CANVAS_W;
        if (x > 0) stack.push(i - 1);
        if (x < CANVAS_W - 1) stack.push(i + 1);
        stack.push(i - CANVAS_W);
        stack.push(i + CANVAS_W);
      }
      setPixels(next);
    }
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center gap-8 p-6"
      style={{
        background:
          "radial-gradient(ellipse at center, #120a18 0%, #080610 100%)",
      }}
    >
      {/* Left toolbar */}
      <div className="flex flex-col gap-3 items-center">
        <span
          className="text-[8px] tracking-widest mb-1"
          style={{ color: "#f43f5e88" }}
        >
          TOOL
        </span>
        {(["pen", "fill"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTool(t)}
            className="w-10 h-10 rounded flex items-center justify-center text-lg cursor-pointer transition-all"
            style={{
              background: tool === t ? "#f43f5e22" : "transparent",
              border: `2px solid ${tool === t ? "#f43f5e" : "#2a1a2e"}`,
              boxShadow: tool === t ? "0 0 10px #f43f5e44" : "none",
            }}
          >
            {t === "pen" ? "✏️" : "🪣"}
          </button>
        ))}

        <div className="w-px h-4 mt-2" style={{ background: "#2a1a2e" }} />

        <span
          className="text-[8px] tracking-widest"
          style={{ color: "#f43f5e88" }}
        >
          COLOR
        </span>
        <div className="flex flex-col gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              className="w-7 h-7 rounded-sm border-2 cursor-pointer transition-all"
              style={{
                background: c,
                borderColor: selectedColor === c ? "#fff" : "#0a0a12",
                transform: selectedColor === c ? "scale(1.15)" : "scale(1)",
                boxShadow: selectedColor === c ? `0 0 8px ${c}` : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p
            className="text-[10px] tracking-[0.4em]"
            style={{ color: "#f43f5e88" }}
          >
            ● PIXEL EDITOR
          </p>
          <h1
            className="text-3xl font-black tracking-widest"
            style={{ color: "#fb7185", textShadow: "0 0 20px #fb718566" }}
          >
            PIXEL ART
          </h1>
        </div>

        <div
          className="relative border-2"
          style={{ borderColor: "#2a1a2e", boxShadow: "0 0 30px #f43f5e22" }}
          onMouseLeave={() => setIsDrawing(false)}
        >
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${CANVAS_W}, 14px)` }}
          >
            {pixels.map((color, i) => (
              <div
                key={i}
                className="w-3.5 h-3.5 border border-black/10 cursor-crosshair"
                style={{ background: color }}
                onMouseDown={() => {
                  setIsDrawing(true);
                  paint(i);
                }}
                onMouseEnter={() => {
                  if (isDrawing) paint(i);
                }}
                onMouseUp={() => setIsDrawing(false)}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => setPixels(Array(CANVAS_W * CANVAS_H).fill("#1a1a2e"))}
          className="px-6 py-2 text-xs font-bold tracking-widest rounded cursor-pointer"
          style={{
            background: "transparent",
            border: "2px solid #2a1a2e",
            color: "#2a1a2e",
          }}
        >
          CLEAR
        </button>
      </div>
    </div>
  );
}
