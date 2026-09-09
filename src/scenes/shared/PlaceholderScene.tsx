import { useEffect } from "react";
import type { ScaleSceneProps } from "../types";

export default function PlaceholderScene({ onReady }: ScaleSceneProps): React.JSX.Element {
  useEffect(() => onReady?.(), [onReady]);

  return (
    <group>
      <gridHelper args={[16, 16, "#8596a0", "#d7d5cd"]} rotation={[0, 0, 0]} />
      <mesh rotation={[0.35, 0.55, 0]}>
        <boxGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color="#b4c1c7" wireframe transparent opacity={0.62} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.18, 24, 16]} />
        <meshStandardMaterial color="#b8533e" />
      </mesh>
    </group>
  );
}
