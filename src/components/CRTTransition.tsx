import type { Phase } from "../types";

interface Props {
  phase: Phase;
  accent: string;
  showReveal?: boolean;
}

const CRT_KEYFRAMES = `
@keyframes crtFadeIn {
  0%   { opacity: 0; }
  40%  { opacity: 1; }
  100% { opacity: 1; }
}
@keyframes crtFadeOut {
  0%   { opacity: 0; }
  20%  { opacity: 1; }
  100% { opacity: 1; }
}
@keyframes crtReveal {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes crtScanIn {
  0%   { top: 50%; height: 3px;    opacity: 1; }
  60%  { top: 0%;  height: 100vh;  opacity: 0.6; }
  100% { top: 0%;  height: 100vh;  opacity: 0; }
}
@keyframes crtScanOut {
  0%   { top: 50%; height: 100vh;  opacity: 0.3; }
  80%  { top: 50%; height: 3px;    opacity: 1; }
  100% { top: 50%; height: 3px;    opacity: 0; }
}
`;

export default function CRTTransition({ phase, accent, showReveal }: Props) {
  if (phase !== "transition-in" && phase !== "transition-out" && !showReveal)
    return null;

  if (showReveal && phase !== "transition-in" && phase !== "transition-out") {
    return (
      <>
        <div
          className="fixed inset-0 z-50 pointer-events-none"
          style={{
            background: "#000",
            animation: "crtReveal 0.6s ease-in-out forwards",
          }}
        />
        <style>{CRT_KEYFRAMES}</style>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "#000",
            animation:
              phase === "transition-in"
                ? "crtFadeIn 0.6s ease-in-out forwards"
                : "crtFadeOut 0.5s ease-in-out forwards",
          }}
        />
        {/* Scan line */}
        <div
          className="absolute left-0 right-0"
          style={{
            height: "3px",
            background: accent,
            boxShadow: `0 0 20px ${accent}, 0 0 40px ${accent}88`,
            animation:
              phase === "transition-in"
                ? "crtScanIn 0.6s ease-in-out forwards"
                : "crtScanOut 0.5s ease-in-out forwards",
          }}
        />
      </div>
      <style>{CRT_KEYFRAMES}</style>
    </>
  );
}
