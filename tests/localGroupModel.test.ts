import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { sceneRegistry } from "../src/app/sceneRegistry";
import { KILOPARSEC_METERS } from "../src/physics/constants";
import { SOURCES } from "../src/data/sources";
import {
  MILKY_WAY_DIAMETER_METERS,
  SUN_GALACTIC_RADIUS_METERS,
} from "../src/scenes/milky-way/milkyWayData";
import { milkyWayModel } from "../src/scenes/milky-way/milkyWayModel";
import {
  LOCAL_GROUP_GALAXIES as galaxies,
  LOCAL_GROUP_UNIT_METERS as unit,
} from "../src/scenes/local-group/localGroupData";
import {
  equatorialToGroup,
  galactocentricCenter,
  galaxyAxes,
  galaxyCloud,
  galaxyPosition,
  skyBasis,
} from "../src/scenes/local-group/localGroupModel";
const find = (name: string) => galaxies.find((g) => g.name === name)!;
describe("Local Group catalog and 3D physical integrity", () => {
  it("includes every tagged catalog entry, preserves unknown sizes, and binds provenance", () => {
    expect(galaxies).toHaveLength(75);
    expect(new Set(galaxies.map((g) => g.name)).size).toBe(75);
    expect(galaxies.filter((g) => !g.radiusMeters).map((g) => g.name)).toEqual([
      "Canis Major",
      "Bootes III",
      "Andromeda XX",
    ]);
    for (const g of galaxies) {
      if (g.name !== "The Galaxy") expect(g.distanceMeters).toBeGreaterThan(0);
      expect(g.sourceIds.every((id) => SOURCES.some((s) => s.id === id))).toBe(true);
      expect(galaxyPosition(g).every(Number.isFinite)).toBe(true);
    }
    expect(find("Bootes (I)").halfLightRadiusMeters! / KILOPARSEC_METERS).toBeCloseTo(0.242, 3);
    expect(find("Bootes II").halfLightRadiusMeters! / KILOPARSEC_METERS).toBeCloseTo(0.051, 3);
  });
  it("uses independent Galactic pole / center fixtures with the correct handedness", () => {
    expect(skyBasis(266.4051, -28.936175).sight.distanceTo(new Vector3(-1, 0, 0))).toBeLessThan(
      1e-4,
    );
    expect(skyBasis(192.85948, 27.12825).sight.distanceTo(new Vector3(0, 1, 0))).toBeLessThan(1e-4);
    const x = equatorialToGroup([1, 0, 0]),
      y = equatorialToGroup([0, 1, 0]),
      z = equatorialToGroup([0, 0, 1]);
    expect(x.clone().cross(y).dot(z)).toBeCloseTo(1, 10);
  });
  it("translates heliocentric distances once, retains MW geometry and uses the true midpoint", () => {
    const mw = find("The Galaxy"),
      m31 = find("Andromeda");
    const a = new Vector3(...galaxyPosition(mw)),
      b = new Vector3(...galaxyPosition(m31));
    expect(a.clone().add(b).length()).toBeLessThan(1e-12);
    expect(
      galactocentricCenter(m31)
        .sub(new Vector3(SUN_GALACTIC_RADIUS_METERS, 0, 0))
        .length() / m31.distanceMeters,
    ).toBeCloseTo(1, 12);
    expect((a.distanceTo(b) * unit) / KILOPARSEC_METERS).toBeGreaterThan(780);
    expect((a.distanceTo(b) * unit) / KILOPARSEC_METERS).toBeLessThan(795);
    expect(galaxyCloud(mw).positions).toEqual(milkyWayModel(unit).positions);
    expect(mw.radiusMeters! * 2).toBe(MILKY_WAY_DIAMETER_METERS);
  });
  it("preserves projected dwarf PA and ellipticity, independently of viewing rotation", () => {
    const g = find("Sculptor"),
      axes = galaxyAxes(g),
      sky = skyBasis(g.raDegrees, g.decDegrees);
    const pa = (g.positionAngleDegrees! * Math.PI) / 180;
    expect(axes.major.dot(sky.east)).toBeCloseTo(Math.sin(pa), 12);
    expect(axes.major.dot(sky.north)).toBeCloseTo(Math.cos(pa), 12);
    expect(axes.major.dot(sky.sight)).toBeCloseTo(0, 12);
    expect(axes.q).toBeCloseTo(1 - g.ellipticity!, 12);
    const cloud = galaxyCloud(g),
      radius = g.radiusMeters! / unit;
    expect(cloud.positions).toEqual(galaxyCloud(g).positions);
    for (let i = 0; i < cloud.positions.length; i += 3) {
      const p = new Vector3().fromArray(cloud.positions, i);
      expect(
        Math.hypot(p.dot(axes.major), p.dot(axes.minor) / axes.q, p.dot(axes.depth) / axes.q),
      ).toBeLessThanOrEqual(radius * 1.000001);
    }
  });
  it("inclines disk planes around their measured line of nodes", () => {
    for (const [name, inclination] of [
      ["Andromeda", 77],
      ["Triangulum", 54],
      ["LMC", 34.7],
    ] as const) {
      const g = find(name),
        axes = galaxyAxes(g),
        sky = skyBasis(g.raDegrees, g.decDegrees);
      expect(Math.abs(axes.depth.dot(sky.sight))).toBeCloseTo(
        Math.cos((inclination * Math.PI) / 180),
        12,
      );
      expect(axes.major.dot(axes.minor)).toBeCloseTo(0, 12);
      expect(axes.depth.length()).toBeCloseTo(1, 12);
    }
  });
  it("keeps scale hierarchy independent with a 100:1 direct comparison", () => {
    const scene = sceneRegistry["local-group"];
    expect(scene.referenceLengthMeters / MILKY_WAY_DIAMETER_METERS).toBeCloseTo(100);
    expect(scene.defaultViewportExtentMeters).not.toBe(scene.referenceLengthMeters);
    expect(scene.previous).toBe("milky-way");
    expect(scene.next).toBe("virgo");
  });
});
