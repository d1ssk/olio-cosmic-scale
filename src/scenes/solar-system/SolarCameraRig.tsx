import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Box3, OrthographicCamera, Vector3 } from "three";
import type { OrbitControls } from "three-stdlib";
import type { earthSunModel } from "../earth-sun/earthSunModel";
import { fitSolarDepth, focusDepth } from "./solarCamera";

export type SolarModel = ReturnType<typeof earthSunModel>;
export function SolarCameraRig({ model }: { model: SolarModel }) {
  const { camera, controls, gl, size } = useThree();
  const orbit = controls as OrbitControls | null;
  const bounds = useMemo(() => {
    const box = new Box3(
      new Vector3(-model.sunRadius, -model.sunRadius, -model.sunRadius),
      new Vector3(model.sunRadius, model.sunRadius, model.sunRadius),
    );
    for (const body of model.bodies) {
      for (const p of body.orbit) box.expandByPoint(new Vector3(...p));
      const extent = new Vector3().setScalar(body.radius * 3); // Conservatively includes Saturn's rings.
      box.expandByPoint(new Vector3(...body.position).add(extent));
      box.expandByPoint(new Vector3(...body.position).sub(extent));
    }
    for (const p of model.rulerBounds) box.expandByPoint(new Vector3(...p));
    return box;
  }, [model]);
  useEffect(() => {
    if (!(camera instanceof OrthographicCamera) || !orbit) return;
    const localPivot = () => {
      if (!orbit.enabled) return;
      const candidates = [{ position: [0, 0, 0], radius: model.sunRadius }, ...model.bodies];
      let nearest: Vector3 | undefined;
      let score = Infinity;
      for (const body of candidates) {
        if (body.radius * camera.zoom * 2 < 1) continue;
        const point = new Vector3(...body.position);
        const projected = point.clone().project(camera);
        if (Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1) continue;
        const d = Math.hypot(projected.x * size.width, projected.y * size.height);
        if (d < score) {
          score = d;
          nearest = point;
        }
      }
      if (nearest) {
        const damping = orbit.enableDamping;
        orbit.enableDamping = false;
        orbit.update();
        focusDepth(camera, orbit.target, nearest);
        fitSolarDepth(camera, orbit.target, bounds);
        orbit.update();
        orbit.enableDamping = damping;
      }
    };
    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", localPivot, true);
    return () => canvas.removeEventListener("pointerdown", localPivot, true);
  }, [camera, orbit, gl, model, size, bounds]);
  useFrame(() => {
    if (camera instanceof OrthographicCamera && orbit) fitSolarDepth(camera, orbit.target, bounds);
  });
  return null;
}
