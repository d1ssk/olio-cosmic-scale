import type { SceneId } from "../scenes/types";

export type BridgeConfig = {
  mainBarFraction: number;
  maxStepRatio: number;
  minSmallBarPx: number;
};

export type BridgeStep = {
  fromMeters: number;
  toMeters: number;
};

export type BridgePlan = {
  fromSceneId: SceneId;
  toSceneId: SceneId;
  steps: readonly BridgeStep[];
};

export const DEFAULT_BRIDGE_CONFIG: BridgeConfig = {
  mainBarFraction: 0.94,
  maxStepRatio: 200,
  minSmallBarPx: 1,
};
