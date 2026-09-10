import { lazy, Suspense, useContext, useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, type ShaderMaterial } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { ScaleSceneProps } from "../types";
import { BarVisibilityContext } from "../shared/barVisibility";
import { SceneReferenceBar } from "../shared/SceneReferenceBar";
import { GalaxyAnnotations } from "./GalaxyAnnotations";
import { MILKY_WAY_COMPARISON_METERS } from "./milkyWayData";
import { milkyWayModel, milkyWayRulers } from "./milkyWayModel";

const MilkyWayVolume = lazy(() => import("./MilkyWayVolume"));

export default function MilkyWayScene({
  metadata,
  locale,
  onReady,
  galaxyVariant = "volume",
  volumeStatus = "idle",
  onVolumeStatusChange,
}: ScaleSceneProps) {
  const visibility = useContext(BarVisibilityContext);
  const model = useMemo(
    () => milkyWayModel(metadata.metersPerSceneUnit),
    [metadata.metersPerSceneUnit],
  );
  const rulers = useMemo(() => milkyWayRulers(metadata), [metadata]);
  const gl = useThree((state) => state.gl);
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ pointSize: { value: 3.5 * gl.getPixelRatio() } }), [gl]);
  useFrame(({ size }) => {
    if (material.current)
      material.current.uniforms.pointSize.value =
        Math.min(3.5, Math.max(1.2, size.width / 300)) * gl.getPixelRatio();
  });
  useEffect(() => {
    if (galaxyVariant === "simple" || volumeStatus === "ready" || volumeStatus === "error")
      onReady?.();
  }, [onReady, galaxyVariant, volumeStatus]);
  return (
    <group>
      <group visible={visibility.only === null}>
        {galaxyVariant === "volume" && onVolumeStatusChange && (
          <Suspense fallback={null}>
            <MilkyWayVolume
              metersPerUnit={metadata.metersPerSceneUnit}
              onStatus={onVolumeStatusChange}
            />
          </Suspense>
        )}
        <points visible={galaxyVariant === "simple" || volumeStatus !== "ready"}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[model.positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[model.colors, 3]} />
          </bufferGeometry>
          <shaderMaterial
            ref={material}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
            vertexColors
            uniforms={uniforms}
            vertexShader={`uniform float pointSize; varying vec3 tint;
            void main() { tint = color; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = pointSize; }`}
            fragmentShader={`varying vec3 tint;
            void main() { float r = length(gl_PointCoord - 0.5) * 2.0; if (r > 1.0) discard;
              gl_FragColor = vec4(tint, exp(-3.5*r*r) * 0.55); }`}
          />
        </points>
        {visibility.only === null && <GalaxyAnnotations sun={model.sun} locale={locale} />}
      </group>
      {rulers.map((ruler, index) => (
        <SceneReferenceBar
          key={index}
          metadata={
            index === 0
              ? metadata
              : {
                  ...metadata,
                  referenceLengthMeters: MILKY_WAY_COMPARISON_METERS,
                  preferredPrimaryUnit: "pc",
                }
          }
          locale={locale}
          base={ruler.base}
          direction={ruler.direction}
          kind={index === 0 ? "reference" : "comparison"}
          labelAlign="center"
          labelOffsetY={index === 0 ? -18 : 20}
        />
      ))}
    </group>
  );
}
