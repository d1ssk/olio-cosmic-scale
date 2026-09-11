import { useMemo } from "react";
import type { Locale } from "../../i18n";
import { BAO_REFERENCE_METERS, baoRulerPlacement } from "../bao/baoModel";
import { SceneReferenceBar } from "../shared/SceneReferenceBar";
import type { SceneMetadata } from "../types";
import type { BaoManifest } from "../bao/baoData";
import {
  COSMIC_WEB_REFERENCE_METERS,
  cosmicRulerPlacements,
  interpolateRulerBase,
} from "./cosmicWebModel";

function revealOpacity(progress: number): number {
  const t = Math.min(1, Math.max(0, (progress - 0.32) / 0.42));
  return t * t * (3 - 2 * t);
}

export function CosmicWebRulers({
  manifest,
  metadata,
  locale,
  mix,
  transitionAnimating,
}: {
  manifest: BaoManifest;
  metadata: SceneMetadata;
  locale: Locale;
  mix: number;
  transitionAnimating: boolean;
}): React.JSX.Element {
  const placements = useMemo(
    () => cosmicRulerPlacements(manifest, metadata.metersPerSceneUnit),
    [manifest, metadata.metersPerSceneUnit],
  );
  const baoStart = useMemo(
    () => baoRulerPlacement(BAO_REFERENCE_METERS, metadata.metersPerSceneUnit).base,
    [metadata.metersPerSceneUnit],
  );
  const movingBaoBase = interpolateRulerBase(baoStart, placements.baoComparison.base, mix);
  const cosmicMetadata = {
    ...metadata,
    referenceLengthMeters: COSMIC_WEB_REFERENCE_METERS,
    preferredPrimaryUnit: "Gpc" as const,
    secondaryUnits: ["Gly", "Mpc"] as const,
  };
  const baoMetadata = {
    ...metadata,
    referenceLengthMeters: BAO_REFERENCE_METERS,
    preferredPrimaryUnit: "Mpc" as const,
    secondaryUnits: ["Mly", "Gpc"] as const,
  };
  return (
    <group>
      <SceneReferenceBar
        metadata={cosmicMetadata}
        locale={locale}
        base={placements.reference.base}
        direction={placements.reference.direction}
        kind="reference"
        barName="cosmic-web-reference-bar"
        opacity={revealOpacity(mix)}
        labelOffsetY={-18}
      />
      <SceneReferenceBar
        metadata={baoMetadata}
        locale={locale}
        base={movingBaoBase}
        direction={placements.baoComparison.direction}
        kind={transitionAnimating ? "auxiliary" : "comparison"}
        barName="cosmic-web-bao-comparison-bar"
        visible={transitionAnimating || mix > 0.001}
        labelOffsetY={transitionAnimating ? -18 + 36 * mix : 18}
      />
    </group>
  );
}
