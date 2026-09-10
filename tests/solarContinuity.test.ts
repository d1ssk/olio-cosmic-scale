import { describe, expect, it } from "vitest";
import { sceneRegistry, MAIN_SCENE_ORDER } from "../src/app/sceneRegistry";
import { AU_METERS } from "../src/physics/constants";
import { earthSunModel } from "../src/scenes/earth-sun/earthSunModel";
import { Body } from "astronomy-engine";
import {
  isContinuousSolarEdge,
  interpolateSolarZoom,
  solarZoomLimits,
  SOLAR_METERS_PER_UNIT,
  MAX_SOLAR_VIEW_METERS,
  MIN_SOLAR_VIEW_METERS,
  planetAnnotationOpacity,
  innerOrbitOpacity,
  solarRecoveryPreset,
  solarDiameterOpacity,
} from "../src/scenes/solar-system/solarScale";
import { SATURN_RINGS } from "../src/scenes/solar-system/planetData";

describe("continuous solar-world exception", () => {
  it("shares one renderer and physical coordinates between the two presets only", () => {
    const inner = sceneRegistry["earth-sun"],
      outer = sceneRegistry["solar-system"];
    expect(inner.component).toBe(outer.component);
    expect(inner.metersPerSceneUnit).toBe(outer.metersPerSceneUnit);
    expect(outer.referenceLengthMeters / inner.referenceLengthMeters).toBe(100);
    expect(inner.defaultViewportExtentMeters).toBe(1.8 * AU_METERS);
    expect(outer.defaultViewportExtentMeters).toBe(75 * AU_METERS);
    for (let i = 0; i < MAIN_SCENE_ORDER.length - 1; i++) {
      const a = MAIN_SCENE_ORDER[i],
        b = MAIN_SCENE_ORDER[i + 1];
      expect(isContinuousSolarEdge(a, b)).toBe(a === "earth-sun");
      expect(isContinuousSolarEdge(b, a)).toBe(a === "earth-sun");
    }
  });
  it.each([
    [1440, 775],
    [320, 300],
    [390, 300],
  ])("bounds the physical short-side extent at %s×%s", (w, h) => {
    const limits = solarZoomLimits(w, h, SOLAR_METERS_PER_UNIT);
    expect((Math.min(w, h) / limits.min) * SOLAR_METERS_PER_UNIT).toBeCloseTo(
      MAX_SOLAR_VIEW_METERS,
      1,
    );
    expect((Math.min(w, h) / limits.max) * SOLAR_METERS_PER_UNIT).toBeCloseTo(
      MIN_SOLAR_VIEW_METERS,
      5,
    );
  });
  it("interpolates monotonically and reversibly in logarithmic zoom", () => {
    let last = 100;
    for (let i = 0; i <= 100; i++) {
      const zoom = interpolateSolarZoom(100, 2.5, i / 100);
      expect(zoom).toBeLessThanOrEqual(last + 1e-10);
      expect(zoom).toBeCloseTo(interpolateSolarZoom(2.5, 100, 1 - i / 100), 10);
      last = zoom;
    }
    expect(last).toBeCloseTo(2.5, 12);
  });
  it("fades labels and reveals the 100 AU ruler without changing any lengths", () => {
    expect(planetAnnotationOpacity(3 * AU_METERS, AU_METERS)).toBe(1);
    expect(planetAnnotationOpacity(100 * AU_METERS, AU_METERS)).toBe(0);
    for (const orbitAu of [5.2, 9.6, 19.2, 30]) {
      expect(planetAnnotationOpacity(120 * AU_METERS, orbitAu * AU_METERS)).toBe(1);
      expect(planetAnnotationOpacity(160 * AU_METERS, orbitAu * AU_METERS)).toBeGreaterThan(0.75);
      expect(planetAnnotationOpacity(320 * AU_METERS, orbitAu * AU_METERS)).toBe(0);
    }
    expect(solarDiameterOpacity(3 * AU_METERS)).toBe(1);
    expect(solarDiameterOpacity(10 * AU_METERS)).toBe(0);
    expect(innerOrbitOpacity("Mercury", 10 * AU_METERS)).toBe(0);
    expect(innerOrbitOpacity("Mars", 10 * AU_METERS)).toBe(1);
    expect(innerOrbitOpacity("Mars", 32 * AU_METERS)).toBe(0);
    expect(innerOrbitOpacity("Jupiter", 160 * AU_METERS)).toBe(1);
  });
  it("contains eight correctly sized planets and the Moon, with unit poles and anchored orbits", () => {
    const model = earthSunModel(new Date("2026-09-10T00:00:00Z"), SOLAR_METERS_PER_UNIT);
    expect(model.bodies.map((b) => b.body).sort()).toEqual(
      [
        Body.Mercury,
        Body.Venus,
        Body.Earth,
        Body.Moon,
        Body.Mars,
        Body.Jupiter,
        Body.Saturn,
        Body.Uranus,
        Body.Neptune,
      ].sort(),
    );
    const bounds = {
      Mars: [1.3, 1.7, 3389500],
      Jupiter: [4.8, 5.5, 69911000],
      Saturn: [9, 10.2, 58232000],
      Uranus: [18, 21, 25362000],
      Neptune: [29, 31, 24622000],
    };
    for (const body of model.bodies) {
      expect(Math.hypot(...body.north)).toBeCloseTo(1, 12);
      if (body.body in bounds) {
        const [lo, hi, radius] = bounds[body.body as keyof typeof bounds];
        expect(Math.hypot(...body.positionMeters) / AU_METERS).toBeGreaterThan(lo);
        expect(Math.hypot(...body.positionMeters) / AU_METERS).toBeLessThan(hi);
        expect(body.radius * SOLAR_METERS_PER_UNIT).toBeCloseTo(radius, 5);
      }
    }
  });
  it("recovers local and intermediate views before leaving the solar world", () => {
    expect(solarRecoveryPreset(1.8 * AU_METERS, 0, 0)).toBe(null);
    expect(solarRecoveryPreset(75 * AU_METERS, 0, 0)).toBe(null);
    expect(solarRecoveryPreset(0.001 * AU_METERS, 30 * AU_METERS, 1)).toBe("earth-sun");
    expect(solarRecoveryPreset(10 * AU_METERS, 0, 0)).toBe("earth-sun");
    expect(solarRecoveryPreset(60 * AU_METERS, 0, 0)).toBe("solar-system");
    expect(solarRecoveryPreset(75 * AU_METERS, AU_METERS * 4, 0)).toBe("solar-system");
    expect(solarRecoveryPreset(3 * AU_METERS, 0, 0.5)).toBe("earth-sun");
  });
  it("retains the sourced Saturn ring intervals and Cassini Division", () => {
    expect(SATURN_RINGS.map((r) => [r.innerMeters, r.outerMeters])).toEqual([
      [74510000, 92000000],
      [92000000, 117580000],
      [122170000, 136780000],
    ]);
    expect(SATURN_RINGS[2].innerMeters - SATURN_RINGS[1].outerMeters).toBe(4590000);
  });
});
