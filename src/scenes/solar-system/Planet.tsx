import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import { DoubleSide, Quaternion, SRGBColorSpace, Vector3 } from "three";
import { Body } from "astronomy-engine";
import type { earthSunModel } from "../earth-sun/earthSunModel";
import { SATURN_RINGS } from "./planetData";
export function Planet({
  model,
  metersPerSceneUnit,
}: {
  model: ReturnType<typeof earthSunModel>["bodies"][number];
  metersPerSceneUnit: number;
}) {
  const texture = useTexture(model.texture, (t) => {
    t.colorSpace = SRGBColorSpace;
  });
  const orientation = useMemo(
    () => new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(...model.north)),
    [model.north],
  );
  return (
    <group position={model.position} quaternion={orientation} name={`planet-${model.body}`}>
      <mesh>
        <sphereGeometry args={[model.radius, 96, 64]} />
        <meshStandardMaterial map={texture} roughness={1} metalness={0} />
      </mesh>
      {model.body === Body.Saturn &&
        SATURN_RINGS.map((ring) => (
          <mesh key={ring.innerMeters} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry
              args={[
                ring.innerMeters / metersPerSceneUnit,
                ring.outerMeters / metersPerSceneUnit,
                192,
              ]}
            />
            <meshStandardMaterial
              color={ring.color}
              transparent
              opacity={ring.opacity}
              side={DoubleSide}
              depthWrite={false}
              roughness={1}
            />
          </mesh>
        ))}
    </group>
  );
}
