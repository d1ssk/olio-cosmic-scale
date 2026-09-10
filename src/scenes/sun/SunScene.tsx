import { useEffect, useMemo } from "react";
import type { ScaleSceneProps } from "../types";
import { EARTH_MOON_DISTANCE_METERS } from "../earth-moon/earthMoonData";
import { SceneReferenceBar } from "../shared/SceneReferenceBar";
import { sunModel } from "./sunModel";
import { SunSphere } from "./SunSphere";
export default function SunScene({ metadata, locale, onReady }: ScaleSceneProps) {
  const model = useMemo(() => sunModel(metadata.metersPerSceneUnit), [metadata.metersPerSceneUnit]);
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return (
    <group>
      <SunSphere radius={model.radius} />
      <SceneReferenceBar
        labelAlign="center"
        metadata={metadata}
        locale={locale}
        base={model.barBase}
        labelOffsetY={-45}
      />
      <SceneReferenceBar
        labelAlign="center"
        metadata={{
          ...metadata,
          referenceLengthMeters: EARTH_MOON_DISTANCE_METERS,
          preferredPrimaryUnit: "km",
        }}
        locale={locale}
        base={model.comparisonBarBase}
        kind="comparison"
        labelOffsetY={60}
      />
    </group>
  );
}
