import rawManifest from "../public/data/bao/manifest.json";
import rawStatistic from "../public/data/bao/stats/bao_xi.json";
import { describe, expect, it } from "vitest";
import {
  decodeHaloBuffer,
  validateBaoManifest,
  validateBaoStatistic,
  type BaoManifest,
} from "../src/scenes/bao/baoData";
import {
  BAO_METERS_PER_SCENE_UNIT,
  BAO_REFERENCE_METERS,
  baoPeak,
  baoRulerPlacement,
  matterSlice,
  mpcHToScene,
} from "../src/scenes/bao/baoModel";
import { VIRGO_REFERENCE_METERS } from "../src/scenes/virgo/virgoData";

function smallManifest(): BaoManifest {
  const value = structuredClone(rawManifest);
  value.bao_region.matter_ngrid = 2;
  value.matter.cell_size_mpc_h = value.bao_region.size_mpc_h / 2;
  value.files.matter_bao_128.shape = [2, 2, 2];
  value.files.matter_bao_128.byte_size = 8;
  value.tracers.count = 1;
  value.files.halos_bao.shape = [1, 4];
  value.files.halos_bao.byte_size = value.tracers.record_stride_bytes;
  return validateBaoManifest(value);
}

describe("BAO manifest-backed decoding", () => {
  it("accepts the supplied manifest and statistic", () => {
    expect(validateBaoManifest(rawManifest).tracers.count).toBe(500_000);
    const statistic = validateBaoStatistic(rawStatistic);
    expect(statistic.r_mpc_h).toHaveLength(100);
    expect(baoPeak(statistic).rMpcH).toBe(103);
  });

  it("decodes little-endian halo records from manifest ranges", () => {
    const manifest = smallManifest();
    const buffer = new ArrayBuffer(manifest.tracers.record_stride_bytes);
    const view = new DataView(buffer);
    view.setUint16(0, 0, true);
    view.setUint16(2, 65_535, true);
    view.setUint16(4, 32_768, true);
    view.setUint16(6, 65_535, true);
    const decoded = decodeHaloBuffer(buffer, manifest);
    expect([...decoded.positionsMpcH.slice(0, 2)]).toEqual([-250, 250]);
    expect(decoded.positionsMpcH[2]).toBeCloseTo(0, 1);
    expect(decoded.logMassHMsun[0]).toBeCloseTo(manifest.tracers.maximum_logM, 5);
  });

  it("extracts a z slab from C-order [x,y,z] matter without changing coordinates", () => {
    const manifest = smallManifest();
    const slice = matterSlice(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]), manifest, 1);
    expect([...slice.bytes]).toEqual([1, 5, 3, 7]);
    expect(slice.positionMpcH).toBe(125);
    expect(mpcHToScene(manifest.bao_region.bounds_mpc_h[1], manifest)).toBe(5);
  });

  it("centers both vertical rulers beside the default-view right rear edge", () => {
    const reference = baoRulerPlacement(BAO_REFERENCE_METERS, BAO_METERS_PER_SCENE_UNIT);
    const comparison = baoRulerPlacement(VIRGO_REFERENCE_METERS, BAO_METERS_PER_SCENE_UNIT, 0.35);
    expect(reference.direction).toEqual([0, 1, 0]);
    expect(comparison.direction).toEqual(reference.direction);
    expect(reference.base[1] + BAO_REFERENCE_METERS / BAO_METERS_PER_SCENE_UNIT / 2).toBe(0);
    expect(comparison.base[1] + VIRGO_REFERENCE_METERS / BAO_METERS_PER_SCENE_UNIT / 2).toBe(0);
    expect(comparison.base[0]).toBeGreaterThan(reference.base[0]);
    expect(reference.base[2]).toBeLessThan(-5);
  });
});
