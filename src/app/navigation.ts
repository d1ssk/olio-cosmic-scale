import type { Locale } from "../i18n";
import type { SceneId } from "../scenes/types";
import { DEFAULT_BRIDGE_CONFIG } from "../bridges/bridgeTypes";
import { isSceneId, sceneRegistry } from "./sceneRegistry";

export type SceneMode = { kind: "scene"; sceneId: SceneId };
export type BridgeMode = { kind: "bridge"; originSceneId: SceneId; targetSceneId: SceneId };
export type AppMode = SceneMode | BridgeMode;

const DIRECT_BAR_TRANSFER_EDGES = [
  ["virgo", "bao"],
  ["local-group", "virgo"],
  ["milky-way", "local-group"],
  ["earth", "earth-moon"],
  ["earth-moon", "sun"],
  ["sun", "earth-sun"],
] as const satisfies readonly (readonly [SceneId, SceneId])[];

export function hasDirectBarTransfer(first: SceneId, second: SceneId | undefined): boolean {
  return DIRECT_BAR_TRANSFER_EDGES.some(
    ([a, b]) => (first === a && second === b) || (first === b && second === a),
  );
}

export function sceneFromSearch(search: string): SceneId {
  const candidate = new URLSearchParams(search).get("scene");
  return isSceneId(candidate) ? candidate : "human";
}

export function urlWithState(
  currentUrl: string,
  { sceneId, locale }: { sceneId: SceneId; locale: Locale },
): string {
  const url = new URL(currentUrl, "https://local.invalid");
  url.searchParams.set("scene", sceneId);
  url.searchParams.set("lang", locale);
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Direct adjacent scene changes need no comparison when their ratio fits one step. */
export function mainNavigationMode(sceneId: SceneId, direction: "previous" | "next"): AppMode {
  const scene = sceneRegistry[sceneId];
  const targetSceneId = scene[direction];
  if (!targetSceneId) return { kind: "scene", sceneId };
  const target = sceneRegistry[targetSceneId];
  const ratio =
    Math.max(scene.referenceLengthMeters, target.referenceLengthMeters) /
    Math.min(scene.referenceLengthMeters, target.referenceLengthMeters);
  return ratio <= DEFAULT_BRIDGE_CONFIG.maxStepRatio
    ? { kind: "scene", sceneId: targetSceneId }
    : { kind: "bridge", originSceneId: sceneId, targetSceneId };
}
