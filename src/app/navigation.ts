import type { Locale } from "../i18n";
import type { SceneId } from "../scenes/types";
import { isSceneId } from "./sceneRegistry";

export type SceneMode = { kind: "scene"; sceneId: SceneId };
export type BridgeMode = { kind: "bridge"; originSceneId: SceneId; targetSceneId: SceneId };
export type AppMode = SceneMode | BridgeMode;

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
