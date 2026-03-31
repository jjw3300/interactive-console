import type { CartridgeData } from "../types";

interface Props {
  cartridge: CartridgeData;
}

export default function CartridgeCard({ cartridge }: Props) {
  return (
    <div
      className="w-full h-full relative flex flex-col"
      style={{ fontFamily: "'Arial Black', sans-serif" }}
    >
      {/* Top notch */}
      <div
        className="absolute -top-px left-1/2 -translate-x-1/2 w-16 h-2 rounded-b-lg z-10"
        style={{ background: cartridge.dark }}
      />

      {/* Left grip ridges */}
      <div className="absolute left-0 top-10 bottom-10 w-2 flex flex-col justify-around">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-r-sm"
            style={{ background: cartridge.dark, opacity: 0.6 }}
          />
        ))}
      </div>

      {/* Right grip ridges */}
      <div className="absolute right-0 top-10 bottom-10 w-2 flex flex-col justify-around">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-l-sm"
            style={{ background: cartridge.dark, opacity: 0.6 }}
          />
        ))}
      </div>

      {/* Label */}
      <div
        className="mx-4 mt-4 rounded-md overflow-hidden shadow-inner border border-black/20"
        style={{ background: "#fffef7", flex: "0 0 auto" }}
      >
        <div
          className="h-2"
          style={{
            background: `linear-gradient(90deg, ${cartridge.dark}, ${cartridge.accent}, ${cartridge.dark})`,
          }}
        />
        <div className="px-3 py-2">
          <div className="flex items-center gap-1 mb-1">
            <div
              className="w-4 h-4 rounded-sm border border-black/20 flex items-center justify-center"
              style={{ background: cartridge.accent }}
            >
              <div className="w-2 h-2 bg-white/80 rounded-sm" />
            </div>
            <span
              className="text-[7px] font-bold tracking-widest"
              style={{ color: cartridge.dark }}
            >
              RETRO PLAY
            </span>
          </div>
          <h2
            className="text-xl font-black leading-none tracking-tighter"
            style={{ color: "#1a1a1a" }}
          >
            {cartridge.title}
          </h2>
          <p
            className="text-[9px] font-bold tracking-[0.2em] mt-0.5"
            style={{ color: cartridge.dark }}
          >
            {cartridge.subtitle}
          </p>
          {/* Barcode */}
          <div className="flex gap-px mt-2 h-4">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  background: cartridge.dark,
                  opacity: [1, 0.4, 0.7, 0.3, 1, 0.5, 0.8, 0.2][i % 8],
                }}
              />
            ))}
          </div>
          <p
            className="text-[6px] text-center mt-0.5 font-mono"
            style={{ color: "#888" }}
          >
            {`ID-${cartridge.id}00${cartridge.id}${cartridge.id}7`}
          </p>
        </div>
        <div
          className="h-1"
          style={{
            background: `linear-gradient(90deg, ${cartridge.dark}, ${cartridge.accent}, ${cartridge.dark})`,
          }}
        />
      </div>

      {/* Body texture */}
      <div
        className="mx-3 mt-2 flex-1 rounded-sm opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)",
        }}
      />

      {/* Connector teeth */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.75 px-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-4 rounded-b-sm border-x border-b border-black/40"
            style={{
              background: "linear-gradient(to bottom, #c8b89a, #a89070)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
