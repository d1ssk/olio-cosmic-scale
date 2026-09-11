import preparedSlab from "../../../public/data/bao/cosmic-slab.json";
import { loadBaoManifest, type BaoManifest } from "../bao/baoData";
import type { CosmicWebQuality } from "../types";
import { COSMIC_SLAB_TARGET_MPC_H } from "./cosmicWebModel";

export type CosmicWebLod = 256 | 512;

export type CosmicSlabWindow = {
  byteEndExclusive: number;
  byteStart: number;
  dimensions: [number, number, number];
  firstLayer: number;
  layerCount: number;
  lod: CosmicWebLod;
  normalAxis: "x" | "y" | "z";
  path: string;
  sourceByteSize: number;
  thicknessMpcH: number;
  preparedPath?: string;
};

export type CosmicSlabDataset = CosmicSlabWindow & {
  bytes: Uint8Array;
  manifest: BaoManifest;
};

const DATA_ROOT = `${import.meta.env.BASE_URL}data/bao/`;
const slabPromises = new Map<CosmicWebQuality, Promise<CosmicSlabDataset>>();

export function qualityLod(quality: CosmicWebQuality): CosmicWebLod {
  return quality === "high" ? 512 : 256;
}

export function centralSlabWindow(
  manifest: BaoManifest,
  lod: CosmicWebLod,
  targetThicknessMpcH = COSMIC_SLAB_TARGET_MPC_H,
): CosmicSlabWindow {
  const file = manifest.files[`matter_full_${lod}`];
  const shape = file?.shape;
  const axes = manifest.matter.axis_order;
  const uniqueAxes = new Set(axes);
  if (
    !file ||
    file.dtype !== "uint8" ||
    file.dtype !== manifest.matter.dtype ||
    file.order !== "C" ||
    file.order !== manifest.matter.order ||
    manifest.matter.stored_quantity !== "log10(rho/rho_mean)" ||
    uniqueAxes.size !== 3 ||
    !["x", "y", "z"].every((axis) => uniqueAxes.has(axis)) ||
    shape?.length !== 3 ||
    shape.some((size) => !Number.isInteger(size) || size !== lod) ||
    file.byte_size !== shape[0] * shape[1] * shape[2]
  ) {
    throw new Error(`Unsupported cosmic-web density encoding for LOD ${lod}`);
  }
  const [boxLower, boxUpper] = manifest.box.bounds_mpc_h;
  const [baoLower, baoUpper] = manifest.bao_region.bounds_mpc_h;
  const masterCellSize = manifest.box.size_mpc_h / manifest.matter.master_ngrid;
  if (
    !Number.isFinite(targetThicknessMpcH) ||
    targetThicknessMpcH <= 0 ||
    !Number.isFinite(manifest.box.size_mpc_h) ||
    !Number.isFinite(boxLower) ||
    !Number.isFinite(boxUpper) ||
    !Number.isInteger(manifest.matter.master_ngrid) ||
    manifest.matter.master_ngrid <= 0 ||
    !Number.isFinite(manifest.matter.cell_size_mpc_h) ||
    boxUpper - boxLower !== manifest.box.size_mpc_h ||
    (boxLower + boxUpper) / 2 !== (baoLower + baoUpper) / 2 ||
    baoUpper - baoLower !== manifest.bao_region.size_mpc_h ||
    manifest.bao_region.master_grid_slice[1] - manifest.bao_region.master_grid_slice[0] !==
      manifest.bao_region.matter_ngrid ||
    Math.abs(masterCellSize - manifest.matter.cell_size_mpc_h) > 1e-9
  ) {
    throw new Error("Cosmic-web and BAO geometry do not share the manifest center/grid");
  }
  const cellSizeMpcH = manifest.box.size_mpc_h / shape[0];
  const layerCount = Math.min(
    shape[0],
    2 * Math.max(1, Math.round(targetThicknessMpcH / cellSizeMpcH / 2)),
  );
  const firstLayer = Math.floor((shape[0] - layerCount) / 2);
  const bytesPerLayer = shape[1] * shape[2];
  const byteStart = firstLayer * bytesPerLayer;
  const byteEndExclusive = (firstLayer + layerCount) * bytesPerLayer;
  let preparedPath: string | undefined;
  if (lod === 512) {
    // The original manifest remains provenance; only this exact extracted window is served.
    if (
      preparedSlab.source_key !== `matter_full_${lod}` ||
      preparedSlab.source_path !== file.path ||
      preparedSlab.source_sha256 !== file.sha256 ||
      preparedSlab.source_byte_size !== file.byte_size ||
      preparedSlab.source_byte_start !== byteStart ||
      preparedSlab.source_byte_end_exclusive !== byteEndExclusive ||
      preparedSlab.byte_size !== byteEndExclusive - byteStart ||
      preparedSlab.first_layer !== firstLayer ||
      preparedSlab.layer_count !== layerCount ||
      preparedSlab.thickness_mpc_h !== layerCount * cellSizeMpcH ||
      preparedSlab.dtype !== file.dtype ||
      preparedSlab.order !== file.order ||
      JSON.stringify(preparedSlab.shape) !== JSON.stringify([layerCount, shape[1], shape[2]]) ||
      JSON.stringify(preparedSlab.axis_order) !== JSON.stringify(axes) ||
      !/^[a-f0-9]{64}$/.test(preparedSlab.sha256)
    ) {
      throw new Error("Prepared cosmic-web slab does not match the manifest window");
    }
    preparedPath = preparedSlab.path;
  }
  return {
    byteEndExclusive,
    byteStart,
    preparedPath,
    dimensions: [shape[2], shape[1], layerCount],
    firstLayer,
    layerCount,
    lod,
    normalAxis: axes[0] as "x" | "y" | "z",
    path: file.path,
    sourceByteSize: file.byte_size,
    thicknessMpcH: layerCount * cellSizeMpcH,
  };
}

function assetUrl(path: string): string {
  if (!path || path.startsWith("/") || path.includes("..") || path.includes("\\")) {
    throw new Error(`Unsafe cosmic-web asset path: ${path}`);
  }
  return `${DATA_ROOT}${path}`;
}

async function copyWindowFromFullResponse(
  response: Response,
  start: number,
  endExclusive: number,
): Promise<Uint8Array> {
  if (!response.body) throw new Error("Range unsupported and response streaming unavailable");
  const output = new Uint8Array(endExclusive - start);
  const reader = response.body.getReader();
  let sourceOffset = 0;
  let copied = 0;
  while (copied < output.byteLength) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunkEnd = sourceOffset + value.byteLength;
    const overlapStart = Math.max(sourceOffset, start);
    const overlapEnd = Math.min(chunkEnd, endExclusive);
    if (overlapEnd > overlapStart) {
      const sourceStart = overlapStart - sourceOffset;
      output.set(value.subarray(sourceStart, sourceStart + overlapEnd - overlapStart), copied);
      copied += overlapEnd - overlapStart;
    }
    sourceOffset = chunkEnd;
    if (sourceOffset >= endExclusive) await reader.cancel();
  }
  if (copied !== output.byteLength) throw new Error("Incomplete cosmic-web slab response");
  return output;
}

export async function fetchSlabBytes(window: CosmicSlabWindow): Promise<Uint8Array> {
  if (window.preparedPath) {
    const response = await fetch(assetUrl(window.preparedPath));
    if (!response.ok)
      throw new Error(`Cosmic-web data HTTP ${response.status}: ${window.preparedPath}`);
    if (response.status !== 200) throw new Error("Expected complete prepared cosmic-web slab");
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength !== window.byteEndExclusive - window.byteStart) {
      throw new Error("Prepared cosmic-web slab byte length mismatch");
    }
    return bytes;
  }
  const lastByte = window.byteEndExclusive - 1;
  const response = await fetch(assetUrl(window.path), {
    headers: { Range: `bytes=${window.byteStart}-${lastByte}` },
  });
  if (!response.ok) throw new Error(`Cosmic-web data HTTP ${response.status}: ${window.path}`);
  if (response.status === 206) {
    const contentRange = response.headers.get("Content-Range");
    if (
      contentRange &&
      contentRange !== `bytes ${window.byteStart}-${lastByte}/${window.sourceByteSize}`
    ) {
      throw new Error("Cosmic-web Content-Range does not match the manifest window");
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength !== window.byteEndExclusive - window.byteStart) {
      throw new Error("Cosmic-web slab byte length mismatch");
    }
    return bytes;
  }
  if (response.status !== 200) throw new Error("Unsupported cosmic-web range response");
  return copyWindowFromFullResponse(response, window.byteStart, window.byteEndExclusive);
}

export function loadCosmicSlab(quality: CosmicWebQuality): Promise<CosmicSlabDataset> {
  let promise = slabPromises.get(quality);
  if (!promise) {
    promise = loadBaoManifest().then(async (manifest) => {
      const window = centralSlabWindow(manifest, qualityLod(quality));
      return { ...window, bytes: await fetchSlabBytes(window), manifest };
    });
    slabPromises.set(quality, promise);
  }
  return promise;
}
