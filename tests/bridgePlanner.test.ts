import { describe, expect, it } from "vitest";
import { planBridge, reverseBridgePlan } from "../src/bridges/bridgePlanner";
import { AU_METERS, PARSEC_METERS } from "../src/physics/constants";

describe("bridge planner", () => {
  it("adds legible intermediate frames for a very large ratio", () => {
    const plan = planBridge({
      fromSceneId: "human",
      toSceneId: "earth",
      fromMeters: 1.7,
      toMeters: 12_742_000,
      availableWidthPx: 1_000,
    });

    expect(plan.steps.length).toBeGreaterThan(1);
    for (const step of plan.steps) {
      expect(step.toMeters / step.fromMeters).toBeLessThanOrEqual(60);
    }
  });

  it("does not add an artificial step for a modest ratio", () => {
    const plan = planBridge({
      fromSceneId: "local-group",
      toSceneId: "virgo",
      fromMeters: 3,
      toMeters: 16.5,
      availableWidthPx: 600,
    });
    expect(plan.steps).toEqual([{ fromMeters: 3, toMeters: 16.5 }]);
  });

  it("retains pedagogical manual milestones", () => {
    const milestone = PARSEC_METERS;
    const plan = planBridge({
      fromSceneId: "solar-system",
      toSceneId: "solar-neighborhood",
      fromMeters: 100 * AU_METERS,
      toMeters: 10 * PARSEC_METERS,
      availableWidthPx: 900,
      milestones: [10_000 * AU_METERS, milestone],
    });
    expect(plan.steps.some((step) => step.toMeters === milestone)).toBe(true);
  });

  it("reverses the exact forward sequence", () => {
    const plan = planBridge({
      fromSceneId: "human",
      toSceneId: "earth",
      fromMeters: 1.7,
      toMeters: 12_742_000,
      availableWidthPx: 800,
    });
    const reversed = reverseBridgePlan(plan);

    expect(reversed.steps).toEqual(
      [...plan.steps]
        .reverse()
        .map((step) => ({ fromMeters: step.toMeters, toMeters: step.fromMeters })),
    );
    expect(reverseBridgePlan(reversed)).toEqual(plan);
  });
});
