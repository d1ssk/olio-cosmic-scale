/** Adopted mean center-to-center separation, not an ephemeris for a particular date. */
export const EARTH_MOON_DISTANCE_METERS = 384_400_000;
export const MOON_DIAMETER_METERS = 3_474_800;
export const EARTH_MOON_SOURCES = {
  distance: "https://ssd.jpl.nasa.gov/glossary/LD.html",
  radius: "https://science.nasa.gov/wp-content/uploads/2023/05/ladee-press-kit-08292013.pdf",
} as const;
