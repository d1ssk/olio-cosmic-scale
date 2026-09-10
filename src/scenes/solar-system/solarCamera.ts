import { Box3, OrthographicCamera, Vector3 } from "three";

/** Move the pivot only in depth: every point keeps its orthographic screen position. */
export function focusDepth(camera: OrthographicCamera, target: Vector3, point: Vector3) {
  const forward = camera.getWorldDirection(new Vector3());
  const shift = forward.multiplyScalar(point.clone().sub(target).dot(forward));
  target.add(shift);
  camera.position.add(shift);
  camera.updateMatrixWorld();
}

/** Keep the full world in front of the camera, even when looking along the orbit plane. */
export function fitSolarDepth(camera: OrthographicCamera, target: Vector3, bounds: Box3) {
  const forward = camera.getWorldDirection(new Vector3());
  const center = bounds.getCenter(new Vector3()).sub(target);
  const half = bounds.getSize(new Vector3()).multiplyScalar(0.5);
  const radius =
    Math.abs(forward.x) * half.x + Math.abs(forward.y) * half.y + Math.abs(forward.z) * half.z;
  const depth = center.dot(forward);
  const margin = Math.max(0.01, radius * 0.01);
  const distance = Math.max(1, radius - depth + margin * 2);
  const currentDistance = target.clone().sub(camera.position).dot(forward);
  camera.position.addScaledVector(forward, currentDistance - distance);
  camera.near = Math.max(0.00001, distance + depth - radius - margin);
  camera.far = Math.max(camera.near + 1, distance + depth + radius + margin);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
}

export function closeupRulerOpacity(diameterPixels: number, earth = false) {
  const t = Math.max(0, Math.min(1, (diameterPixels - (earth ? 24 : 2)) / (earth ? 40 : 6)));
  return t * t * (3 - 2 * t);
}
