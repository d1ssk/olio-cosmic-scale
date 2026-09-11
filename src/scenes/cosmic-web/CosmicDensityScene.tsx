import { useCallback } from "react";
import { DEFAULT_COSMIC_WEB_QUALITY, type ScaleSceneProps } from "../types";
import BaoScene from "../bao/BaoScene";
import { cosmicLayerOpacities } from "./cosmicWebModel";
import { CosmicWebSlab } from "./CosmicWebSlab";

export default function CosmicDensityScene(props: ScaleSceneProps): React.JSX.Element {
  const {
    metadata,
    onReady,
    cosmicWebMix = metadata.id === "cosmic-web" ? 1 : 0,
    cosmicWebQuality = DEFAULT_COSMIC_WEB_QUALITY,
    densityTransitionActive = false,
    densityTransitionAnimating = false,
    onBaoLayerReady,
    onCosmicWebLayerReady,
  } = props;
  const opacities = cosmicLayerOpacities(cosmicWebMix);
  const showBao = metadata.id === "bao" || densityTransitionActive || cosmicWebMix < 0.999;
  const showCosmic =
    metadata.id === "cosmic-web" || densityTransitionActive || cosmicWebMix > 0.001;
  const markBaoReady = useCallback(() => {
    onBaoLayerReady?.();
    if (metadata.id === "bao") onReady?.();
  }, [metadata.id, onBaoLayerReady, onReady]);
  const markCosmicReady = useCallback(() => {
    onCosmicWebLayerReady?.();
    if (metadata.id === "cosmic-web") onReady?.();
  }, [metadata.id, onCosmicWebLayerReady, onReady]);
  return (
    <group>
      {showBao && (
        <BaoScene
          {...props}
          onReady={markBaoReady}
          baoLayerOpacity={opacities.bao}
          suppressBaoRulers={densityTransitionAnimating || metadata.id !== "bao"}
        />
      )}
      {showCosmic && (
        <CosmicWebSlab
          quality={cosmicWebQuality}
          opacity={opacities.slab}
          metadata={metadata}
          locale={props.locale}
          mix={cosmicWebMix}
          transitionAnimating={densityTransitionAnimating}
          entryBarKind={props.entryBarKind}
          referenceBarVisible={props.referenceBarVisible}
          onReady={markCosmicReady}
        />
      )}
    </group>
  );
}
