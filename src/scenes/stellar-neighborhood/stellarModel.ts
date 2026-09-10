import { Color, Matrix4, Vector3 } from "three";
import type { SceneMetadata } from "../types";
import { PARSEC_METERS } from "../../physics/constants";
import {
  BULGE_STAR_COUNT,
  BV_PALETTE,
  NEARBY_STARS,
  SPECTRAL_BV,
  STELLAR_RADIUS_METERS,
  STELLAR_COMPARISON_METERS,
  STELLAR_RULER_OFFSETS_METERS,
} from "./stellarData";

export type StellarPoint = {
  id: number;
  name: string;
  position: [number, number, number];
  color: [number, number, number];
  brightness: number;
};

/** Equatorial J2000 → right-handed Y-up: (x,z,−y); no positional exaggeration. */
export function stellarPosition(
  positionMeters: readonly number[],
  metersPerUnit: number,
): [number, number, number] {
  return [
    positionMeters[0] / metersPerUnit,
    positionMeters[2] / metersPerUnit,
    -positionMeters[1] / metersPerUnit,
  ];
}
export function stellarColor(bv: number | null, spectralType: string): [number, number, number] {
  const spectral = spectralType
    .replace(/^(sd|d)(?=[OBAFGKM])/i, "")
    .charAt(0)
    .toUpperCase();
  const value = Math.max(-0.3, Math.min(2.1, bv ?? SPECTRAL_BV[spectral] ?? 0.65));
  const upper = BV_PALETTE.findIndex((anchor) => anchor[0] >= value);
  const lo = BV_PALETTE[Math.max(0, upper - 1)];
  const hi = BV_PALETTE[Math.max(0, upper)];
  return new Color(lo[1])
    .lerp(new Color(hi[1]), hi[0] === lo[0] ? 0 : (value - lo[0]) / (hi[0] - lo[0]))
    .toArray() as [number, number, number];
}
/** Compress absolute V luminosity; never use distance to an orthographic camera as flux. */
export function stellarBrightness(absoluteMagnitude: number): number {
  return 0.28 + 0.72 / (1 + Math.exp((absoluteMagnitude - 7) / 3));
}
export function nearbyStarModel(metersPerUnit = PARSEC_METERS): StellarPoint[] {
  return NEARBY_STARS.map((star) => ({
    id: star.id,
    name: star.name,
    position: stellarPosition(star.positionMeters, metersPerUnit),
    color: stellarColor(star.bv, star.spectralType),
    brightness: stellarBrightness(star.absoluteMagnitude),
  }));
}
export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
/** Uniform physical volume, one point per modeled star. Photometry resampled only for comparison. */
export function bulgeStarModel(metersPerUnit = PARSEC_METERS): StellarPoint[] {
  const random = seededRandom(20260910);
  const templates = nearbyStarModel(metersPerUnit);
  return Array.from({ length: BULGE_STAR_COUNT }, (_, id) => {
    const radius = STELLAR_RADIUS_METERS * Math.cbrt(random());
    const z = 2 * random() - 1;
    const theta = 2 * Math.PI * random();
    const plane = radius * Math.sqrt(1 - z * z);
    const template = templates[Math.floor(random() * templates.length)];
    return {
      ...template,
      id,
      name: "",
      position: stellarPosition(
        [plane * Math.cos(theta), plane * Math.sin(theta), radius * z],
        metersPerUnit,
      ),
    };
  });
}

/** Use the default screen-up direction once; never follow the interactive camera. */
export function stellarRulerModel(metadata: SceneMetadata) {
  const basis = new Matrix4().lookAt(
    new Vector3(...metadata.camera.position),
    new Vector3(...metadata.camera.target),
    new Vector3(0, 1, 0),
  );
  const up = new Vector3().setFromMatrixColumn(basis, 1);
  const right = new Vector3().setFromMatrixColumn(basis, 0);
  return [metadata.referenceLengthMeters, STELLAR_COMPARISON_METERS].map((meters, index) => ({
    base: right
      .clone()
      .multiplyScalar(STELLAR_RULER_OFFSETS_METERS[index] / metadata.metersPerSceneUnit)
      .addScaledVector(up, -meters / metadata.metersPerSceneUnit / 2)
      .toArray() as [number, number, number],
    direction: up.toArray() as [number, number, number],
  }));
}
