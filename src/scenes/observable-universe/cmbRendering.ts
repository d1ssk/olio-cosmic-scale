import {
  BufferGeometry,
  ClampToEdgeWrapping,
  DataTexture,
  Float32BufferAttribute,
  LinearFilter,
  RGBAFormat,
  SRGBColorSpace,
  UnsignedByteType,
} from "three";
import type { CmbMap } from "./cmbAssets";
import { anglesToNestedPixel, polarizationReference } from "./healpix";
import { insideCmbPatch, LAST_SCATTERING_RADIUS, patchPoint } from "./cmbPatch";

export function scalarDisplayValue(value: number, std: number): number {
  return Math.max(-1, Math.min(1, value / (3 * std)));
}

/** Reproject once onto the EXISTING patch UV (not a longitude/latitude image).
 * The exact same patchPoint defines geometry and the direction sampled here.
 * DataTexture flipY=false: increasing row maps to increasing patch v. No mirror
 * for the inner face; DoubleSide changes face culling only.
 */
export function makeCmbTexture(map: CmbMap, field: "T" | "E"): DataTexture {
  const width = 4 * map.asset.nside;
  const height = 3 * map.asset.nside;
  const bytes = new Uint8Array(width * height * 4);
  const middle = field === "T" ? [255, 240, 207] : [240, 224, 196];
  const negative = field === "T" ? [92, 139, 181] : [74, 91, 164];
  const positive = field === "T" ? [239, 132, 57] : [215, 77, 44];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const n = patchPoint((2 * (x + 0.5)) / width - 1, (2 * (y + 0.5)) / height - 1, 1);
      const pixel = anglesToNestedPixel(map.asset.nside, Math.acos(n.y), Math.atan2(-n.z, n.x));
      const value = scalarDisplayValue(map.values[pixel], map.asset.std);
      const edge = value < 0 ? negative : positive;
      const offset = (y * width + x) * 4;
      for (let c = 0; c < 3; c++)
        bytes[offset + c] = Math.round(middle[c] + (edge[c] - middle[c]) * Math.abs(value));
      bytes[offset + 3] = 255;
    }
  }
  const texture = new DataTexture(bytes, width, height, RGBAFormat, UnsignedByteType);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = texture.magFilter = LinearFilter;
  texture.wrapS = texture.wrapT = ClampToEdgeWrapping;
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
}

export function makePolarizationGeometry(q: CmbMap, u: CmbMap): BufferGeometry {
  if (
    q.asset.nside !== u.asset.nside ||
    q.asset.npix !== u.asset.npix ||
    q.asset.effective_lmax !== u.asset.effective_lmax
  )
    throw new Error("CMB Q/U resolution mismatch");
  const positions: number[] = [];
  // Keep the two opposite Morton children (1,2) of each NESTED parent:
  // a checkerboard in face coordinates, independent of amplitude or direction.
  // Half of NSIDE=64 gives twice the former NSIDE=32 glyph density.
  const thin = q.asset.nside >= 64;
  const displayedPixels = q.asset.npix / (thin ? 2 : 1);
  const spacing = Math.sqrt((4 * Math.PI) / displayedPixels) * LAST_SCATTERING_RADIUS;
  // E[P^2] = E[Q^2] + E[U^2], including nonzero supplied map means.
  // Length is strictly proportional to physical P (no floor or saturation).
  // The common scale is a display convention, not a physical spatial length.
  const amplitudeRms = Math.hypot(q.asset.std, q.asset.mean, u.asset.std, u.asset.mean);
  for (let pixel = 0; pixel < q.asset.npix; pixel++) {
    if (thin && (pixel & 1) === ((pixel >> 1) & 1)) continue;
    const ref = polarizationReference(q.asset.nside, pixel, q.values[pixel], u.values[pixel]);
    if (ref.amplitude === 0 || !insideCmbPatch(ref.normal)) continue;
    const halfLength = 0.3 * spacing * (ref.amplitude / amplitudeRms);
    // Small inward offset clears the existing faceted shell (unchanged tessellation).
    const center = ref.normal.clone().multiplyScalar(LAST_SCATTERING_RADIUS * 0.998);
    const a = center.clone().addScaledVector(ref.direction, -halfLength);
    const b = center.clone().addScaledVector(ref.direction, halfLength);
    // All four boundaries are convex planes through the observer: if both ends
    // are inside, the whole straight tangent segment is inside. Avoid floating edges.
    if (!insideCmbPatch(a) || !insideCmbPatch(b)) continue;
    positions.push(...a.toArray(), ...b.toArray());
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();
  return geometry;
}
