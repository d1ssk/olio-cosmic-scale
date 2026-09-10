import { EARTH_MOON_DISTANCE_METERS } from "../earth-moon/earthMoonData";
import { SUN_RADIUS_METERS } from "./sunData";
export function sunModel(metersPerSceneUnit: number) {
  const radius = SUN_RADIUS_METERS / metersPerSceneUnit;
  return {
    radius,
    barBase: [radius * 1.15, -radius, 0] as const,
    comparisonBarBase: [
      radius * 1.35,
      -EARTH_MOON_DISTANCE_METERS / metersPerSceneUnit / 2,
      0,
    ] as const,
  };
}
