import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Vector2, Vector3, type ShaderMaterial } from "three";
import { SOLAR_PSF_DIAMETER_PIXELS, solarPointOpacity } from "./sunDisplay";
export function SunPointGlow({ radius }: { radius: number }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      viewport: { value: new Vector2() },
      opacity: { value: 0 },
      diameter: { value: SOLAR_PSF_DIAMETER_PIXELS },
    }),
    [],
  );
  const center = useMemo(() => new Vector3(), []);
  useFrame(({ camera, size }) => {
    center.set(0, 0, 0).applyMatrix4(camera.matrixWorldInverse);
    const depth = camera.type === "PerspectiveCamera" ? Math.max(1e-12, -center.z) : 1;
    const diameterPixels = (radius * camera.projectionMatrix.elements[5] * size.height) / depth;
    if (material.current) {
      material.current.uniforms.viewport.value.set(size.width, size.height);
      material.current.uniforms.opacity.value = solarPointOpacity(diameterPixels);
    }
  });
  return (
    <mesh name="sun-display-psf" frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
        vertexShader={`uniform vec2 viewport; uniform float diameter; varying vec2 point;
        void main() { point=position.xy; vec4 center=projectionMatrix*modelViewMatrix*vec4(0.,0.,0.,1.);
        center.xy+=position.xy*diameter/viewport*center.w; gl_Position=center; }`}
        fragmentShader={`uniform float opacity; varying vec2 point;
        void main() { float r2=dot(point,point); float core=exp(-r2*32.); float halo=0.22*exp(-r2*5.);
        float edge=1.-smoothstep(.65,1.,sqrt(r2));
        gl_FragColor=vec4(mix(vec3(1.,.58,.19),vec3(1.,.96,.8),core),opacity*(core+halo)*edge);
        #include <colorspace_fragment>
        }`}
      />
    </mesh>
  );
}
