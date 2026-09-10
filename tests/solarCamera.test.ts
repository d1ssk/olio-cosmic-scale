import { describe, it, expect } from "vitest";
import { Box3, OrthographicCamera, Vector3 } from "three";
import {
  fitSolarDepth,
  focusDepth,
  closeupRulerOpacity,
} from "../src/scenes/solar-system/solarCamera";
import { earthSunModel } from "../src/scenes/earth-sun/earthSunModel";
import { SOLAR_METERS_PER_UNIT } from "../src/scenes/solar-system/solarScale";

describe("solar local camera", () => {
  it("moves the pivot to the object's depth without changing screen positions or scale", () => {
    const camera = new OrthographicCamera(-5, 5, 5, -5, 0.01, 2000);
    const target = new Vector3(40, 0, 20);
    camera.position.copy(target).add(new Vector3(0, 30, 20));
    camera.lookAt(target);
    camera.zoom = 100;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    const forward = camera.getWorldDirection(new Vector3());
    const planet = target.clone().addScaledVector(forward, 4);
    const sample = planet.clone().add(new Vector3(0.01, 0.02, 0.03));
    const before = sample.clone().project(camera);
    focusDepth(camera, target, planet);
    expect(target.distanceTo(planet)).toBeLessThan(1e-12);
    const after = sample.clone().project(camera);
    expect(after.x).toBeCloseTo(before.x, 9);
    expect(after.y).toBeCloseTo(before.y, 9);
    expect(camera.zoom).toBe(100);
    camera.position.copy(target).add(new Vector3(20, 30, 0));
    camera.lookAt(target);
    camera.updateMatrixWorld();
    expect(planet.clone().project(camera).length()).toBeLessThan(1); // Still centered after rotation.
    expect(planet.clone().project(camera).x).toBeCloseTo(0, 9);
    expect(planet.clone().project(camera).y).toBeCloseTo(0, 9);
  });
  it.each([0, 1, 5, 20, 90, 175])(
    "keeps every orbit inside depth clipping at elevation %s°",
    (angle) => {
      const model = earthSunModel(new Date("2026-09-10T00:00:00Z"), SOLAR_METERS_PER_UNIT);
      const points = model.bodies.flatMap((b) => b.orbit).map((p) => new Vector3(...p));
      points.push(...model.rulerBounds.map((p) => new Vector3(...p)));
      const bounds = new Box3().setFromPoints(points);
      const camera = new OrthographicCamera(-600, 600, 600, -600, 0.01, 2000);
      const target = new Vector3(200, 1, 150);
      const radians = (angle * Math.PI) / 180;
      camera.position
        .copy(target)
        .add(new Vector3(0, 30 * Math.sin(radians), 30 * Math.cos(radians)));
      camera.lookAt(target);
      camera.updateMatrixWorld();
      const before = points[0].clone().project(camera);
      fitSolarDepth(camera, target, bounds);
      const after = points[0].clone().project(camera);
      expect(after.x).toBeCloseTo(before.x, 10);
      expect(after.y).toBeCloseTo(before.y, 10);
      for (const p of points) expect(Math.abs(p.clone().project(camera).z)).toBeLessThan(1);
      expect(camera.near).toBeGreaterThan(0);
    },
  );
  it("reveals the additional solar ruler only for visibly resolved bodies", () => {
    expect(closeupRulerOpacity(1)).toBe(0);
    expect(closeupRulerOpacity(2)).toBe(0);
    expect(closeupRulerOpacity(5)).toBe(0.5);
    expect(closeupRulerOpacity(8)).toBe(1);
    expect(closeupRulerOpacity(24, true)).toBe(0);
    expect(closeupRulerOpacity(44, true)).toBe(0.5);
    expect(closeupRulerOpacity(64, true)).toBe(1);
  });
});
