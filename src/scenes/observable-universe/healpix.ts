import { Vector3 } from "three";

/** HEALPix NESTED: Morton-interleaved (x,y) in one of 12 base faces. */
export function nestedPixelAngles(nside: number, pixel: number): { theta: number; phi: number } {
  if (
    !Number.isInteger(nside) ||
    nside < 1 ||
    (nside & (nside - 1)) !== 0 ||
    !Number.isInteger(pixel) ||
    pixel < 0 ||
    pixel >= 12 * nside * nside
  ) {
    throw new Error("Invalid HEALPix NESTED pixel / NSIDE");
  }
  const face = Math.floor(pixel / (nside * nside));
  let bits = pixel % (nside * nside);
  let x = 0;
  let y = 0;
  for (let scale = 1; scale < nside; scale *= 2) {
    x += (bits & 1) * scale;
    y += ((bits >> 1) & 1) * scale;
    bits >>>= 2;
  }
  const ring = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4][face] * nside - x - y - 1;
  let nr = nside;
  let z = ((2 * nside - ring) * 2) / (3 * nside);
  let shift = (ring - nside) & 1;
  if (ring < nside) {
    nr = ring;
    z = 1 - (nr * nr) / (3 * nside * nside);
    shift = 0;
  } else if (ring > 3 * nside) {
    nr = 4 * nside - ring;
    z = -1 + (nr * nr) / (3 * nside * nside);
    shift = 0;
  }
  let jp = ([1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7][face] * nr + x - y + 1 + shift) / 2;
  if (jp > 4 * nr) jp -= 4 * nr;
  if (jp < 1) jp += 4 * nr;
  return { theta: Math.acos(z), phi: ((jp - (shift + 1) / 2) * Math.PI) / (2 * nr) };
}

/** Inverse HEALPix face equations; used once per texture texel, never per frame. */
export function anglesToNestedPixel(nside: number, theta: number, phi: number): number {
  const z = Math.cos(theta);
  const za = Math.abs(z);
  const tt = (((phi % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / (Math.PI / 2);
  let face: number;
  let x: number;
  let y: number;
  if (za <= 2 / 3) {
    const jp = Math.floor(nside * (0.5 + tt - z * 0.75));
    const jm = Math.floor(nside * (0.5 + tt + z * 0.75));
    const fp = Math.floor(jp / nside);
    const fm = Math.floor(jm / nside);
    face = fp === fm ? fp | 4 : fp < fm ? fp : fm + 8;
    x = jm % nside;
    y = nside - (jp % nside) - 1;
  } else {
    const quadrant = Math.min(3, Math.floor(tt));
    const fraction = tt - quadrant;
    const scale = nside * Math.sqrt(3 * (1 - za));
    const jp = Math.min(nside - 1, Math.floor(fraction * scale));
    const jm = Math.min(nside - 1, Math.floor((1 - fraction) * scale));
    face = quadrant + (z >= 0 ? 0 : 8);
    x = z >= 0 ? nside - jm - 1 : jp;
    y = z >= 0 ? nside - jp - 1 : jm;
  }
  let pixel = face * nside * nside;
  for (let bit = 1, weight = 1; bit < nside; bit *= 2, weight *= 4) {
    if (x & bit) pixel += weight;
    if (y & bit) pixel += 2 * weight;
  }
  return pixel;
}

/**
 * Adopted Galactic sky -> right-handed Y-up world: (X,Y,Z)sky -> (X,Z,-Y)world.
 * l=0,b=0 -> +X; l=90,b=0 -> -Z; north -> +Y. This is a proper rotation
 * (det=+1), not a mirror. theta=pi/2-b; phi=l increases eastward.
 * HEALPix COSMO Q/U refer to (e_theta south, e_phi east):
 * https://healpix.sourceforge.io/html/intro_HEALPix_conventions.htm
 * Rotate the position AND both basis vectors identically. DoubleSide rendering
 * and an inside camera change only projection, never U or the physical angle.
 */
export function skyBasis(theta: number, phi: number) {
  const s = Math.sin(theta),
    c = Math.cos(theta);
  const cp = Math.cos(phi),
    sp = Math.sin(phi);
  return {
    normal: new Vector3(s * cp, c, -s * sp),
    eTheta: new Vector3(c * cp, -s, -c * sp),
    ePhi: new Vector3(-sp, 0, -cp),
  };
}

/** Inspectable reference record; Q/U stay in the supplied physical uK_CMB units. */
export function polarizationReference(nside: number, pixel: number, q: number, u: number) {
  const angles = nestedPixelAngles(nside, pixel);
  const basis = skyBasis(angles.theta, angles.phi);
  const psi = 0.5 * Math.atan2(u, q);
  return {
    pixel,
    ...angles,
    q,
    u,
    psi,
    amplitude: Math.hypot(q, u),
    ...basis,
    direction: basis.eTheta
      .clone()
      .multiplyScalar(Math.cos(psi))
      .addScaledVector(basis.ePhi, Math.sin(psi)),
  };
}
