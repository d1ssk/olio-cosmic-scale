import { Euler, Matrix4, Vector3 } from "three";

export type GalaxyVariant = "simple" | "volume";
export type VolumeStatus = "idle" | "loading" | "ready" | "error";
export const VOLUME_DATA = {
  url: `${import.meta.env.BASE_URL}models/milky-way/volume-256x256x32.rgba`,
  dimensions: [256, 256, 32] as const,
  bytes: 8_388_608,
  // Texture XYZ before transformation: the thin axis is texture Z.
  sizeMeters: [1.2e21, 1.2e21, 0.15e21] as const,
  rotationRadians: [Math.PI, 3.1248, 4.45741] as const,
  // Half a voxel in units of physical box width; avoid skipping thin emissive layers.
  stepSize: 0.5 / 256,
  absorption: 200,
  emission: 250,
  maxSteps: 768,
  sourceId: "openspace-milky-way-volume",
} as const;

/** OpenSpace Rx*Ry*Rz, then Galactic coordinates → our Sun-facing X, north Y.
 * Galactic +X points Sun→center, so (gX,gY,gZ) becomes (-gX,gZ,gY).
 * This is a proper rotation, not a mirror. No per-axis physical exaggeration. */
export function volumeModelMatrix(metersPerUnit: number): Matrix4 {
  const galacticToScene = new Matrix4().set(-1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1);
  return galacticToScene
    .multiply(new Matrix4().makeRotationFromEuler(new Euler(...VOLUME_DATA.rotationRadians, "XYZ")))
    .scale(new Vector3(...VOLUME_DATA.sizeMeters).divideScalar(metersPerUnit));
}

export function validateVolumeBytes(data: ArrayBuffer): Uint8Array {
  if (data.byteLength !== VOLUME_DATA.bytes)
    throw new Error("Unexpected Milky Way volume byte length");
  return new Uint8Array(data);
}
