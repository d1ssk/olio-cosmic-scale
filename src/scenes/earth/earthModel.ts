import { EARTH_COMPARISON_METERS } from "../../bridges/humanEarthBridge";
import {
  EARTH_DIAMETER_METERS,
  EARTH_BAR_LONGITUDE_DEGREES,
  EARTH_BAR_CLEARANCE_METERS,
} from "./earthData";

/** Y is north; +X is (0°N, 0°E), -Z is (0°N, 90°E). */
export function earthSceneModel(metersPerSceneUnit: number) {
  const radius = EARTH_DIAMETER_METERS / 2 / metersPerSceneUnit;
  const longitude = (EARTH_BAR_LONGITUDE_DEGREES * Math.PI) / 180;
  const distance = radius + EARTH_BAR_CLEARANCE_METERS / metersPerSceneUnit;
  return {
    radius,
    comparisonBarBase: [
      (distance + radius * 0.08) * Math.cos(longitude),
      -EARTH_COMPARISON_METERS / metersPerSceneUnit / 2,
      -(distance + radius * 0.08) * Math.sin(longitude),
    ] as const,
    barBase: [distance * Math.cos(longitude), -radius, -distance * Math.sin(longitude)] as const,
  };
}
