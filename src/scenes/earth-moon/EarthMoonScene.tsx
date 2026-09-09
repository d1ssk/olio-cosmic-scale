import { Html, useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { SRGBColorSpace } from "three";
import { translate } from "../../i18n";
import type { ScaleSceneProps } from "../types";
import { EARTH_DIAMETER_METERS, EARTH_TEXTURE } from "../earth/earthData";
import { SceneReferenceBar } from "../shared/SceneReferenceBar";
import { earthMoonModel } from "./earthMoonModel";

export default function EarthMoonScene({
  metadata,
  locale,
  onReady,
  referenceBarVisible = true,
}: ScaleSceneProps) {
  const texture = useTexture(EARTH_TEXTURE.url, (loaded) => {
    loaded.colorSpace = SRGBColorSpace;
  });
  const model = useMemo(
    () => earthMoonModel(metadata.metersPerSceneUnit),
    [metadata.metersPerSceneUnit],
  );
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return (
    <group>
      <mesh position={model.earthPosition}>
        <sphereGeometry args={[model.earthRadius, 64, 32]} />
        <meshStandardMaterial map={texture} roughness={1} />
      </mesh>
      <mesh position={model.moonPosition}>
        <sphereGeometry args={[model.moonRadius, 48, 24]} />
        <meshStandardMaterial color="#b9b8b5" roughness={1} />
      </mesh>
      <Html center position={[model.earthPosition[0], 0.65, 0]} className="body-label">
        {translate(locale, "scene.earth.title")}
      </Html>
      <Html center position={[model.moonPosition[0], 0.65, 0]} className="body-label">
        {translate(locale, "earthMoon.moon")}
      </Html>
      <SceneReferenceBar
        metadata={metadata}
        locale={locale}
        base={model.distanceBarBase}
        direction={[1, 0, 0]}
        labelOffsetY={24}
      />
      <SceneReferenceBar
        metadata={{ ...metadata, referenceLengthMeters: EARTH_DIAMETER_METERS }}
        locale={locale}
        base={model.earthBarBase}
        kind="comparison"
        visible={referenceBarVisible}
        labelOffsetY={45}
      />
    </group>
  );
}
