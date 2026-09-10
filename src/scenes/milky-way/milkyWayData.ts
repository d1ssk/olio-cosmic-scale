import { KILOPARSEC_METERS, PARSEC_METERS } from "../../physics/constants";
import { SOURCES } from "../../data/sources";
import { STELLAR_REFERENCE_METERS } from "../stellar-neighborhood/stellarData";

export const MILKY_WAY_DIAMETER_METERS = 30 * KILOPARSEC_METERS;
export const MILKY_WAY_METERS_PER_UNIT = KILOPARSEC_METERS;
export const MILKY_WAY_VIEW_METERS = 40 * KILOPARSEC_METERS;
export const SUN_GALACTIC_RADIUS_METERS = 8178 * PARSEC_METERS;
// Rounded thin-disc extent, not a universal boundary or exponential scale height.
export const DISK_THICKNESS_METERS = 0.3 * KILOPARSEC_METERS;
export const BAR_HALF_LENGTH_METERS = 3 * KILOPARSEC_METERS;
export const MILKY_WAY_COMPARISON_METERS = Math.sqrt(
  STELLAR_REFERENCE_METERS * MILKY_WAY_DIAMETER_METERS,
);
export const MILKY_WAY_BRIDGE_VALUES = [STELLAR_REFERENCE_METERS, MILKY_WAY_COMPARISON_METERS];
export const MILKY_WAY_SOURCES = SOURCES.filter((s) =>
  ["esa-galaxy-guide", "gravity-2019-distance"].includes(s.id),
);
// Display conventions: these samples paint a morphology, never count physical stars.
export const GALAXY_DISPLAY = {
  seed: 74219,
  diskSamples: 18000,
  bulgeSamples: 6000,
  arms: 4,
  pitchRadians: (14 * Math.PI) / 180,
  barAngleRadians: (25 * Math.PI) / 180,
  bulgeMinorMeters: 1.2 * KILOPARSEC_METERS,
  bulgeHeightMeters: 0.9 * KILOPARSEC_METERS,
  referenceForegroundMeters: 17 * KILOPARSEC_METERS,
  comparisonForegroundMeters: 19 * KILOPARSEC_METERS,
} as const;
