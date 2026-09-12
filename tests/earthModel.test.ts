import { PerspectiveCamera, Vector3 } from "three";
import {
  EARTH_COMPARISON_METERS,
  HUMAN_EARTH_BRIDGE_VALUES,
} from "../src/bridges/humanEarthBridge";
import { describe, expect, it } from "vitest";
import { sceneRegistry } from "../src/app/sceneRegistry";
import { earthSceneModel } from "../src/scenes/earth/earthModel";
import { EARTH_DIAMETER_METERS, EARTH_BAR_CLEARANCE_METERS } from "../src/scenes/earth/earthData";

describe("Earth sphere and diameter", () => {
  it("projects both polar-axis bars vertically in the default view", () => {
    const scene = sceneRegistry.earth;
    const camera = new PerspectiveCamera(45, 16 / 9, scene.camera.near, scene.camera.far);
    camera.position.fromArray(scene.camera.position);
    camera.lookAt(new Vector3(...scene.camera.target));
    camera.updateMatrixWorld();
    const model = earthSceneModel(scene.metersPerSceneUnit);
    for (const [base, length] of [
      [model.barBase, scene.referenceLengthMeters],
      [model.comparisonBarBase, EARTH_COMPARISON_METERS],
    ] as const) {
      const south = new Vector3(...base).project(camera);
      const north = new Vector3(...base)
        .add(new Vector3(0, length / scene.metersPerSceneUnit, 0))
        .project(camera);
      expect(north.x).toBeCloseTo(south.x, 12);
      expect(north.y).toBeGreaterThan(south.y);
    }
  });
  it("finishes two bridge frames with the same centered physical comparison in Earth", () => {
    expect(HUMAN_EARTH_BRIDGE_VALUES).toEqual([1.7, 340, 70_000]);
    expect(EARTH_COMPARISON_METERS).toBe(70_000);
    const units = sceneRegistry.earth.metersPerSceneUnit;
    const { barBase, comparisonBarBase } = earthSceneModel(units);
    expect(comparisonBarBase[1] + EARTH_COMPARISON_METERS / units / 2).toBe(0);
    expect(barBase[1] + EARTH_DIAMETER_METERS / units / 2).toBe(0);
    expect(
      Math.hypot(comparisonBarBase[0] - barBase[0], comparisonBarBase[2] - barBase[2]),
    ).toBeCloseTo(0.4);
  });
  it("places an axis-parallel diameter bar outside the sphere over the Pacific", () => {
    const scene = sceneRegistry.earth;
    const { radius, barBase } = earthSceneModel(scene.metersPerSceneUnit);
    expect(radius * 2 * scene.metersPerSceneUnit).toBe(EARTH_DIAMETER_METERS);
    expect(scene.referenceLengthMeters).toBe(EARTH_DIAMETER_METERS);
    expect(barBase[1]).toBe(-radius);
    expect(Math.hypot(barBase[0], barBase[2]) * scene.metersPerSceneUnit).toBeCloseTo(
      EARTH_DIAMETER_METERS / 2 + EARTH_BAR_CLEARANCE_METERS,
      6,
    );
    expect((Math.atan2(-barBase[2], barBase[0]) * 180) / Math.PI).toBeCloseTo(-150, 10);
    expect(barBase[1] + scene.referenceLengthMeters / scene.metersPerSceneUnit).toBe(radius);
    expect(scene.defaultViewportExtentMeters).toBeGreaterThan(scene.referenceLengthMeters);
  });
});
