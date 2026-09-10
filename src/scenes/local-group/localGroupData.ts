import catalog from "./catalog.json";
import { SOURCES } from "../../data/sources";
import {
  KILOPARSEC_METERS,
  MEGAPARSEC_METERS,
  PARSEC_METERS,
  LIGHT_YEAR_METERS,
} from "../../physics/constants";
import { MILKY_WAY_DIAMETER_METERS } from "../milky-way/milkyWayData";

export const LOCAL_GROUP_REFERENCE_METERS = 3 * MEGAPARSEC_METERS;
export const LOCAL_GROUP_UNIT_METERS = 0.1 * MEGAPARSEC_METERS;
export const LOCAL_GROUP_VIEW_METERS = 2.4 * MEGAPARSEC_METERS;
// World-fixed ruler positions: negative Y places them below the central galaxies.
export const LOCAL_GROUP_RULER_Y_METERS = {
  reference: -0.65 * MEGAPARSEC_METERS,
  comparison: -0.75 * MEGAPARSEC_METERS,
} as const;
export const LOCAL_GROUP_LABEL_LAYOUT = {
  desktopLeaderPixels: 100,
  mobileLeaderPixels: 40,
  verticalOffsetPixels: 38,
} as const;
// Representative stellar extents, not virial radii. Missing dwarf sizes stay missing.
const extents: Record<string, number> = {
  "The Galaxy": MILKY_WAY_DIAMETER_METERS / 2,
  Andromeda: 100000 * LIGHT_YEAR_METERS,
  Triangulum: 8.6 * KILOPARSEC_METERS,
  LMC: 7000 * LIGHT_YEAR_METERS,
  SMC: 3500 * LIGHT_YEAR_METERS,
};
export const DISK_ORIENTATIONS: Record<string, { pa: number; inclination: number }> = {
  Andromeda: { pa: 38, inclination: 77 },
  Triangulum: { pa: 23, inclination: 54 },
  LMC: { pa: 122.5, inclination: 34.7 },
};
export const LOCAL_GROUP_DISPLAY = {
  dwarfSupportHalfLightRadii: 3,
  diskThicknessRatio: 0.025,
  samplesPerDwarf: 1800,
  samplesPerDisk: 10000,
  // Near/far tilt is ambiguous without additional population-specific constraints.
  tiltSign: 1,
} as const;
export const LOCAL_GROUP_GALAXIES = catalog.map((row, id) => ({
  ...row,
  id,
  distanceMeters: (row.distanceKpc ?? 0) * KILOPARSEC_METERS,
  distancePlusMeters: row.distancePlusKpc === null ? null : row.distancePlusKpc * KILOPARSEC_METERS,
  distanceMinusMeters:
    row.distanceMinusKpc === null ? null : row.distanceMinusKpc * KILOPARSEC_METERS,
  halfLightRadiusMeters:
    row.halfLightRadiusPc === null ? null : row.halfLightRadiusPc * PARSEC_METERS,
  radiusMeters:
    extents[row.name] ??
    (row.halfLightRadiusPc === null
      ? null
      : row.halfLightRadiusPc * PARSEC_METERS * LOCAL_GROUP_DISPLAY.dwarfSupportHalfLightRadii),
  sizeConvention:
    row.name in extents
      ? ("extent" as const)
      : row.halfLightRadiusPc === null
        ? ("missing" as const)
        : ("halfLight" as const),
  sourceIds: [
    "mcconnachie-2012",
    ...(row.name === "The Galaxy"
      ? ["esa-galaxy-guide", "gravity-2019-distance"]
      : row.name in extents
        ? row.name === "Andromeda"
          ? ["local-group-shapes", "local-group-m31-orientation"]
          : row.name === "Triangulum"
            ? ["local-group-m33"]
            : row.name === "LMC"
              ? ["local-group-clouds", "local-group-lmc-orientation"]
              : ["local-group-clouds"]
        : []),
  ],
}));
export type LocalGalaxy = (typeof LOCAL_GROUP_GALAXIES)[number];
export const LOCAL_GROUP_SOURCES = SOURCES.filter(
  (s) => s.id === "mcconnachie-2012" || s.id.startsWith("local-group-"),
);
