import { describe, expect, it } from "vitest";
import { OrthographicCamera, Vector3 } from "three";
import { sceneRegistry } from "../src/app/sceneRegistry";
import { KILOPARSEC_METERS, PARSEC_METERS } from "../src/physics/constants";
import {
  DISK_THICKNESS_METERS,
  GALAXY_DISPLAY,
  MILKY_WAY_BRIDGE_VALUES,
  MILKY_WAY_COMPARISON_METERS,
  MILKY_WAY_DIAMETER_METERS,
  MILKY_WAY_SOURCES,
} from "../src/scenes/milky-way/milkyWayData";
import {
  galacticPosition,
  milkyWayModel,
  milkyWayRulers,
} from "../src/scenes/milky-way/milkyWayModel";

describe("Milky Way physical and display contracts", () => {
  it("retains the sourced solar distance and explicit SI normalization", () => {
    const model = milkyWayModel();
    expect(model.sun).toEqual([(8178 * PARSEC_METERS) / KILOPARSEC_METERS, 0, 0]);
    expect(galacticPosition([2, 4, -6], 2)).toEqual([2 / 2, 2, -3]);
    expect(model.center).toEqual([0, 0, 0]);
    expect(MILKY_WAY_SOURCES).toHaveLength(2);
  });
  it("samples deterministically without exaggerating physical disk thickness or diameter", () => {
    const a = milkyWayModel();
    expect(a.positions).toEqual(milkyWayModel().positions);
    expect(a.positions.length / 3).toBe(GALAXY_DISPLAY.diskSamples + GALAXY_DISPLAY.bulgeSamples);
    for (let i = 0; i < GALAXY_DISPLAY.diskSamples * 3; i += 3) {
      expect(Math.hypot(a.positions[i], a.positions[i + 2])).toBeLessThanOrEqual(
        MILKY_WAY_DIAMETER_METERS / KILOPARSEC_METERS / 2 + 1e-6,
      );
      expect(Math.abs(a.positions[i + 1])).toBeLessThanOrEqual(
        DISK_THICKNESS_METERS / KILOPARSEC_METERS / 2 + 1e-6,
      );
    }
  });
  it("has one standalone bridge with its final comparison inside the galaxy", () => {
    expect(MILKY_WAY_BRIDGE_VALUES).toHaveLength(2);
    expect(MILKY_WAY_BRIDGE_VALUES[0]).toBe(
      sceneRegistry["solar-neighborhood"].referenceLengthMeters,
    );
    expect(MILKY_WAY_BRIDGE_VALUES[1]).toBe(MILKY_WAY_COMPARISON_METERS);
    expect(MILKY_WAY_COMPARISON_METERS / MILKY_WAY_BRIDGE_VALUES[0]).toBeLessThanOrEqual(200);
    expect(MILKY_WAY_DIAMETER_METERS / MILKY_WAY_COMPARISON_METERS).toBeLessThanOrEqual(200);
  });
  it("keeps real-length rulers horizontal in the foreground Galactic plane at reset", () => {
    const scene = sceneRegistry["milky-way"];
    const camera = new OrthographicCamera(-20, 20, 20, -20, 0.01, 2000);
    camera.position.fromArray(scene.camera.position);
    camera.lookAt(new Vector3(...scene.camera.target));
    camera.updateMatrixWorld();
    const rulers = milkyWayRulers(scene);
    rulers.forEach((ruler, i) => {
      const length = i === 0 ? scene.referenceLengthMeters : MILKY_WAY_COMPARISON_METERS;
      const start = new Vector3(...ruler.base);
      const end = start
        .clone()
        .addScaledVector(new Vector3(...ruler.direction), length / scene.metersPerSceneUnit);
      expect((start.distanceTo(end) * scene.metersPerSceneUnit) / length).toBeCloseTo(1, 12);
      expect(start.y).toBe(0);
      expect(start.z).toBeGreaterThan(15);
      start.project(camera);
      end.project(camera);
      expect(start.y).toBeCloseTo(end.y, 12);
      expect(start.y).toBeLessThan(0);
      expect(Math.abs(start.x)).toBeLessThan(1);
      expect(Math.abs(start.y)).toBeLessThan(1);
    });
  });
});
