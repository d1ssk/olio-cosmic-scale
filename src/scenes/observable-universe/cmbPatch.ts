import { Vector3 } from "three";
import { PARTICLE_HORIZON_DISTANCE_GPC, RADIAL_DIRECTION } from "./observableUniverseModel";

export const LAST_SCATTERING_RADIUS = 10;
export const PARTICLE_HORIZON_RADIUS =
  (PARTICLE_HORIZON_DISTANCE_GPC / 14) * LAST_SCATTERING_RADIUS;
export const HORIZONTAL_SEGMENTS = 48;
export const VERTICAL_SEGMENTS = 34;
const HORIZONTAL_HALF_ANGLE = (46 * Math.PI) / 180;
const VERTICAL_HALF_ANGLE = (34 * Math.PI) / 180;
export const AXIS = new Vector3(...RADIAL_DIRECTION).normalize();
export const SIDE = new Vector3(0, 1, 0).cross(AXIS).normalize();
export const UP = new Vector3().crossVectors(AXIS, SIDE).normalize();
export function patchPoint(u: number, v: number, radius: number): Vector3 {
  return AXIS.clone()
    .addScaledVector(SIDE, Math.tan(u * HORIZONTAL_HALF_ANGLE))
    .addScaledVector(UP, Math.tan(v * VERTICAL_HALF_ANGLE))
    .normalize()
    .multiplyScalar(radius);
}

/** Exact same four radial cut planes as the existing tangent-plane angular sphere patch. */
export function insideCmbPatch(point: Vector3): boolean {
  const depth = point.dot(AXIS);
  return (
    depth > 0 &&
    Math.abs(point.dot(SIDE)) <= depth * Math.tan(HORIZONTAL_HALF_ANGLE) &&
    Math.abs(point.dot(UP)) <= depth * Math.tan(VERTICAL_HALF_ANGLE)
  );
}
