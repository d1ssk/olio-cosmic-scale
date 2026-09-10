import { Vector3, type Camera, type Object3D } from "three";
import type { Line2 } from "three-stdlib";
import { visibleSegmentFraction } from "../solar-system/solarNavigation";

/** Test physical endpoints even when the user has hidden the bar. */
export function projectPhysicalBar(
  scene: Object3D,
  camera: Camera,
  size: { width: number; height: number },
  name: string,
) {
  camera.updateMatrixWorld();
  const line = scene.getObjectByName(name)?.children[0] as Line2 | undefined;
  const a = line?.geometry?.attributes.instanceStart;
  const b = line?.geometry?.attributes.instanceEnd;
  if (!line || !a || !b) return { fraction: 0, pixels: 0 };
  line.updateWorldMatrix(true, false);
  const start = line.localToWorld(new Vector3(a.getX(0), a.getY(0), a.getZ(0))).project(camera);
  const end = line.localToWorld(new Vector3(b.getX(0), b.getY(0), b.getZ(0))).project(camera);
  return {
    fraction: visibleSegmentFraction(start.toArray(), end.toArray()),
    pixels: Math.hypot(((end.x - start.x) * size.width) / 2, ((end.y - start.y) * size.height) / 2),
  };
}
export function wholeBarInView(projection: { fraction: number; pixels: number }) {
  return projection.fraction >= 1 - 1e-9 && projection.pixels >= 0.5;
}
