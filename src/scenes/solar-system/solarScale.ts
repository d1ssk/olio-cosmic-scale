import { AU_METERS } from "../../physics/constants";
import type { SceneId } from "../types";
/** Display conventions, not a boundary of the gravitational Solar System. */
export const SOLAR_METERS_PER_UNIT = AU_METERS / 10;
/** Both solar presets look down at 45 degrees above the ecliptic plane. */
export const SOLAR_PRESET_CAMERA_POSITION = [0, 30, 30] as const;
export const INNER_VIEW_METERS = 1.8 * AU_METERS;
export const OUTER_REFERENCE_METERS = 100 * AU_METERS;
export const OUTER_VIEW_METERS = 75 * AU_METERS;
export const MAX_SOLAR_VIEW_METERS = 160 * AU_METERS;
export const MIN_SOLAR_VIEW_METERS = 4_000_000;
export const SOLAR_ZOOM_DURATION_MS = 1000;
export function isSolarWorld(id: SceneId) {
  return id === "earth-sun" || id === "solar-system";
}
export function isContinuousSolarEdge(from: SceneId, to: SceneId) {
  return from !== to && isSolarWorld(from) && isSolarWorld(to);
}
export function smoothLogFade(start: number, end: number, value: number) {
  const t = Math.max(0, Math.min(1, Math.log(value / start) / Math.log(end / start)));
  return t * t * (3 - 2 * t);
}
// Display convention: keep Jupiter and the outer planets readable in the full-system view.
export const OUTER_ANNOTATION_FADE_START_METERS = 120 * AU_METERS;
export const OUTER_ANNOTATION_FADE_END_METERS = 320 * AU_METERS;
export function planetAnnotationOpacity(extentMeters: number, orbitMeters: number) {
  if (orbitMeters >= 4 * AU_METERS) {
    return (
      1 -
      smoothLogFade(
        OUTER_ANNOTATION_FADE_START_METERS,
        OUTER_ANNOTATION_FADE_END_METERS,
        extentMeters,
      )
    );
  }
  return (
    (1 - smoothLogFade(12 * AU_METERS, 100 * AU_METERS, extentMeters)) *
    (1 -
      smoothLogFade(
        Math.max(0.8 * AU_METERS, orbitMeters * 4),
        Math.max(6 * AU_METERS, orbitMeters * 20),
        extentMeters,
      ))
  );
}
export function solarDiameterOpacity(extent: number) {
  return 1 - smoothLogFade(3 * AU_METERS, 8 * AU_METERS, extent);
}
/** Adopted readability fades, ordered by inner orbital size; outer orbits stay visible. */
export function innerOrbitOpacity(body: string, extent: number) {
  const ranges: Record<string, [number, number]> = {
    Mercury: [4, 10],
    Venus: [6, 15],
    Moon: [6, 20],
    Earth: [9, 22],
    Mars: [14, 32],
  };
  const range = ranges[body];
  return range ? 1 - smoothLogFade(range[0] * AU_METERS, range[1] * AU_METERS, extent) : 1;
}

export function solarRecoveryPreset(
  extent: number,
  offsetMeters: number,
  angle: number,
  current?: SceneId,
) {
  const id =
    extent < Math.sqrt(INNER_VIEW_METERS * OUTER_VIEW_METERS) ? "earth-sun" : "solar-system";
  const preset = id === "earth-sun" ? INNER_VIEW_METERS : OUTER_VIEW_METERS;
  return Math.abs(Math.log(extent / preset)) > 0.04 ||
    offsetMeters > preset * 0.01 ||
    angle > 0.02 ||
    (current !== undefined && current !== id)
    ? id
    : null;
}
export function interpolateSolarZoom(from: number, to: number, progress: number) {
  const t = Math.max(0, Math.min(1, progress));
  const eased = t * t * (3 - 2 * t);
  return Math.exp(Math.log(from) * (1 - eased) + Math.log(to) * eased);
}

export function solarZoomLimits(width: number, height: number, metersPerSceneUnit: number) {
  const shortSide = Math.min(width, height);
  return {
    min: shortSide / (MAX_SOLAR_VIEW_METERS / metersPerSceneUnit),
    max: shortSide / (MIN_SOLAR_VIEW_METERS / metersPerSceneUnit),
  };
}
