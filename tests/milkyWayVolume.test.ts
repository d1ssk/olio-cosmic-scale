import manifest from "../public/models/milky-way/volume-256x256x32.json";
import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { KILOPARSEC_METERS } from "../src/physics/constants";
import {
  VOLUME_DATA,
  validateVolumeBytes,
  volumeModelMatrix,
} from "../src/scenes/milky-way/volumeData";

describe("OpenSpace volume provenance and physical frame", () => {
  it("matches the 8 MiB RGBA8 preprocessing manifest and rejects incomplete payloads", () => {
    expect(manifest.dimensionsXYZ).toEqual(VOLUME_DATA.dimensions);
    expect(manifest.bytes).toBe(VOLUME_DATA.dimensions.reduce((a, b) => a * b, 4));
    expect(manifest.bytes).toBe(VOLUME_DATA.bytes);
    expect(validateVolumeBytes(new ArrayBuffer(manifest.bytes))).toHaveLength(manifest.bytes);
    expect(manifest.physicalSizeMetersXYZ).toEqual(VOLUME_DATA.sizeMeters);
    expect(() => validateVolumeBytes(new ArrayBuffer(16))).toThrow();
  });
  it("keeps the upstream author, simulation provenance and license with the redistributed volume", () => {
    expect(manifest.upstreamAsset).toEqual({
      Name: "Milky Way Volume",
      Author: "OpenSpace Team",
      Description: "Volumetric rendering of Milky Way galaxy based on simulations from NAOJ",
      License: "MIT License",
      URL: "https://openspaceproject.com",
    });
    expect(manifest.licenseFile).toBe("LICENSE-OpenSpace.md");
    expect(manifest.attributionFile).toBe("ATTRIBUTION.json");
  });
  it("samples at most half a physical voxel and covers the entire fixed-phase ray", () => {
    const width = Math.max(...VOLUME_DATA.sizeMeters);
    const smallestVoxel =
      Math.min(...VOLUME_DATA.sizeMeters.map((size, axis) => size / VOLUME_DATA.dimensions[axis])) /
      width;
    expect(VOLUME_DATA.stepSize).toBeLessThanOrEqual(smallestVoxel / 2);
    const diagonal = Math.hypot(...VOLUME_DATA.sizeMeters.map((size) => size / width));
    // Two clipped end cells can straddle the galaxy-centered sample lattice.
    expect(Math.ceil(diagonal / VOLUME_DATA.stepSize) + 2).toBeLessThanOrEqual(
      VOLUME_DATA.maxSteps,
    );
  });
  it("retains physical dimensions, handedness and Galactic north without fitting the box to 30 kpc", () => {
    const matrix = volumeModelMatrix(KILOPARSEC_METERS);
    const origin = new Vector3().applyMatrix4(matrix);
    expect(origin.length()).toBe(0);
    const axes = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)].map((axis) =>
      axis.applyMatrix4(matrix),
    );
    axes.forEach((axis, i) =>
      expect(axis.length()).toBeCloseTo(VOLUME_DATA.sizeMeters[i] / KILOPARSEC_METERS, 10),
    );
    expect(axes[2].length() / axes[0].length()).toBeCloseTo(0.125, 12);
    expect(matrix.determinant()).toBeGreaterThan(0);
    expect(axes[2].clone().normalize().y).toBeGreaterThan(0.999);
    expect(axes[0].dot(axes[2])).toBeCloseTo(0, 10);
    expect(axes[0].length()).toBeGreaterThan(38);
    // Maximum ray length within this physical box fits the fixed loop at default quality.
    expect(Math.ceil(Math.hypot(1, 1, 0.125) / VOLUME_DATA.stepSize)).toBeLessThan(
      VOLUME_DATA.maxSteps,
    );
  });
});
