import { describe, expect, it } from "vitest";
import { sceneRegistry } from "../src/app/sceneRegistry";
import { GIGAPARSEC_METERS } from "../src/physics/constants";
import {
  COSMIC_WEB_COMPARISON_METERS,
  cosmologyAtComovingDistance,
  LAST_SCATTERING_TEMPERATURE_KELVIN,
  LAST_SCATTERING_REDSHIFT,
  OBSERVABLE_UNIVERSE_REFERENCE_METERS,
  PARTICLE_HORIZON_DISTANCE_GPC,
  RADIAL_RULER_TICKS,
} from "../src/scenes/observable-universe/observableUniverseModel";

describe("observable-universe radial convention", () => {
  it("uses the adopted 14 Gpc radius as its reference length", () => {
    expect(OBSERVABLE_UNIVERSE_REFERENCE_METERS).toBe(14 * GIGAPARSEC_METERS);
    expect(sceneRegistry["observable-universe"].referenceLengthMeters).toBe(
      OBSERVABLE_UNIVERSE_REFERENCE_METERS,
    );
    expect(
      OBSERVABLE_UNIVERSE_REFERENCE_METERS /
        sceneRegistry["observable-universe"].metersPerSceneUnit,
    ).toBeCloseTo(10, 12);
    expect(sceneRegistry["observable-universe"].camera.maxDistance).toBe(40);
  });

  it("places redshift ticks nonlinearly in increasing comoving distance", () => {
    expect(RADIAL_RULER_TICKS.map((tick) => Math.round(tick.redshift))).toEqual([
      0,
      1,
      2,
      6,
      10,
      LAST_SCATTERING_REDSHIFT,
    ]);
    const distances = RADIAL_RULER_TICKS.map((tick) => tick.comovingDistanceGpc);
    expect(distances[0]).toBeCloseTo(0, 8);
    expect(distances.at(-1)).toBeCloseTo(14, 8);
    expect(distances[2] - distances[1]).not.toBeCloseTo(distances[1] - distances[0], 1);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });

  it("keeps distance and cosmic time as separate monotonic quantities", () => {
    const near = cosmologyAtComovingDistance(3);
    const far = cosmologyAtComovingDistance(10);
    expect(far.redshift).toBeGreaterThan(near.redshift);
    expect(far.lookbackTimeGyr).toBeGreaterThan(near.lookbackTimeGyr);
    expect(far.universeAgeGyr).toBeLessThan(near.universeAgeGyr);
    expect(far.scaleFactor).toBeLessThan(near.scaleFactor);
    expect(cosmologyAtComovingDistance(14).redshift).toBeCloseTo(1_100, 6);
  });

  it("extends the finite shell from last scattering to the particle horizon", () => {
    expect(PARTICLE_HORIZON_DISTANCE_GPC).toBeGreaterThan(14);
    expect(PARTICLE_HORIZON_DISTANCE_GPC).toBeLessThan(15);
    expect(COSMIC_WEB_COMPARISON_METERS).toBe(3 * GIGAPARSEC_METERS);
    expect(LAST_SCATTERING_TEMPERATURE_KELVIN).toBeCloseTo(3_001, 0);
  });
});
