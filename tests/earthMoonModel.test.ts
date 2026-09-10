import { describe, expect, it } from "vitest";
import { earthMoonModel } from "../src/scenes/earth-moon/earthMoonModel";
import {
  EARTH_MOON_DISTANCE_METERS,
  MOON_DIAMETER_METERS,
  LIGHT_SECOND_METERS,
} from "../src/scenes/earth-moon/earthMoonData";
import { EARTH_DIAMETER_METERS } from "../src/scenes/earth/earthData";
import { sceneRegistry } from "../src/app/sceneRegistry";

describe("Earth–Moon physical scale", () => {
  it("preserves both diameters, center distance and the connecting Earth bar", () => {
    const metadata = sceneRegistry["earth-moon"];
    const units = metadata.metersPerSceneUnit;
    const model = earthMoonModel(units);
    expect((model.moonPosition[0] - model.earthPosition[0]) * units).toBe(
      EARTH_MOON_DISTANCE_METERS,
    );
    expect(model.earthRadius * 2 * units).toBeCloseTo(EARTH_DIAMETER_METERS);
    expect(model.moonRadius * 2 * units).toBeCloseTo(MOON_DIAMETER_METERS);
    expect(model.earthBarBase[1] + model.earthRadius).toBe(0);
    expect(Math.abs(model.earthBarBase[0] - model.earthPosition[0])).toBeGreaterThan(
      model.earthRadius,
    );
    expect(LIGHT_SECOND_METERS).toBe(299_792_458);
    expect(model.lightSecondLength * units).toBeCloseTo(LIGHT_SECOND_METERS);
    expect(model.lightSecondLength / (model.moonPosition[0] - model.earthPosition[0])).toBeCloseTo(
      299_792_458 / 384_400_000,
    );
    expect(model.lightSecondBarBase[0] + model.lightSecondLength / 2).toBeCloseTo(0);
    expect(model.lightSecondBarBase[1]).toBe(model.distanceBarBase[1]);
    expect(model.lightSecondBarBase[2]).toBeLessThan(model.distanceBarBase[2]);
    expect(metadata.referenceLengthMeters).toBe(EARTH_MOON_DISTANCE_METERS);
    expect(metadata.defaultViewportExtentMeters).toBeGreaterThan(
      EARTH_MOON_DISTANCE_METERS + EARTH_DIAMETER_METERS,
    );
  });
});
