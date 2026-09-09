import type { SceneId } from "../scenes/types";

export type BridgeConfig = {
  mainBarFraction: number;
  minSmallBarPx: number;
  preferredStepRatios: readonly number[];
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
  mainBarFraction: 0.6,
  minSmallBarPx: 10,
  preferredStepRatios: [10, 20, 50, 100],
};
