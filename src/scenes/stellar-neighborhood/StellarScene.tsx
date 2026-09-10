import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AdditiveBlending, Vector3, type ShaderMaterial } from "three";
import { translate } from "../../i18n";
import type { ScaleSceneProps } from "../types";
import { BarVisibilityContext } from "../shared/barVisibility";
import { SceneReferenceBar } from "../shared/SceneReferenceBar";
import { STELLAR_COMPARISON_METERS, STELLAR_PSF_PIXELS } from "./stellarData";
import {
  bulgeStarModel,
  nearbyStarModel,
  stellarRulerModel,
  type StellarPoint,
} from "./stellarModel";

export default function StellarScene({
  metadata,
  locale,
  onReady,
  showAllStarLabels = false,
  selectedStarId = null,
  previewStarId = null,
}: ScaleSceneProps) {
  const local = metadata.id === "solar-neighborhood";
  const visibility = useContext(BarVisibilityContext);
  const stars = useMemo(
    () =>
      local
        ? nearbyStarModel(metadata.metersPerSceneUnit)
        : bulgeStarModel(metadata.metersPerSceneUnit),
    [local, metadata.metersPerSceneUnit],
  );
  useEffect(() => onReady?.(), [onReady]);
  const [referenceRuler, comparisonRuler] = useMemo(() => stellarRulerModel(metadata), [metadata]);
  return (
    <group>
      <group visible={visibility.only === null}>
        <StarField stars={stars} />
        {local && visibility.only === null && (
          <StarLabels
            stars={stars}
            locale={locale}
            all={showAllStarLabels}
            selected={selectedStarId}
            preview={previewStarId}
          />
        )}
      </group>
      <SceneReferenceBar
        metadata={metadata}
        locale={locale}
        base={referenceRuler.base}
        direction={referenceRuler.direction}
        labelAlign="left"
        labelOffsetY={-36}
      />
      <SceneReferenceBar
        metadata={{
          ...metadata,
          referenceLengthMeters: STELLAR_COMPARISON_METERS,
          preferredPrimaryUnit: "AU",
        }}
        locale={locale}
        kind="comparison"
        base={comparisonRuler.base}
        direction={comparisonRuler.direction}
        labelAlign="left"
        labelOffsetY={18}
      />
    </group>
  );
}

function StarField({ stars }: { stars: StellarPoint[] }) {
  const material = useRef<ShaderMaterial>(null);
  const attributes = useMemo(
    () => ({
      position: new Float32Array(stars.flatMap((s) => s.position)),
      color: new Float32Array(stars.flatMap((s) => s.color)),
      brightness: new Float32Array(stars.map((s) => s.brightness)),
    }),
    [stars],
  );
  const uniforms = useMemo(() => ({ diameter: { value: STELLAR_PSF_PIXELS } }), []);
  useFrame(({ gl }) => {
    if (material.current)
      material.current.uniforms.diameter.value = STELLAR_PSF_PIXELS * gl.getPixelRatio();
  });
  return (
    <points frustumCulled={false} name="stellar-display-psf">
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[attributes.position, 3]} />
        <bufferAttribute attach="attributes-color" args={[attributes.color, 3]} />
        <bufferAttribute attach="attributes-brightness" args={[attributes.brightness, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
        vertexShader={`attribute vec3 color; attribute float brightness; uniform float diameter; varying vec3 tint; varying float intensity;
      void main(){ tint=color; intensity=brightness; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_PointSize=diameter; }`}
        fragmentShader={`varying vec3 tint; varying float intensity;
      void main(){ vec2 p=gl_PointCoord*2.-1.; float r2=dot(p,p); float core=exp(-r2*32.); float halo=.22*exp(-r2*5.); float edge=1.-smoothstep(.65,1.,sqrt(r2));
      gl_FragColor=vec4(mix(tint,vec3(1.),core*.45),intensity*(core+halo)*edge);
      #include <colorspace_fragment>
      }`}
      />
    </points>
  );
}

type Label = { id: number; name: string; x: number; y: number; tx: number; ty: number };
function StarLabels({
  stars,
  locale,
  all,
  selected,
  preview,
}: {
  stars: StellarPoint[];
  locale: ScaleSceneProps["locale"];
  all: boolean;
  selected: number | null;
  preview: number | null;
}) {
  const { camera, size, gl } = useThree();
  const [hovered, setHovered] = useState<number[]>([]);
  const groups = useRef(new Map<number, SVGGElement>());
  const point = useMemo(() => new Vector3(), []);
  useEffect(() => {
    const canvas = gl.domElement;
    const move = (event: PointerEvent) => {
      camera.updateMatrixWorld();
      const rect = canvas.getBoundingClientRect();
      const hits = stars
        .filter((star) => {
          point.fromArray(star.position).project(camera);
          return (
            Math.abs(point.z) <= 1 &&
            Math.hypot(
              ((point.x + 1) * size.width) / 2 - (event.clientX - rect.left),
              ((1 - point.y) * size.height) / 2 - (event.clientY - rect.top),
            ) < 10
          );
        })
        .map((star) => star.id);
      setHovered((previous) => (previous.join() === hits.join() ? previous : hits));
    };
    const leave = () => setHovered([]);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerdown", move);
    canvas.addEventListener("pointerleave", leave);
    return () => {
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerdown", move);
      canvas.removeEventListener("pointerleave", leave);
    };
  }, [camera, gl, point, size, stars]);
  const updateLabels = (labels: Label[]) => {
    for (const group of groups.current.values()) group.style.visibility = "hidden";
    for (const label of labels) {
      const group = groups.current.get(label.id);
      if (!group) continue;
      group.style.visibility = "visible";
      group.children[0].setAttribute(
        "d",
        `M${label.x},${label.y} L${label.tx - 5},${label.ty - 4} L${label.tx},${label.ty - 4}`,
      );
      group.children[1].setAttribute("x", String(label.tx));
      group.children[1].setAttribute("y", String(label.ty));
    }
  };
  useFrame(() => {
    // Controls run at priority -1. Project using this frame's camera matrices.
    camera.updateMatrixWorld();
    const projected = stars
      .filter(
        (star) =>
          all ||
          star.id === 0 ||
          star.id === selected ||
          star.id === preview ||
          hovered.includes(star.id),
      )
      .flatMap((star) => {
        point.fromArray(star.position).project(camera);
        if (Math.abs(point.x) > 1 || Math.abs(point.y) > 1 || Math.abs(point.z) > 1) return [];
        return [
          {
            id: star.id,
            name: star.id === 0 ? translate(locale, "scene.sun.title") : star.name,
            x: ((point.x + 1) * size.width) / 2,
            y: ((1 - point.y) * size.height) / 2,
            tx: 0,
            ty: 0,
          },
        ];
      });
    if (all && size.width < 600) {
      // In a narrow viewport, use discrete label slots instead of wrapping into occupied space.
      const columns = Math.max(1, Math.floor((size.width - 16) / 110));
      const rows = Math.ceil(projected.length / columns);
      const slots = Array.from({ length: columns * rows }, (_, i) => ({
        tx: 8 + ((i % columns) * (size.width - 16)) / columns,
        ty: 14 + (Math.floor(i / columns) * (size.height - 28)) / Math.max(1, rows - 1),
      }));
      const placed = projected.map((label) => {
        let nearest = 0;
        for (let i = 1; i < slots.length; i++) {
          if (
            Math.hypot(slots[i].tx - label.x, slots[i].ty - label.y) <
            Math.hypot(slots[nearest].tx - label.x, slots[nearest].ty - label.y)
          )
            nearest = i;
        }
        return { ...label, ...slots.splice(nearest, 1)[0] };
      });
      updateLabels(placed);
      return;
    }
    // Keep nearby binary labels separate without moving either physical source.
    const placed: Label[] = [];
    for (const label of projected.sort((a, b) =>
      a.id === 0 ? -1 : b.id === 0 ? 1 : a.id - b.id,
    )) {
      const width = Math.min(size.width - 16, label.name.length * 7 + 10);
      label.tx = Math.max(8, Math.min(size.width - width - 8, label.x + 18));
      label.ty = Math.max(16, label.y - 18);
      for (let i = 0; i < 60; i++) {
        if (
          !placed.some(
            (other) =>
              Math.abs(other.ty - label.ty) < 16 &&
              label.tx < other.tx + other.name.length * 7 + 10 &&
              label.tx + width > other.tx,
          )
        )
          break;
        label.ty += 16;
        if (label.ty > size.height - 12) {
          label.ty = 16;
          label.tx = Math.max(8, label.tx - width - 20);
        }
      }
      placed.push(label);
    }
    updateLabels(placed);
  });
  return (
    <Html
      fullscreen
      calculatePosition={() => [size.width / 2, size.height / 2]}
      style={{ pointerEvents: "none" }}
      zIndexRange={[5, 0]}
    >
      <svg
        className={`stellar-annotations ${all && size.width < 600 ? "stellar-compact-labels" : ""}`}
        width={size.width}
        height={size.height}
        aria-hidden="true"
      >
        {stars.map((star) => (
          <g
            key={star.id}
            data-star-annotation={star.id}
            className={star.id === preview ? "is-table-preview" : undefined}
            ref={(element) => {
              if (element) groups.current.set(star.id, element);
              else groups.current.delete(star.id);
            }}
            style={{ visibility: "hidden" }}
          >
            <path />
            <text>{star.id === 0 ? translate(locale, "scene.sun.title") : star.name}</text>
          </g>
        ))}
      </svg>
    </Html>
  );
}
