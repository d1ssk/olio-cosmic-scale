import { Edges } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import {
  ClampToEdgeWrapping,
  DataTexture,
  DoubleSide,
  LinearFilter,
  NoColorSpace,
  RedFormat,
  UnsignedByteType,
} from "three";
import { matterDensityBase, type BaoDataset } from "./baoData";
import { BAO_BOX_RENDER_SIZE, matterSlice, mpcHToScene } from "./baoModel";

export function BaoMatterSlab({
  dataset,
  fraction,
}: {
  dataset: BaoDataset;
  fraction: number;
}): React.JSX.Element {
  const slice = useMemo(
    () => matterSlice(dataset.matter, dataset.manifest, fraction),
    [dataset, fraction],
  );
  const texture = useMemo(() => {
    const next = new DataTexture(slice.bytes, slice.width, slice.width, RedFormat);
    next.type = UnsignedByteType;
    next.colorSpace = NoColorSpace;
    next.minFilter = next.magFilter = LinearFilter;
    next.wrapS = next.wrapT = ClampToEdgeWrapping;
    next.unpackAlignment = 1;
    next.generateMipmaps = false;
    next.needsUpdate = true;
    return next;
  }, [slice]);
  useEffect(() => () => texture.dispose(), [texture]);
  const z = mpcHToScene(slice.positionMpcH, dataset.manifest);
  return (
    <group>
      <mesh position={[0, 0, z]} renderOrder={-1}>
        <planeGeometry args={[BAO_BOX_RENDER_SIZE, BAO_BOX_RENDER_SIZE]} />
        <shaderMaterial
          side={DoubleSide}
          transparent
          depthWrite={false}
          toneMapped={false}
          uniforms={{
            densityMap: { value: texture },
            clipMin: { value: dataset.manifest.matter.clip_min },
            clipMax: { value: dataset.manifest.matter.clip_max },
            densityBase: { value: matterDensityBase(dataset.manifest) },
          }}
          vertexShader={`
            varying vec2 texCoord;
            void main() {
              texCoord = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform sampler2D densityMap;
            uniform float clipMin;
            uniform float clipMax;
            uniform float densityBase;
            varying vec2 texCoord;
            void main() {
              float q = texture2D(densityMap, texCoord).r;
              float logDensity = mix(clipMin, clipMax, q);
              float rhoRelative = pow(densityBase, logDensity);
              float signal = clamp(log2(max(rhoRelative, 0.0001)) / 4.0 + 0.32, 0.0, 1.0);
              float bright = smoothstep(0.1, 0.95, signal);
              vec3 color = mix(vec3(0.035, 0.18, 0.24), vec3(0.38, 0.96, 0.88), bright);
              color = mix(color, vec3(1.0, 0.82, 0.46), smoothstep(0.7, 1.0, signal));
              float alpha = mix(0.035, 0.78, smoothstep(0.05, 0.92, signal));
              gl_FragColor = linearToOutputTexel(vec4(color, alpha));
            }
          `}
        />
      </mesh>
      <mesh position={[0, 0, z]}>
        <boxGeometry args={[BAO_BOX_RENDER_SIZE, BAO_BOX_RENDER_SIZE, slice.thickness]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        <Edges color="#65c5c7" transparent opacity={0.28} />
      </mesh>
    </group>
  );
}
