import { Matrix4, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { PARSEC_METERS, AU_METERS } from "../src/physics/constants";
import {
  BULGE_DENSITY_PER_PC3,
  BULGE_STAR_COUNT,
  NEARBY_STARS,
  STELLAR_BRIDGE_VALUES,
  STELLAR_COMPARISON_METERS,
  STELLAR_REFERENCE_METERS,
  STELLAR_VOLUME_PC3,
} from "../src/scenes/stellar-neighborhood/stellarData";
import {
  bulgeStarModel,
  nearbyStarModel,
  stellarBrightness,
  stellarColor,
  stellarPosition,
  stellarRulerModel,
} from "../src/scenes/stellar-neighborhood/stellarModel";
import { sceneRegistry } from "../src/app/sceneRegistry";

describe("stellar neighborhood scientific contracts", () => {
  it("preserves catalog distances and handedness in the SI → render transform", () => {
    expect(
      stellarPosition([PARSEC_METERS, 2 * PARSEC_METERS, 3 * PARSEC_METERS], PARSEC_METERS),
    ).toEqual([1, expect.closeTo(3, 12), -2]);
    const stars = nearbyStarModel();
    expect(stars).toHaveLength(62);
    expect(stars.find((star) => star.id === 0)?.position.every((v) => v === 0)).toBe(true);
    for (const star of stars) expect(Math.hypot(...star.position)).toBeLessThanOrEqual(5.00001);
    // HYG XYZ and its rounded dist field differ slightly; preserve XYZ unchanged.
    expect(
      Math.hypot(...stars.find((star) => star.name === "Proxima Centauri")!.position),
    ).toBeCloseTo(1.2959, 3);
    expect(Math.hypot(...stars.find((star) => star.name === "Sirius")!.position)).toBeCloseTo(
      2.6371,
      3,
    );
    expect(NEARBY_STARS.every((star) => star.sourceId === "hyg41")).toBe(true);
  });
  it("keeps luminosity ordering and blue/red color sense with missing-data fallbacks", () => {
    expect(stellarBrightness(1.454)).toBeGreaterThan(stellarBrightness(4.85));
    expect(stellarBrightness(4.85)).toBeGreaterThan(stellarBrightness(15.447));
    const blue = stellarColor(-0.2, "B");
    const red = stellarColor(1.8, "M");
    expect(blue[2]).toBeGreaterThan(blue[0]);
    expect(red[0]).toBeGreaterThan(red[2]);
    expect(stellarColor(null, "sdM4")).toEqual(stellarColor(null, "M4"));
    expect(stellarColor(null, "")).toEqual(stellarColor(0.65, ""));
  });
  it("samples the full modeled star count deterministically and uniformly in volume", () => {
    const stars = bulgeStarModel();
    expect(stars).toEqual(bulgeStarModel());
    // Independent evaluation of Balbi et al. eqs 2–5 at x=1 kpc, y=z=0.
    expect(BULGE_DENSITY_PER_PC3).toBeCloseTo(
      13.7 * Math.exp(-0.5 / 1.59 ** 2) + 0.14 * Math.exp(7.3 / 3.5),
      10,
    );
    expect(stars).toHaveLength(BULGE_STAR_COUNT);
    expect(Math.abs(stars.length / STELLAR_VOLUME_PC3 - BULGE_DENSITY_PER_PC3)).toBeLessThan(
      0.5 / STELLAR_VOLUME_PC3,
    );
    expect(stars.every((star) => Math.hypot(...star.position) <= 5)).toBe(true);
    const meanR3 =
      stars.reduce((sum, star) => sum + (Math.hypot(...star.position) / 5) ** 3, 0) / stars.length;
    expect(meanR3).toBeCloseTo(0.5, 1);
    for (let axis = 0; axis < 3; axis++)
      expect(
        Math.abs(stars.reduce((sum, star) => sum + star.position[axis], 0) / stars.length),
      ).toBeLessThan(0.1);
  });
  it("uses one standalone stellar bridge and an exact in-scene comparison", () => {
    expect(STELLAR_BRIDGE_VALUES).toEqual([100 * AU_METERS, STELLAR_COMPARISON_METERS]);
    expect(STELLAR_COMPARISON_METERS / AU_METERS).toBe(20_000);
    expect(STELLAR_COMPARISON_METERS / (100 * AU_METERS)).toBe(200);
    expect(STELLAR_REFERENCE_METERS / STELLAR_COMPARISON_METERS).toBeLessThan(200);
    expect(STELLAR_REFERENCE_METERS).toBe(8 * PARSEC_METERS);
    const local = sceneRegistry["solar-neighborhood"];
    const bulge = sceneRegistry["galactic-center-neighborhood"];
    expect(local.camera).toEqual(bulge.camera);
    expect(local.defaultViewportExtentMeters).toBe(bulge.defaultViewportExtentMeters);
    expect(local.referenceLengthMeters).toBe(bulge.referenceLengthMeters);
  });
});

it.each([
  [0, 0, 20],
  [8, 7, 10],
] as const)("aligns rulers with default screen-up at camera (%s,%s,%s)", (x, y, z) => {
  const source = sceneRegistry["solar-neighborhood"];
  const metadata = { ...source, camera: { ...source.camera, position: [x, y, z] as const } };
  const eye = new Vector3(x, y, z);
  const view = new Matrix4().lookAt(eye, new Vector3(), new Vector3(0, 1, 0));
  view.setPosition(eye).invert();
  for (const [index, ruler] of stellarRulerModel(metadata).entries()) {
    const meters = index === 0 ? STELLAR_REFERENCE_METERS : STELLAR_COMPARISON_METERS;
    const start = new Vector3(...ruler.base);
    const end = start
      .clone()
      .addScaledVector(new Vector3(...ruler.direction), meters / metadata.metersPerSceneUnit);
    expect((start.distanceTo(end) * metadata.metersPerSceneUnit) / meters).toBeCloseTo(1, 12);
    start.applyMatrix4(view);
    end.applyMatrix4(view);
    expect(end.x).toBeCloseTo(start.x, 12);
    expect(end.z).toBeCloseTo(start.z, 12);
    expect(end.y).toBeGreaterThan(start.y);
  }
});
