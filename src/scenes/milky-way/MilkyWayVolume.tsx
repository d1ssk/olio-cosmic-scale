import { useEffect, useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import {
  BackSide,
  ClampToEdgeWrapping,
  Data3DTexture,
  GLSL3,
  LinearFilter,
  Matrix4,
  NoColorSpace,
  RGBAFormat,
  UnsignedByteType,
  Vector3,
  type Mesh,
  type OrthographicCamera,
  type ShaderMaterial,
} from "three";
import {
  VOLUME_DATA,
  validateVolumeBytes,
  volumeModelMatrix,
  type VolumeStatus,
} from "./volumeData";
import { volumeFragmentShader, volumeVertexShader } from "./volumeShaders";

export default function MilkyWayVolume({
  metersPerUnit,
  onStatus,
}: {
  metersPerUnit: number;
  onStatus: (status: VolumeStatus) => void;
}) {
  const [texture, setTexture] = useState<Data3DTexture | null>(null);
  const mesh = useRef<Mesh>(null);
  const material = useRef<ShaderMaterial>(null);
  const gl = useThree((state) => state.gl);
  const modelMatrix = useMemo(() => volumeModelMatrix(metersPerUnit), [metersPerUnit]);
  const uniforms = useMemo(
    () => ({
      volume: { value: texture },
      volumeAspect: {
        value: new Vector3(...VOLUME_DATA.sizeMeters).divideScalar(
          Math.max(...VOLUME_DATA.sizeMeters),
        ),
      },
      inverseModelView: { value: new Matrix4() },
      cameraNear: { value: 0.01 },
      stepSize: { value: VOLUME_DATA.stepSize },
      absorptionMultiply: { value: VOLUME_DATA.absorption },
      emissionMultiply: { value: VOLUME_DATA.emission },
    }),
    [texture],
  );
  useEffect(() => {
    const controller = new AbortController();
    let owned: Data3DTexture | undefined;
    onStatus("loading");
    async function load() {
      try {
        const context = gl.getContext() as WebGL2RenderingContext;
        if (context.getParameter(context.MAX_3D_TEXTURE_SIZE) < Math.max(...VOLUME_DATA.dimensions))
          throw new Error("3D texture size unsupported");
        const response = await fetch(VOLUME_DATA.url, { signal: controller.signal });
        if (!response.ok) throw new Error(`Volume HTTP ${response.status}`);
        const bytes = validateVolumeBytes(await response.arrayBuffer());
        if (controller.signal.aborted) return;
        owned = new Data3DTexture(bytes, ...VOLUME_DATA.dimensions);
        owned.format = RGBAFormat;
        owned.type = UnsignedByteType;
        owned.colorSpace = NoColorSpace;
        owned.minFilter = owned.magFilter = LinearFilter;
        owned.wrapS = owned.wrapT = owned.wrapR = ClampToEdgeWrapping;
        owned.unpackAlignment = 1;
        owned.generateMipmaps = false;
        owned.needsUpdate = true;
        gl.initTexture(owned);
        setTexture(owned);
        onStatus("ready");
      } catch {
        if (!controller.signal.aborted) onStatus("error");
      }
    }
    void load();
    return () => {
      controller.abort();
      owned?.dispose();
    };
  }, [gl, onStatus]);
  if (!texture) return null;
  return (
    <mesh
      ref={mesh}
      name="milky-way-volume"
      matrixAutoUpdate={false}
      matrix={modelMatrix}
      onBeforeRender={(_renderer, _scene, camera) => {
        if (!material.current || !mesh.current) return;
        // Renderer has now updated the camera and mesh matrices for THIS frame.
        material.current.uniforms.inverseModelView.value
          .multiplyMatrices(camera.matrixWorldInverse, mesh.current.matrixWorld)
          .invert();
        material.current.uniforms.cameraNear.value = (camera as OrthographicCamera).near;
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <shaderMaterial
        ref={material}
        glslVersion={GLSL3}
        side={BackSide}
        transparent
        premultipliedAlpha
        depthWrite={false}
        toneMapped={false}
        uniforms={uniforms}
        defines={{ MAX_VOLUME_STEPS: VOLUME_DATA.maxSteps }}
        vertexShader={volumeVertexShader}
        fragmentShader={volumeFragmentShader}
      />
    </mesh>
  );
}
