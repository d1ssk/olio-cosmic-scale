import { Rotation_EQJ_GAL } from "astronomy-engine";
import { Vector3 } from "three";
import { SUN_GALACTIC_RADIUS_METERS } from "../milky-way/milkyWayData";
import { milkyWayModel } from "../milky-way/milkyWayModel";
import {
  DISK_ORIENTATIONS,
  LOCAL_GROUP_DISPLAY as D,
  LOCAL_GROUP_GALAXIES,
  LOCAL_GROUP_UNIT_METERS,
  type LocalGalaxy,
} from "./localGroupData";

export type Point = [number, number, number];
const radians = Math.PI / 180;
const rotation = Rotation_EQJ_GAL().rot;
/** EQJ -> Galactic -> right-handed MW scene axes (-galX, galZ, galY). */
export function equatorialToGroup(v: Point): Vector3 {
  const g = [0, 1, 2].map((j) => v.reduce((s, x, i) => s + rotation[i][j] * x, 0));
  return new Vector3(-g[0], g[2], g[1]);
}
export function skyBasis(ra: number, dec: number) {
  const a = ra * radians,
    d = dec * radians;
  return {
    sight: equatorialToGroup([Math.cos(d) * Math.cos(a), Math.cos(d) * Math.sin(a), Math.sin(d)]),
    east: equatorialToGroup([-Math.sin(a), Math.cos(a), 0]),
    north: equatorialToGroup([-Math.sin(d) * Math.cos(a), -Math.sin(d) * Math.sin(a), Math.cos(d)]),
  };
}
export function galactocentricCenter(galaxy: LocalGalaxy): Vector3 {
  if (galaxy.name === "The Galaxy") return new Vector3();
  return skyBasis(galaxy.raDegrees, galaxy.decDegrees)
    .sight.multiplyScalar(galaxy.distanceMeters)
    .add(new Vector3(SUN_GALACTIC_RADIUS_METERS, 0, 0));
}
export const GROUP_ORIGIN_METERS = galactocentricCenter(
  LOCAL_GROUP_GALAXIES.find((g) => g.name === "Andromeda")!,
).multiplyScalar(0.5);
export function galaxyPosition(g: LocalGalaxy, unit = LOCAL_GROUP_UNIT_METERS): Point {
  return galactocentricCenter(g).sub(GROUP_ORIGIN_METERS).divideScalar(unit).toArray();
}
/** PA is east of north. Dwarfs preserve projected q; depth adopts b, not a measured 3D axis. */
export function galaxyAxes(g: LocalGalaxy) {
  const { sight, north, east } = skyBasis(g.raDegrees, g.decDegrees);
  const disk = DISK_ORIENTATIONS[g.name];
  const pa = (disk?.pa ?? g.positionAngleDegrees ?? 0) * radians;
  const major = north.clone().multiplyScalar(Math.cos(pa)).addScaledVector(east, Math.sin(pa));
  const minor = north.clone().multiplyScalar(-Math.sin(pa)).addScaledVector(east, Math.cos(pa));
  if (!disk) return { major, minor, depth: sight, q: 1 - (g.ellipticity ?? 0) };
  const i = disk.inclination * radians;
  const tilted = minor
    .clone()
    .multiplyScalar(Math.cos(i))
    .addScaledVector(sight, D.tiltSign * Math.sin(i));
  return { major, minor: tilted, depth: major.clone().cross(tilted).normalize(), q: 1 };
}
export function galaxyCloud(g: LocalGalaxy, unit = LOCAL_GROUP_UNIT_METERS) {
  if (g.name === "The Galaxy") return milkyWayModel(unit);
  const positions: number[] = [],
    colors: number[] = [];
  if (!g.radiusMeters) return { positions: new Float32Array(), colors: new Float32Array() };
  const axes = galaxyAxes(g),
    disk = Boolean(DISK_ORIENTATIONS[g.name]);
  let seed = 74219 + g.id * 7919;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return (seed + 0.5) / 4294967296;
  };
  const normal = () => Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
  const count = disk ? D.samplesPerDisk : D.samplesPerDwarf;
  const p = new Vector3();
  for (let n = 0; n < count; n++) {
    let x: number, y: number, z: number;
    let bulge = false;
    if (disk) {
      let radius: number;
      do {
        radius = -Math.log(random() * random()) / 4;
      } while (radius > 1);
      const spiral = g.name !== "LMC" && random() < 0.65;
      const angle = spiral
        ? (n % 2) * Math.PI +
          Math.log(Math.max(radius, 0.06)) / Math.tan(18 * radians) +
          (random() - 0.5) * (g.name === "Triangulum" ? 1.4 : 0.45)
        : random() * Math.PI * 2;
      x = radius * Math.cos(angle);
      y = radius * Math.sin(angle);
      z = (random() - 0.5) * D.diskThicknessRatio;
      bulge = g.name === "Andromeda" && n % 4 === 0;
      if (bulge) {
        x = normal() * 0.07;
        y = normal() * 0.05;
        z = normal() * 0.04;
      }
    } else {
      // Gaussian projected half-light radius = sigma * sqrt(2 ln 2); support truncated at 3 rh.
      const sigma =
        g.sizeConvention === "halfLight"
          ? 1 / (D.dwarfSupportHalfLightRadii * Math.sqrt(2 * Math.log(2)))
          : 0.32;
      do {
        x = normal() * sigma;
        y = normal() * sigma;
        z = normal() * sigma;
      } while (Math.hypot(x, y, z) > 1);
      y *= axes.q;
      z *= axes.q;
    }
    p.copy(axes.major)
      .multiplyScalar(x)
      .addScaledVector(axes.minor, y)
      .addScaledVector(axes.depth, z)
      .multiplyScalar(g.radiusMeters / unit);
    positions.push(...p.toArray());
    const brightness = 0.35 + random() * 0.45;
    const warm = bulge || (!g.morphology.includes("Irr") && !disk);
    colors.push(
      brightness * (warm ? 1 : 0.65),
      brightness * (warm ? 0.76 : 0.82),
      brightness * (warm ? 0.55 : 1),
    );
  }
  return { positions: new Float32Array(positions), colors: new Float32Array(colors) };
}
