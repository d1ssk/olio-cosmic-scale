import { BarVisibilityContext } from "./barVisibility";
import { Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useMemo, useRef } from "react";
import { Vector3, type Sprite } from "three";
import { formatLength, length } from "../../physics/length";
import type { Locale } from "../../i18n";
import type { SceneMetadata } from "../types";
import { referenceLabel } from "./referenceLabel";

/** Physical endpoints and GPU depth testing; only thickness and label size use screen pixels. */
export function SceneReferenceBar({
  metadata,
  base,
  locale,
  visible = true,
  kind = "reference",
  labelOffsetY = 0,
  direction,
}: {
  metadata: SceneMetadata;
  base: readonly [number, number, number];
  locale: Locale;
  visible?: boolean;
  kind?: "reference" | "comparison";
  labelOffsetY?: number;
  direction?: readonly [number, number, number];
}): React.JSX.Element {
  const visibility = useContext(BarVisibilityContext);
  const shown =
    visible && !visibility.hidden && (visibility.only === null || visibility.only === kind);
  const { camera, size, gl } = useThree();
  const projectedLine = useRef<SVGLineElement>(null);
  const sprite = useRef<Sprite>(null);
  const endpoints = useMemo(
    () => [
      new Vector3(...base),
      new Vector3(...base).addScaledVector(
        new Vector3(...(direction ?? [0, 1, 0])).normalize(),
        metadata.referenceLengthMeters / metadata.metersPerSceneUnit,
      ),
    ],
    [base, direction, metadata.referenceLengthMeters, metadata.metersPerSceneUnit],
  );
  const scratch = useMemo(
    () => ({
      start: new Vector3(),
      end: new Vector3(),
      midpoint: new Vector3(),
      right: new Vector3(),
      up: new Vector3(),
      cameraPoint: new Vector3(),
    }),
    [],
  );
  const label = useMemo(
    () =>
      referenceLabel(
        formatLength(length(metadata.referenceLengthMeters), {
          unit: metadata.preferredPrimaryUnit,
          locale,
        }),
      ),
    [metadata.referenceLengthMeters, metadata.preferredPrimaryUnit, locale],
  );
  const color = useMemo(
    () => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(),
    [],
  );
  useEffect(() => () => label.texture.dispose(), [label]);
  useEffect(() => {
    projectedLine.current = document.querySelector<SVGLineElement>(`[data-scene-${kind}-bar]`);
  }, [kind]);
  useFrame(() => {
    const { start, end, midpoint, right, up, cameraPoint } = scratch;
    start.copy(endpoints[0]).project(camera);
    end.copy(endpoints[1]).project(camera);
    if (projectedLine.current) {
      const canvasRect = gl.domElement.getBoundingClientRect();
      const overlayRect = projectedLine.current.ownerSVGElement?.getBoundingClientRect();
      const offsetX = canvasRect.left - (overlayRect?.left ?? canvasRect.left);
      const offsetY = canvasRect.top - (overlayRect?.top ?? canvasRect.top);
      projectedLine.current.setAttribute("x1", String(offsetX + ((start.x + 1) * size.width) / 2));
      projectedLine.current.setAttribute("y1", String(offsetY + ((1 - start.y) * size.height) / 2));
      projectedLine.current.setAttribute("x2", String(offsetX + ((end.x + 1) * size.width) / 2));
      projectedLine.current.setAttribute("y2", String(offsetY + ((1 - end.y) * size.height) / 2));
      projectedLine.current.dataset.projected = "true";
      projectedLine.current.dataset.visible = String(shown);
    }
    if (sprite.current) {
      midpoint.copy(endpoints[0]).add(endpoints[1]).multiplyScalar(0.5);
      cameraPoint.copy(midpoint).applyMatrix4(camera.matrixWorldInverse);
      const unitsPerPixel = 2 / (size.height * camera.projectionMatrix.elements[5]);
      const depth = camera.type === "PerspectiveCamera" ? Math.max(0, -cameraPoint.z) : 1;
      right.setFromMatrixColumn(camera.matrixWorld, 0);
      sprite.current.position.copy(midpoint).addScaledVector(right, 12 * unitsPerPixel * depth);
      up.setFromMatrixColumn(camera.matrixWorld, 1);
      sprite.current.position.addScaledVector(up, -labelOffsetY * unitsPerPixel * depth);
      sprite.current.scale.set(label.width * unitsPerPixel, label.height * unitsPerPixel, 1);
    }
  });
  return (
    <group visible={shown} name={`physical-${kind}-bar`}>
      <Line
        points={endpoints}
        color={color}
        lineWidth={4}
        depthTest
        depthWrite
        toneMapped={false}
      />
      <sprite ref={sprite} center={[0, 0.5]}>
        <spriteMaterial
          map={label.texture}
          sizeAttenuation={false}
          depthTest
          depthWrite={false}
          transparent
          toneMapped={false}
        />
      </sprite>
    </group>
  );
}
