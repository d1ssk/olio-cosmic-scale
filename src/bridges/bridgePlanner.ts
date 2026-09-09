import type { SceneId } from "../scenes/types";
import {
  DEFAULT_BRIDGE_CONFIG,
  type BridgeConfig,
  type BridgePlan,
  type BridgeStep,
} from "./bridgeTypes";

type PlanBridgeOptions = {
  fromSceneId: SceneId;
  toSceneId: SceneId;
  fromMeters: number;
  toMeters: number;
  availableWidthPx: number;
  milestones?: readonly number[];
  config?: BridgeConfig;
};

export function planBridge({
  fromSceneId,
  toSceneId,
  fromMeters,
  toMeters,
  availableWidthPx,
  milestones = [],
  config = DEFAULT_BRIDGE_CONFIG,
}: PlanBridgeOptions): BridgePlan {
  assertPositive(fromMeters, "fromMeters");
  assertPositive(toMeters, "toMeters");
  if (fromMeters >= toMeters) {
    throw new RangeError("Canonical bridge plans must run from the smaller to the larger scale.");
  }

  const maxVisualRatio = Math.max(
    2,
    Math.min(
      config.maxStepRatio,
      (Math.max(1, availableWidthPx) * config.mainBarFraction) / config.minSmallBarPx,
    ),
  );
  const anchors = [...milestones]
    .filter((value) => value > fromMeters && value < toMeters)
    .sort((a, b) => a - b)
    .filter((value, index, values) => index === 0 || value !== values[index - 1]);
  anchors.push(toMeters);

  const steps: BridgeStep[] = [];
  let current = fromMeters;

  for (const anchor of anchors) {
    const start = current;
    const logRatio = Math.log(anchor) - Math.log(start);
    const count = Math.max(1, Math.ceil(logRatio / Math.log(maxVisualRatio) - 1e-12));
    for (let step = 1; step <= count; step += 1) {
      const next = step === count ? anchor : start * Math.exp((logRatio * step) / count);
      steps.push({ fromMeters: current, toMeters: next });
      current = next;
    }
  }

  return { fromSceneId, toSceneId, steps };
}

export function reverseBridgePlan(plan: BridgePlan): BridgePlan {
  return {
    fromSceneId: plan.toSceneId,
    toSceneId: plan.fromSceneId,
    steps: [...plan.steps]
      .reverse()
      .map(({ fromMeters, toMeters }) => ({ fromMeters: toMeters, toMeters: fromMeters })),
  };
}

function assertPositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be finite and positive.`);
  }
}
