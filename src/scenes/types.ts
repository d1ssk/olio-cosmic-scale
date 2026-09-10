import type { GalaxyVariant, VolumeStatus } from "./milky-way/volumeData";
import type { ComponentType, LazyExoticComponent } from "react";
import type { TranslationKey } from "../i18n";
import type { Locale } from "../i18n";
import type { UnitId } from "../physics/length";

export type SceneId =
  | "human"
  | "earth-moon"
  | "earth"
  | "sun"
  | "earth-sun"
  | "solar-system"
  | "solar-neighborhood"
  | "galactic-center-neighborhood"
  | "milky-way"
  | "local-group"
  | "virgo"
  | "bao"
  | "observable-universe";

export type CameraConfig = {
  projection: "perspective" | "orthographic";
  fitToViewport?: boolean;
  rightGutterPixels?: number;
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  near: number;
  far: number;
  minDistance?: number;
  maxDistance?: number;
  minZoom?: number;
  maxZoom?: number;
};

export type SceneMetadata = {
  id: SceneId;
  titleKey: TranslationKey;
  originDescriptionKey: TranslationKey;
  referenceLengthMeters: number;
  defaultViewportExtentMeters: number;
  metersPerSceneUnit: number;
  preferredPrimaryUnit: UnitId;
  secondaryUnits: readonly UnitId[];
  camera: CameraConfig;
};

export type ScaleSceneProps = {
  previewStarId?: number | null;
  selectedGalaxyId?: number | null;
  showAllGalaxyLabels?: boolean;
  galaxyVariant?: GalaxyVariant;
  volumeStatus?: VolumeStatus;
  onVolumeStatusChange?: (status: VolumeStatus) => void;
  observationDate?: string;
  showAllStarLabels?: boolean;
  selectedStarId?: number | null;
  active: boolean;
  locale: Locale;
  metadata: SceneMetadata;
  onReady?: () => void;
  referenceBarVisible?: boolean;
  entryBarKind?: "reference" | "comparison";
};

export type SceneDefinition = SceneMetadata & {
  kind: "scene";
  component: LazyExoticComponent<ComponentType<ScaleSceneProps>>;
  previous?: SceneId;
  next?: SceneId;
  lateralSibling?: SceneId;
  bridgeMilestonesToNext?: readonly number[];
};

export type RepresentationMode =
  | { type: "physical" }
  | { type: "marker" }
  | { type: "exaggerated"; factor: number }
  | { type: "density-proxy"; objectsPerMarker: number };
