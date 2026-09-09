import { HUMAN_BAR_CLEARANCE_METERS } from "./humanData";
import { Box3, Vector3, type Object3D } from "three";

/** Preserve proportions; center X/Z, put the base at Y=0, and adopt the stated display height. */
export function modelPlacement(object: Object3D, heightMeters: number, metersPerSceneUnit: number) {
  const bounds = new Box3().setFromObject(object, true);
  const size = bounds.getSize(new Vector3());
  if (!Number.isFinite(size.y) || size.y <= 0 || heightMeters <= 0 || metersPerSceneUnit <= 0) {
    throw new RangeError("Model bounds and physical scales must be positive.");
  }
  const center = bounds.getCenter(new Vector3());
  const scale = heightMeters / metersPerSceneUnit / size.y;
  return {
    scale,
    referenceBarBase: [
      0,
      0,
      (size.z * scale) / 2 + HUMAN_BAR_CLEARANCE_METERS / metersPerSceneUnit,
    ] as const,
    position: [-center.x * scale, -bounds.min.y * scale, -center.z * scale] as const,
  };
}
