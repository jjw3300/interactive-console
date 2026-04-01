import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Matter from "matter-js";

// ── Types ──────────────────────────────────────────────────────────────────
type RuleKey =
  | "KIWI_IS_TEXT"
  | "TEXT_IS_KIWI"
  | "KIWI_IS_JELLY"
  | "BG_IS_DARK"
  | "TEXT_IS_RAINBOW"
  | "KIWI_IS_FLOAT";

interface Block {
  id: string;
  label: string;
  type: "subject" | "verb" | "property";
  x: number;
  y: number;
}

// ── Constants ──────────────────────────────────────────────────────────────
const BLOCK_W = 68;
const BLOCK_H = 36;
const SNAP_GAP = 6;
const SNAP_DIST = 56;

// ── Layout ────────────────────────────────────────────────────────────────
// 8 slots total. Gap at slot 3-4 between subjects/verbs AND between left/right props.
// This ensures IS[slot5].x - 74 = slot4 (empty), never a block position.
//
//  Row1: [KIWI][TEXT][ BG ][    ][    ][ IS ][ IS ][ IS ]
//  Row2: [RNBW][JLLY][DARK][FLT ][    ][KIWI][TEXT]
//         s0    s1    s2    s3    s4    s5    s6    s7
function buildBlocks(w: number, h: number): Block[] {
  const col = BLOCK_W + SNAP_GAP; // 74px per slot
  // Center the 8-slot grid (592px) horizontally
  const sx = Math.max(8, Math.round((w - col * 8) / 2));
  const s = (n: number) => sx + col * n;

  const row1Y = Math.round(h * 0.65);
  const row2Y = row1Y + BLOCK_H + 10;

  return [
    // Row 1 – subjects (slots 0-2) and verbs (slots 5-7)
    { id: "b-kiwi1",   label: "KIWI",    type: "subject",  x: s(0), y: row1Y },
    { id: "b-text1",   label: "TEXT",    type: "subject",  x: s(1), y: row1Y },
    { id: "b-bg1",     label: "BG",      type: "subject",  x: s(2), y: row1Y },
    { id: "b-is1",     label: "IS",      type: "verb",     x: s(5), y: row1Y },
    { id: "b-is2",     label: "IS",      type: "verb",     x: s(6), y: row1Y },
    { id: "b-is3",     label: "IS",      type: "verb",     x: s(7), y: row1Y },
    // Row 2 – properties left (slots 0-3) and right (slots 5-6)
    { id: "b-rainbow", label: "RAINBOW", type: "property", x: s(0), y: row2Y },
    { id: "b-jelly",   label: "JELLY",   type: "property", x: s(1), y: row2Y },
    { id: "b-dark",    label: "DARK",    type: "property", x: s(2), y: row2Y },
    { id: "b-float",   label: "FLOAT",   type: "property", x: s(3), y: row2Y },
    { id: "b-kiwi2",   label: "KIWI",    type: "property", x: s(5), y: row2Y },
    { id: "b-text2",   label: "TEXT",    type: "property", x: s(6), y: row2Y },
  ];
}

// ── Rule detection (3-loop: no sorted-consecutive dependency) ─────────────
// Checks: is verb snapped directly to right of subject?
//         is property snapped directly to right of verb?
function detectRules(blocks: Block[]): Set<RuleKey> {
  const rules = new Set<RuleKey>();
  const snap = BLOCK_W + SNAP_GAP; // exact snapped distance = 74px

  const subjects   = blocks.filter((b) => b.type === "subject");
  const verbs      = blocks.filter((b) => b.label === "IS");
  const properties = blocks.filter((b) => b.type === "property");

  for (const subj of subjects) {
    for (const verb of verbs) {
      if (Math.abs(verb.x - (subj.x + snap)) > 12) continue; // verb right of subject
      if (Math.abs(verb.y - subj.y) > BLOCK_H * 0.8) continue;
      for (const prop of properties) {
        if (Math.abs(prop.x - (verb.x + snap)) > 12) continue; // prop right of verb
        if (Math.abs(prop.y - verb.y) > BLOCK_H * 0.8) continue;
        rules.add(`${subj.label}_IS_${prop.label}` as RuleKey);
      }
    }
  }
  return rules;
}

// ── Snap blocks (with occupancy guard) ────────────────────────────────────
function snapBlocks(blocks: Block[], draggedId: string): Block[] {
  const dragged = blocks.find((b) => b.id === draggedId);
  if (!dragged) return blocks;

  const isOccupied = (tx: number, ty: number) =>
    blocks.some(
      (b) =>
        b.id !== draggedId &&
        Math.abs(b.x - tx) < BLOCK_W * 0.8 &&
        Math.abs(b.y - ty) < BLOCK_H * 0.8
    );

  for (const other of blocks) {
    if (other.id === draggedId) continue;
    // Snap to RIGHT of other
    const rX = other.x + BLOCK_W + SNAP_GAP;
    if (
      !isOccupied(rX, other.y) &&
      Math.abs(dragged.x - rX) < SNAP_DIST &&
      Math.abs(dragged.y - other.y) < SNAP_DIST
    ) {
      return blocks.map((b) => (b.id === draggedId ? { ...b, x: rX, y: other.y } : b));
    }
    // Snap to LEFT of other
    const lX = other.x - BLOCK_W - SNAP_GAP;
    if (
      !isOccupied(lX, other.y) &&
      Math.abs(dragged.x - lX) < SNAP_DIST &&
      Math.abs(dragged.y - other.y) < SNAP_DIST
    ) {
      return blocks.map((b) => (b.id === draggedId ? { ...b, x: lX, y: other.y } : b));
    }
  }
  return blocks;
}

// ── Adjacent-pair highlight ───────────────────────────────────────────────
function getSnappedIds(blocks: Block[]): Set<string> {
  const result = new Set<string>();
  const snap = BLOCK_W + SNAP_GAP;
  for (const a of blocks) {
    for (const b of blocks) {
      if (a.id === b.id) continue;
      if (Math.abs(a.x - (b.x + snap)) < 12 && Math.abs(a.y - b.y) < 12) {
        result.add(a.id);
        result.add(b.id);
      }
    }
  }
  return result;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Game1() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const engineRef     = useRef<Matter.Engine | null>(null);
  const runnerRef     = useRef<Matter.Runner | null>(null);
  const ballsRef      = useRef<Matter.Body[]>([]);
  const jellyRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const textBallsRef  = useRef(false);
  const particleIdRef = useRef(0);

  const [blocks,    setBlocks]    = useState<Block[]>([]);
  const [rules,     setRules]     = useState<Set<RuleKey>>(new Set());
  const [dragging,  setDragging]  = useState<{ id: string; ox: number; oy: number } | null>(null);
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; vx: number; vy: number; life: number }[]
  >([]);
  const [jellyPhase, setJellyPhase] = useState(0);

  // Derived (memos recompute on every blocks change but that's fine)
  const snappedIds = useMemo(() => getSnappedIds(blocks), [blocks]);

  // ── Init blocks ───────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const { clientWidth: w, clientHeight: h } = el;
    if (w > 0 && h > 0) setBlocks(buildBlocks(w, h));
  }, []);

  // ── Matter.js setup ───────────────────────────────────────────────────────
  useEffect(() => {
    const { Engine, Render, Runner, Bodies, Composite, World } = Matter;
    const canvas = canvasRef.current!;
    const el = containerRef.current!;
    const w = el.clientWidth || 900;
    const h = el.clientHeight || 600;
    canvas.width = w;
    canvas.height = h;

    const engine = Engine.create({ gravity: { x: 0, y: 1 } });
    engineRef.current = engine;

    const render = Render.create({
      canvas,
      engine,
      options: { width: w, height: h, wireframes: false, background: "transparent" },
    });

    Composite.add(engine.world, [
      Bodies.rectangle(w / 2,  h + 25, w * 2, 50, { isStatic: true, render: { fillStyle: "transparent" } }),
      Bodies.rectangle(-25,    h / 2,  50, h * 2, { isStatic: true, render: { fillStyle: "transparent" } }),
      Bodies.rectangle(w + 25, h / 2,  50, h * 2, { isStatic: true, render: { fillStyle: "transparent" } }),
    ]);

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);
    Render.run(render);

    return () => {
      Runner.stop(runner);
      Render.stop(render);
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (jellyRef.current) clearInterval(jellyRef.current); };
  }, []);

  // ── Spawn TEXT→KIWI balls ─────────────────────────────────────────────────
  const spawnTextBalls = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const { Bodies, Composite } = Matter;
    const w = canvasRef.current?.width ?? 900;
    const palette = ["#a78bfa", "#818cf8", "#c4b5fd", "#7c3aed", "#6d28d9"];
    const balls = Array.from({ length: 40 }, (_, i) =>
      Bodies.circle(
        80 + Math.random() * (w - 160),
        -20 - i * 16,
        6 + Math.random() * 8,
        {
          restitution: 0.65,
          friction: 0.08,
          render: { fillStyle: palette[i % palette.length], strokeStyle: "#c4b5fd", lineWidth: 1 },
        }
      )
    );
    Composite.add(engine.world, balls);
    ballsRef.current = balls;
  }, []);

  // ── Rule side-effects ─────────────────────────────────────────────────────
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    // KIWI IS FLOAT → gravity
    engine.gravity.y = rules.has("KIWI_IS_FLOAT") ? 0 : 1;
    engine.gravity.x = 0;

    // TEXT IS KIWI → physics balls
    if (rules.has("TEXT_IS_KIWI") && !textBallsRef.current) {
      textBallsRef.current = true;
      spawnTextBalls();
    } else if (!rules.has("TEXT_IS_KIWI") && textBallsRef.current) {
      textBallsRef.current = false;
      ballsRef.current.forEach((b) => Matter.Composite.remove(engine.world, b));
      ballsRef.current = [];
    }

    // KIWI IS JELLY → wobble interval
    if (rules.has("KIWI_IS_JELLY")) {
      if (!jellyRef.current) {
        jellyRef.current = setInterval(() => setJellyPhase((p) => p + 0.12), 16);
      }
    } else {
      if (jellyRef.current) { clearInterval(jellyRef.current); jellyRef.current = null; }
    }
  }, [rules, spawnTextBalls]);

  // ── Particles ─────────────────────────────────────────────────────────────
  const emitParticles = useCallback((x: number, y: number) => {
    setParticles((prev) => [
      ...prev,
      ...Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        return {
          id: particleIdRef.current++,
          x, y,
          vx: Math.cos(angle) * (2 + Math.random() * 4),
          vy: Math.sin(angle) * (2 + Math.random() * 4),
          life: 1,
        };
      }),
    ]);
  }, []);

  useEffect(() => {
    if (particles.length === 0) return;
    const id = requestAnimationFrame(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.15, life: p.life - 0.034 }))
          .filter((p) => p.life > 0)
      );
    });
    return () => cancelAnimationFrame(id);
  }, [particles]);

  // ── Drag ─────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const rect  = containerRef.current!.getBoundingClientRect();
    const block = blocks.find((b) => b.id === id)!;
    setDragging({ id, ox: e.clientX - rect.left - block.x, oy: e.clientY - rect.top - block.y });
  }, [blocks]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    const rect = containerRef.current!.getBoundingClientRect();
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === dragging.id
          ? { ...b, x: e.clientX - rect.left - dragging.ox, y: e.clientY - rect.top - dragging.oy }
          : b
      )
    );
  }, [dragging]);

  // onMouseUp uses `blocks` directly — adding to deps so it always sees the latest
  const onMouseUp = useCallback(() => {
    if (!dragging) return;
    const snapped   = snapBlocks(blocks, dragging.id);
    const newRules  = detectRules(snapped);
    const newSnapped = getSnappedIds(snapped);

    setBlocks(snapped);
    setRules(newRules);
    setDragging(null);

    // Emit particles at snap point
    if (newSnapped.size > 0) {
      const b = snapped.find((bl) => newSnapped.has(bl.id));
      if (b) emitParticles(b.x + BLOCK_W / 2, b.y + BLOCK_H / 2);
    }
  }, [dragging, blocks, emitParticles]);

  const onTouchStart = useCallback((e: React.TouchEvent, id: string) => {
    const rect  = containerRef.current!.getBoundingClientRect();
    const t     = e.touches[0];
    const block = blocks.find((b) => b.id === id)!;
    setDragging({ id, ox: t.clientX - rect.left - block.x, oy: t.clientY - rect.top - block.y });
  }, [blocks]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging) return;
    e.preventDefault();
    const rect = containerRef.current!.getBoundingClientRect();
    const t    = e.touches[0];
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === dragging.id
          ? { ...b, x: t.clientX - rect.left - dragging.ox, y: t.clientY - rect.top - dragging.oy }
          : b
      )
    );
  }, [dragging]);

  // ── Block theme ───────────────────────────────────────────────────────────
  const blockTheme = (b: Block) => {
    if (b.type === "subject") return { bg: "#312e81", border: "#818cf8", color: "#e0e7ff" };
    if (b.label === "IS")     return { bg: "#1e3a8a", border: "#60a5fa", color: "#bfdbfe" };
    return                           { bg: "#1c1917", border: "#a78bfa", color: "#ede9fe" };
  };

  // ── Derived flags ─────────────────────────────────────────────────────────
  const isDark    = rules.has("BG_IS_DARK");
  const isRainbow = rules.has("TEXT_IS_RAINBOW");
  const isFloat   = rules.has("KIWI_IS_FLOAT");
  const isText    = rules.has("KIWI_IS_TEXT");
  const isJelly   = rules.has("KIWI_IS_JELLY");

  // ── Jelly polygon ─────────────────────────────────────────────────────────
  const jellyPoints = isJelly
    ? Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2;
        const w = Math.sin(a * 3 + jellyPhase) * 10 + Math.sin(a * 5 + jellyPhase * 1.3) * 6;
        return `${Math.cos(a) * (76 + w)},${Math.sin(a) * (76 + w)}`;
      }).join(" ")
    : "";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{
        background: isDark
          ? "radial-gradient(ellipse at center, #050510 0%, #020208 100%)"
          : "radial-gradient(ellipse at center, #1e1b4b 0%, #0f0c29 100%)",
        transition: "background 0.8s ease",
        cursor: dragging ? "grabbing" : "default",
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
    >
      {/* Scanline */}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px)",
        }}
      />

      {/* Physics canvas (TEXT IS KIWI) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: rules.has("TEXT_IS_KIWI") ? 1 : 0, transition: "opacity 0.4s", zIndex: 10 }}
      />

      {/* ── KIWI center ── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ paddingBottom: "35%", zIndex: 11 }}
      >
        {!isText ? (
          <div
            style={{
              width: 180,
              height: 180,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // KIWI IS FLOAT: bob up/down
              animation: isFloat ? "kiwiFloat 2.4s ease-in-out infinite" : "none",
            }}
          >
            {/* Jelly polygon */}
            {isJelly && (
              <svg
                viewBox="-100 -100 200 200"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              >
                <polygon points={jellyPoints} fill="#7c3aed44" stroke="#a78bfa" strokeWidth="2.5" />
              </svg>
            )}

            {/* KIWI circle */}
            <div
              className="rounded-full flex items-center justify-center font-black text-2xl tracking-widest"
              style={{
                width: 155,
                height: 155,
                background: isJelly
                  ? "radial-gradient(circle, #7c3aed 0%, #4c1d95 100%)"
                  : isFloat
                    ? "radial-gradient(circle, #818cf8 0%, #4338ca 100%)"
                    : "radial-gradient(circle, #6d28d9 0%, #312e81 100%)",
                border: `3px solid ${isJelly ? "#c4b5fd" : isFloat ? "#a5b4fc" : "#818cf8"}`,
                boxShadow: isFloat
                  ? "0 0 50px #818cf8, 0 0 100px #6366f155, 0 20px 60px #6366f133"
                  : isJelly
                    ? "0 0 40px #a78bfa, 0 0 80px #7c3aed55"
                    : "0 0 30px #6d28d955",
                color: "#e0e7ff",
                transition: "background 0.4s, box-shadow 0.4s, border-color 0.4s",
              }}
            >
              KIWI
            </div>

            {/* KIWI IS FLOAT: star/glow particles around circle */}
            {isFloat && (
              <>
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <div
                    key={deg}
                    style={{
                      position: "absolute",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#a5b4fc",
                      boxShadow: "0 0 8px #818cf8",
                      transform: `rotate(${deg}deg) translateX(92px)`,
                      animation: `orbitStar 3s linear ${deg / 360}s infinite`,
                    }}
                  />
                ))}
              </>
            )}
          </div>
        ) : (
          /* KIWI IS TEXT → text card */
          <div
            style={{
              width: 240,
              minHeight: 110,
              background: isDark ? "#0d0d1a" : "#1a1740",
              border: "2px solid #a78bfa",
              boxShadow: "0 0 24px #a78bfa88, 0 0 60px #7c3aed44",
              padding: "18px 24px",
              borderRadius: 4,
              animation: "fadeIn 0.4s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <p className="text-xs leading-relaxed text-center" style={{ color: "#c4b5fd" }}>
              프론트엔드 개발자<br />
              React · TypeScript<br />
              Matter.js · Three.js<br />
              <span style={{ color: "#818cf8", fontSize: "0.65rem" }}>UI ENGINEER</span>
            </p>
          </div>
        )}
      </div>

      {/* ── Word blocks ── */}
      {blocks.map((block) => {
        const theme    = blockTheme(block);
        const snapped  = snappedIds.has(block.id);
        const isDragged = dragging?.id === block.id;
        const applyRainbow = isRainbow && block.type !== "verb";
        return (
          <div
            key={block.id}
            onMouseDown={(e) => onMouseDown(e, block.id)}
            onTouchStart={(e) => onTouchStart(e, block.id)}
            className="absolute flex items-center justify-center font-black tracking-widest rounded-sm"
            style={{
              left: block.x,
              top: block.y,
              width: BLOCK_W,
              height: BLOCK_H,
              fontSize: 10,
              background: snapped ? `${theme.bg}f0` : theme.bg,
              border: `2px solid ${snapped ? "#e0e7ff" : theme.border}`,
              color: applyRainbow ? undefined : snapped ? "#fff" : theme.color,
              cursor: isDragged ? "grabbing" : "grab",
              boxShadow: snapped
                ? "0 0 16px #c4b5fd, 0 0 32px #a78bfa66"
                : isDragged
                  ? "0 8px 24px #000c"
                  : "0 2px 8px #0008",
              transform: isDragged ? "scale(1.1) rotate(-1.5deg)" : snapped ? "scale(1.05)" : "scale(1)",
              transition: isDragged ? "none" : "transform 0.12s, box-shadow 0.12s, border-color 0.12s",
              zIndex: isDragged ? 50 : snapped ? 25 : 20,
              userSelect: "none",
            }}
          >
            <span className={applyRainbow ? "rainbow-label" : ""}>{block.label}</span>
            {snapped && (
              <div
                className="absolute inset-0 rounded-sm pointer-events-none"
                style={{
                  background: "linear-gradient(135deg,#ffffff22 0%,transparent 60%)",
                  animation: "neonPulse 1.5s ease-in-out infinite",
                }}
              />
            )}
          </div>
        );
      })}

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: p.x - 3,
            top: p.y - 3,
            width: 6,
            height: 6,
            background: `hsl(${(p.id * 53) % 360},90%,70%)`,
            opacity: p.life,
            transform: `scale(${p.life})`,
            zIndex: 40,
          }}
        />
      ))}

      <style>{`
        @keyframes neonPulse   { 0%,100%{opacity:.3} 50%{opacity:.9} }
        @keyframes fadeIn      { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
        @keyframes kiwiFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-28px)} }
        @keyframes orbitStar   { from{transform:rotate(var(--r,0deg)) translateX(92px)}
                                  to{transform:rotate(calc(var(--r,0deg)+360deg)) translateX(92px)} }
        .rainbow-label {
          background: linear-gradient(90deg,#f00,#ff7700,#ffee00,#00cc44,#0066ff,#8b00ff,#f00);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rainbowMove 1.6s linear infinite;
        }
        @keyframes rainbowMove { from{background-position:0% center} to{background-position:200% center} }
      `}</style>
    </div>
  );
}
