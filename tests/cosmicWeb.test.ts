import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import preparedSlab from "../public/data/bao/cosmic-slab.json";
import rawManifest from "../public/data/bao/manifest.json";
import { afterEach, describe, expect, it, vi } from "vitest";
import { validateBaoManifest } from "../src/scenes/bao/baoData";
import {
  centralSlabWindow,
  fetchSlabBytes,
  qualityLod,
} from "../src/scenes/cosmic-web/cosmicWebData";
import {
  COSMIC_WEB_REFERENCE_METERS,
  cosmicRulerPlacements,
  cosmicLayerOpacities,
  fullBoxRenderSize,
  interpolateRulerBase,
  isCosmicTransition,
  textureCoordinateExpression,
} from "../src/scenes/cosmic-web/cosmicWebModel";
import { BAO_REFERENCE_METERS, baoRulerPlacement } from "../src/scenes/bao/baoModel";
import { GIGAPARSEC_METERS } from "../src/physics/constants";
import { sceneRegistry } from "../src/app/sceneRegistry";
import { DEFAULT_COSMIC_WEB_QUALITY } from "../src/scenes/types";

const manifest = validateBaoManifest(rawManifest);

afterEach(() => vi.unstubAllGlobals());

describe("manifest-backed fixed cosmic-web slab", () => {
  it("uses the 512³ slab as the default quality", () => {
    expect(DEFAULT_COSMIC_WEB_QUALITY).toBe("high");
    expect(qualityLod(DEFAULT_COSMIC_WEB_QUALITY)).toBe(512);
  });

  it("selects only the centered contiguous slab window at each quality", () => {
    const standard = centralSlabWindow(manifest, qualityLod("standard"));
    const high = centralSlabWindow(manifest, qualityLod("high"));
    expect(standard).toMatchObject({
      lod: 256,
      normalAxis: "x",
      firstLayer: 125,
      layerCount: 6,
      dimensions: [256, 256, 6],
      thicknessMpcH: 46.875,
    });
    expect(high).toMatchObject({
      lod: 512,
      normalAxis: "x",
      firstLayer: 250,
      layerCount: 12,
      dimensions: [512, 512, 12],
      thicknessMpcH: 46.875,
    });
    expect(standard.byteEndExclusive - standard.byteStart).toBe(256 * 256 * 6);
    expect(high.byteEndExclusive - high.byteStart).toBe(512 * 512 * 12);
    expect(high.byteEndExclusive - high.byteStart).toBeLessThan(high.sourceByteSize / 40);
  });

  it("keeps the existing BAO normalization and expands the manifest full box around it", () => {
    expect(fullBoxRenderSize(manifest)).toBe(40);
    expect(textureCoordinateExpression(manifest)).toBe("vec3(p.z, p.y, p.x)");
  });

  it("uses a 3 Gpc reference and places both vertical rulers beside the slab", () => {
    const metersPerUnit = sceneRegistry["cosmic-web"].metersPerSceneUnit;
    const placement = cosmicRulerPlacements(manifest, metersPerUnit);
    const halfBox = fullBoxRenderSize(manifest) / 2;
    expect(COSMIC_WEB_REFERENCE_METERS).toBe(3 * GIGAPARSEC_METERS);
    expect(placement.reference.base[0]).toBe(0);
    expect(placement.baoComparison.base[0]).toBe(0);
    expect(placement.reference.base[2]).toBeLessThan(-halfBox);
    expect(placement.reference.base[1]).toBe(-COSMIC_WEB_REFERENCE_METERS / metersPerUnit / 2);
    expect(placement.baoComparison.base[2]).toBeLessThan(placement.reference.base[2]);
    expect(placement.baoComparison.base[1]).toBe(-BAO_REFERENCE_METERS / metersPerUnit / 2);
  });

  it("moves the 147 Mpc ruler without changing its scene-space length", () => {
    const metersPerUnit = sceneRegistry.bao.metersPerSceneUnit;
    const start = baoRulerPlacement(BAO_REFERENCE_METERS, metersPerUnit).base;
    const end = cosmicRulerPlacements(manifest, metersPerUnit).baoComparison.base;
    expect(interpolateRulerBase(start, end, 0)).toEqual(start);
    expect(interpolateRulerBase(start, end, 1)).toEqual(end);
    expect(BAO_REFERENCE_METERS / metersPerUnit).toBe(2);
  });

  it("rejects a manifest whose full grid no longer matches its declared cell size", () => {
    const changed = structuredClone(manifest);
    changed.matter.master_ngrid = 256;
    expect(() => centralSlabWindow(changed, 256)).toThrow(/share the manifest center\/grid/);
  });

  it("authenticates the prepared high-quality slab and retains the original coordinate window", () => {
    const window = centralSlabWindow(manifest, 512);
    const bytes = readFileSync(`public/data/bao/${window.preparedPath}`);
    expect(bytes.byteLength).toBe(window.byteEndExclusive - window.byteStart);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(preparedSlab.sha256);
    expect(preparedSlab.source_sha256).toBe(manifest.files.matter_full_512.sha256);
    expect(preparedSlab.source_byte_start).toBe(window.byteStart);
    expect(preparedSlab.source_byte_end_exclusive).toBe(window.byteEndExclusive);
    const changed = structuredClone(manifest);
    changed.files.matter_full_512.sha256 = "0".repeat(64);
    expect(() => centralSlabWindow(changed, 512)).toThrow(/does not match/);
    expect(() => centralSlabWindow(manifest, 512, 100)).toThrow(/does not match/);
  });

  it("fetches the prepared high-quality bytes without requesting the original volume or Range", async () => {
    const window = centralSlabWindow(manifest, 512);
    const source = readFileSync(`public/data/bao/${window.preparedPath}`);
    const fetchMock = vi.fn(async () => new Response(new Uint8Array(source), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const bytes = await fetchSlabBytes(window);
    expect(bytes.byteLength).toBe(source.byteLength);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(preparedSlab.sha256);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(`/data/bao/${window.preparedPath}`);
  });

  it("rejects incomplete prepared slabs and HTTP failures without falling back to the full volume", async () => {
    const window = centralSlabWindow(manifest, 512);
    const fetchMock = vi.fn(async () => new Response(new Uint8Array(8), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchSlabBytes(window)).rejects.toThrow(/byte length/);
    fetchMock.mockImplementation(async () => new Response(null, { status: 404 }));
    await expect(fetchSlabBytes(window)).rejects.toThrow(/HTTP 404/);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("requests exactly the source byte range", async () => {
    const window = centralSlabWindow(manifest, 256);
    const length = window.byteEndExclusive - window.byteStart;
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.headers).toEqual({
        Range: `bytes=${window.byteStart}-${window.byteEndExclusive - 1}`,
      });
      return new Response(new Uint8Array(length).fill(17), {
        status: 206,
        headers: {
          "Content-Range": `bytes ${window.byteStart}-${window.byteEndExclusive - 1}/${window.sourceByteSize}`,
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const bytes = await fetchSlabBytes(window);
    expect(bytes).toHaveLength(length);
    expect(bytes[0]).toBe(17);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("stages only the explicit BAO/cosmic scene transition", () => {
    expect(isCosmicTransition("bao", "cosmic-web")).toBe(true);
    expect(isCosmicTransition("bao", "virgo")).toBe(false);
    expect(cosmicLayerOpacities(0)).toEqual({ slab: 0, bao: 1 });
    expect(cosmicLayerOpacities(1)).toEqual({ slab: 1, bao: 0 });
  });
});
