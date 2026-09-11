import {
  createWedgeSurfaces,
  tracerNearWeights,
  WEDGE_RENDER,
} from "../src/scenes/observable-universe/wedgeRendering";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Matrix4, Vector3 } from "three";
import { AXIS, SIDE, UP, LAST_SCATTERING_RADIUS } from "../src/scenes/observable-universe/cmbPatch";
import {
  decodeWedgeLayer,
  validateWedgeMetadata,
  WEDGE_UNITS_PER_GPC,
} from "../src/scenes/observable-universe/wedgeAssets";

const base = "public/models/observable-universe-wedge/";
const metadata = validateWedgeMetadata(JSON.parse(readFileSync(base + "metadata.json", "utf8")));
const binary = (name: string) => {
  const bytes = readFileSync(base + name);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
};
describe("supplied light-cone wedge", () => {
  it("tapers the observer-side emphasis monotonically by radial distance, not axis or thickness", () => {
    const radius = metadata.geometry.chi_max_gpc;
    const range = radius * WEDGE_RENDER.tracerBoostRadiusFraction;
    const positions = new Float32Array([0, 0, 0, 0, 0, range / 2, 0, 0, range, 0, 0, radius]);
    const before = positions.slice();
    const weights = tracerNearWeights(positions, radius);
    expect(weights[0]).toBe(1);
    expect(weights[1]).toBeCloseTo(0.5);
    expect(weights[2]).toBeCloseTo(0);
    expect(weights[3]).toBe(0);
    expect(positions).toEqual(before);
    const r = range / 2,
      a = 0.15;
    const equalRadii = tracerNearWeights(
      new Float32Array([0, -0.098, r, r * Math.sin(a), 0.098, r * Math.cos(a)]),
      radius,
    );
    expect(equalRadii[0]).toBeCloseTo(equalRadii[1], 6);
    for (let i = 1; i < weights.length; i++) expect(weights[i]).toBeLessThanOrEqual(weights[i - 1]);
  });
  it("centers the opaque plane and compresses a symmetric closed sector without changing source thickness", () => {
    const { midplane, sector } = createWedgeSurfaces(
      metadata.geometry,
      metadata.geometry.chi_max_gpc,
    );
    const center = midplane.getAttribute("position");
    for (let i = 0; i < center.count; i++) expect(center.getY(i)).toBe(0);
    const surface = sector.getAttribute("position");
    let min = Infinity,
      max = -Infinity;
    for (let i = 0; i < surface.count; i++) {
      const y = surface.getY(i) * WEDGE_RENDER.thicknessScale;
      min = Math.min(min, y);
      max = Math.max(max, y);
      expect(Math.hypot(surface.getX(i), y, surface.getZ(i))).toBeLessThanOrEqual(
        metadata.geometry.chi_max_gpc + 1e-6,
      );
    }
    expect(min).toBeCloseTo(-max);
    expect(max - min).toBeCloseTo(metadata.geometry.thickness_gpc * WEDGE_RENDER.thicknessScale);
    expect(WEDGE_RENDER.thicknessScale).toBeGreaterThan(0);
    expect(WEDGE_RENDER.thicknessScale).toBeLessThan(1);
    const edges = new Map<string, number>();
    const index = sector.getIndex()!;
    for (let i = 0; i < index.count; i += 3) {
      const tri = [index.getX(i), index.getX(i + 1), index.getX(i + 2)];
      for (let j = 0; j < 3; j++) {
        const key = [tri[j], tri[(j + 1) % 3]].sort((a, b) => a - b).join(",");
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    }
    expect([...edges.values()].every((count) => count === 2)).toBe(true);
    midplane.dispose();
    sector.dispose();
  });
  it("preserves the right-handed shared frame and the existing SI normalization", () => {
    const matrix = new Matrix4().makeBasis(SIDE, UP, AXIS);
    expect(matrix.determinant()).toBeCloseTo(1);
    expect(new Vector3(0, 0, 1).applyMatrix4(matrix).distanceTo(AXIS)).toBeLessThan(1e-12);
    expect(metadata.geometry.chi_max_gpc * WEDGE_UNITS_PER_GPC).toBeCloseTo(LAST_SCATTERING_RADIUS);
    expect(metadata.geometry.thickness_gpc * WEDGE_UNITS_PER_GPC).toBeCloseTo(0.14);
    expect(metadata.radial_ticks.at(-1)?.chi_gpc).toBeCloseTo(13.886327776455873);
  });
  for (const kind of ["matter", "tracer"] as const) {
    const name = kind === "matter" ? "matter_splats.f32" : "tracer_points.f32";
    it(`preserves every ${kind} position, size and intensity within the declared wedge`, () => {
      const buffer = binary(name);
      const layer = decodeWedgeLayer(buffer, metadata, kind);
      const source = new DataView(buffer);
      const fields = metadata.formats[`${kind}_fields`];
      const stride = metadata.formats[`${kind}_stride`];
      expect(layer.sizes.length).toBe(metadata.counts[`${kind}_count`]);
      for (let i = 0; i < layer.sizes.length; i++) {
        const [x, y, z] = layer.positions.subarray(i * 3, i * 3 + 3);
        expect(Math.abs(Math.atan2(x, z))).toBeLessThanOrEqual(
          (metadata.geometry.half_angle_deg * Math.PI) / 180 + 1e-7,
        );
        expect(Math.abs(y)).toBeLessThanOrEqual(metadata.geometry.half_thickness_gpc + 1e-7);
        expect(Math.hypot(x, z)).toBeLessThanOrEqual(metadata.geometry.chi_max_gpc + 1e-6);
        for (const [f, value] of [
          ["x_gpc", x],
          ["y_gpc", y],
          ["z_gpc", z],
          ["size_gpc", layer.sizes[i]],
          [kind === "matter" ? "alpha" : "brightness", layer.intensities[i]],
        ] as const) {
          expect(value).toBe(source.getFloat32((i * stride + fields.indexOf(f)) * 4, true));
        }
      }
    });
    it(`rejects truncated and nonfinite ${kind} data`, () => {
      const b = binary(name);
      expect(() => decodeWedgeLayer(b.slice(0, -4), metadata, kind)).toThrow(/bytes/);
      new DataView(b).setFloat32(0, NaN, true);
      expect(() => decodeWedgeLayer(b, metadata, kind)).toThrow(/invalid value/);
    });
  }
  it("rejects incompatible metadata instead of assuming stride or orientation", () => {
    const invalid = structuredClone(metadata);
    invalid.formats.matter_stride += 1;
    expect(() => validateWedgeMetadata(invalid)).toThrow(/format/);
    invalid.geometry.axis_convention = "left-handed";
    expect(() => validateWedgeMetadata(invalid)).toThrow(/coordinate/);
  });
});
