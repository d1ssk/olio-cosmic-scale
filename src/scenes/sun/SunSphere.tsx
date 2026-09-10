import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { SRGBColorSpace, type ShaderMaterial } from "three";
import { SunPointGlow } from "./SunPointGlow";
import { SUN_TEXTURE } from "./sunData";

/** Fixed physical silhouette. Noise and limb darkening are illustrative, not solar observations. */
export function SunSphere({ radius }: { radius: number }) {
  const texture = useTexture(SUN_TEXTURE.url, (t) => {
    t.colorSpace = SRGBColorSpace;
  });
  const material = useRef<ShaderMaterial>(null);
  const reduced = useRef(false);
  const uniforms = useMemo(() => ({ map: { value: texture }, time: { value: 0 } }), [texture]);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduced.current = media.matches;
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useFrame((_, delta) => {
    if (!reduced.current && material.current)
      material.current.uniforms.time.value += Math.min(delta, 0.05);
  });
  return (
    <group>
      <SunPointGlow radius={radius} />
      <mesh>
        <sphereGeometry args={[radius, 96, 64]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          toneMapped={false}
          vertexShader={`varying vec2 vUv; varying vec3 vNormal; varying vec3 vView; varying vec3 vPoint;
        void main() { vUv=uv; vPoint=normalize(position); vNormal=normalize(normalMatrix*normal);
          vec4 p=modelViewMatrix*vec4(position,1.0); vView=-p.xyz; gl_Position=projectionMatrix*p; }`}
          fragmentShader={`uniform sampler2D map; uniform float time;
        varying vec2 vUv; varying vec3 vNormal; varying vec3 vView; varying vec3 vPoint;
        float hash(vec3 p) { return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
        float noise(vec3 p) { vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
        void main() { float mu=max(dot(normalize(vNormal),normalize(vView)),0.0);
          float grain=noise(vPoint*65.0+vec3(time*0.08));
          vec3 color=texture2D(map,vUv).rgb*(0.97+0.06*grain)*(0.55+0.45*sqrt(mu));
          gl_FragColor=vec4(color,1.0);
          #include <colorspace_fragment>
        }`}
        />
      </mesh>
    </group>
  );
}
