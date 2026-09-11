import { MEGAPARSEC_METERS } from "../../physics/constants";
import {
  matterGridCellOffset,
  type BaoDataset,
  type BaoManifest,
  type BaoStatistic,
} from "./baoData";

export const BAO_REFERENCE_METERS = 147 * MEGAPARSEC_METERS;
export const BAO_BOX_RENDER_SIZE = 10;
// The 147 Mpc ladder convention is mapped to the approximately 100 Mpc/h feature.
export const BAO_METERS_PER_SCENE_UNIT = BAO_REFERENCE_METERS / 2;
export const BAO_VIEW_METERS = BAO_METERS_PER_SCENE_UNIT * 14;

/** Default-view display convention: beside the screen-right, far vertical box edge. */
export function baoRulerPlacement(
  lengthMeters: number,
  metersPerSceneUnit: number,
  outwardOffset = 0,
): {
  base: [number, number, number];
  direction: [number, number, number];
} {
  const length = lengthMeters / metersPerSceneUnit;
  return {
    base: [
      BAO_BOX_RENDER_SIZE / 2 + 0.45 + outwardOffset,
      -length / 2,
      -BAO_BOX_RENDER_SIZE / 2 - 0.25,
    ],
    direction: [0, 1, 0],
  };
}

export function mpcHToScene(value: number, manifest: BaoManifest): number {
  return (value * BAO_BOX_RENDER_SIZE) / manifest.bao_region.size_mpc_h;
}

export function haloRenderData(dataset: BaoDataset): {
  positions: Float32Array;
  mass: Float32Array;
} {
  const { manifest, halos } = dataset;
  const positions = new Float32Array(halos.positionsMpcH.length);
  const mass = new Float32Array(halos.logMassHMsun.length);
  const massSpan = manifest.tracers.maximum_logM - manifest.tracers.minimum_logM;
  for (let i = 0; i < mass.length; i += 1) {
    positions[i * 3] = mpcHToScene(halos.positionsMpcH[i * 3], manifest);
    positions[i * 3 + 1] = mpcHToScene(halos.positionsMpcH[i * 3 + 1], manifest);
    positions[i * 3 + 2] = mpcHToScene(halos.positionsMpcH[i * 3 + 2], manifest);
    mass[i] = (halos.logMassHMsun[i] - manifest.tracers.minimum_logM) / massSpan;
  }
  return { positions, mass };
}

export function matterSlice(
  matter: Uint8Array,
  manifest: BaoManifest,
  fraction: number,
): { bytes: Uint8Array; index: number; positionMpcH: number; width: number; thickness: number } {
  const shape = manifest.files.matter_bao_128.shape;
  if (!shape) throw new Error("BAO matter shape is unavailable");
  const axisOrder = manifest.matter.axis_order;
  const zAxis = axisOrder.indexOf("z");
  const xAxis = axisOrder.indexOf("x");
  const yAxis = axisOrder.indexOf("y");
  const zLength = shape[zAxis];
  const index = Math.round(Math.min(1, Math.max(0, fraction)) * (zLength - 1));
  const strides = [shape[1] * shape[2], shape[2], 1];
  const bytes = new Uint8Array(shape[xAxis] * shape[yAxis]);
  const coordinates = [0, 0, 0];
  coordinates[zAxis] = index;
  for (let y = 0; y < shape[yAxis]; y += 1) {
    coordinates[yAxis] = y;
    for (let x = 0; x < shape[xAxis]; x += 1) {
      coordinates[xAxis] = x;
      const source = coordinates.reduce((sum, value, axis) => sum + value * strides[axis], 0);
      bytes[y * shape[xAxis] + x] = matter[source];
    }
  }
  const positionMpcH =
    manifest.bao_region.bounds_mpc_h[0] +
    (index + matterGridCellOffset(manifest)) * manifest.matter.cell_size_mpc_h;
  return {
    bytes,
    index,
    positionMpcH,
    width: shape[xAxis],
    thickness: mpcHToScene(manifest.matter.cell_size_mpc_h, manifest),
  };
}

export function baoPeak(statistic: BaoStatistic): { index: number; rMpcH: number; r2Xi: number } {
  const lower = statistic.r_max_mpc_h * 0.35;
  const upper = statistic.r_max_mpc_h * 0.65;
  let best = -1;
  for (let i = 1; i < statistic.r2_xi.length - 1; i += 1) {
    const r = statistic.r_mpc_h[i];
    const localPeak =
      statistic.r2_xi[i] >= statistic.r2_xi[i - 1] && statistic.r2_xi[i] >= statistic.r2_xi[i + 1];
    if (
      r >= lower &&
      r <= upper &&
      localPeak &&
      (best < 0 || statistic.r2_xi[i] > statistic.r2_xi[best])
    ) {
      best = i;
    }
  }
  if (best < 0) throw new Error("No BAO-scale maximum in the correlation statistic");
  return { index: best, rMpcH: statistic.r_mpc_h[best], r2Xi: statistic.r2_xi[best] };
}
