import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
const BLOCK_W = 82;
const BLOCK_H = 40;
const SNAP_GAP = 8;
const SNAP_DIST = 72;
const ALIGN_TOL = 10;

const VALID_RULE_KEYS = new Set<RuleKey>([
  "KIWI_IS_TEXT",
  "TEXT_IS_KIWI",
  "KIWI_IS_JELLY",
  "BG_IS_DARK",
  "TEXT_IS_RAINBOW",
  "KIWI_IS_FLOAT",
]);

// ── Helpers ────────────────────────────────────────────────────────────────
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isRightNeighbor(left: Block, right: Block) {
  const snap = BLOCK_W + SNAP_GAP;
  return (
    Math.abs(right.x - (left.x + snap)) <= ALIGN_TOL &&
    Math.abs(right.y - left.y) <= ALIGN_TOL
  );
}

function isOccupied(
  blocks: Block[],
  draggedId: string,
  tx: number,
  ty: number,
) {
  return blocks.some(
    (b) =>
      b.id !== draggedId &&
      Math.abs(b.x - tx) < BLOCK_W * 0.9 &&
      Math.abs(b.y - ty) < BLOCK_H * 0.9,
  );
}

function hasOverlap(blocks: Block[], targetId: string) {
  const target = blocks.find((b) => b.id === targetId);
  if (!target) return false;

  return blocks.some(
    (b) =>
      b.id !== targetId &&
      Math.abs(b.x - target.x) < BLOCK_W * 0.9 &&
      Math.abs(b.y - target.y) < BLOCK_H * 0.9,
  );
}

// ── Layout ────────────────────────────────────────────────────────────────
function buildBlocks(w: number, h: number): Block[] {
  const col = BLOCK_W + SNAP_GAP;
  const totalWidth = BLOCK_W * 8 + SNAP_GAP * 7;
  const sx = Math.max(8, Math.round((w - totalWidth) / 2));
  const s = (n: number) => sx + col * n;

  const row1Y = Math.round(h * 0.64);
  const row2Y = row1Y + BLOCK_H + 12;

  return [
    // Row 1
    { id: "b-kiwi1", label: "KIWI", type: "subject", x: s(0), y: row1Y },
    { id: "b-text1", label: "TEXT", type: "subject", x: s(1), y: row1Y },
    { id: "b-bg1", label: "BG", type: "subject", x: s(2), y: row1Y },
    { id: "b-is1", label: "IS", type: "verb", x: s(5), y: row1Y },
    { id: "b-is2", label: "IS", type: "verb", x: s(6), y: row1Y },
    { id: "b-is3", label: "IS", type: "verb", x: s(7), y: row1Y },

    // Row 2
    { id: "b-rainbow", label: "RAINBOW", type: "property", x: s(0), y: row2Y },
    { id: "b-jelly", label: "JELLY", type: "property", x: s(1), y: row2Y },
    { id: "b-dark", label: "DARK", type: "property", x: s(2), y: row2Y },
    { id: "b-float", label: "FLOAT", type: "property", x: s(3), y: row2Y },
    { id: "b-kiwi2", label: "KIWI", type: "property", x: s(5), y: row2Y },
    { id: "b-text2", label: "TEXT", type: "property", x: s(6), y: row2Y },
  ];
}

// ── Snap ──────────────────────────────────────────────────────────────────
function snapBlocks(blocks: Block[], draggedId: string): Block[] {
  const dragged = blocks.find((b) => b.id === draggedId);
  if (!dragged) return blocks;

  const candidates: { x: number; y: number; dist: number }[] = [];

  for (const other of blocks) {
    if (other.id === draggedId) continue;

    const positions = [
      { x: other.x + BLOCK_W + SNAP_GAP, y: other.y },
      { x: other.x - BLOCK_W - SNAP_GAP, y: other.y },
    ];

    for (const pos of positions) {
      if (isOccupied(blocks, draggedId, pos.x, pos.y)) continue;

      const dist = Math.hypot(dragged.x - pos.x, dragged.y - pos.y);
      if (dist <= SNAP_DIST) {
        candidates.push({ ...pos, dist });
      }
    }
  }

  if (candidates.length === 0) return blocks;

  candidates.sort((a, b) => a.dist - b.dist);
  const best = candidates[0];

  return blocks.map((b) =>
    b.id === draggedId ? { ...b, x: best.x, y: best.y } : b,
  );
}

// ── Rule detection ────────────────────────────────────────────────────────
function detectRules(blocks: Block[]): Set<RuleKey> {
  const rules = new Set<RuleKey>();

  const subjects = blocks.filter((b) => b.type === "subject");
  const verbs = blocks.filter((b) => b.label === "IS");
  const properties = blocks.filter((b) => b.type === "property");

  for (const subj of subjects) {
    for (const verb of verbs) {
      if (!isRightNeighbor(subj, verb)) continue;

      for (const prop of properties) {
        if (!isRightNeighbor(verb, prop)) continue;

        const key = `${subj.label}_IS_${prop.label}` as RuleKey;
        if (VALID_RULE_KEYS.has(key)) {
          rules.add(key);
        }
      }
    }
  }

  return rules;
}

// ── Highlight only grammar-relevant pairs ────────────────────────────────
function getSnappedIds(blocks: Block[]): Set<string> {
  const result = new Set<string>();

  const subjects = blocks.filter((b) => b.type === "subject");
  const verbs = blocks.filter((b) => b.label === "IS");
  const properties = blocks.filter((b) => b.type === "property");

  for (const subj of subjects) {
    for (const verb of verbs) {
      if (isRightNeighbor(subj, verb)) {
        result.add(subj.id);
        result.add(verb.id);
      }
    }
  }

  for (const verb of verbs) {
    for (const prop of properties) {
      if (isRightNeighbor(verb, prop)) {
        result.add(verb.id);
        result.add(prop.id);
      }
    }
  }

  return result;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Game1() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const ballsRef = useRef<Matter.Body[]>([]);
  const jellyRef = useRef<number | null>(null);
  const textBallsRef = useRef(false);
  const particleIdRef = useRef(0);
  const blocksRef = useRef<Block[]>([]);

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [rules, setRules] = useState<Set<RuleKey>>(new Set());
  const [dragging, setDragging] = useState<{
    id: string;
    ox: number;
    oy: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; vx: number; vy: number; life: number }[]
  >([]);
  const [jellyPhase, setJellyPhase] = useState(0);

  const snappedIds = useMemo(() => getSnappedIds(blocks), [blocks]);

  // ── Initial layout ──────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId = 0;

    const measureAndInit = () => {
      const { clientWidth: w, clientHeight: h } = el;
      if (w <= 0 || h <= 0) return;
      if (blocksRef.current.length > 0) return;

      const initial = buildBlocks(w, h);
      blocksRef.current = initial;
      setBlocks(initial);
      setRules(detectRules(initial));
    };

    rafId = window.requestAnimationFrame(measureAndInit);

    const ro = new ResizeObserver(() => {
      if (blocksRef.current.length === 0) {
        measureAndInit();
      }
    });

    ro.observe(el);

    return () => {
      window.cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // ── Matter.js setup ─────────────────────────────────────────────────────
  useEffect(() => {
    const { Engine, Render, Runner, Bodies, Composite, World } = Matter;
    const canvas = canvasRef.current;
    const el = containerRef.current;
    if (!canvas || !el) return;

    const w = el.clientWidth || 900;
    const h = el.clientHeight || 600;

    canvas.width = w;
    canvas.height = h;

    const engine = Engine.create({ gravity: { x: 0, y: 1 } });
    engineRef.current = engine;

    const render = Render.create({
      canvas,
      engine,
      options: {
        width: w,
        height: h,
        wireframes: false,
        background: "transparent",
      },
    });

    Composite.add(engine.world, [
      Bodies.rectangle(w / 2, h + 25, w * 2, 50, {
        isStatic: true,
        render: { fillStyle: "transparent" },
      }),
      Bodies.rectangle(-25, h / 2, 50, h * 2, {
        isStatic: true,
        render: { fillStyle: "transparent" },
      }),
      Bodies.rectangle(w + 25, h / 2, 50, h * 2, {
        isStatic: true,
        render: { fillStyle: "transparent" },
      }),
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

  useEffect(() => {
    return () => {
      if (jellyRef.current !== null) {
        window.clearInterval(jellyRef.current);
      }
    };
  }, []);

  // ── Spawn TEXT→KIWI balls ───────────────────────────────────────────────
  const spawnTextBalls = useCallback(() => {
    const engine = engineRef.current;
    const canvas = canvasRef.current;
    if (!engine || !canvas) return;

    const { Bodies, Composite } = Matter;
    const w = canvas.width || 900;
    const palette = ["#a78bfa", "#818cf8", "#c4b5fd", "#7c3aed", "#6d28d9"];

    const balls = Array.from({ length: 40 }, (_, i) =>
      Bodies.circle(
        80 + Math.random() * Math.max(40, w - 160),
        -20 - i * 16,
        6 + Math.random() * 8,
        {
          restitution: 0.65,
          friction: 0.08,
          render: {
            fillStyle: palette[i % palette.length],
            strokeStyle: "#c4b5fd",
            lineWidth: 1,
          },
        },
      ),
    );

    Composite.add(engine.world, balls);
    ballsRef.current = balls;
  }, []);

  // ── Rule side-effects ───────────────────────────────────────────────────
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    // KIWI IS FLOAT
    engine.gravity.y = rules.has("KIWI_IS_FLOAT") ? 0 : 1;
    engine.gravity.x = 0;

    // TEXT IS KIWI
    if (rules.has("TEXT_IS_KIWI") && !textBallsRef.current) {
      textBallsRef.current = true;
      spawnTextBalls();
    } else if (!rules.has("TEXT_IS_KIWI") && textBallsRef.current) {
      textBallsRef.current = false;
      ballsRef.current.forEach((b) => Matter.Composite.remove(engine.world, b));
      ballsRef.current = [];
    }

    // KIWI IS JELLY
    if (rules.has("KIWI_IS_JELLY")) {
      if (jellyRef.current === null) {
        jellyRef.current = window.setInterval(() => {
          setJellyPhase((p) => p + 0.12);
        }, 16);
      }
    } else {
      if (jellyRef.current !== null) {
        window.clearInterval(jellyRef.current);
        jellyRef.current = null;
      }
    }
  }, [rules, spawnTextBalls]);

  // ── Particles ────────────────────────────────────────────────────────────
  const emitParticles = useCallback((x: number, y: number) => {
    setParticles((prev) => [
      ...prev,
      ...Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        return {
          id: particleIdRef.current++,
          x,
          y,
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
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15,
            life: p.life - 0.034,
          }))
          .filter((p) => p.life > 0),
      );
    });

    return () => cancelAnimationFrame(id);
  }, [particles]);

  // ── Drag ────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();

    const rect = containerRef.current?.getBoundingClientRect();
    const block = blocksRef.current.find((b) => b.id === id);
    if (!rect || !block) return;

    setDragging({
      id,
      ox: e.clientX - rect.left - block.x,
      oy: e.clientY - rect.top - block.y,
      startX: block.x,
      startY: block.y,
    });
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const maxX = Math.max(0, rect.width - BLOCK_W);
      const maxY = Math.max(0, rect.height - BLOCK_H);

      const nextX = clamp(e.clientX - rect.left - dragging.ox, 0, maxX);
      const nextY = clamp(e.clientY - rect.top - dragging.oy, 0, maxY);

      setBlocks((prev) => {
        const next = prev.map((b) =>
          b.id === dragging.id ? { ...b, x: nextX, y: nextY } : b,
        );
        blocksRef.current = next;
        return next;
      });
    },
    [dragging],
  );

  const onMouseUp = useCallback(() => {
    if (!dragging) return;

    const dragId = dragging.id;

    let next = snapBlocks(blocksRef.current, dragId);

    if (hasOverlap(next, dragId)) {
      next = next.map((b) =>
        b.id === dragId ? { ...b, x: dragging.startX, y: dragging.startY } : b,
      );
    }

    const nextRules = detectRules(next);
    const nextSnappedIds = getSnappedIds(next);
    const jellyWillStart =
      nextRules.has("KIWI_IS_JELLY") && !rules.has("KIWI_IS_JELLY");

    blocksRef.current = next;
    setBlocks(next);

    if (jellyWillStart) {
      setJellyPhase(0);
    }

    setRules(nextRules);
    setDragging(null);

    if (nextSnappedIds.has(dragId)) {
      const b = next.find((bl) => bl.id === dragId);
      if (b) {
        emitParticles(b.x + BLOCK_W / 2, b.y + BLOCK_H / 2);
      }
    }
  }, [dragging, emitParticles, rules]);

  const onTouchStart = useCallback((e: React.TouchEvent, id: string) => {
    e.preventDefault();

    const rect = containerRef.current?.getBoundingClientRect();
    const t = e.touches[0];
    const block = blocksRef.current.find((b) => b.id === id);
    if (!rect || !t || !block) return;

    setDragging({
      id,
      ox: t.clientX - rect.left - block.x,
      oy: t.clientY - rect.top - block.y,
      startX: block.x,
      startY: block.y,
    });
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!dragging) return;

      e.preventDefault();

      const rect = containerRef.current?.getBoundingClientRect();
      const t = e.touches[0];
      if (!rect || !t) return;

      const maxX = Math.max(0, rect.width - BLOCK_W);
      const maxY = Math.max(0, rect.height - BLOCK_H);

      const nextX = clamp(t.clientX - rect.left - dragging.ox, 0, maxX);
      const nextY = clamp(t.clientY - rect.top - dragging.oy, 0, maxY);

      setBlocks((prev) => {
        const next = prev.map((b) =>
          b.id === dragging.id ? { ...b, x: nextX, y: nextY } : b,
        );
        blocksRef.current = next;
        return next;
      });
    },
    [dragging],
  );

  // ── Block theme ─────────────────────────────────────────────────────────
  const blockTheme = (b: Block) => {
    if (b.type === "subject") {
      return { bg: "#312e81", border: "#818cf8", color: "#e0e7ff" };
    }
    if (b.label === "IS") {
      return { bg: "#1e3a8a", border: "#60a5fa", color: "#bfdbfe" };
    }
    return { bg: "#1c1917", border: "#a78bfa", color: "#ede9fe" };
  };

  // ── Derived flags ───────────────────────────────────────────────────────
  const isDark = rules.has("BG_IS_DARK");
  const isRainbow = rules.has("TEXT_IS_RAINBOW");
  const isFloat = rules.has("KIWI_IS_FLOAT");
  const isText = rules.has("KIWI_IS_TEXT");
  const isJelly = rules.has("KIWI_IS_JELLY");

  // ── Jelly polygon ───────────────────────────────────────────────────────
  const jellyPoints = isJelly
    ? Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2;
        const wobble =
          Math.sin(a * 3 + jellyPhase) * 10 +
          Math.sin(a * 5 + jellyPhase * 1.3) * 6;
        return `${Math.cos(a) * (76 + wobble)},${Math.sin(a) * (76 + wobble)}`;
      }).join(" ")
    : "";

  // ── Render ──────────────────────────────────────────────────────────────
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
        touchAction: "none",
      }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
      onTouchCancel={onMouseUp}
    >
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)",
        }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: rules.has("TEXT_IS_KIWI") ? 1 : 0,
          transition: "opacity 0.4s",
          zIndex: 10,
        }}
      />

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
              animation: isFloat
                ? "kiwiFloat 2.4s ease-in-out infinite"
                : "none",
            }}
          >
            {isJelly && (
              <svg
                viewBox="-100 -100 200 200"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                }}
              >
                <polygon
                  points={jellyPoints}
                  fill="#7c3aed44"
                  stroke="#a78bfa"
                  strokeWidth="2.5"
                />
              </svg>
            )}

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
                transition:
                  "background 0.4s, box-shadow 0.4s, border-color 0.4s",
              }}
            >
              KIWI
            </div>

            {isFloat &&
              [0, 60, 120, 180, 240, 300].map((deg) => (
                <div
                  key={deg}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    marginLeft: -3,
                    marginTop: -3,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#a5b4fc",
                    boxShadow: "0 0 8px #818cf8",
                    ["--r" as any]: `${deg}deg`,
                    animation: "orbitStar 3s linear infinite",
                  }}
                />
              ))}
          </div>
        ) : (
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
            <p
              className="text-xs leading-relaxed text-center"
              style={{ color: "#c4b5fd" }}
            >
              프론트엔드 개발자
              <br />
              React · TypeScript
              <br />
              Matter.js · Three.js
              <br />
              <span style={{ color: "#818cf8", fontSize: "0.65rem" }}>
                UI ENGINEER
              </span>
            </p>
          </div>
        )}
      </div>

      {blocks.map((block) => {
        const theme = blockTheme(block);
        const snapped = snappedIds.has(block.id);
        const isDragged = dragging?.id === block.id;
        const applyRainbow = isRainbow && block.type !== "verb";

        return (
          <div
            key={block.id}
            onMouseDown={(e) => onMouseDown(e, block.id)}
            onTouchStart={(e) => onTouchStart(e, block.id)}
            className="absolute flex items-center justify-center font-black rounded-sm"
            style={{
              left: block.x,
              top: block.y,
              width: BLOCK_W,
              height: BLOCK_H,
              fontSize: block.label.length >= 7 ? 9 : 10,
              background: snapped ? `${theme.bg}f0` : theme.bg,
              border: `2px solid ${snapped ? "#e0e7ff" : theme.border}`,
              color: applyRainbow ? undefined : snapped ? "#fff" : theme.color,
              cursor: isDragged ? "grabbing" : "grab",
              boxShadow: snapped
                ? "0 0 16px #c4b5fd, 0 0 32px #a78bfa66"
                : isDragged
                  ? "0 8px 24px #000c"
                  : "0 2px 8px #0008",
              transform: isDragged
                ? "scale(1.06)"
                : snapped
                  ? "scale(1.03)"
                  : "scale(1)",
              transition: isDragged
                ? "none"
                : "transform 0.12s, box-shadow 0.12s, border-color 0.12s",
              zIndex: isDragged ? 50 : snapped ? 25 : 20,
              userSelect: "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              padding: "0 6px",
              touchAction: "none",
              letterSpacing: "0.08em",
              lineHeight: 1,
            }}
          >
            <span className={applyRainbow ? "rainbow-label" : ""}>
              {block.label}
            </span>

            {snapped && (
              <div
                className="absolute inset-0 rounded-sm pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, #ffffff22 0%, transparent 60%)",
                  animation: "neonPulse 1.5s ease-in-out infinite",
                }}
              />
            )}
          </div>
        );
      })}

      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: p.x - 3,
            top: p.y - 3,
            width: 6,
            height: 6,
            background: `hsl(${(p.id * 53) % 360}, 90%, 70%)`,
            opacity: p.life,
            transform: `scale(${p.life})`,
            zIndex: 40,
          }}
        />
      ))}

      <style>{`
        @keyframes neonPulse {
          0%, 100% { opacity: .3; }
          50% { opacity: .9; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(.88); }
          to   { opacity: 1; transform: scale(1); }
        }

        @keyframes kiwiFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-28px); }
        }

        @keyframes orbitStar {
          from { transform: rotate(var(--r, 0deg)) translateX(92px); }
          to   { transform: rotate(calc(var(--r, 0deg) + 360deg)) translateX(92px); }
        }

        .rainbow-label {
          background: linear-gradient(
            90deg,
            #f00,
            #ff7700,
            #ffee00,
            #00cc44,
            #0066ff,
            #8b00ff,
            #f00
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rainbowMove 1.6s linear infinite;
        }

        @keyframes rainbowMove {
          from { background-position: 0% center; }
          to   { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
