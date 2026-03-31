import { useState } from "react";
import type { Phase } from "../types";
import { CARTRIDGE_LIST } from "../data/cartridges";
import CartridgeCard from "../components/CartridgeCard";

interface Props {
  activeIndex: number;
  phase: Phase;
  loadProgress: number;
  onCartridgeClick: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function ConsolePage({
  activeIndex,
  phase,
  loadProgress,
  onCartridgeClick,
  onPrev,
  onNext,
}: Props) {
  const [pressedBtn, setPressedBtn] = useState<string | null>(null);

  const totalItems = CARTRIDGE_LIST.length;
  const activeCartridge = CARTRIDGE_LIST[activeIndex];
  const isInserted = phase !== "browse";

  const getRelativeIndex = (index: number, active: number, total: number) => {
    let diff = index - active;
    const half = total / 2;
    if (diff > half) diff -= total;
    if (diff < -half) diff += total;
    return diff;
  };

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-between overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #e8e0f0 0%, #f0ece8 50%, #e4eef4 100%)",
        fontFamily: "'Arial', sans-serif",
      }}
    >
      {/* ── CARTRIDGE CAROUSEL ── */}
      <div className="relative z-10 w-full h-[38vh] flex justify-center pt-6">
        {CARTRIDGE_LIST.map((cartridge, index) => {
          const diff = getRelativeIndex(index, activeIndex, totalItems);
          const isActive = diff === 0;

          let transformStyle = "";
          let opacityStyle = 0;
          let pointerEventsStyle: "auto" | "none" = "none";

          if (isInserted) {
            if (isActive) {
              transformStyle =
                "translateX(-50%) translateY(calc(100vh - 544px))";
              opacityStyle = 1;
            } else {
              transformStyle = `translateX(calc(-50% + ${diff * 40}vw)) translateY(-120px) scale(0.25) rotate(${diff * -20}deg)`;
              opacityStyle = 0;
            }
          } else {
            if (diff === 0) {
              transformStyle =
                "translateX(-50%) translateY(0) rotate(0deg) scale(1)";
              opacityStyle = 1;
              pointerEventsStyle = "auto";
            } else if (diff === -1) {
              transformStyle =
                "translateX(calc(-50% - 30vw)) translateY(-30px) rotate(12deg) scale(0.9)";
              opacityStyle = 0.85;
              pointerEventsStyle = "auto";
            } else if (diff === 1) {
              transformStyle =
                "translateX(calc(-50% + 30vw)) translateY(-30px) rotate(-12deg) scale(0.9)";
              opacityStyle = 0.85;
              pointerEventsStyle = "auto";
            } else if (diff === -2) {
              transformStyle =
                "translateX(calc(-50% - 58vw)) translateY(-80px) rotate(25deg) scale(0.7)";
              opacityStyle = 0.3;
            } else if (diff === 2) {
              transformStyle =
                "translateX(calc(-50% + 58vw)) translateY(-80px) rotate(-25deg) scale(0.7)";
              opacityStyle = 0.3;
            } else {
              transformStyle = "translateX(-50%) translateY(-150px) scale(0.4)";
              opacityStyle = 0;
            }
          }

          return (
            <div
              key={cartridge.id}
              onClick={() => onCartridgeClick(index)}
              className="absolute top-0 left-1/2 origin-top cursor-pointer"
              style={{
                transform: transformStyle,
                opacity: opacityStyle,
                pointerEvents: pointerEventsStyle,
                zIndex: isActive ? 30 : 20 - Math.abs(diff),
                transition:
                  "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease-out",
                width: "min(32vw, 240px)",
                height: "280px",
                borderRadius: "6px 6px 2px 2px",
                background: `linear-gradient(175deg, ${cartridge.accent} 0%, ${cartridge.body} 60%, ${cartridge.dark} 100%)`,
                boxShadow: isActive
                  ? `0 20px 60px rgba(0,0,0,0.45), 0 0 0 3px ${cartridge.dark}, inset 0 1px 0 rgba(255,255,255,0.3)`
                  : `0 8px 24px rgba(0,0,0,0.3), 0 0 0 2px ${cartridge.dark}`,
              }}
            >
              <CartridgeCard cartridge={cartridge} />
            </div>
          );
        })}
      </div>

      {/* ── CONSOLE BODY ── */}
      <div
        className={`relative z-20 flex flex-col items-center mb-10 w-full max-w-230 px-6 transition-all duration-700 ease-[cubic-bezier(0.87,0,0.13,1)] ${
          isInserted ? "-translate-y-2" : ""
        }`}
      >
        {/* Cartridge slot housing */}
        <div className="relative flex justify-center w-full">
          <div
            className="relative z-10"
            style={{
              width: "min(34vw, 260px)",
              height: "28px",
              background: "linear-gradient(to bottom, #d4d0cc, #b8b4b0)",
              borderRadius: "8px 8px 0 0",
              border: "3px solid #3a3530",
              borderBottom: "none",
              boxShadow:
                "inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-0"
              style={{
                width: "min(28vw, 210px)",
                height: "10px",
                background: "linear-gradient(to bottom, #1a1612, #2a2420)",
                borderRadius: "2px 2px 0 0",
                boxShadow: "inset 0 2px 6px rgba(0,0,0,0.8)",
              }}
            />
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-black/30"
              style={{
                background:
                  "radial-gradient(circle at 35% 35%, #e0dcd8, #9a9690)",
              }}
            />
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-black/30"
              style={{
                background:
                  "radial-gradient(circle at 35% 35%, #e0dcd8, #9a9690)",
              }}
            />
          </div>
        </div>

        {/* Main console body */}
        <div
          className="relative z-10 w-full flex flex-row items-center gap-6 px-8 py-6"
          style={{
            height: "340px",
            background:
              "linear-gradient(160deg, #c8c4f0 0%, #a8a4e8 40%, #9890d8 100%)",
            borderRadius: "24px 24px 40px 40px",
            border: "3px solid #3a3875",
            boxShadow:
              "0 24px 64px rgba(0,0,0,0.4), 0 8px 20px rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -4px 0 rgba(0,0,0,0.15)",
          }}
        >
          <div
            className="absolute top-3 left-12 right-12 h-px rounded-full"
            style={{ background: "rgba(255,255,255,0.5)" }}
          />

          {/* ── D-PAD ── */}
          <div className="flex flex-col gap-5 shrink-0">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(0,0,0,0.3) 60%, transparent 100%)",
                  transform: "translateY(4px) scale(0.85)",
                  filter: "blur(8px)",
                }}
              />
              <div
                className="absolute left-1/2 -translate-x-1/2 w-9 h-full rounded-md border-2 border-black/60"
                style={{
                  background:
                    "linear-gradient(to right, #2a2a2a, #404040, #2a2a2a)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-full h-9 rounded-md border-2 border-black/60"
                style={{
                  background:
                    "linear-gradient(to bottom, #2a2a2a, #404040, #2a2a2a)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              />
              <div
                className="absolute w-9 h-9 rounded-sm z-10 border border-black/40"
                style={{
                  background:
                    "radial-gradient(circle at 40% 40%, #4a4a4a, #1a1a1a)",
                }}
              />
              <span className="absolute top-1.5 left-1/2 -translate-x-1/2 text-white/60 text-[10px] z-20 leading-none select-none">
                ▲
              </span>
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-white/60 text-[10px] z-20 leading-none select-none">
                ▼
              </span>
              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-white/60 text-[10px] z-20 leading-none select-none">
                ◀
              </span>
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/60 text-[10px] z-20 leading-none select-none">
                ▶
              </span>
              <button
                onClick={onPrev}
                className="absolute left-0 w-9 h-9 z-30 rounded-l-md cursor-pointer active:brightness-75 transition-all"
              />
              <button
                onClick={onNext}
                className="absolute right-0 w-9 h-9 z-30 rounded-r-md cursor-pointer active:brightness-75 transition-all"
              />
            </div>
            <div className="flex gap-3 justify-center">
              {["SEL", "STR"].map((label) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <button
                    className="w-8 h-3 rounded-full border border-black/50 active:translate-y-px transition-transform cursor-pointer"
                    style={{
                      background:
                        "linear-gradient(to bottom, #5a5670, #3a3450)",
                      boxShadow:
                        "0 2px 0 #1a1430, inset 0 1px 0 rgba(255,255,255,0.2)",
                    }}
                  />
                  <span
                    className="text-[7px] font-bold tracking-widest"
                    style={{ color: "rgba(30,28,60,0.7)" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── SCREEN ── */}
          <div className="flex-1 flex flex-col items-center gap-2 h-full">
            <div
              className="w-full flex-1 relative rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(145deg, #1a1830, #0d0c1a)",
                border: "4px solid #0a0918",
                boxShadow:
                  "inset 0 4px 16px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="absolute inset-3 rounded-lg overflow-hidden"
                style={{
                  background: phase === "loading" ? "#000" : "#1e2d1e",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.6)",
                }}
              >
                {phase === "browse" ? (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center gap-2"
                    style={{
                      background: "linear-gradient(160deg, #1a2a1a, #0d1a0d)",
                    }}
                  >
                    <div className="grid grid-cols-8 gap-1 opacity-20">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-sm"
                          style={{
                            background:
                              i % 3 === 0
                                ? "#4ade80"
                                : i % 3 === 1
                                  ? "#22c55e"
                                  : "transparent",
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="text-[10px] font-mono tracking-[0.3em] animate-pulse"
                      style={{ color: "#4ade80", opacity: 0.6 }}
                    >
                      INSERT CARTRIDGE
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-black p-4">
                    <div
                      className="text-[9px] font-mono tracking-widest"
                      style={{ color: activeCartridge.accent, opacity: 0.6 }}
                    >
                      ● LOADING
                    </div>
                    <span
                      className="text-base font-mono font-black tracking-widest"
                      style={{
                        color: activeCartridge.accent,
                        textShadow: `0 0 10px ${activeCartridge.accent}`,
                      }}
                    >
                      {activeCartridge.title}
                    </span>
                    <div
                      className="w-full rounded-full overflow-hidden"
                      style={{ height: "4px", background: "#1a1a2e" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${loadProgress}%`,
                          background: activeCartridge.accent,
                          boxShadow: `0 0 8px ${activeCartridge.accent}`,
                        }}
                      />
                    </div>
                    <div
                      className="text-[8px] font-mono"
                      style={{ color: activeCartridge.accent, opacity: 0.4 }}
                    >
                      {loadProgress < 100 ? `${loadProgress}%` : "READY"}
                    </div>
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                <span
                  className="text-[6px] font-bold tracking-[0.4em] opacity-30"
                  style={{ color: "#a0a0c0" }}
                >
                  RETRO PLAY
                </span>
              </div>
            </div>

            {/* Speaker grille */}
            <div className="flex gap-1 pb-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="w-1 h-1 rounded-full"
                      style={{
                        background: "rgba(20,18,50,0.5)",
                        boxShadow: "inset 0 1px 0 rgba(0,0,0,0.6)",
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* ── A/B BUTTONS ── */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* B button */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                <button
                  onMouseDown={() => setPressedBtn("B")}
                  onMouseUp={() => setPressedBtn(null)}
                  onMouseLeave={() => setPressedBtn(null)}
                  className="w-12 h-12 rounded-full border-2 border-black/60 cursor-pointer"
                  style={{
                    background:
                      pressedBtn === "B"
                        ? "radial-gradient(circle at 50% 60%, #1565c0, #0d47a1)"
                        : "radial-gradient(circle at 40% 35%, #42a5f5, #1565c0)",
                    boxShadow:
                      pressedBtn === "B"
                        ? "0 1px 0 #0a2d6a, inset 0 2px 4px rgba(0,0,0,0.4)"
                        : "0 5px 0 #0a2d6a, inset 0 1px 0 rgba(255,255,255,0.3)",
                    transform:
                      pressedBtn === "B" ? "translateY(4px)" : undefined,
                  }}
                />
                <span
                  className="text-[8px] font-black tracking-widest"
                  style={{ color: "rgba(30,28,60,0.6)" }}
                >
                  B
                </span>
              </div>
              {/* A button */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
                <button
                  onMouseDown={() => setPressedBtn("A")}
                  onMouseUp={() => setPressedBtn(null)}
                  onMouseLeave={() => setPressedBtn(null)}
                  onClick={() => onCartridgeClick(activeIndex)}
                  className="w-12 h-12 rounded-full border-2 border-black/60 cursor-pointer"
                  style={{
                    background:
                      pressedBtn === "A"
                        ? "radial-gradient(circle at 50% 60%, #b71c1c, #7f0000)"
                        : "radial-gradient(circle at 40% 35%, #ef5350, #b71c1c)",
                    boxShadow:
                      pressedBtn === "A"
                        ? "0 1px 0 #4a0000, inset 0 2px 4px rgba(0,0,0,0.4)"
                        : "0 5px 0 #4a0000, inset 0 1px 0 rgba(255,255,255,0.3)",
                    transform:
                      pressedBtn === "A" ? "translateY(4px)" : undefined,
                  }}
                />
                <span
                  className="text-[8px] font-black tracking-widest"
                  style={{ color: "rgba(30,28,60,0.6)" }}
                >
                  A
                </span>
              </div>
            </div>

            {/* Power LED */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: isInserted ? activeCartridge.accent : "#374151",
                    boxShadow: isInserted
                      ? `0 0 6px ${activeCartridge.accent}, 0 0 12px ${activeCartridge.accent}88`
                      : "none",
                    transition: "all 0.4s ease",
                  }}
                />
                <span
                  className="text-[7px] font-bold tracking-widest"
                  style={{ color: "rgba(30,28,60,0.5)" }}
                >
                  POWER
                </span>
              </div>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full border border-black/30"
                    style={{
                      background:
                        i < 3 ? "rgba(30,28,60,0.4)" : "rgba(30,28,60,0.1)",
                    }}
                  />
                ))}
              </div>
              <span
                className="text-[6px] tracking-widest opacity-30"
                style={{ color: "rgba(30,28,60,0.8)" }}
              >
                VOL
              </span>
            </div>
          </div>
        </div>

        {/* Console bottom ridge */}
        <div
          className="w-11/12 h-3 rounded-b-3xl"
          style={{
            background: "linear-gradient(to bottom, #7068b8, #5850a0)",
            border: "2px solid #3a3875",
            borderTop: "none",
            boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
          }}
        />
      </div>
    </div>
  );
}
