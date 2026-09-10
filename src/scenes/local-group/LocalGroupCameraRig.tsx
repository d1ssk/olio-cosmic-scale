import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Box3, OrthographicCamera, Vector3 } from "three";
import type { OrbitControls } from "three-stdlib";
import { focusDepth, fitSolarDepth } from "../solar-system/solarCamera";
import {
  LOCAL_GROUP_GALAXIES,
  LOCAL_GROUP_REFERENCE_METERS,
  LOCAL_GROUP_RULER_Y_METERS,
} from "./localGroupData";
import { galaxyPosition } from "./localGroupModel";

/** The same view-center depth pivot as the solar world; never move objects to the cursor. */
export function LocalGroupCameraRig({ unit }: { unit: number }) {
  const { camera, controls, gl, size } = useThree();
  const orbit = controls as OrbitControls | null;
  const candidates = useMemo(
    () =>
      LOCAL_GROUP_GALAXIES.filter((g) => g.radiusMeters !== null).map((g) => ({
        position: new Vector3(...galaxyPosition(g, unit)),
        radius: g.radiusMeters! / unit,
      })),
    [unit],
  );
  const bounds = useMemo(() => {
    const box = new Box3();
    for (const g of candidates) {
      const radius = new Vector3().setScalar(g.radius);
      box.expandByPoint(g.position.clone().add(radius));
      box.expandByPoint(g.position.clone().sub(radius));
    }
    for (const y of Object.values(LOCAL_GROUP_RULER_Y_METERS))
      for (const sign of [-1, 1])
        box.expandByPoint(
          new Vector3((sign * LOCAL_GROUP_REFERENCE_METERS) / unit / 2, y / unit, 0),
        );
    return box;
  }, [candidates, unit]);
  useEffect(() => {
    if (!(camera instanceof OrthographicCamera) || !orbit) return;
    const localPivot = () => {
      if (!orbit.enabled) return;
      camera.updateMatrixWorld();
      let nearest: Vector3 | undefined,
        score = Infinity;
      for (const g of candidates) {
        if (g.radius * camera.zoom * 2 < 1) continue;
        const projected = g.position.clone().project(camera);
        if (Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1 || Math.abs(projected.z) > 1)
          continue;
        const distance = Math.hypot(projected.x * size.width, projected.y * size.height);
        if (distance < score) {
          score = distance;
          nearest = g.position;
        }
      }
      if (!nearest) return;
      const damping = orbit.enableDamping;
      orbit.enableDamping = false;
      orbit.update();
      focusDepth(camera, orbit.target, nearest);
      fitSolarDepth(camera, orbit.target, bounds);
      orbit.update();
      orbit.enableDamping = damping;
    };
    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", localPivot, true);
    return () => canvas.removeEventListener("pointerdown", localPivot, true);
  }, [camera, orbit, gl, candidates, size, bounds]);
  useFrame(() => {
    if (camera instanceof OrthographicCamera && orbit) fitSolarDepth(camera, orbit.target, bounds);
  });
  return null;
}
