/** Adopted display calibration, not a measurement of the real statue. */
export const HUMAN_REFERENCE_METERS = 1.7;
export const HUMAN_BAR_CLEARANCE_METERS = 0.25;
export const HACHIKO_MODEL = {
  sourceId: "svay-hachiko-2016",
  title: "Hachikō",
  author: "Maurice Svay",
  authorUrl: "https://sketchfab.com/mauricesvay",
  sourceUrl: "https://sketchfab.com/3d-models/hachiko-fffee43c3cbc4b7ea20d6556a360b25f",
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  assetUrl: `${import.meta.env.BASE_URL}models/hachiko/hachiko.glb`,
  displayHeightMeters: HUMAN_REFERENCE_METERS,
} as const;
