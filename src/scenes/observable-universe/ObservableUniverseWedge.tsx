import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Matrix4,
  NormalBlending,
  Quaternion,
  ShaderMaterial,
} from "three";
import { AXIS, SIDE, UP, LAST_SCATTERING_RADIUS } from "./cmbPatch";
import {
  loadWedgeAsset,
  WEDGE_UNITS_PER_GPC,
  type WedgeAsset,
  type WedgeLayer,
} from "./wedgeAssets";

import { createWedgeSurfaces, tracerNearWeights, WEDGE_RENDER } from "./wedgeRendering";

const rotation = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(SIDE, UP, AXIS));
const vertexShader = `
attribute float splatSize;
attribute float intensity;
#ifndef MATTER
attribute float nearWeight;
uniform float nearSizeBoost;
#endif
varying float vNearWeight;
uniform float pixelHeight;
uniform float pixelRatio;
uniform float sizeScale;
uniform float minPixels;
uniform float maxPixels;
uniform float radiusGpc;
varying float vIntensity;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float worldScale = length(modelMatrix[0].xyz);
  float pixels = splatSize * worldScale * sizeScale * projectionMatrix[1][1] * pixelHeight * 0.5;
  if (projectionMatrix[2][3] < -0.5) pixels /= max(0.001, -mv.z);
  float diameter = clamp(pixels, minPixels * pixelRatio, maxPixels * pixelRatio);
  vNearWeight = 0.0;
  #ifndef MATTER
    vNearWeight = nearWeight;
    // Apply after the baseline clamp so saturated base sizes retain the gradient.
    diameter *= mix(1.0, nearSizeBoost, nearWeight);
  #endif
  gl_PointSize = diameter;
  vIntensity = length(position) <= radiusGpc ? intensity : 0.0;
  gl_Position = projectionMatrix * mv;
}`;
const fragmentShader = `
uniform vec3 tint;
uniform float exposure;
uniform float nearBrightnessBoost;
varying float vNearWeight;
varying float vIntensity;
void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(p, p);
  if (r2 >= 1.0 || vIntensity <= 0.0) discard;
  float falloff = exp(-5.0 * r2) * (1.0 - smoothstep(0.55, 1.0, r2));
  float alpha = clamp(vIntensity * exposure * falloff, 0.0, 1.0);
  #ifdef MATTER
    gl_FragColor = vec4(tint * alpha, alpha);
  #else
    gl_FragColor = vec4(tint * mix(1.0, nearBrightnessBoost, vNearWeight), alpha);
  #endif
}`;

function Layer({
  data,
  matter,
  visible,
  radius,
}: {
  data: WedgeLayer;
  matter: boolean;
  visible: boolean;
  radius: number;
}) {
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(data.positions, 3));
    g.setAttribute("splatSize", new BufferAttribute(data.sizes, 1));
    g.setAttribute("intensity", new BufferAttribute(data.intensities, 1));
    if (!matter) {
      g.setAttribute(
        "nearWeight",
        new BufferAttribute(tracerNearWeights(data.positions, radius), 1),
      );
    }
    g.computeBoundingSphere();
    return g;
  }, [data, matter, radius]);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        defines: matter ? { MATTER: 1 } : {},
        uniforms: {
          // tint: { value: new Color(matter ? "#9fadb5" : "#fff1d8") },
          tint: { value: new Color(matter ? "#7fbfd4" : "#ebcba7") },
          exposure: {
            value: matter ? WEDGE_RENDER.matterOpacityScale : WEDGE_RENDER.tracerBrightnessScale,
          },
          sizeScale: {
            value: matter ? WEDGE_RENDER.matterSizeScale : WEDGE_RENDER.tracerSizeScale,
          },
          minPixels: {
            value: matter ? WEDGE_RENDER.matterMinPixels : WEDGE_RENDER.tracerMinPixels,
          },
          maxPixels: {
            value: matter ? WEDGE_RENDER.matterMaxPixels : WEDGE_RENDER.tracerMaxPixels,
          },
          radiusGpc: { value: radius },
          nearSizeBoost: { value: WEDGE_RENDER.tracerNearSizeBoost },
          nearBrightnessBoost: { value: WEDGE_RENDER.tracerNearBrightnessBoost },
          pixelHeight: { value: 1 },
          pixelRatio: { value: 1 },
        },
        transparent: true,
        depthTest: true,
        depthWrite: false,
        toneMapped: false,
        premultipliedAlpha: matter,
        blending: matter ? NormalBlending : AdditiveBlending,
      }),
    [matter, radius],
  );
  const materialRef = useRef<ShaderMaterial>(null);
  useFrame(({ gl, size }) => {
    const liveMaterial = materialRef.current;
    if (!liveMaterial) return;
    liveMaterial.uniforms.pixelHeight.value = size.height * gl.getPixelRatio();
    liveMaterial.uniforms.pixelRatio.value = gl.getPixelRatio();
  });
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  return (
    <points
      name={matter ? "matterLayer" : "tracerLayer"}
      visible={visible}
      geometry={geometry}
      renderOrder={matter ? 1 : 2}
    >
      <primitive object={material} ref={materialRef} attach="material" />
    </points>
  );
}

function LoadedWedge({
  asset,
  matter,
  galaxies,
  debug,
}: {
  asset: WedgeAsset;
  matter: boolean;
  galaxies: boolean;
  debug: boolean;
}) {
  const { geometry: g } = asset.metadata;
  const radius = Math.min(g.chi_max_gpc, LAST_SCATTERING_RADIUS / WEDGE_UNITS_PER_GPC);
  const { midplane, sector, arc } = useMemo(() => createWedgeSurfaces(g, radius), [g, radius]);
  useEffect(
    () => () => {
      midplane.dispose();
      sector.dispose();
    },
    [midplane, sector],
  );
  return (
    <group name="observableUniverseWedgeGroup" quaternion={rotation} scale={WEDGE_UNITS_PER_GPC}>
      <group name="wedgeDisplayThickness" scale={[1, WEDGE_RENDER.thicknessScale, 1]}>
        <mesh name="wedgeMidplane" geometry={midplane} renderOrder={-1}>
          <meshBasicMaterial
            color={WEDGE_RENDER.midplaneColor}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
        <mesh name="wedgeSector" geometry={sector} renderOrder={0}>
          <meshBasicMaterial
            color={WEDGE_RENDER.sectorColor}
            side={DoubleSide}
            transparent
            opacity={WEDGE_RENDER.sectorOpacity}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <Layer data={asset.matter} matter visible={matter} radius={radius} />
        <Layer data={asset.tracer} matter={false} visible={galaxies} radius={radius} />
        {debug && (
          <>
            <Line
              points={[
                [0, -g.half_thickness_gpc, 0],
                ...arc.map(([x, , z]): [number, number, number] => [x, -g.half_thickness_gpc, z]),
                [0, -g.half_thickness_gpc, 0],
              ]}
              color="#668899"
              lineWidth={1}
            />
            <Line
              points={[
                [0, g.half_thickness_gpc, 0],
                ...arc.map(([x, , z]): [number, number, number] => [x, g.half_thickness_gpc, z]),
                [0, g.half_thickness_gpc, 0],
              ]}
              color="#668899"
              lineWidth={1}
            />
            <Line
              points={[
                [0, 0, 0],
                [0, 0, g.chi_max_gpc],
              ]}
              color="#66aaff"
              lineWidth={1}
            />
            <Line
              points={[
                [-0.1, 0, 0],
                [0.1, 0, 0],
                [0, 0, 0],
                [0, -0.1, 0],
                [0, 0.1, 0],
              ]}
              color="white"
              lineWidth={1}
            />
          </>
        )}
      </group>
    </group>
  );
}

export function ObservableUniverseWedge({
  matter,
  galaxies,
}: {
  matter: boolean;
  galaxies: boolean;
}) {
  const [asset, setAsset] = useState<WedgeAsset | null>(null);
  useEffect(() => {
    let active = true;
    loadWedgeAsset()
      .then((value) => {
        if (active) setAsset(value);
      })
      .catch((error) => console.error("Observable Universe wedge failed to load:", error));
    return () => {
      active = false;
    };
  }, []);
  const debug =
    import.meta.env.DEV && new URLSearchParams(window.location.search).has("wedgeDebug");
  return asset ? (
    <LoadedWedge asset={asset} matter={matter} galaxies={galaxies} debug={debug} />
  ) : null;
}
