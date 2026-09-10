import { describe, expect, it } from "vitest";
import { Body, GeoMoon } from "astronomy-engine";
import { earthSunModel, parseUtcInput, vectorMeters } from "../src/scenes/earth-sun/earthSunModel";
import { AU_METERS } from "../src/physics/constants";
import { SUN_DIAMETER_METERS, SUN_RADIUS_METERS } from "../src/scenes/sun/sunData";
import { sunModel } from "../src/scenes/sun/sunModel";
import { EARTH_MOON_DISTANCE_METERS } from "../src/scenes/earth-moon/earthMoonData";
import { sceneRegistry } from "../src/app/sceneRegistry";
import fixture from "./fixtures/jpl-j2000.json";

describe("solar scale integrity", () => {
  it("adopts the nominal solar radius and center-aligns true-length comparison bars", () => {
    expect(SUN_RADIUS_METERS).toBe(695700000);
    const scale = sceneRegistry.sun.metersPerSceneUnit;
    const model = sunModel(scale);
    expect(model.radius * scale).toBe(SUN_RADIUS_METERS);
    expect(model.barBase[1] + SUN_DIAMETER_METERS / scale / 2).toBe(0);
    expect(model.comparisonBarBase[1] + EARTH_MOON_DISTANCE_METERS / scale / 2).toBe(0);
    expect(sceneRegistry.sun.referenceLengthMeters).toBe(SUN_DIAMETER_METERS);
  });
  it("uses one normalization for every radius, position and shared bar", () => {
    const scale = AU_METERS / 10;
    const model = earthSunModel(new Date("2026-09-10T00:00:00Z"), scale);
    expect(model.sunRadius * scale).toBe(SUN_RADIUS_METERS);
    expect(model.comparisonBase[0] * -2 * scale).toBeCloseTo(SUN_DIAMETER_METERS, 4);
    for (const body of model.bodies) {
      expect(body.radius * scale).toBeCloseTo(body.radiusMeters, 5);
      body.position.forEach((v, i) => expect(v * scale).toBeCloseTo(body.positionMeters[i], 3));
    }
    const earth = model.bodies.find((b) => b.body === Body.Earth)!;
    const moon = model.bodies.find((b) => b.body === Body.Moon)!;
    const lunarDistance = Math.hypot(
      ...moon.positionMeters.map((v, i) => v - earth.positionMeters[i]),
    );
    expect(lunarDistance).toBeGreaterThan(350e6);
    expect(lunarDistance).toBeLessThan(410e6);
    const geocentric = vectorMeters(GeoMoon(new Date("2026-09-10T00:00:00Z")));
    geocentric.forEach((v, i) =>
      expect(moon.positionMeters[i] - earth.positionMeters[i]).toBeCloseTo(v, 3),
    );
    for (const body of model.bodies)
      body.orbit[128].forEach((v, i) => expect(v).toBeCloseTo(body.position[i], 10));
  });
  it("agrees with independently calculated JPL J2000 positions within 50000 km", () => {
    const model = earthSunModel(new Date("2000-01-01T12:00:00Z"), AU_METERS);
    for (const body of model.bodies.filter((b) => b.body in fixture.positions)) {
      const [x, y, z] = fixture.positions[body.body as keyof typeof fixture.positions];
      const expected = [x, z, -y];
      expect(Math.hypot(...body.position.map((v, i) => v - expected[i])) * AU_METERS).toBeLessThan(
        50e6,
      );
    }
  });
  it("changes actual separation with date without changing the 1 AU reference", () => {
    const jan = earthSunModel(new Date("2026-01-03T00:00:00Z"), AU_METERS);
    const jul = earthSunModel(new Date("2026-07-04T00:00:00Z"), AU_METERS);
    expect(jan.earthDistanceMeters / AU_METERS).toBeLessThan(0.985);
    expect(jul.earthDistanceMeters / AU_METERS).toBeGreaterThan(1.015);
    expect(jan.referenceBase).toEqual(jul.referenceBase);
    expect(sceneRegistry["earth-sun"].referenceLengthMeters).toBe(AU_METERS);
  });
  it.each(["1900-01-01T00:00", "2100-12-31T23:59"])("supports the UI boundary %s", (value) => {
    const date = parseUtcInput(value)!;
    expect(date).not.toBeNull();
    const model = earthSunModel(date, AU_METERS);
    expect(model.bodies.every((b) => b.orbit.flat().every(Number.isFinite))).toBe(true);
  });
  it.each(["", "2026-02-30T00:00", "1899-12-31T23:59", "2101-01-01T00:00", "2026-01-01T25:00"])(
    "rejects invalid input %s",
    (value) => expect(parseUtcInput(value)).toBeNull(),
  );
});
