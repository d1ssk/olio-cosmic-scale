import { SPEED_OF_LIGHT_METERS_PER_SECOND } from "../../physics/constants";

/** Exact vacuum light travel distance in one SI second. */
export const LIGHT_SECOND_METERS = SPEED_OF_LIGHT_METERS_PER_SECOND * 1;

/** Adopted mean center-to-center separation, not an ephemeris for a particular date. */
export const EARTH_MOON_DISTANCE_METERS = 384_400_000;
export const MOON_DIAMETER_METERS = 3_474_800;
export const EARTH_MOON_SOURCES = {
  lightSecond: "https://www.bipm.org/en/measurement-units/si-defining-constants",
  distance: "https://ssd.jpl.nasa.gov/glossary/LD.html",
  radius: "https://science.nasa.gov/wp-content/uploads/2023/05/ladee-press-kit-08292013.pdf",
} as const;
