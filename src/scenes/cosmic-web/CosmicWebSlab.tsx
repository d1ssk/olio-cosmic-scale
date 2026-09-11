import { Edges } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  BackSide,
  ClampToEdgeWrapping,
  Data3DTexture,
  LinearFilter,
  Matrix4,
  NoColorSpace,
  RedFormat,
  UnsignedByteType,
  type Mesh,
  type ShaderMaterial,
} from "three";
import type { CosmicWebQuality, SceneMetadata } from "../types";
import type { Locale } from "../../i18n";
import { BAO_BOX_RENDER_SIZE } from "../bao/baoModel";
import { loadCosmicSlab, type CosmicSlabDataset } from "./cosmicWebData";
import {
  fullBoxRenderSize,
  mpcHToSharedScene,
  textureCoordinateExpression,
} from "./cosmicWebModel";
import { cosmicSlabFragmentShader, cosmicSlabVertexShader } from "./cosmicSlabShaders";
import { CosmicWebRulers } from "./CosmicWebRulers";
import { BarVisibilityContext } from "../shared/barVisibility";

function slabScale(dataset: CosmicSlabDataset): [number, number, number] {
  const full = fullBoxRenderSize(dataset.manifest);
  const thickness = mpcHToSharedScene(dataset.thicknessMpcH, dataset.manifest);
  return ["x", "y", "z"].map((axis) => (axis === dataset.normalAxis ? thickness : full)) as [
    number,
    number,
    number,
  ];
}

export function CosmicWebSlab({
  quality,
  opacity,
  metadata,
  locale,
  mix,
  transitionAnimating,
  entryBarKind,
  referenceBarVisible,
  onReady,
}: {
  quality: CosmicWebQuality;
  opacity: number;
  metadata: SceneMetadata;
  locale: Locale;
  mix: number;
  transitionAnimating: boolean;
  entryBarKind?: "reference" | "comparison";
  referenceBarVisible?: boolean;
  onReady?: () => void;
}): React.JSX.Element | null {
  const visibility = useContext(BarVisibilityContext);
  const gl = useThree((state) => state.gl);
  const [dataset, setDataset] = useState<CosmicSlabDataset | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  useEffect(() => {
    let active = true;
    void loadCosmicSlab(quality).then(
      (loaded) => {
        if (!active) return;
        const maximum = Number(
          (gl.getContext() as WebGL2RenderingContext).getParameter(
            (gl.getContext() as WebGL2RenderingContext).MAX_3D_TEXTURE_SIZE,
          ),
        );
        if (maximum < Math.max(...loaded.dimensions)) {
          setError(new Error(`3D texture limit ${maximum} is below the requested slab LOD`));
          onReady?.();
          return;
        }
        setDataset(loaded);
        onReady?.();
      },
      (reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason : new Error(String(reason)));
          onReady?.();
        }
      },
    );
    return () => {
      active = false;
    };
  }, [gl, onReady, quality]);
  const texture = useMemo(() => {
    if (!dataset) return null;
    const next = new Data3DTexture(dataset.bytes, ...dataset.dimensions);
    next.format = RedFormat;
    next.type = UnsignedByteType;
    next.colorSpace = NoColorSpace;
    next.minFilter = next.magFilter = LinearFilter;
    next.wrapS = next.wrapT = next.wrapR = ClampToEdgeWrapping;
    next.unpackAlignment = 1;
    next.generateMipmaps = false;
    next.needsUpdate = true;
    gl.initTexture(next);
    return next;
  }, [dataset, gl]);
  useEffect(() => () => texture?.dispose(), [texture]);
  const scale = dataset ? slabScale(dataset) : null;
  const fragmentShader = useMemo(
    () => (dataset ? cosmicSlabFragmentShader(textureCoordinateExpression(dataset.manifest)) : ""),
    [dataset],
  );
  const uniforms = useMemo(
    () => ({
      densitySlab: { value: texture },
      inverseModelView: { value: new Matrix4() },
      clipMin: { value: dataset?.manifest.matter.clip_min ?? 0 },
      clipMax: { value: dataset?.manifest.matter.clip_max ?? 1 },
      layerOpacity: { value: opacity },
    }),
    [dataset, opacity, texture],
  );
  if (error) throw error;
  if (!dataset || !texture || !scale) return null;
  const full = fullBoxRenderSize(dataset.manifest);
  return (
    <group>
      <group visible={opacity > 0.001 && visibility.only === null}>
        <mesh
          ref={mesh}
          scale={scale}
          onBeforeRender={(_renderer, _scene, camera) => {
            if (!mesh.current || !material.current) return;
            material.current.uniforms.inverseModelView.value
              .multiplyMatrices(camera.matrixWorldInverse, mesh.current.matrixWorld)
              .invert();
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <shaderMaterial
            ref={material}
            side={BackSide}
            transparent
            premultipliedAlpha
            depthWrite={false}
            toneMapped={false}
            uniforms={uniforms}
            vertexShader={cosmicSlabVertexShader}
            fragmentShader={fragmentShader}
          />
        </mesh>
        <mesh scale={scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          <Edges color="#78d6d1" transparent opacity={0.5 * opacity} />
        </mesh>
        <mesh>
          <boxGeometry args={[full, full, full]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          <Edges color="#648098" transparent opacity={0.12 * opacity} />
        </mesh>
        <mesh>
          <boxGeometry args={[BAO_BOX_RENDER_SIZE, BAO_BOX_RENDER_SIZE, BAO_BOX_RENDER_SIZE]} />
          <meshBasicMaterial transparent opacity={0.035 * opacity} depthWrite={false} />
          <Edges color="#efb868" transparent opacity={0.68 * opacity} />
        </mesh>
      </group>
      <CosmicWebRulers
        manifest={dataset.manifest}
        metadata={metadata}
        locale={locale}
        mix={mix}
        transitionAnimating={transitionAnimating}
        entryBarKind={entryBarKind}
        referenceBarVisible={referenceBarVisible}
      />
    </group>
  );
}
