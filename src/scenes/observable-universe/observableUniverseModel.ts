import {
  GIGAPARSEC_METERS,
  MEGAPARSEC_METERS,
  SPEED_OF_LIGHT_METERS_PER_SECOND,
} from "../../physics/constants";

export const OBSERVABLE_UNIVERSE_REFERENCE_METERS = 14 * GIGAPARSEC_METERS;
export const OBSERVABLE_UNIVERSE_VIEW_METERS = 28 * GIGAPARSEC_METERS;
export const OBSERVABLE_UNIVERSE_METERS_PER_UNIT = 1.4 * GIGAPARSEC_METERS;
export const LAST_SCATTERING_REDSHIFT = 1_100;
export const CMB_TEMPERATURE_KELVIN = 2.7255;
export const LAST_SCATTERING_TEMPERATURE_KELVIN =
  CMB_TEMPERATURE_KELVIN * (1 + LAST_SCATTERING_REDSHIFT);
export const COSMIC_WEB_COMPARISON_METERS = 3 * GIGAPARSEC_METERS;

/** Adopted flat Planck-2018-like background cosmology for the educational ruler. */
export const RULER_COSMOLOGY = {
  hubbleKmPerSecondPerMpc: 67.4,
  matterDensity: 0.315,
  radiationDensity: 9.2e-5,
} as const;

export const RADIAL_DIRECTION = [0.76, -0.04, -0.648] as const;

export type CosmologyPoint = {
  comovingDistanceGpc: number;
  redshift: number;
  lookbackTimeGyr: number;
  universeAgeGyr: number;
  scaleFactor: number;
};

type TablePoint = CosmologyPoint & { modelDistanceGpc: number };

const SECONDS_PER_GYR = 365.25 * 86_400 * 1e9;
const SAMPLE_COUNT = 8_192;

function expansionRate(a: number): number {
  const { matterDensity, radiationDensity } = RULER_COSMOLOGY;
  const darkEnergyDensity = 1 - matterDensity - radiationDensity;
  return Math.sqrt(radiationDensity / a ** 4 + matterDensity / a ** 3 + darkEnergyDensity);
}

function integrateEarlyConformalTime(minA: number): number {
  const steps = 4_096;
  const minU = Math.log(1e-8);
  const maxU = Math.log(minA);
  const du = (maxU - minU) / steps;
  let integral = 0;
  let previous = 1 / (Math.exp(minU) * expansionRate(Math.exp(minU)));
  for (let index = 1; index <= steps; index += 1) {
    const a = Math.exp(minU + index * du);
    const next = 1 / (a * expansionRate(a));
    integral += ((previous + next) * du) / 2;
    previous = next;
  }
  return integral;
}

function makeCosmologyModel(): {
  table: readonly TablePoint[];
  particleHorizonDistanceGpc: number;
} {
  const minA = 1 / (1 + LAST_SCATTERING_REDSHIFT);
  const minU = Math.log(minA);
  const du = -minU / SAMPLE_COUNT;
  const hubbleSeconds = MEGAPARSEC_METERS / (RULER_COSMOLOGY.hubbleKmPerSecondPerMpc * 1_000);
  const hubbleDistanceGpc = (SPEED_OF_LIGHT_METERS_PER_SECOND * hubbleSeconds) / GIGAPARSEC_METERS;
  const hubbleTimeGyr = hubbleSeconds / SECONDS_PER_GYR;
  const ascending: Array<{
    a: number;
    ageIntegral: number;
    distanceIntegral: number;
  }> = [];
  let ageIntegral = 0;
  let distanceIntegral = 0;
  let previousAgeIntegrand = 1 / expansionRate(minA);
  let previousDistanceIntegrand = 1 / (minA * expansionRate(minA));
  ascending.push({ a: minA, ageIntegral, distanceIntegral });
  for (let index = 1; index <= SAMPLE_COUNT; index += 1) {
    const a = Math.exp(minU + index * du);
    const ageIntegrand = 1 / expansionRate(a);
    const distanceIntegrand = 1 / (a * expansionRate(a));
    ageIntegral += ((previousAgeIntegrand + ageIntegrand) * du) / 2;
    distanceIntegral += ((previousDistanceIntegrand + distanceIntegrand) * du) / 2;
    ascending.push({ a, ageIntegral, distanceIntegral });
    previousAgeIntegrand = ageIntegrand;
    previousDistanceIntegrand = distanceIntegrand;
  }
  const totalAgeGyr = ageIntegral * hubbleTimeGyr + 0.00038;
  const totalDistanceIntegral = distanceIntegral;
  const modelLastScatteringGpc = totalDistanceIntegral * hubbleDistanceGpc;
  const displayScale = 14 / modelLastScatteringGpc;
  const table = ascending
    .map(({ a, ageIntegral: age, distanceIntegral: distance }) => {
      const modelDistanceGpc = (totalDistanceIntegral - distance) * hubbleDistanceGpc;
      const universeAgeGyr = age * hubbleTimeGyr + 0.00038;
      return {
        modelDistanceGpc,
        comovingDistanceGpc: modelDistanceGpc * displayScale,
        redshift: 1 / a - 1,
        lookbackTimeGyr: totalAgeGyr - universeAgeGyr,
        universeAgeGyr,
        scaleFactor: a,
      };
    })
    .reverse();
  const particleHorizonDistanceGpc =
    (totalDistanceIntegral + integrateEarlyConformalTime(minA)) * hubbleDistanceGpc * displayScale;
  return { table, particleHorizonDistanceGpc };
}

const COSMOLOGY_MODEL = makeCosmologyModel();
const COSMOLOGY_TABLE = COSMOLOGY_MODEL.table;
export const PARTICLE_HORIZON_DISTANCE_GPC = COSMOLOGY_MODEL.particleHorizonDistanceGpc;

export function cosmologyAtComovingDistance(distanceGpc: number): CosmologyPoint {
  const distance = Math.min(14, Math.max(0, distanceGpc));
  let low = 0;
  let high = COSMOLOGY_TABLE.length - 1;
  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2);
    if (COSMOLOGY_TABLE[middle].comovingDistanceGpc < distance) low = middle;
    else high = middle;
  }
  const left = COSMOLOGY_TABLE[low];
  const right = COSMOLOGY_TABLE[high];
  const span = right.comovingDistanceGpc - left.comovingDistanceGpc;
  const mix = span > 0 ? (distance - left.comovingDistanceGpc) / span : 0;
  const interpolate = (a: number, b: number) => a + (b - a) * mix;
  return {
    comovingDistanceGpc: distance,
    redshift: interpolate(left.redshift, right.redshift),
    lookbackTimeGyr: interpolate(left.lookbackTimeGyr, right.lookbackTimeGyr),
    universeAgeGyr: interpolate(left.universeAgeGyr, right.universeAgeGyr),
    scaleFactor: interpolate(left.scaleFactor, right.scaleFactor),
  };
}

export const RADIAL_RULER_REDSHIFTS = [0, 1, 2, 6, 10, LAST_SCATTERING_REDSHIFT] as const;

export const RADIAL_RULER_TICKS = RADIAL_RULER_REDSHIFTS.map((redshift) => {
  const scaleFactor = 1 / (1 + redshift);
  const nearest = COSMOLOGY_TABLE.reduce((best, point) =>
    Math.abs(point.scaleFactor - scaleFactor) < Math.abs(best.scaleFactor - scaleFactor)
      ? point
      : best,
  );
  return nearest;
});
