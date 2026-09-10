import {
  Body,
  GeoMoon,
  HelioVector,
  RotateVector,
  Rotation_EQJ_ECL,
  RotationAxis,
  type Vector,
} from "astronomy-engine";
import { AU_METERS } from "../../physics/constants";
import { SUN_RADIUS_METERS, SUN_DIAMETER_METERS } from "../sun/sunData";
import { DATE_MIN, DATE_MAX, ORBIT_SEGMENTS, SYSTEM_BODIES } from "./earthSunData";
export type Point = [number, number, number];
const rotation = Rotation_EQJ_ECL();
/** EQJ → fixed J2000 ecliptic; render +X=equinox, +Y=north, -Z=ecliptic +Y. */
export function vectorMeters(vector: Vector): Point {
  const e = RotateVector(rotation, vector);
  return [e.x * AU_METERS, e.z * AU_METERS, -e.y * AU_METERS];
}
export function parseUtcInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) || value < DATE_MIN || value > DATE_MAX)
    return null;
  const date = new Date(value + ":00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 16) === value ? date : null;
}
export function earthSunModel(date: Date, metersPerSceneUnit: number) {
  if (!Number.isFinite(date.getTime()) || !parseUtcInput(date.toISOString().slice(0, 16)))
    throw new RangeError("Unsupported ephemeris date");
  const normalize = (p: Point): Point => p.map((v) => v / metersPerSceneUnit) as Point;
  const earthMeters = vectorMeters(HelioVector(Body.Earth, date));
  const bodies = SYSTEM_BODIES.map((spec) => {
    const positionMeters = vectorMeters(HelioVector(spec.body, date));
    // Sample an actual time interval, never forcibly close a perturbed trajectory.
    // Lunar samples are geocentric vectors translated to Earth's selected-date position.
    const orbit = Array.from({ length: ORBIT_SEGMENTS + 1 }, (_, i) => {
      const t = new Date(date.getTime() + (i / ORBIT_SEGMENTS - 0.5) * spec.periodDays * 86400000);
      const p =
        spec.body === Body.Moon
          ? vectorMeters(GeoMoon(t))
          : vectorMeters(HelioVector(spec.body, t));
      return normalize(
        spec.body === Body.Moon ? (p.map((v, axis) => v + earthMeters[axis]) as Point) : p,
      );
    });
    const pole = vectorMeters(RotationAxis(spec.body, date).north);
    const poleLength = Math.hypot(...pole);
    return {
      ...spec,
      north: pole.map((v) => v / poleLength) as Point,
      positionSourceId: "astronomy-engine",
      poleSourceId: "astronomy-engine",
      textureSourceId: spec.body === Body.Earth ? "nasa-bmng-july-2004" : "sss-planets",
      representation: "physical" as const,
      positionMeters,
      position: normalize(positionMeters),
      radius: spec.radiusMeters / metersPerSceneUnit,
      orbit,
    };
  });
  return {
    bodies,
    outerReferenceBase: normalize([-50 * AU_METERS, 0, 32 * AU_METERS]),
    rulerBounds: [
      normalize([-50 * AU_METERS, 0, 32 * AU_METERS]),
      normalize([50 * AU_METERS, 0, 32 * AU_METERS]),
    ],
    earthDistanceMeters: Math.hypot(...earthMeters),
    sunRadius: SUN_RADIUS_METERS / metersPerSceneUnit,
    referenceBase: [
      -AU_METERS / metersPerSceneUnit / 2,
      0,
      (1.08 * AU_METERS) / metersPerSceneUnit,
    ] as Point,
    comparisonBase: [
      -SUN_DIAMETER_METERS / metersPerSceneUnit / 2,
      0,
      (1.16 * AU_METERS) / metersPerSceneUnit,
    ] as Point,
  };
}
