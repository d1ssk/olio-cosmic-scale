/// <reference types="node" />
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import metadata from "../public/models/cmb/metadata.json";
import {
  createCmbLoader,
  decodeCmbMap,
  validateMetadata,
  type CmbAsset,
} from "../src/scenes/observable-universe/cmbAssets";

function binary(asset: CmbAsset): ArrayBuffer {
  const file = readFileSync(`public/models/cmb/${asset.file}`);
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
}

describe("supplied joint CMB assets", () => {
  it("validates metadata and every supplied binary, statistics and provenance hash", () => {
    expect(validateMetadata(metadata)).toBe(metadata);
    for (const asset of Object.values(metadata.assets)) {
      const buffer = binary(asset);
      expect(createHash("sha256").update(new Uint8Array(buffer)).digest("hex")).toBe(asset.sha256);
      const map = decodeCmbMap(buffer, asset);
      expect(map.values.length).toBe(asset.npix);
      expect(map.values.byteLength).toBe(asset.byte_length);
    }
  });

  it("rejects wrong ordering, truncation, pixel counts, statistics and NaN", () => {
    expect(() => validateMetadata({ ...metadata, ordering: "RING" })).toThrow();
    const asset = metadata.assets.Q_nside32;
    expect(() => decodeCmbMap(new ArrayBuffer(4), asset)).toThrow(/byte length/);
    expect(() => decodeCmbMap(binary(asset), { ...asset, npix: 1 })).toThrow(/pixel count/);
    expect(() => decodeCmbMap(binary(asset), { ...asset, std: 2 * asset.std })).toThrow(
      /statistics/,
    );
    const corrupted = binary(asset);
    new Float32Array(corrupted)[42] = NaN;
    expect(() => decodeCmbMap(corrupted, asset)).toThrow(/nonfinite pixel 42/);
  });

  it("loads only requested standard fields and caches concurrent and later requests", async () => {
    const fetcher = vi.fn(async (url: RequestInfo | URL) => {
      const name = String(url).split("/").at(-1);
      return name === "metadata.json"
        ? new Response(JSON.stringify(metadata))
        : new Response(
            binary(Object.values(metadata.assets).find((asset) => asset.file === name)!),
          );
    });
    const loader = createCmbLoader("/fixture/", fetcher);
    expect(fetcher).not.toHaveBeenCalled();
    const [t1, t2] = await Promise.all([loader.load("T"), loader.load("T")]);
    expect(t1).toBe(t2);
    expect(await loader.load("T")).toBe(t1);
    expect(fetcher.mock.calls.map((call) => call[0])).toEqual([
      "/fixture/metadata.json",
      `/fixture/${metadata.assets.T_nside256.file}`,
    ]);
    const [q, u] = await Promise.all([loader.load("Q"), loader.load("U")]);
    expect(q.asset.nside).toBe(64);
    expect(u.asset.effective_lmax).toBe(q.asset.effective_lmax);
    expect(fetcher).toHaveBeenCalledTimes(4);
    expect((await loader.load("E")).asset.nside).toBe(256);
  });

  it("propagates HTTP failure without a synthetic fallback or repeated fetch", async () => {
    const fetcher = vi.fn(async () => new Response("missing", { status: 404 }));
    const loader = createCmbLoader("/fixture/", fetcher);
    await expect(loader.load("T")).rejects.toThrow(/HTTP 404/);
    await expect(loader.load("T")).rejects.toThrow(/HTTP 404/);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
