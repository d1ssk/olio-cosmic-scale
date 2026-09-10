import { Vector3 } from "three";
import {
  VIRGO_DIRECTION,
  VIRGO_REFERENCE_METERS,
  VIRGO_UNIT_METERS,
  type VirgoGalaxy,
} from "./virgoData";

export function equatorialSight(ra: number, dec: number): Vector3 {
  const a = (ra * Math.PI) / 180,
    d = (dec * Math.PI) / 180;
  return new Vector3(Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d));
}
const xAxis = equatorialSight(VIRGO_DIRECTION.raDegrees, VIRGO_DIRECTION.decDegrees);
const zAxis = xAxis
  .clone()
  .cross(new Vector3(0, 0, 1))
  .normalize();
const yAxis = zAxis.clone().cross(xAxis).normalize();
/** Rigid right-handed EQJ rotation: +X toward Virgo, +Y projected celestial north. */
export function virgoPosition(
  g: Pick<VirgoGalaxy, "raDegrees" | "decDegrees" | "distanceMeters">,
): [number, number, number] {
  const p = equatorialSight(g.raDegrees, g.decDegrees).multiplyScalar(g.distanceMeters);
  return [
    (p.dot(xAxis) - VIRGO_REFERENCE_METERS / 2) / VIRGO_UNIT_METERS,
    p.dot(yAxis) / VIRGO_UNIT_METERS,
    p.dot(zAxis) / VIRGO_UNIT_METERS,
  ];
}
/** Compressed absolute B magnitude proxy, clamped screen pixels, never a physical radius. */
export function markerPixels(magnitude: number | null): number {
  // Missing photometry uses minimum visibility, not an inferred faint luminosity.
  return magnitude === null ? 1.5 : Math.max(1.5, Math.min(5, 1.5 + (-magnitude - 10) * 0.28));
}
export function uncertaintyEndpoints(g: VirgoGalaxy) {
  if (g.distanceErrorMeters === null) return null;
  return [
    virgoPosition({ ...g, distanceMeters: Math.max(0, g.distanceMeters - g.distanceErrorMeters) }),
    virgoPosition({ ...g, distanceMeters: g.distanceMeters + g.distanceErrorMeters }),
  ];
}
