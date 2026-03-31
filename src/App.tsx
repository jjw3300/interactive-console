import { useEffect, useState } from "react";
import type { Phase } from "./types";
import { CARTRIDGE_LIST, GAME_COMPONENTS } from "./data/cartridges";
import ConsolePage from "./pages/ConsolePage";
import GameShell from "./games/GameShell";
import CRTTransition from "./components/CRTTransition";

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("browse");
  const [loadProgress, setLoadProgress] = useState(0);
  const [revealing, setRevealing] = useState(false);

  const totalItems = CARTRIDGE_LIST.length;
  const activeCartridge = CARTRIDGE_LIST[activeIndex];

  // Loading progress → transition-in
  useEffect(() => {
    if (phase !== "loading") return;
    const steps = [
      { target: 0, delay: 0 },
      { target: 30, delay: 200 },
      { target: 65, delay: 600 },
      { target: 90, delay: 1000 },
      { target: 100, delay: 1600 },
    ];
    const timers = steps.map(({ target, delay }) =>
      setTimeout(() => setLoadProgress(target), delay),
    );
    timers.push(setTimeout(() => setPhase("transition-in"), 2000));
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // transition-in → playing
  useEffect(() => {
    if (phase !== "transition-in") return;
    const t1 = setTimeout(() => {
      setPhase("playing");
      setRevealing(true);
    }, 700);
    const t2 = setTimeout(() => setRevealing(false), 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase]);

  // transition-out → browse
  useEffect(() => {
    if (phase !== "transition-out") return;
    const t1 = setTimeout(() => {
      setPhase("browse");
      setRevealing(true);
    }, 600);
    const t2 = setTimeout(() => setRevealing(false), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase]);

  const handleCartridgeClick = (index: number) => {
    if (phase !== "browse") return;
    if (index === activeIndex) setPhase("loading");
    else setActiveIndex(index);
  };

  const handlePrev = () => {
    if (phase === "browse")
      setActiveIndex((p) => (p - 1 + totalItems) % totalItems);
  };

  const handleNext = () => {
    if (phase === "browse") setActiveIndex((p) => (p + 1) % totalItems);
  };

  const handleExit = () => setPhase("transition-out");

  const isPlayingGame = phase === "playing" || phase === "transition-out";
  const GameComponent = isPlayingGame
    ? GAME_COMPONENTS[activeCartridge.id]
    : null;

  // ── RENDER ────────────────────────────────────────
  return (
    <>
      {/* CONSOLE PAGE (always rendered as background) */}
      <ConsolePage
        activeIndex={activeIndex}
        phase={phase}
        loadProgress={loadProgress}
        onCartridgeClick={handleCartridgeClick}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {/* GAME PAGE (overlaid on top) */}
      {isPlayingGame && GameComponent && (
        <div
          className="fixed inset-0"
          style={{
            background: "#0a0a12",
            opacity: phase === "transition-out" ? 0 : 1,
            transition: "opacity 0.6s ease-out",
            zIndex: 50,
            pointerEvents: phase === "transition-out" ? "none" : "auto",
          }}
        >
          <GameShell cartridge={activeCartridge} onExit={handleExit}>
            <GameComponent />
          </GameShell>
        </div>
      )}

      <CRTTransition
        phase={phase}
        accent={activeCartridge.accent}
        showReveal={revealing}
      />
    </>
  );
}
