import { EARTH_COMPARISON_METERS } from "../../bridges/humanEarthBridge";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { SRGBColorSpace } from "three";
import type { ScaleSceneProps } from "../types";
import { SceneReferenceBar } from "../shared/SceneReferenceBar";
import { EARTH_TEXTURE } from "./earthData";
import { earthSceneModel } from "./earthModel";

export default function EarthScene({
  metadata,
  locale,
  onReady,
  referenceBarVisible = true,
  entryBarKind = "comparison",
}: ScaleSceneProps): React.JSX.Element {
  const texture = useTexture(EARTH_TEXTURE.url, (loaded) => {
    loaded.colorSpace = SRGBColorSpace;
    loaded.needsUpdate = true;
  });
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  const model = useMemo(
    () => earthSceneModel(metadata.metersPerSceneUnit),
    [metadata.metersPerSceneUnit],
  );
  return (
    <group>
      <directionalLight position={[-12, 9, -16]} intensity={2} />
      <mesh>
        <sphereGeometry args={[model.radius, 96, 64]} />
        <meshStandardMaterial map={texture} roughness={1} metalness={0} />
      </mesh>
      <SceneReferenceBar
        metadata={metadata}
        locale={locale}
        base={model.barBase}
        labelOffsetY={-65}
        visible={entryBarKind !== "reference" || referenceBarVisible}
      />
      <SceneReferenceBar
        metadata={{
          ...metadata,
          referenceLengthMeters: EARTH_COMPARISON_METERS,
          preferredPrimaryUnit: "km",
        }}
        locale={locale}
        visible={entryBarKind !== "comparison" || referenceBarVisible}
        kind="comparison"
        labelOffsetY={24}
        base={model.comparisonBarBase}
      />
    </group>
  );
}
