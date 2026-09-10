import { visibleSegmentFraction } from "../solar-system/solarNavigation";
import { BarVisibilityContext } from "./barVisibility";
import { Line } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useMemo, useRef } from "react";
import { Vector3, type Sprite, type Group, type InterleavedBufferAttribute } from "three";
import type { Line2, OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { formatLength, length } from "../../physics/length";
import type { Locale } from "../../i18n";
import type { SceneMetadata } from "../types";
import { referenceLabel } from "./referenceLabel";

/** Physical endpoints and GPU depth testing; only thickness and label size use screen pixels. */
export function SceneReferenceBar({
  metadata,
  barName,
  base,
  locale,
  visible = true,
  kind = "reference",
  labelOffsetY = 0,
  labelAlign = "left",
  direction,
  screenBottom,
  opacityForExtent,
  labelSuffix,
  labelOffsetX = 0,
}: {
  metadata: SceneMetadata;
  barName?: string;
  base: readonly [number, number, number];
  locale: Locale;
  labelSuffix?: string;
  labelOffsetX?: number | ((projectedLengthPixels: number) => number);
  visible?: boolean;
  kind?: "reference" | "comparison" | "auxiliary";
  screenBottom?: number;
  opacityForExtent?: (extentMeters: number) => number;
  labelOffsetY?: number;
  labelAlign?: "left" | "center";
  direction?: readonly [number, number, number];
}): React.JSX.Element {
  const visibility = useContext(BarVisibilityContext);
  const shown =
    visible && !visibility.hidden && (visibility.only === null || visibility.only === kind);
  const { camera, size, gl, controls } = useThree();
  const group = useRef<Group>(null);
  const line = useRef<Line2>(null);
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
        }) + (labelSuffix ? ` (${labelSuffix})` : ""),
      ),
    [metadata.referenceLengthMeters, metadata.preferredPrimaryUnit, locale, labelSuffix],
  );
  const color = useMemo(
    () => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(),
    [],
  );
  useEffect(() => () => label.texture.dispose(), [label]);
  useEffect(() => {
    if (!line.current) return;
    // Line2 normally extends each endpoint by half the stroke width. Keep the
    // visible segment identical to the DOM transfer and its physical endpoints.
    const material = line.current.material;
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <clipping_planes_fragment>",
        "#include <clipping_planes_fragment>\nif (abs(vUv.y) > 1.0) discard;",
      );
    };
    material.customProgramCacheKey = () => "physical-bar-butt-caps";
    material.needsUpdate = true;
  }, []);
  useEffect(() => {
    projectedLine.current = document.querySelector<SVGLineElement>(`[data-scene-${kind}-bar]`);
  }, [kind]);
  useFrame(() => {
    const { start, end, midpoint, right, up, cameraPoint } = scratch;
    const extent = (Math.min(size.width, size.height) / camera.zoom) * metadata.metersPerSceneUnit;
    const opacity = visibility.only === kind ? 1 : (opacityForExtent?.(extent) ?? 1);
    if (group.current) group.current.visible = shown && opacity > 0.001;
    if (line.current) line.current.material.opacity = opacity;
    if (sprite.current) sprite.current.material.opacity = opacity;
    if (screenBottom !== undefined && camera.type === "OrthographicCamera") {
      const target = (controls as OrbitControlsImpl | null)?.target;
      midpoint.copy(target ?? new Vector3());
      right.setFromMatrixColumn(camera.matrixWorld, 0);
      up.setFromMatrixColumn(camera.matrixWorld, 1);
      midpoint.addScaledVector(up, (screenBottom - size.height / 2) / camera.zoom);
      const halfLength = metadata.referenceLengthMeters / metadata.metersPerSceneUnit / 2;
      endpoints[0].copy(midpoint).addScaledVector(right, -halfLength);
      endpoints[1].copy(midpoint).addScaledVector(right, halfLength);
      if (line.current) {
        const startAttribute = line.current.geometry.attributes
          .instanceStart as InterleavedBufferAttribute;
        const endAttribute = line.current.geometry.attributes
          .instanceEnd as InterleavedBufferAttribute;
        startAttribute.setXYZ(0, endpoints[0].x, endpoints[0].y, endpoints[0].z);
        endAttribute.setXYZ(0, endpoints[1].x, endpoints[1].y, endpoints[1].z);
        startAttribute.data.needsUpdate = true;
        // The endpoints move in the camera plane; don't use the initial static bounds.
        line.current.frustumCulled = false;
      }
    }
    start.copy(endpoints[0]).project(camera);
    end.copy(endpoints[1]).project(camera);
    if (group.current) {
      const fraction = visibleSegmentFraction(start.toArray(), end.toArray());
      group.current.userData.visibleBarMeters =
        shown && opacity > 0.15 && fraction > 0 ? metadata.referenceLengthMeters : null;
    }
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
      projectedLine.current.dataset.visible = String(shown && opacity > 0.001);
    }
    if (sprite.current) {
      const projectedLength = Math.hypot(
        ((end.x - start.x) * size.width) / 2,
        ((end.y - start.y) * size.height) / 2,
      );
      const horizontalOffset =
        typeof labelOffsetX === "function" ? labelOffsetX(projectedLength) : labelOffsetX;
      midpoint.copy(endpoints[0]).add(endpoints[1]).multiplyScalar(0.5);
      cameraPoint.copy(midpoint).applyMatrix4(camera.matrixWorldInverse);
      const unitsPerPixel = 2 / (size.height * camera.projectionMatrix.elements[5]);
      const depth = camera.type === "PerspectiveCamera" ? Math.max(0, -cameraPoint.z) : 1;
      right.setFromMatrixColumn(camera.matrixWorld, 0);
      sprite.current.position
        .copy(midpoint)
        .addScaledVector(
          right,
          ((labelAlign === "center" ? 0 : 12) + horizontalOffset) * unitsPerPixel * depth,
        );
      up.setFromMatrixColumn(camera.matrixWorld, 1);
      sprite.current.position.addScaledVector(up, -labelOffsetY * unitsPerPixel * depth);
      sprite.current.scale.set(label.width * unitsPerPixel, label.height * unitsPerPixel, 1);
    }
  });
  return (
    <group ref={group} visible={shown} name={barName ?? `physical-${kind}-bar`}>
      <Line
        ref={line}
        transparent
        points={endpoints}
        color={color}
        lineWidth={4}
        depthTest
        depthWrite
        toneMapped={false}
      />
      <sprite ref={sprite} center={[labelAlign === "center" ? 0.5 : 0, 0.5]}>
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
