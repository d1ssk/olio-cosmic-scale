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
    (Math.max(1, availableWidthPx) * config.mainBarFraction) / config.minSmallBarPx,
  );
  const preferredMaxRatio =
    [...config.preferredStepRatios]
      .filter((ratio) => ratio > 1 && ratio <= maxVisualRatio)
      .sort((a, b) => b - a)[0] ?? maxVisualRatio;

  const anchors = [...milestones]
    .filter((value) => value > fromMeters && value < toMeters)
    .sort((a, b) => a - b)
    .filter((value, index, values) => index === 0 || value !== values[index - 1]);
  anchors.push(toMeters);

  const steps: BridgeStep[] = [];
  let current = fromMeters;

  for (const anchor of anchors) {
    while (anchor / current > maxVisualRatio) {
      const limit = Math.min(anchor, current * preferredMaxRatio);
      let next = largestNiceValueAtOrBelow(limit, current);
      if (next <= current) next = Math.min(anchor, current * maxVisualRatio);
      steps.push({ fromMeters: current, toMeters: next });
      current = next;
    }
    if (anchor > current) {
      steps.push({ fromMeters: current, toMeters: anchor });
      current = anchor;
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

function largestNiceValueAtOrBelow(limit: number, greaterThan: number): number {
  const exponent = Math.floor(Math.log10(limit));
  let best = greaterThan;

  for (let power = exponent - 2; power <= exponent; power += 1) {
    for (const coefficient of [1, 2, 5]) {
      const candidate = coefficient * 10 ** power;
      if (candidate > greaterThan && candidate <= limit) best = Math.max(best, candidate);
    }
  }

  return best;
}

function assertPositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be finite and positive.`);
  }
}
