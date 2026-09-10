/** Illustrative display PSF, not a physical radius or calibrated photometric response. */
export const SOLAR_PSF_DIAMETER_PIXELS = 24;
export function solarPointOpacity(diameterPixels: number) {
  const t = Math.max(0, Math.min(1, (6 - diameterPixels) / 4));
  return t * t * (3 - 2 * t);
}
