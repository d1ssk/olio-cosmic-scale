/// <reference types="node" />
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import reference from "./fixtures/cmb-healpy.json";
import metadata from "../public/models/cmb/metadata.json";
import { decodeCmbMap, type CmbAsset } from "../src/scenes/observable-universe/cmbAssets";
import {
  anglesToNestedPixel,
  nestedPixelAngles,
  polarizationReference,
  skyBasis,
} from "../src/scenes/observable-universe/healpix";
import {
  insideCmbPatch,
  LAST_SCATTERING_RADIUS,
  patchPoint,
} from "../src/scenes/observable-universe/cmbPatch";
import {
  makeCmbTexture,
  makePolarizationGeometry,
  scalarDisplayValue,
} from "../src/scenes/observable-universe/cmbRendering";

const readMap = (asset: CmbAsset) => {
  const bytes = readFileSync(`public/models/cmb/${asset.file}`);
  return decodeCmbMap(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    asset,
  );
};
function closeVector(actual: Vector3, expected: Vector3) {
  expect(actual.distanceTo(expected)).toBeLessThan(1e-12);
}

describe("HEALPix directions and COSMO polarization", () => {
  it("matches independently generated healpy reference centers, inverse directions and real Q/U records", () => {
    for (const fixture of reference.centers) {
      const angles = nestedPixelAngles(fixture.nside, fixture.pixel);
      const normal = skyBasis(angles.theta, angles.phi).normal;
      closeVector(normal, new Vector3(fixture.sky[0], fixture.sky[2], -fixture.sky[1]));
    }
    for (const fixture of reference.directions) {
      expect(anglesToNestedPixel(fixture.nside, fixture.theta, fixture.phi)).toBe(fixture.pixel);
    }
    for (const fixture of reference.polarization) {
      const record = polarizationReference(fixture.nside, fixture.pixel, fixture.q, fixture.u);
      expect(record.psi).toBeCloseTo(fixture.psi, 13);
      for (const key of ["eTheta", "ePhi", "direction"] as const) {
        closeVector(record[key], new Vector3(...(fixture[key] as [number, number, number])));
      }
      closeVector(record.normal, new Vector3(...(fixture.world as [number, number, number])));
    }
  });

  it("maps known Galactic directions with a proper, right-handed rotation", () => {
    closeVector(skyBasis(Math.PI / 2, 0).normal, new Vector3(1, 0, 0));
    closeVector(skyBasis(Math.PI / 2, Math.PI / 2).normal, new Vector3(0, 0, -1));
    closeVector(skyBasis(0, 0).normal, new Vector3(0, 1, 0));
    for (const [theta, phi] of [
      [0.3, 0.7],
      [2.7, 5.9],
      [Math.PI / 2, 0],
    ]) {
      const { normal, eTheta, ePhi } = skyBasis(theta, phi);
      closeVector(eTheta.clone().cross(ePhi), normal);
      expect(eTheta.dot(normal)).toBeCloseTo(0, 14);
      expect(ePhi.dot(normal)).toBeCloseTo(0, 14);
      // Analytic bases match actual increasing colatitude and longitude.
      const epsilon = 1e-6;
      const dt = skyBasis(theta + epsilon, phi)
        .normal.sub(skyBasis(theta - epsilon, phi).normal)
        .normalize();
      const dp = skyBasis(theta, phi + epsilon)
        .normal.sub(skyBasis(theta, phi - epsilon).normal)
        .normalize();
      expect(dt.distanceTo(eTheta)).toBeLessThan(1e-9);
      expect(dp.distanceTo(ePhi)).toBeLessThan(1e-9);
    }
  });

  it("round-trips every center in all 12 NESTED faces including polar caps", () => {
    for (const nside of [1, 2, 8, 32, 64]) {
      for (let pixel = 0; pixel < 12 * nside * nside; pixel++) {
        const { theta, phi } = nestedPixelAngles(nside, pixel);
        expect(anglesToNestedPixel(nside, theta, phi)).toBe(pixel);
      }
    }
  });

  it("uses the HEALPix tensor principal axis, without U sign or quarter-turn hacks", () => {
    for (const pixel of [0, 1023, 4096, 8192, 12287]) {
      for (const [q, u] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [0.3, -0.8],
      ]) {
        const ref = polarizationReference(32, pixel, q, u);
        const a = ref.direction.dot(ref.eTheta),
          b = ref.direction.dot(ref.ePhi);
        expect(ref.direction.dot(ref.normal)).toBeCloseTo(0, 13);
        expect(q * a + u * b).toBeCloseTo(ref.amplitude * a, 13);
        expect(u * a - q * b).toBeCloseTo(ref.amplitude * b, 13);
        expect(ref.amplitude * Math.cos(2 * ref.psi)).toBeCloseTo(q, 13);
        expect(ref.amplitude * Math.sin(2 * ref.psi)).toBeCloseTo(u, 13);
        const reversed = ref.eTheta
          .clone()
          .multiplyScalar(Math.cos(ref.psi + Math.PI))
          .addScaledVector(ref.ePhi, Math.sin(ref.psi + Math.PI));
        closeVector(reversed, ref.direction.clone().negate());
      }
    }
  });

  it("keeps all real Q/U segment endpoints within the same cut planes and on tangent planes", () => {
    const q = readMap(metadata.assets.Q_nside64),
      u = readMap(metadata.assets.U_nside64);
    const geometry = makePolarizationGeometry(q, u);
    const positions = geometry.getAttribute("position");
    expect(positions.count).toBeGreaterThan(1000);
    expect(positions.count).toBeLessThan(2 * q.asset.npix);
    for (let i = 0; i < positions.count; i += 2) {
      const a = new Vector3().fromBufferAttribute(positions, i);
      const b = new Vector3().fromBufferAttribute(positions, i + 1);
      expect(insideCmbPatch(a)).toBe(true);
      expect(insideCmbPatch(b)).toBe(true);
      const center = a.clone().add(b).multiplyScalar(0.5);
      expect(center.length()).toBeCloseTo(LAST_SCATTERING_RADIUS * 0.998, 5);
      expect(b.clone().sub(a).dot(center)).toBeCloseTo(0, 4);
    }
    expect(insideCmbPatch(patchPoint(1.01, 0, 10))).toBe(false);
    expect(insideCmbPatch(patchPoint(0, -1.01, 10))).toBe(false);
    geometry.dispose();
  });

  it("doubles glyph density approximately and scales length linearly with P", () => {
    const low = makePolarizationGeometry(
      readMap(metadata.assets.Q_nside32),
      readMap(metadata.assets.U_nside32),
    );
    const q = readMap(metadata.assets.Q_nside64),
      u = readMap(metadata.assets.U_nside64);
    const dense = makePolarizationGeometry(q, u);
    const ratio = dense.getAttribute("position").count / low.getAttribute("position").count;
    expect(ratio).toBeGreaterThan(1.9);
    expect(ratio).toBeLessThan(2.1);
    // A synthetic pair isolates length from orientation; metadata remains fixed
    // so doubling physical amplitude must double each surviving interior segment.
    const base = { ...q, values: new Float32Array(q.values.length).fill(0.2) };
    const zero = { ...u, values: new Float32Array(u.values.length) };
    const first = makePolarizationGeometry(base, zero);
    const second = makePolarizationGeometry(
      { ...base, values: new Float32Array(q.values.length).fill(0.4) },
      zero,
    );
    const length = (geometry: typeof first) => {
      const positions = geometry.getAttribute("position");
      return new Vector3()
        .fromBufferAttribute(positions, 0)
        .distanceTo(new Vector3().fromBufferAttribute(positions, 1));
    };
    expect(length(second) / length(first)).toBeCloseTo(2, 4);
    for (const geometry of [low, dense, first, second]) geometry.dispose();
  });

  it("reprojects physical T into unmirrored patch UV and never mutates source floats", () => {
    const map = readMap(metadata.assets.T_nside256);
    const original = map.values.slice();
    const texture = makeCmbTexture(map, "T");
    expect(texture.flipY).toBe(false);
    expect(map.values).toEqual(original);
    expect(scalarDisplayValue(3 * map.asset.std, map.asset.std)).toBe(1);
    expect(scalarDisplayValue(-9 * map.asset.std, map.asset.std)).toBe(-1);
    expect(scalarDisplayValue(0, map.asset.std)).toBe(0);
    const { width, height, data } = texture.image;
    for (const [x, y] of [
      [0, 0],
      [99, 345],
      [width - 1, height - 1],
    ]) {
      const n = patchPoint((2 * (x + 0.5)) / width - 1, (2 * (y + 0.5)) / height - 1, 1);
      const p = anglesToNestedPixel(map.asset.nside, Math.acos(n.y), Math.atan2(-n.z, n.x));
      const v = scalarDisplayValue(map.values[p], map.asset.std);
      expect(data![(y * width + x) * 4]).toBe(
        Math.round(255 + ((v < 0 ? 92 : 239) - 255) * Math.abs(v)),
      );
    }
    texture.dispose();
  });
});
