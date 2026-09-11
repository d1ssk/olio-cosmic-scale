/** Representative human height, independent of the statue calibration. */
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
  // User-supplied total height (2026-09-11), including the pedestal.
  // The scan itself has no author-provided metric calibration.
  displayHeightMeters: 2.17,
} as const;
