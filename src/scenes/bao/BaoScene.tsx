import { Edges } from "@react-three/drei";
import { useContext, useEffect, useMemo, useState } from "react";
import { BarVisibilityContext } from "../shared/barVisibility";
import { SceneReferenceBar } from "../shared/SceneReferenceBar";
import type { ScaleSceneProps } from "../types";
import { VIRGO_REFERENCE_METERS } from "../virgo/virgoData";
import { BaoGuideLayer } from "./BaoGuideLayer";
import { BaoHaloCloud } from "./BaoHaloCloud";
import { BaoMatterSlab } from "./BaoMatterSlab";
import { loadBaoDataset, type BaoDataset } from "./baoData";
import { BAO_BOX_RENDER_SIZE, baoPeak, baoRulerPlacement } from "./baoModel";

export default function BaoScene({
  metadata,
  locale,
  onReady,
  baoLayerMode = "both",
  baoReveal = false,
  baoSliceFraction = 0.5,
  referenceBarVisible = true,
  entryBarKind,
}: ScaleSceneProps): React.JSX.Element {
  const visibility = useContext(BarVisibilityContext);
  const [dataset, setDataset] = useState<BaoDataset | null>(null);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    let active = true;
    void loadBaoDataset().then(
      (loaded) => {
        if (!active) return;
        setDataset(loaded);
        onReady?.();
      },
      (reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason : new Error(String(reason)));
        onReady?.();
      },
    );
    return () => {
      active = false;
    };
  }, [onReady]);
  const peak = useMemo(() => (dataset ? baoPeak(dataset.statistic) : null), [dataset]);
  if (error) throw error;
  if (!dataset || !peak) return <group />;
  const ordinaryLayersVisible = visibility.only === null;
  const referenceRuler = baoRulerPlacement(
    metadata.referenceLengthMeters,
    metadata.metersPerSceneUnit,
  );
  const comparisonRuler = baoRulerPlacement(
    VIRGO_REFERENCE_METERS,
    metadata.metersPerSceneUnit,
    0.35,
  );
  return (
    <group>
      <group visible={ordinaryLayersVisible}>
        {(baoLayerMode === "matter" || baoLayerMode === "both") && (
          <BaoMatterSlab dataset={dataset} fraction={baoSliceFraction} />
        )}
        {(baoLayerMode === "halos" || baoLayerMode === "both") && (
          <BaoHaloCloud dataset={dataset} />
        )}
        {baoReveal && <BaoGuideLayer manifest={dataset.manifest} radiusMpcH={peak.rMpcH} />}
        <mesh>
          <boxGeometry args={[BAO_BOX_RENDER_SIZE, BAO_BOX_RENDER_SIZE, BAO_BOX_RENDER_SIZE]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          <Edges color="#7290a7" transparent opacity={0.22} />
        </mesh>
      </group>
      <SceneReferenceBar
        metadata={metadata}
        locale={locale}
        base={referenceRuler.base}
        direction={referenceRuler.direction}
        kind="reference"
        visible={entryBarKind !== "reference" || referenceBarVisible}
        labelOffsetY={-18}
      />
      <SceneReferenceBar
        metadata={{ ...metadata, referenceLengthMeters: VIRGO_REFERENCE_METERS }}
        locale={locale}
        base={comparisonRuler.base}
        direction={comparisonRuler.direction}
        kind="comparison"
        visible={entryBarKind !== "comparison" || referenceBarVisible}
        labelOffsetY={18}
      />
    </group>
  );
}
