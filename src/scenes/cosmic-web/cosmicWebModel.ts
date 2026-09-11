import { BAO_BOX_RENDER_SIZE, BAO_REFERENCE_METERS } from "../bao/baoModel";
import type { BaoManifest } from "../bao/baoData";
import type { SceneId } from "../types";
import { GIGAPARSEC_METERS } from "../../physics/constants";

export const COSMIC_SLAB_TARGET_MPC_H = 50;
export const COSMIC_TRANSITION_DURATION_MS = 1_600;

// Ladder/viewport conventions are separate from the manifest-defined box geometry.
export const COSMIC_WEB_REFERENCE_METERS = 3 * GIGAPARSEC_METERS;
export const COSMIC_WEB_VIEW_METERS = 4 * GIGAPARSEC_METERS;

export function isCosmicDensityWorld(sceneId: SceneId): boolean {
  return sceneId === "bao" || sceneId === "cosmic-web";
}

export function isCosmicTransition(first: SceneId, second: SceneId): boolean {
  return isCosmicDensityWorld(first) && isCosmicDensityWorld(second) && first !== second;
}

export function fullBoxRenderSize(manifest: BaoManifest): number {
  return (BAO_BOX_RENDER_SIZE * manifest.box.size_mpc_h) / manifest.bao_region.size_mpc_h;
}

export function mpcHToSharedScene(value: number, manifest: BaoManifest): number {
  return (value * BAO_BOX_RENDER_SIZE) / manifest.bao_region.size_mpc_h;
}

/** Default-view convention: vertical rulers beside the slab, within its central plane. */
export function cosmicRulerPlacements(
  manifest: BaoManifest,
  metersPerSceneUnit: number,
): {
  reference: { base: [number, number, number]; direction: [number, number, number] };
  baoComparison: { base: [number, number, number]; direction: [number, number, number] };
} {
  const halfBox = fullBoxRenderSize(manifest) / 2;
  const referenceLength = COSMIC_WEB_REFERENCE_METERS / metersPerSceneUnit;
  const baoLength = BAO_REFERENCE_METERS / metersPerSceneUnit;
  const direction: [number, number, number] = [0, 1, 0];
  return {
    reference: {
      base: [0, -referenceLength / 2, -halfBox - 1.15],
      direction,
    },
    baoComparison: {
      base: [0, -baoLength / 2, -halfBox - 2.35],
      direction,
    },
  };
}

export function interpolateRulerBase(
  from: readonly [number, number, number],
  to: readonly [number, number, number],
  progress: number,
): [number, number, number] {
  const p = Math.min(1, Math.max(0, progress));
  return from.map((value, index) => value + (to[index] - value) * p) as [number, number, number];
}

export function textureCoordinateExpression(manifest: BaoManifest): string {
  const component: Record<string, string> = { x: "x", y: "y", z: "z" };
  const [slow, middle, fast] = manifest.matter.axis_order;
  if (!component[slow] || !component[middle] || !component[fast]) {
    throw new Error("Unsupported cosmic-web axis order");
  }
  return `vec3(p.${component[fast]}, p.${component[middle]}, p.${component[slow]})`;
}

export function cosmicLayerOpacities(progress: number): { bao: number; slab: number } {
  const p = Math.min(1, Math.max(0, progress));
  const smooth = (start: number, end: number) => {
    const t = Math.min(1, Math.max(0, (p - start) / (end - start)));
    return t * t * (3 - 2 * t);
  };
  return { slab: smooth(0.05, 0.68), bao: 1 - smooth(0.25, 0.86) };
}
