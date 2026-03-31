export interface CartridgeData {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  body: string;
  dark: string;
}

export type Phase =
  | "browse"
  | "loading"
  | "transition-in"
  | "playing"
  | "transition-out";
