import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import type { ScaleSceneProps } from "../types";
import { SceneReferenceBar } from "../shared/SceneReferenceBar";
import { HACHIKO_MODEL } from "./humanData";
import { modelPlacement } from "./humanModel";

export default function HumanScene({
  metadata,
  locale,
  onReady,
  referenceBarVisible = true,
}: ScaleSceneProps): React.JSX.Element {
  const { scene } = useGLTF(HACHIKO_MODEL.assetUrl);
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  const object = useMemo(() => scene.clone(true), [scene]);
  const placement = useMemo(
    () => modelPlacement(object, HACHIKO_MODEL.displayHeightMeters, metadata.metersPerSceneUnit),
    [object, metadata.metersPerSceneUnit],
  );
  return (
    <group>
      <group scale={placement.scale} position={placement.position}>
        <primitive object={object} />
      </group>
      <SceneReferenceBar
        metadata={metadata}
        locale={locale}
        visible={referenceBarVisible}
        base={placement.referenceBarBase}
      />
    </group>
  );
}
