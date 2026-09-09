import type { SceneId } from "../scenes/types";

export type CameraSnapshot = {
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  zoom: number;
};

export interface CameraStateStore {
  get(key: string): CameraSnapshot | undefined;
  set(key: string, snapshot: CameraSnapshot): void;
  delete(key: string): void;
}

export function cameraStateKey(sceneId: SceneId): string {
  return sceneId === "solar-neighborhood" || sceneId === "galactic-center-neighborhood"
    ? "stellar-neighborhood-comparison"
    : sceneId;
}

export function createCameraStateStore(): CameraStateStore {
  const snapshots = new Map<string, CameraSnapshot>();
  return {
    get: (key) => snapshots.get(key),
    set: (key, snapshot) => snapshots.set(key, snapshot),
    delete: (key) => snapshots.delete(key),
  };
}

export const cameraStateStore = createCameraStateStore();
