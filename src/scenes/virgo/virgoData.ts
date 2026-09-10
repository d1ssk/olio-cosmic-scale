import type { TranslationKey } from "../../i18n";
import { MEGAPARSEC_METERS } from "../../physics/constants";
import { SOURCES } from "../../data/sources";

export const VIRGO_REFERENCE_METERS = 16.5 * MEGAPARSEC_METERS;
export const VIRGO_VIEW_METERS = 44 * MEGAPARSEC_METERS;
export const VIRGO_UNIT_METERS = MEGAPARSEC_METERS;
// M87 J2000 direction; origin at the observer–adopted Virgo midpoint.
export const VIRGO_DIRECTION = { raDegrees: 187.70593, decDegrees: 12.39112 };
export const VIRGO_RULER_Y = -12 * MEGAPARSEC_METERS;
export type DistanceKind = "independent" | "estimated" | "adopted";
export type DisplayDistanceKind = DistanceKind | "modeled";
export type VirgoGalaxy = {
  evccId: number | null;
  evccMembership: "M" | "P" | null;
  magnitudeBand: "B" | "g" | null;
  magnitudeSourceId: string | null;
  representativeDistanceMeters: number;
  depthModel: "virgo-sbf" | "nearby" | null;
  name: string;
  raDegrees: number;
  decDegrees: number;
  distanceMeters: number;
  distanceErrorMeters: number | null;
  distanceKind: DistanceKind;
  method: string;
  sourceIds: string[];
  absoluteMagnitude: number | null;
  aliases: string[];
  quality: string | null;
};
export const DISTANCE_STYLES: Record<
  DisplayDistanceKind,
  { color: string; symbol: string; key: TranslationKey; shape: number }
> = {
  independent: { color: "#b6d8e9", symbol: "●", key: "virgo.independent", shape: 0 },
  estimated: { color: "#cba581", symbol: "◆", key: "virgo.estimated", shape: 1 },
  modeled: { color: "#c596d8", symbol: "□", key: "virgo.modeled", shape: 3 },
  adopted: { color: "#b96878", symbol: "○", key: "virgo.adopted", shape: 2 },
};
export const VIRGO_SOURCES = SOURCES.filter((s) =>
  ["50mgc-2024", "evcc-2014", "ngvs-sbf-2024", "mcconnachie-2012"].includes(s.id),
);

// A merged galaxy gets exactly one display color. Preserve all sourceIds in the data.
export const CATALOG_STYLES = [
  { id: "ngvs-sbf-2024", color: "#87cbe6", key: "virgo.catalogSbf" },
  { id: "evcc-2014", color: "#ce89bd", key: "virgo.catalogEvcc" },
  { id: "mcconnachie-2012", color: "#a6d58d", key: "virgo.catalogLocal" },
  { id: "50mgc-2024", color: "#d6b17d", key: "virgo.catalogNearby" },
  { id: "virgo-convention", color: "#f1f0e8", key: "virgo.catalogOrigin" },
] as const satisfies readonly { id: string; color: string; key: TranslationKey }[];

export function galaxyCatalogStyle(g: Pick<VirgoGalaxy, "sourceIds">) {
  return CATALOG_STYLES.find((style) => g.sourceIds.includes(style.id)) ?? CATALOG_STYLES[4];
}

export const VIRGO_DEPTH_MODEL = {
  clusterMinMeters: 12 * MEGAPARSEC_METERS,
  clusterMaxMeters: 23 * MEGAPARSEC_METERS,
  clusterAngularBandwidthRadians: (2.5 * Math.PI) / 180,
  clusterSmoothingMeters: 0.25 * MEGAPARSEC_METERS,
  nearbyAngularBandwidthRadians: (30 * Math.PI) / 180,
  nearbyLogDistanceBandwidth: 0.35,
  nearbySmoothingFraction: 0.05,
} as const;

export function displayDistanceKind(
  g: VirgoGalaxy,
  representativeDepths: boolean,
): DisplayDistanceKind {
  return g.depthModel ? (representativeDepths ? "adopted" : "modeled") : g.distanceKind;
}
