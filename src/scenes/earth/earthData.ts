/** Mean-radius spherical approximation; the existing ladder rounds the JPL mean radius to 6371 km. */
export const EARTH_DIAMETER_METERS = 12_742_000;
export const EARTH_BAR_LONGITUDE_DEGREES = -150;
// Adopted annotation placement: equatorial clearance of 15% of the mean radius.
export const EARTH_BAR_CLEARANCE_METERS = EARTH_DIAMETER_METERS * 0.075;
export const EARTH_TEXTURE = {
  url: `${import.meta.env.BASE_URL}models/earth/blue-marble-july-2004.jpg`,
  credit: "NASA Earth Observatory",
  sourceUrl:
    "https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography/",
  sourceId: "nasa-bmng-july-2004",
} as const;
