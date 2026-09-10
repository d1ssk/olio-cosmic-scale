import { EARTH_DIAMETER_METERS } from "../earth/earthData";
import {
  EARTH_MOON_DISTANCE_METERS,
  LIGHT_SECOND_METERS,
  MOON_DIAMETER_METERS,
} from "./earthMoonData";

/** Midpoint origin; X joins the centers, Y is the illustrative shared north direction. */
export function earthMoonModel(metersPerSceneUnit: number) {
  const separation = EARTH_MOON_DISTANCE_METERS / metersPerSceneUnit;
  const earthRadius = EARTH_DIAMETER_METERS / metersPerSceneUnit / 2;
  return {
    earthRadius,
    moonRadius: MOON_DIAMETER_METERS / metersPerSceneUnit / 2,
    earthPosition: [-separation / 2, 0, 0] as const,
    moonPosition: [separation / 2, 0, 0] as const,
    earthBarBase: [-separation / 2 - earthRadius * 1.8, -earthRadius, 0] as const,
    lightSecondLength: LIGHT_SECOND_METERS / metersPerSceneUnit,
    lightSecondBarBase: [
      -LIGHT_SECOND_METERS / metersPerSceneUnit / 2,
      -separation * 0.1,
      -separation * 0.1,
    ] as const,
    distanceBarBase: [-separation / 2, -separation * 0.1, 0] as const,
  };
}
