import { Line } from "@react-three/drei";
import type { BaoManifest } from "./baoData";
import { mpcHToScene } from "./baoModel";

/** Statistical-scale overlay. Kept separate so a future stacked-halo layer can replace it. */
export function BaoGuideLayer({
  manifest,
  radiusMpcH,
}: {
  manifest: BaoManifest;
  radiusMpcH: number;
}): React.JSX.Element {
  const radius = mpcHToScene(radiusMpcH, manifest);
  return (
    <group name="bao-statistical-guide">
      <mesh renderOrder={3}>
        <sphereGeometry args={[radius, 48, 24]} />
        <meshBasicMaterial
          color="#f2b866"
          wireframe
          transparent
          opacity={0.095}
          depthWrite={false}
        />
      </mesh>
      <Line
        points={[
          [0, 0, 0],
          [radius, 0, 0],
        ]}
        color="#ffd184"
        lineWidth={1.25}
        transparent
        opacity={0.8}
        depthWrite={false}
      />
      <mesh>
        <sphereGeometry args={[0.045, 12, 8]} />
        <meshBasicMaterial color="#ffd184" transparent opacity={0.8} depthWrite={false} />
      </mesh>
    </group>
  );
}
