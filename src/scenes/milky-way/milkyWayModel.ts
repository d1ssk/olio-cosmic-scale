import type { SceneMetadata } from "../types";
import {
  BAR_HALF_LENGTH_METERS,
  DISK_THICKNESS_METERS,
  GALAXY_DISPLAY as D,
  MILKY_WAY_COMPARISON_METERS,
  MILKY_WAY_DIAMETER_METERS,
  MILKY_WAY_METERS_PER_UNIT,
  SUN_GALACTIC_RADIUS_METERS,
} from "./milkyWayData";

type Point = [number, number, number];
/** Galactocentric right-handed frame: X toward the Sun, Y north, disk in XZ.
 * Sun height is deliberately approximated as zero; azimuth and arm phase are illustrative. */
export function galacticPosition(
  meters: readonly number[],
  unit = MILKY_WAY_METERS_PER_UNIT,
): Point {
  return [meters[0] / unit, meters[1] / unit, meters[2] / unit];
}
export function milkyWayModel(unit = MILKY_WAY_METERS_PER_UNIT) {
  let seed: number = D.seed;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const positions: number[] = [];
  const colors: number[] = [];
  const add = (p: Point, color: Point) => {
    positions.push(...galacticPosition(p, unit));
    colors.push(...color);
  };
  for (let i = 0; i < D.diskSamples; i++) {
    const radius = (MILKY_WAY_DIAMETER_METERS / 2) * Math.sqrt(random());
    const arm = i % D.arms;
    const inArm = random() < 0.72;
    const angle = inArm
      ? (arm * 2 * Math.PI) / D.arms +
        Math.log(Math.max(radius / BAR_HALF_LENGTH_METERS, 0.15)) / Math.tan(D.pitchRadians) +
        (random() - 0.5) * 0.28
      : random() * Math.PI * 2;
    const brightness = 0.25 + 0.65 * (1 - radius / (MILKY_WAY_DIAMETER_METERS / 2));
    add(
      [
        radius * Math.cos(angle),
        (random() - 0.5) * DISK_THICKNESS_METERS,
        radius * Math.sin(angle),
      ],
      [brightness * 0.65, brightness * 0.78, brightness],
    );
  }
  for (let i = 0; i < D.bulgeSamples; i++) {
    const radius = Math.pow(random(), 0.7);
    const y = random() * 2 - 1;
    const angle = random() * Math.PI * 2;
    const x = radius * Math.sqrt(1 - y * y) * Math.cos(angle) * BAR_HALF_LENGTH_METERS;
    const z = radius * Math.sqrt(1 - y * y) * Math.sin(angle) * D.bulgeMinorMeters;
    add(
      [
        x * Math.cos(D.barAngleRadians) - z * Math.sin(D.barAngleRadians),
        radius * y * D.bulgeHeightMeters,
        x * Math.sin(D.barAngleRadians) + z * Math.cos(D.barAngleRadians),
      ],
      [0.4, 0.27, 0.16],
    );
  }
  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    sun: galacticPosition([SUN_GALACTIC_RADIUS_METERS, 0, 0], unit),
    center: [0, 0, 0] as Point,
  };
}
export function milkyWayRulers(
  metadata: Pick<SceneMetadata, "metersPerSceneUnit" | "referenceLengthMeters">,
) {
  return [
    { length: metadata.referenceLengthMeters, foreground: D.referenceForegroundMeters },
    { length: MILKY_WAY_COMPARISON_METERS, foreground: D.comparisonForegroundMeters },
  ].map(({ length, foreground }) => ({
    base: galacticPosition([-length / 2, 0, foreground], metadata.metersPerSceneUnit),
    direction: [1, 0, 0] as Point,
  }));
}
