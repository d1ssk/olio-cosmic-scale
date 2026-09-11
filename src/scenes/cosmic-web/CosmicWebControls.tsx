import { useEffect, useState } from "react";
import { translate, type Locale } from "../../i18n";
import { loadBaoManifest, type BaoManifest } from "../bao/baoData";
import type { CosmicWebQuality } from "../types";
import { centralSlabWindow, qualityLod } from "./cosmicWebData";

export default function CosmicWebControls({
  locale,
  quality,
  onQualityChange,
  disabled,
}: {
  locale: Locale;
  quality: CosmicWebQuality;
  onQualityChange?: (quality: CosmicWebQuality) => void;
  disabled?: boolean;
}): React.JSX.Element {
  const [manifest, setManifest] = useState<BaoManifest | null>(null);
  useEffect(() => {
    let active = true;
    void loadBaoManifest().then((loaded) => {
      if (active) setManifest(loaded);
    });
    return () => {
      active = false;
    };
  }, []);
  const window = manifest ? centralSlabWindow(manifest, qualityLod(quality)) : null;
  return (
    <div className="cosmic-web-controls">
      <p>
        {manifest
          ? translate(locale, "cosmicWeb.summary", {
              size: manifest.box.size_mpc_h / 1_000,
              redshift: manifest.redshift,
            })
          : translate(locale, "cosmicWeb.loading")}
      </p>
      <label>
        {translate(locale, "cosmicWeb.quality")}
        <select
          value={quality}
          disabled={disabled}
          onChange={(event) => onQualityChange?.(event.target.value as CosmicWebQuality)}
        >
          <option value="high">{translate(locale, "cosmicWeb.high")}</option>
          <option value="standard">{translate(locale, "cosmicWeb.standard")}</option>
        </select>
      </label>
      {window && (
        <p>
          {translate(locale, "cosmicWeb.slab", {
            axis: window.normalAxis.toUpperCase(),
            resolution: window.lod,
            thickness: window.thicknessMpcH.toFixed(3),
          })}
        </p>
      )}
      <p>{translate(locale, "cosmicWeb.fixed")}</p>
    </div>
  );
}
