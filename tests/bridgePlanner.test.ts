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
      expect(step.toMeters / step.fromMeters).toBeLessThanOrEqual(200);
    }
  });

  it.each([280, 600, 1200])("allows 1:200 in one frame at %s px", (width) => {
    const plan = planBridge({
      fromSceneId: "earth",
      toSceneId: "sun",
      fromMeters: 1,
      toMeters: 200,
      availableWidthPx: width,
    });
    expect(plan.steps).toEqual([{ fromMeters: 1, toMeters: 200 }]);
  });
  it("uses three balanced comparisons from human to Earth", () => {
    const plan = planBridge({
      fromSceneId: "human",
      toSceneId: "earth",
      fromMeters: 1.7,
      toMeters: 12742000,
      availableWidthPx: 320,
    });
    expect(plan.steps).toHaveLength(3);
    const ratios = plan.steps.map((step) => step.toMeters / step.fromMeters);
    for (const ratio of ratios) expect(ratio).toBeCloseTo(Math.cbrt(12742000 / 1.7), 10);
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

it.each([240, 800, 1440])("keeps equal ratios across arbitrary large gaps at %s px", (width) => {
  const plan = planBridge({
    fromSceneId: "solar-system",
    toSceneId: "solar-neighborhood",
    fromMeters: 100 * AU_METERS,
    toMeters: 10 * PARSEC_METERS,
    availableWidthPx: width,
  });
  const ratios = plan.steps.map((step) => step.toMeters / step.fromMeters);
  expect(Math.max(...ratios) / Math.min(...ratios)).toBeCloseTo(1, 12);
  expect(Math.max(...ratios)).toBeLessThanOrEqual(200);
  expect(plan.steps.at(-1)?.toMeters).toBe(10 * PARSEC_METERS);
});
