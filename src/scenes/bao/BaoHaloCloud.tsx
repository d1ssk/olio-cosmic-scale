import { useThree } from "@react-three/fiber";
import { AdditiveBlending } from "three";
import type { BaoDataset } from "./baoData";
import { haloRenderData } from "./baoModel";
import { useMemo } from "react";

export function BaoHaloCloud({ dataset }: { dataset: BaoDataset }): React.JSX.Element {
  const pixelRatio = useThree((state) => state.gl.getPixelRatio());
  const cloud = useMemo(() => haloRenderData(dataset), [dataset]);
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[cloud.positions, 3]} />
        <bufferAttribute attach="attributes-haloMass" args={[cloud.mass, 1]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        uniforms={{ pixelRatio: { value: pixelRatio } }}
        vertexShader={`
          attribute float haloMass;
          uniform float pixelRatio;
          varying float strength;
          void main() {
            strength = 0.35 + 0.65 * pow(clamp(haloMass, 0.0, 1.0), 0.35);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = pixelRatio * mix(1.1, 4.0, pow(clamp(haloMass, 0.0, 1.0), 1.8));
          }
        `}
        fragmentShader={`
          varying float strength;
          void main() {
            vec2 p = gl_PointCoord - 0.5;
            float radius = length(p) * 2.0;
            if (radius > 1.0) discard;
            float alpha = smoothstep(1.0, 0.15, radius) * mix(0.28, 0.9, strength);
            vec3 tint = mix(vec3(0.34, 0.67, 0.92), vec3(1.0, 0.82, 0.52), strength);
            gl_FragColor = vec4(tint, alpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `}
      />
    </points>
  );
}
