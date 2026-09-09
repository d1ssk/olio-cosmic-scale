import { createContext } from "react";

export type BarKind = "reference" | "comparison";
export const BarVisibilityContext = createContext<{
  hidden: boolean;
  only: BarKind | "none" | null;
}>({ hidden: false, only: null });
