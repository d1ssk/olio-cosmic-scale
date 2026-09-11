import { BufferAttribute, BufferGeometry } from "three";
import type { WedgeMetadata } from "./wedgeAssets";

/** Visualization only. Source coordinates, sizes and intensities remain unchanged. */
export const WEDGE_RENDER = {
  // Shared local-Y compression for the sector, both point layers and debug bounds.
  thicknessScale: 0.25,
  matterOpacityScale: 6.0,
  matterSizeScale: 5.6,
  tracerBrightnessScale: 3.4,
  tracerSizeScale: 15.0,
  // Extra observer-side multipliers, smoothly returning to 1 at the range boundary.
  tracerNearSizeBoost: 1.4,
  tracerNearBrightnessBoost: 1.5,
  tracerBoostRadiusFraction: 0.6,
  // Sprite diameters in CSS pixels, not physical galaxy diameters.
  matterMinPixels: 2,
  matterMaxPixels: 18,
  tracerMinPixels: 1.2,
  tracerMaxPixels: 3.5,
  midplaneColor: "#05090e",
  sectorColor: "#7595b8",
  sectorOpacity: 0.105,
};

export function createWedgeSurfaces(g: WedgeMetadata["geometry"], radius: number) {
  const halfAngle = (g.half_angle_deg * Math.PI) / 180;
  // Keep even the uncompressed outer corners inside the adopted CMB sphere.
  const r = Math.sqrt(radius ** 2 - g.half_thickness_gpc ** 2);
  const arc = Array.from({ length: 65 }, (_, i): [number, number, number] => {
    const angle = -halfAngle + (2 * halfAngle * i) / 64;
    return [r * Math.sin(angle), 0, r * Math.cos(angle)];
  });
  const planar = [0, 0, 0, ...arc.flat()];
  const fan = Array.from({ length: arc.length - 1 }, (_, i) => [0, i + 1, i + 2]).flat();
  const midplane = new BufferGeometry();
  midplane.setAttribute("position", new BufferAttribute(new Float32Array(planar), 3));
  midplane.setIndex(fan);
  const row = planar.length / 3;
  const positions: number[] = [];
  for (const y of [-g.half_thickness_gpc, g.half_thickness_gpc]) {
    for (let i = 0; i < row; i++) positions.push(planar[i * 3], y, planar[i * 3 + 2]);
  }
  const indices = [...fan, ...fan.map((i) => i + row)];
  // Close the arc and both radial sides, including the observer end.
  for (let i = 0; i < row; i++) {
    const next = (i + 1) % row;
    indices.push(i, next, i + row, next, next + row, i + row);
  }
  const sector = new BufferGeometry();
  sector.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  sector.setIndex(indices);
  return { midplane, sector, arc };
}

/** Radial display weight, independent of camera, wedge angle and compressed Y.
 * Uses the asset's XZ radial-distance convention, not Cartesian Z as redshift.
 */
export function tracerNearWeights(positions: Float32Array, radiusGpc: number): Float32Array {
  const weights = new Float32Array(positions.length / 3);
  const range = radiusGpc * WEDGE_RENDER.tracerBoostRadiusFraction;
  for (let i = 0; i < weights.length; i++) {
    const distance = Math.hypot(positions[i * 3], positions[i * 3 + 2]);
    const t = Math.min(1, Math.max(0, distance / range));
    weights[i] = 1 - t * t * (3 - 2 * t);
  }
  return weights;
}
