import { VIRGO_DEPTH_MODEL as C, type VirgoGalaxy } from "./virgoData";
import { equatorialSight } from "./virgoModel";

/** Stable galaxy-key seed: reordering the catalog never changes a draw. */
function randomFor(name: string) {
  let state = 2166136261;
  for (const c of `virgo-depth-v1:${name}`)
    state = Math.imul(state ^ c.charCodeAt(0), 16777619) >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return (state + 0.5) / 4294967296;
  };
}
export type DepthAssignment = { modeledDistanceMeters: number; donorName: string | null };
/** Conditional empirical radial resampling; synthetic depths are NOT measurements. */
export function buildDepthAssignments(
  galaxies: readonly VirgoGalaxy[],
): Map<string, DepthAssignment> {
  const independent = galaxies
    .filter((g) => g.distanceKind === "independent" && g.distanceMeters > 0)
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    .map((g) => ({ g, sight: equatorialSight(g.raDegrees, g.decDegrees) }));
  const cluster = independent.filter(
    ({ g }) =>
      g.sourceIds.includes("ngvs-sbf-2024") &&
      (g.quality === "q1" || g.quality === "q2") &&
      g.distanceMeters >= C.clusterMinMeters &&
      g.distanceMeters <= C.clusterMaxMeters,
  );
  const result = new Map<string, DepthAssignment>();
  for (const g of galaxies) {
    if (!g.depthModel) {
      result.set(g.name, { modeledDistanceMeters: g.distanceMeters, donorName: null });
      continue;
    }
    const isCluster = g.depthModel === "virgo-sbf";
    const pool = isCluster ? cluster : independent;
    if (!pool.length) throw new Error(`Missing distance donors for ${g.depthModel}`);
    const sight = equatorialSight(g.raDegrees, g.decDegrees);
    const random = randomFor(g.name);
    const logs = pool.map((donor) => {
      const angle = Math.acos(Math.max(-1, Math.min(1, sight.dot(donor.sight))));
      const angular =
        angle / (isCluster ? C.clusterAngularBandwidthRadians : C.nearbyAngularBandwidthRadians);
      const radial = isCluster
        ? 0
        : Math.log(donor.g.distanceMeters / g.representativeDistanceMeters) /
          C.nearbyLogDistanceBandwidth;
      return -0.5 * (angular * angular + radial * radial);
    });
    // Log weights avoid underflow even for galaxies outside the SBF footprint.
    const max = Math.max(...logs),
      weights = logs.map((w) => Math.exp(w - max));
    let draw = random() * weights.reduce((a, b) => a + b, 0),
      index = weights.length - 1;
    for (let i = 0; i < weights.length; i++) {
      draw -= weights[i];
      if (draw <= 0) {
        index = i;
        break;
      }
    }
    const donor = pool[index].g;
    const normal = Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
    const distance = isCluster
      ? Math.max(
          C.clusterMinMeters,
          Math.min(C.clusterMaxMeters, donor.distanceMeters + normal * C.clusterSmoothingMeters),
        )
      : donor.distanceMeters * Math.exp(normal * C.nearbySmoothingFraction);
    result.set(g.name, { modeledDistanceMeters: distance, donorName: donor.name });
  }
  return result;
}
export function displayGalaxy(
  g: VirgoGalaxy,
  assignments: ReadonlyMap<string, DepthAssignment>,
  representativeDepths: boolean,
): VirgoGalaxy {
  const distanceMeters = g.depthModel
    ? representativeDepths
      ? g.representativeDistanceMeters
      : assignments.get(g.name)!.modeledDistanceMeters
    : g.distanceMeters;
  return { ...g, distanceMeters };
}
