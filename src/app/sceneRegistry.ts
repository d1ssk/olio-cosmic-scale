import {
  MILKY_WAY_DIAMETER_METERS,
  MILKY_WAY_METERS_PER_UNIT,
  MILKY_WAY_VIEW_METERS,
} from "../scenes/milky-way/milkyWayData";
import { STELLAR_REFERENCE_METERS } from "../scenes/stellar-neighborhood/stellarData";
import {
  SOLAR_METERS_PER_UNIT,
  SOLAR_PRESET_CAMERA_POSITION,
  INNER_VIEW_METERS,
  OUTER_VIEW_METERS,
  OUTER_REFERENCE_METERS,
} from "../scenes/solar-system/solarScale";
import { SUN_DIAMETER_METERS } from "../scenes/sun/sunData";
import { EARTH_MOON_DISTANCE_METERS } from "../scenes/earth-moon/earthMoonData";
import { EARTH_DIAMETER_METERS } from "../scenes/earth/earthData";
import { HUMAN_REFERENCE_METERS } from "../scenes/human/humanData";
import { lazy } from "react";
import {
  AU_METERS,
  GIGAPARSEC_METERS,
  MEGAPARSEC_METERS,
  PARSEC_METERS,
} from "../physics/constants";
import type { SceneDefinition, SceneId } from "../scenes/types";

const MilkyWayScene = lazy(() => import("../scenes/milky-way/MilkyWayScene"));

const StellarScene = lazy(() => import("../scenes/stellar-neighborhood/StellarScene"));

const SunScene = lazy(() => import("../scenes/sun/SunScene"));
const EarthSunScene = lazy(() => import("../scenes/earth-sun/EarthSunScene"));
const EarthMoonScene = lazy(() => import("../scenes/earth-moon/EarthMoonScene"));
const EarthScene = lazy(() => import("../scenes/earth/EarthScene"));
const HumanScene = lazy(() => import("../scenes/human/HumanScene"));

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
  "earth-moon",
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
    referenceLengthMeters: HUMAN_REFERENCE_METERS,
    defaultViewportExtentMeters: 3,
    metersPerSceneUnit: 0.17,
    preferredPrimaryUnit: "m",
    secondaryUnits: ["cm"],
    camera: {
      ...perspective,
      position: [-25, 10, 5],
      target: [0, 5, 0],
      minDistance: 12,
      maxDistance: 45,
    },
    component: HumanScene,
    next: "earth",
  },
  earth: {
    id: "earth",
    kind: "scene",
    titleKey: "scene.earth.title",
    originDescriptionKey: "origin.earth",
    referenceLengthMeters: EARTH_DIAMETER_METERS,
    defaultViewportExtentMeters: 18_000_000,
    metersPerSceneUnit: EARTH_DIAMETER_METERS / 10,
    preferredPrimaryUnit: "km",
    secondaryUnits: ["Mm", "m"],
    camera: { ...perspective, position: [-14, 7, -18], minDistance: 12, maxDistance: 50 },
    component: EarthScene,
    previous: "human",
    next: "earth-moon",
  },
  "earth-moon": {
    id: "earth-moon",
    kind: "scene",
    titleKey: "scene.earthMoon.title",
    originDescriptionKey: "origin.earthMoon",
    referenceLengthMeters: EARTH_MOON_DISTANCE_METERS,
    defaultViewportExtentMeters: EARTH_MOON_DISTANCE_METERS * 1.5,
    metersPerSceneUnit: EARTH_MOON_DISTANCE_METERS / 10,
    preferredPrimaryUnit: "km",
    secondaryUnits: [],
    camera: {
      ...perspective,
      position: [0, 0, 10],
      fitToViewport: true,
      minDistance: 0.5,
      maxDistance: 50,
    },
    component: EarthMoonScene,
    previous: "earth",
    next: "sun",
  },
  sun: {
    id: "sun",
    kind: "scene",
    titleKey: "scene.sun.title",
    originDescriptionKey: "origin.sun",
    referenceLengthMeters: SUN_DIAMETER_METERS,
    defaultViewportExtentMeters: 2.1e9,
    metersPerSceneUnit: SUN_DIAMETER_METERS / 10,
    preferredPrimaryUnit: "Gm",
    secondaryUnits: ["km", "AU"],
    camera: {
      ...perspective,
      position: [0, 0, 24],
      fitToViewport: true,
      minDistance: 12,
      maxDistance: 60,
    },
    component: SunScene,
    previous: "earth-moon",
    next: "earth-sun",
  },
  "earth-sun": {
    id: "earth-sun",
    kind: "scene",
    titleKey: "scene.earthSun.title",
    originDescriptionKey: "origin.earthSun",
    referenceLengthMeters: AU_METERS,
    defaultViewportExtentMeters: INNER_VIEW_METERS,
    metersPerSceneUnit: SOLAR_METERS_PER_UNIT,
    preferredPrimaryUnit: "AU",
    secondaryUnits: ["Gm", "km"],
    camera: {
      ...orthographic,
      position: SOLAR_PRESET_CAMERA_POSITION,
      fitToViewport: true,
      minZoom: 0.01,
      maxZoom: 10000000,
    },
    component: EarthSunScene,
    previous: "sun",
    next: "solar-system",
  },
  "solar-system": {
    id: "solar-system",
    kind: "scene",
    titleKey: "scene.solarSystem.title",
    originDescriptionKey: "origin.solarSystem",
    referenceLengthMeters: OUTER_REFERENCE_METERS,
    defaultViewportExtentMeters: OUTER_VIEW_METERS,
    metersPerSceneUnit: SOLAR_METERS_PER_UNIT,
    preferredPrimaryUnit: "AU",
    secondaryUnits: ["ly", "Tm"],
    camera: {
      ...orthographic,
      position: SOLAR_PRESET_CAMERA_POSITION,
      fitToViewport: true,
      minZoom: 0.01,
      maxZoom: 10000000,
    },
    component: EarthSunScene,
    previous: "earth-sun",
    next: "solar-neighborhood",
  },
  "solar-neighborhood": {
    id: "solar-neighborhood",
    kind: "scene",
    titleKey: "scene.solarNeighborhood.title",
    originDescriptionKey: "origin.solarNeighborhood",
    referenceLengthMeters: STELLAR_REFERENCE_METERS,
    defaultViewportExtentMeters: 12 * PARSEC_METERS,
    metersPerSceneUnit: PARSEC_METERS,
    preferredPrimaryUnit: "pc",
    secondaryUnits: ["ly", "AU"],
    camera: {
      ...orthographic,
      position: [0, 0, 20],
      fitToViewport: true,
      rightGutterPixels: 110,
      minZoom: 5,
      maxZoom: 600,
    },
    component: StellarScene,
    previous: "solar-system",
    next: "milky-way",
    lateralSibling: "galactic-center-neighborhood",
  },
  "galactic-center-neighborhood": {
    id: "galactic-center-neighborhood",
    kind: "scene",
    titleKey: "scene.galacticCenterNeighborhood.title",
    originDescriptionKey: "origin.galacticCenterNeighborhood",
    referenceLengthMeters: STELLAR_REFERENCE_METERS,
    defaultViewportExtentMeters: 12 * PARSEC_METERS,
    metersPerSceneUnit: PARSEC_METERS,
    preferredPrimaryUnit: "pc",
    secondaryUnits: ["ly", "AU"],
    camera: {
      ...orthographic,
      position: [0, 0, 20],
      fitToViewport: true,
      rightGutterPixels: 110,
      minZoom: 5,
      maxZoom: 600,
    },
    component: StellarScene,
    previous: "solar-system",
    next: "milky-way",
    lateralSibling: "solar-neighborhood",
  },
  "milky-way": {
    id: "milky-way",
    kind: "scene",
    titleKey: "scene.milkyWay.title",
    originDescriptionKey: "origin.milkyWay",
    referenceLengthMeters: MILKY_WAY_DIAMETER_METERS,
    defaultViewportExtentMeters: MILKY_WAY_VIEW_METERS,
    metersPerSceneUnit: MILKY_WAY_METERS_PER_UNIT,
    preferredPrimaryUnit: "kpc",
    secondaryUnits: ["kly", "pc"],
    camera: {
      ...orthographic,
      position: [0, 32, 40],
      fitToViewport: true,
      minZoom: 1,
      maxZoom: 800,
    },
    component: MilkyWayScene,
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
