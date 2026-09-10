import { buildDepthAssignments, displayGalaxy } from "./virgoDepth";
import { useThree } from "@react-three/fiber";
import { useContext, useEffect, useMemo } from "react";
import { Color } from "three";
import { VirgoAnnotations } from "./VirgoAnnotations";
import { LOCAL_GROUP_REFERENCE_METERS } from "../local-group/localGroupData";
import { BarVisibilityContext } from "../shared/barVisibility";
import { SceneReferenceBar } from "../shared/SceneReferenceBar";
import type { ScaleSceneProps } from "../types";
import catalog from "./catalog.json";
import {
  displayDistanceKind,
  DISTANCE_STYLES,
  galaxyCatalogStyle,
  VIRGO_RULER_Y,
  type VirgoGalaxy,
} from "./virgoData";
import { markerPixels, virgoPosition } from "./virgoModel";

const galaxies = catalog as VirgoGalaxy[];
const depths = buildDepthAssignments(galaxies);
export default function VirgoScene({
  metadata,
  locale,
  onReady,
  colorByCatalog = false,
  representativeDepths = false,
}: ScaleSceneProps) {
  const visibility = useContext(BarVisibilityContext);
  const { gl } = useThree();
  const displayed = useMemo(
    () => galaxies.map((g) => displayGalaxy(g, depths, representativeDepths)),
    [representativeDepths],
  );
  const cloud = useMemo(() => {
    const positions: number[] = [],
      colors: number[] = [],
      sizes: number[] = [],
      shapes: number[] = [];
    for (const g of displayed) {
      positions.push(...virgoPosition(g));
      colors.push(
        ...new Color(
          colorByCatalog
            ? galaxyCatalogStyle(g).color
            : DISTANCE_STYLES[displayDistanceKind(g, representativeDepths)].color,
        ).toArray(),
      );
      sizes.push(g.name === "Milky Way" ? 7 : markerPixels(g.absoluteMagnitude));
      shapes.push(DISTANCE_STYLES[displayDistanceKind(g, representativeDepths)].shape);
    }
    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      sizes: new Float32Array(sizes),
      shapes: new Float32Array(shapes),
    };
  }, [colorByCatalog, displayed, representativeDepths]);
  useEffect(() => onReady?.(), [onReady]);
  const labels = [
    displayed[0],
    displayed.find((g) => g.name === "NGC4486"),
    displayed.find((g) => g.name === "NGC4472"),
    displayed.find((g) => g.name === "Andromeda"),
  ].filter((g, i, a): g is VirgoGalaxy => !!g && a.indexOf(g) === i);
  return (
    <group>
      <group visible={visibility.only === null}>
        <points frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[cloud.positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[cloud.colors, 3]} />
            <bufferAttribute attach="attributes-markerSize" args={[cloud.sizes, 1]} />
            <bufferAttribute attach="attributes-markerShape" args={[cloud.shapes, 1]} />
          </bufferGeometry>
          <shaderMaterial
            vertexColors
            transparent
            depthWrite={false}
            uniforms={{ pixelRatio: { value: gl.getPixelRatio() } }}
            vertexShader={`attribute float markerSize; attribute float markerShape; uniform float pixelRatio; varying vec3 tint; varying float shape;
            void main(){tint=color;shape=markerShape;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=markerSize*pixelRatio;}`}
            fragmentShader={`varying vec3 tint;varying float shape;
            void main(){vec2 p=(gl_PointCoord-.5)*2.;float r=shape>2.5?max(abs(p.x),abs(p.y)):length(p);if(shape>.5&&shape<1.5)r=abs(p.x)+abs(p.y);if(r>1.)discard;if(shape>1.5&&r<.53)discard;gl_FragColor=vec4(tint,.88);#include <tonemapping_fragment>\n#include <colorspace_fragment>}`.replace(
              ";#include",
              ";\n#include",
            )}
          />
        </points>
        {visibility.only === null && <VirgoAnnotations galaxies={labels} locale={locale} />}
      </group>
      <SceneReferenceBar
        metadata={metadata}
        locale={locale}
        base={[
          -metadata.referenceLengthMeters / metadata.metersPerSceneUnit / 2,
          VIRGO_RULER_Y / metadata.metersPerSceneUnit,
          0,
        ]}
        direction={[1, 0, 0]}
        kind="reference"
        labelAlign="center"
        labelOffsetY={-18}
      />
      <SceneReferenceBar
        metadata={{ ...metadata, referenceLengthMeters: LOCAL_GROUP_REFERENCE_METERS }}
        locale={locale}
        base={[
          -LOCAL_GROUP_REFERENCE_METERS / metadata.metersPerSceneUnit / 2,
          VIRGO_RULER_Y / metadata.metersPerSceneUnit - 1,
          0,
        ]}
        direction={[1, 0, 0]}
        kind="comparison"
        labelAlign="center"
        labelOffsetY={20}
      />
    </group>
  );
}
