/** IAU 2015 B3 nominal photospheric radius; an adopted conversion constant. */
export const SUN_RADIUS_SOURCE_ID = "iau-solar-radius";
export const SUN_RADIUS_METERS = 695_700_000;
export const SUN_DIAMETER_METERS = 2 * SUN_RADIUS_METERS;
export const SUN_TEXTURE = {
  sourceId: "sss-sun",
  url: `${import.meta.env.BASE_URL}models/sun/sun.jpg`,
  sourceUrl: "https://www.solarsystemscope.com/textures/",
  credit: "Solar System Scope",
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
} as const;
