import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import { Raycaster, Vector2, Vector3, type Object3D } from "three";
import { LOCAL_GROUP_GALAXIES } from "./localGroupData";
import { galaxyPosition } from "./localGroupModel";

/** Center-marker tolerance plus actual point-cloud picking at the current physical zoom. */
export function useGalaxyHover(unit: number) {
  const { camera, gl, size, scene } = useThree();
  const [hovered, setHovered] = useState<number | null>(null);
  useEffect(() => {
    const canvas = gl.domElement,
      raycaster = new Raycaster(),
      pointer = new Vector2(),
      scratch = new Vector3();
    const centers = LOCAL_GROUP_GALAXIES.map((g) => ({
      id: g.id,
      position: galaxyPosition(g, unit),
    }));
    const clouds: Object3D[] = [];
    scene.traverse((o) => {
      if (typeof o.userData.localGalaxyId === "number") clouds.push(o);
    });
    const clear = () => setHovered(null);
    const move = (event: PointerEvent) => {
      if (event.buttons) {
        clear();
        return;
      }
      camera.updateMatrixWorld();
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left,
        y = event.clientY - rect.top;
      let hit: number | null = null,
        nearest = 8;
      for (const g of centers) {
        scratch.fromArray(g.position).project(camera);
        if (Math.abs(scratch.x) > 1 || Math.abs(scratch.y) > 1 || Math.abs(scratch.z) > 1) continue;
        const distance = Math.hypot(
          ((scratch.x + 1) * size.width) / 2 - x,
          ((1 - scratch.y) * size.height) / 2 - y,
        );
        if (distance < nearest) {
          nearest = distance;
          hit = g.id;
        }
      }
      if (hit === null) {
        pointer.set((x / size.width) * 2 - 1, 1 - (y / size.height) * 2);
        raycaster.params.Points.threshold = 6 / camera.zoom;
        raycaster.setFromCamera(pointer, camera);
        const intersections = raycaster.intersectObjects(clouds, false);
        const match = intersections.find((i) => {
          scratch.copy(i.point).project(camera);
          return Math.abs(scratch.z) <= 1;
        });
        if (match) hit = match.object.userData.localGalaxyId as number;
      }
      setHovered(hit);
    };
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", clear);
    canvas.addEventListener("pointerdown", clear);
    canvas.addEventListener("wheel", clear);
    return () => {
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerleave", clear);
      canvas.removeEventListener("pointerdown", clear);
      canvas.removeEventListener("wheel", clear);
    };
  }, [camera, gl, size, scene, unit]);
  return hovered;
}
