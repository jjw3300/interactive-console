import React from "react";
import type { CartridgeData } from "../types";
import Game1 from "../games/Game1";
import Game2 from "../games/Game2";
import Game3 from "../games/Game3";
import Game4 from "../games/Game4";
import Game5 from "../games/Game5";
import Game6 from "../games/Game6";

export const CARTRIDGE_LIST: CartridgeData[] = [
  {
    id: "1",
    title: "BIT DRUM",
    subtitle: "RHYTHM MACHINE",
    accent: "#ef4444",
    body: "#dc2626",
    dark: "#991b1b",
  },
  {
    id: "2",
    title: "PIXEL ART",
    subtitle: "CANVAS PAINTER",
    accent: "#fb7185",
    body: "#f43f5e",
    dark: "#be123c",
  },
  {
    id: "3",
    title: "GRAVITY",
    subtitle: "PHYSICS ENGINE",
    accent: "#a78bfa",
    body: "#7c3aed",
    dark: "#4c1d95",
  },
  {
    id: "4",
    title: "SYNTH",
    subtitle: "AUDIO VISUALIZER",
    accent: "#60a5fa",
    body: "#2563eb",
    dark: "#1e3a8a",
  },
  {
    id: "5",
    title: "MAZE",
    subtitle: "PATH FINDER",
    accent: "#34d399",
    body: "#059669",
    dark: "#064e3b",
  },
  {
    id: "6",
    title: "SNAKE",
    subtitle: "ARCADE CLASSIC",
    accent: "#fbbf24",
    body: "#d97706",
    dark: "#78350f",
  },
];

export const GAME_COMPONENTS: Record<string, React.FC> = {
  "1": Game1,
  "2": Game2,
  "3": Game3,
  "4": Game4,
  "5": Game5,
  "6": Game6,
};
