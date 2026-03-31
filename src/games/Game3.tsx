export default function Game3() {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-6"
      style={{
        background:
          "radial-gradient(ellipse at center, #0a0a1a 0%, #060610 100%)",
      }}
    >
      <p
        className="text-[10px] tracking-[0.4em]"
        style={{ color: "#7c3aed88" }}
      >
        ● PHYSICS ENGINE
      </p>
      <h1
        className="text-5xl font-black tracking-widest"
        style={{ color: "#a78bfa", textShadow: "0 0 30px #7c3aed66" }}
      >
        GRAVITY
      </h1>
      <div
        className="mt-4 px-8 py-4 rounded border text-xs tracking-widest"
        style={{
          borderColor: "#7c3aed44",
          color: "#7c3aed88",
          background: "#7c3aed11",
        }}
      >
        COMING SOON
      </div>
      {/* Floating particles decoration */}
      <div className="relative w-64 h-32">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-bounce"
            style={{
              left: `${(i * 23) % 100}%`,
              top: `${(i * 37) % 100}%`,
              background: "#a78bfa",
              opacity: 0.3 + (i % 4) * 0.15,
              animationDelay: `${i * 0.15}s`,
              animationDuration: `${1.2 + (i % 3) * 0.4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
