export default function Game4() {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-6"
      style={{
        background:
          "radial-gradient(ellipse at center, #020818 0%, #01040e 100%)",
      }}
    >
      <p
        className="text-[10px] tracking-[0.4em]"
        style={{ color: "#2563eb88" }}
      >
        ● AUDIO VISUALIZER
      </p>
      <h1
        className="text-5xl font-black tracking-widest"
        style={{ color: "#60a5fa", textShadow: "0 0 30px #2563eb66" }}
      >
        SYNTH
      </h1>
      <div
        className="mt-4 px-8 py-4 rounded border text-xs tracking-widest"
        style={{
          borderColor: "#2563eb44",
          color: "#2563eb88",
          background: "#2563eb11",
        }}
      >
        COMING SOON
      </div>
      {/* Waveform decoration */}
      <div className="flex items-center gap-1 h-16">
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            className="w-2 rounded-full animate-pulse"
            style={{
              background: "#60a5fa",
              height: `${20 + Math.abs(Math.sin(i * 0.5)) * 40}px`,
              opacity: 0.4 + Math.abs(Math.sin(i * 0.3)) * 0.5,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
