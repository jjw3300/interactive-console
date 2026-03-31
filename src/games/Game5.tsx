import React from "react";

export default function Game5() {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-6"
      style={{ background: "radial-gradient(ellipse at center, #020e08 0%, #010608 100%)" }}
    >
      <p className="text-[10px] tracking-[0.4em]" style={{ color: "#05966988" }}>● PATH FINDER</p>
      <h1 className="text-5xl font-black tracking-widest" style={{ color: "#34d399", textShadow: "0 0 30px #05966966" }}>
        MAZE
      </h1>
      <div
        className="mt-4 px-8 py-4 rounded border text-xs tracking-widest"
        style={{ borderColor: "#05966944", color: "#05966988", background: "#05966911" }}
      >
        COMING SOON
      </div>
      {/* Grid decoration */}
      <div
        className="w-48 h-48 opacity-20"
        style={{
          backgroundImage: "linear-gradient(#34d399 1px, transparent 1px), linear-gradient(90deg, #34d399 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />
    </div>
  );
}
