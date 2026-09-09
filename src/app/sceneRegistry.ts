import { lazy } from "react";
import {
  AU_METERS,
  GIGAPARSEC_METERS,
  KILOPARSEC_METERS,
  MEGAPARSEC_METERS,
  PARSEC_METERS,
} from "../physics/constants";
import type { SceneDefinition, SceneId } from "../scenes/types";

const PlaceholderScene = lazy(() => import("../scenes/shared/PlaceholderScene"));

const perspective = {
  projection: "perspective" as const,
  position: [7, 5, 9] as const,
  target: [0, 0, 0] as const,
  near: 0.01,
  far: 2_000,
  minDistance: 2,
  maxDistance: 80,
};

const orthographic = {
  projection: "orthographic" as const,
  position: [8, 7, 10] as const,
  target: [0, 0, 0] as const,
  near: 0.01,
  far: 2_000,
  minZoom: 20,
  maxZoom: 180,
};

export const MAIN_SCENE_ORDER = [
  "human",
  "earth",
  "sun",
  "earth-sun",
  "solar-system",
  "solar-neighborhood",
  "milky-way",
  "local-group",
  "virgo",
  "bao",
  "observable-universe",
] as const satisfies readonly SceneId[];

export const sceneRegistry: Record<SceneId, SceneDefinition> = {
  human: {
    id: "human",
    kind: "scene",
    titleKey: "scene.human.title",
    originDescriptionKey: "origin.human",
    referenceLengthMeters: 1.7,
    defaultViewportExtentMeters: 3,
    metersPerSceneUnit: 0.17,
    preferredPrimaryUnit: "m",
    secondaryUnits: ["cm"],
    camera: perspective,
    component: PlaceholderScene,
    next: "earth",
  },
  earth: {
    id: "earth",
    kind: "scene",
    titleKey: "scene.earth.title",
    originDescriptionKey: "origin.earth",
    referenceLengthMeters: 12_742_000,
    defaultViewportExtentMeters: 18_000_000,
    metersPerSceneUnit: 1_274_200,
    preferredPrimaryUnit: "km",
    secondaryUnits: ["Mm", "m"],
    camera: perspective,
    component: PlaceholderScene,
    previous: "human",
    next: "sun",
  },
  sun: {
    id: "sun",
    kind: "scene",
    titleKey: "scene.sun.title",
    originDescriptionKey: "origin.sun",
    referenceLengthMeters: 1.3927e9,
    defaultViewportExtentMeters: 2.1e9,
    metersPerSceneUnit: 1.3927e8,
    preferredPrimaryUnit: "Gm",
    secondaryUnits: ["km", "AU"],
    camera: perspective,
    component: PlaceholderScene,
    previous: "earth",
    next: "earth-sun",
  },
  "earth-sun": {
    id: "earth-sun",
    kind: "scene",
    titleKey: "scene.earthSun.title",
    originDescriptionKey: "origin.earthSun",
    referenceLengthMeters: AU_METERS,
    defaultViewportExtentMeters: AU_METERS * 1.35,
    metersPerSceneUnit: AU_METERS / 10,
    preferredPrimaryUnit: "AU",
    secondaryUnits: ["Gm", "km"],
    camera: orthographic,
    component: PlaceholderScene,
    previous: "sun",
    next: "solar-system",
  },
  "solar-system": {
    id: "solar-system",
    kind: "scene",
    titleKey: "scene.solarSystem.title",
    originDescriptionKey: "origin.solarSystem",
    referenceLengthMeters: 100 * AU_METERS,
    defaultViewportExtentMeters: 120 * AU_METERS,
    metersPerSceneUnit: 10 * AU_METERS,
    preferredPrimaryUnit: "AU",
    secondaryUnits: ["ly", "Tm"],
    camera: orthographic,
    component: PlaceholderScene,
    previous: "earth-sun",
    next: "solar-neighborhood",
    bridgeMilestonesToNext: [10_000 * AU_METERS, PARSEC_METERS],
  },
  "solar-neighborhood": {
    id: "solar-neighborhood",
    kind: "scene",
    titleKey: "scene.solarNeighborhood.title",
    originDescriptionKey: "origin.solarNeighborhood",
    referenceLengthMeters: 10 * PARSEC_METERS,
    defaultViewportExtentMeters: 12 * PARSEC_METERS,
    metersPerSceneUnit: PARSEC_METERS,
    preferredPrimaryUnit: "pc",
    secondaryUnits: ["ly", "AU"],
    camera: orthographic,
    component: PlaceholderScene,
    previous: "solar-system",
    next: "milky-way",
    lateralSibling: "galactic-center-neighborhood",
    bridgeMilestonesToNext: [KILOPARSEC_METERS],
  },
  "galactic-center-neighborhood": {
    id: "galactic-center-neighborhood",
    kind: "scene",
    titleKey: "scene.galacticCenterNeighborhood.title",
    originDescriptionKey: "origin.galacticCenterNeighborhood",
    referenceLengthMeters: 10 * PARSEC_METERS,
    defaultViewportExtentMeters: 12 * PARSEC_METERS,
    metersPerSceneUnit: PARSEC_METERS,
    preferredPrimaryUnit: "pc",
    secondaryUnits: ["ly", "AU"],
    camera: orthographic,
    component: PlaceholderScene,
    previous: "solar-system",
    next: "milky-way",
    lateralSibling: "solar-neighborhood",
  },
  "milky-way": {
    id: "milky-way",
    kind: "scene",
    titleKey: "scene.milkyWay.title",
    originDescriptionKey: "origin.milkyWay",
    referenceLengthMeters: 30 * KILOPARSEC_METERS,
    defaultViewportExtentMeters: 38 * KILOPARSEC_METERS,
    metersPerSceneUnit: 3 * KILOPARSEC_METERS,
    preferredPrimaryUnit: "kpc",
    secondaryUnits: ["kly", "pc"],
    camera: orthographic,
    component: PlaceholderScene,
    previous: "solar-neighborhood",
    next: "local-group",
  },
  "local-group": {
    id: "local-group",
    kind: "scene",
    titleKey: "scene.localGroup.title",
    originDescriptionKey: "origin.localGroup",
    referenceLengthMeters: 3 * MEGAPARSEC_METERS,
    defaultViewportExtentMeters: 4 * MEGAPARSEC_METERS,
    metersPerSceneUnit: 0.3 * MEGAPARSEC_METERS,
    preferredPrimaryUnit: "Mpc",
    secondaryUnits: ["Mly", "kpc"],
    camera: orthographic,
    component: PlaceholderScene,
    previous: "milky-way",
    next: "virgo",
  },
  virgo: {
    id: "virgo",
    kind: "scene",
    titleKey: "scene.virgo.title",
    originDescriptionKey: "origin.virgo",
    referenceLengthMeters: 16.5 * MEGAPARSEC_METERS,
    defaultViewportExtentMeters: 22 * MEGAPARSEC_METERS,
    metersPerSceneUnit: 1.65 * MEGAPARSEC_METERS,
    preferredPrimaryUnit: "Mpc",
    secondaryUnits: ["Mly", "kpc"],
    camera: orthographic,
    component: PlaceholderScene,
    previous: "local-group",
    next: "bao",
  },
  bao: {
    id: "bao",
    kind: "scene",
    titleKey: "scene.bao.title",
    originDescriptionKey: "origin.bao",
    referenceLengthMeters: 147 * MEGAPARSEC_METERS,
    defaultViewportExtentMeters: 190 * MEGAPARSEC_METERS,
    metersPerSceneUnit: 14.7 * MEGAPARSEC_METERS,
    preferredPrimaryUnit: "Mpc",
    secondaryUnits: ["Mly", "Gpc"],
    camera: perspective,
    component: PlaceholderScene,
    previous: "virgo",
    next: "observable-universe",
    bridgeMilestonesToNext: [GIGAPARSEC_METERS],
  },
  "observable-universe": {
    id: "observable-universe",
    kind: "scene",
    titleKey: "scene.observableUniverse.title",
    originDescriptionKey: "origin.observableUniverse",
    referenceLengthMeters: 28.5 * GIGAPARSEC_METERS,
    defaultViewportExtentMeters: 32 * GIGAPARSEC_METERS,
    metersPerSceneUnit: 2.85 * GIGAPARSEC_METERS,
    preferredPrimaryUnit: "Gpc",
    secondaryUnits: ["Gly", "Mpc"],
    camera: perspective,
    component: PlaceholderScene,
    previous: "bao",
  },
};

export function isSceneId(value: string | null): value is SceneId {
  return value !== null && value in sceneRegistry;
}

export function hierarchyPosition(sceneId: SceneId): number {
  const normalized = sceneId === "galactic-center-neighborhood" ? "solar-neighborhood" : sceneId;
  return MAIN_SCENE_ORDER.indexOf(normalized as (typeof MAIN_SCENE_ORDER)[number]) + 1;
}

export function canonicalBridgeEndpoints(
  first: SceneId,
  second: SceneId,
): readonly [SceneDefinition, SceneDefinition] {
  const normalizedFirst = first === "galactic-center-neighborhood" ? "solar-neighborhood" : first;
  const normalizedSecond =
    second === "galactic-center-neighborhood" ? "solar-neighborhood" : second;
  const firstIndex = MAIN_SCENE_ORDER.indexOf(normalizedFirst as (typeof MAIN_SCENE_ORDER)[number]);
  const secondIndex = MAIN_SCENE_ORDER.indexOf(
    normalizedSecond as (typeof MAIN_SCENE_ORDER)[number],
  );
  return firstIndex < secondIndex
    ? [sceneRegistry[normalizedFirst], sceneRegistry[normalizedSecond]]
    : [sceneRegistry[normalizedSecond], sceneRegistry[normalizedFirst]];
}
