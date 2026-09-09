export type PhysicalPoint = readonly [number, number, number];
export type ScenePoint = readonly [number, number, number];

export function metersToSceneUnits(meters: number, metersPerSceneUnit: number): number {
  if (!Number.isFinite(metersPerSceneUnit) || metersPerSceneUnit <= 0) {
    throw new RangeError("metersPerSceneUnit must be finite and positive.");
  }
  return meters / metersPerSceneUnit;
}

export function physicalPointToScene(
  pointMeters: PhysicalPoint,
  metersPerSceneUnit: number,
): ScenePoint {
  return pointMeters.map((coordinate) =>
    metersToSceneUnits(coordinate, metersPerSceneUnit),
  ) as unknown as ScenePoint;
}
