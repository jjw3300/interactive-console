export default function Game6() {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-6"
      style={{
        background:
          "radial-gradient(ellipse at center, #100800 0%, #080400 100%)",
      }}
    >
      <p
        className="text-[10px] tracking-[0.4em]"
        style={{ color: "#d9770688" }}
      >
        ● ARCADE CLASSIC
      </p>
      <h1
        className="text-5xl font-black tracking-widest"
        style={{ color: "#fbbf24", textShadow: "0 0 30px #d9770666" }}
      >
        SNAKE
      </h1>
      <div
        className="mt-4 px-8 py-4 rounded border text-xs tracking-widest"
        style={{
          borderColor: "#d9770644",
          color: "#d9770688",
          background: "#d9770611",
        }}
      >
        COMING SOON
      </div>
      {/* Snake body decoration */}
      <div className="flex gap-2 mt-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-sm border-2"
            style={{
              background: i === 0 ? "#fbbf24" : "#d97706",
              borderColor: "#78350f",
              opacity: 1 - i * 0.08,
            }}
          />
        ))}
        <div
          className="w-4 h-4 self-center rounded-sm"
          style={{ background: "#ef4444", marginLeft: -4 }}
        />
      </div>
    </div>
  );
}
