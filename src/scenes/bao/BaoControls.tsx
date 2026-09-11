import { useEffect, useMemo, useState } from "react";
import { translate, type Locale } from "../../i18n";
import type { BaoLayerMode } from "../types";
import {
  loadBaoManifest,
  loadBaoStatistic,
  matterGridCellOffset,
  type BaoManifest,
  type BaoStatistic,
} from "./baoData";
import { baoPeak } from "./baoModel";

export default function BaoControls({
  locale,
  layerMode,
  onLayerModeChange,
  reveal,
  onRevealChange,
  sliceFraction,
  onSliceFractionChange,
  disabled,
}: {
  locale: Locale;
  layerMode: BaoLayerMode;
  onLayerModeChange?: (mode: BaoLayerMode) => void;
  reveal: boolean;
  onRevealChange?: (value: boolean) => void;
  sliceFraction: number;
  onSliceFractionChange?: (value: number) => void;
  disabled?: boolean;
}): React.JSX.Element {
  const [manifest, setManifest] = useState<BaoManifest | null>(null);
  const [statistic, setStatistic] = useState<BaoStatistic | null>(null);
  useEffect(() => {
    let active = true;
    void Promise.all([loadBaoManifest(), loadBaoStatistic()]).then(
      ([nextManifest, nextStatistic]) => {
        if (!active) return;
        setManifest(nextManifest);
        setStatistic(nextStatistic);
      },
    );
    return () => {
      active = false;
    };
  }, []);
  const slice = manifest ? Math.round(sliceFraction * (manifest.bao_region.matter_ngrid - 1)) : 0;
  const coordinate = manifest
    ? manifest.bao_region.bounds_mpc_h[0] +
      (slice + matterGridCellOffset(manifest)) * manifest.matter.cell_size_mpc_h
    : 0;
  const peak = useMemo(() => (statistic ? baoPeak(statistic) : null), [statistic]);
  return (
    <div className="bao-controls">
      <p className="stellar-summary">
        {manifest
          ? translate(locale, "bao.summary", {
              count: manifest.tracers.count.toLocaleString(locale),
              size: manifest.bao_region.size_mpc_h,
            })
          : translate(locale, "bao.loading")}
      </p>
      <fieldset disabled={disabled}>
        <legend>{translate(locale, "bao.layers")}</legend>
        <div className="bao-layer-switch">
          {(["halos", "matter", "both"] as const).map((mode) => (
            <label key={mode} className={layerMode === mode ? "is-active" : undefined}>
              <input
                type="radio"
                name="bao-layer"
                value={mode}
                checked={layerMode === mode}
                onChange={() => onLayerModeChange?.(mode)}
              />
              {translate(
                locale,
                mode === "halos" ? "bao.halos" : mode === "matter" ? "bao.matter" : "bao.both",
              )}
            </label>
          ))}
        </div>
      </fieldset>
      {(layerMode === "matter" || layerMode === "both") && manifest && (
        <label className="bao-slice-control">
          <span>
            {translate(locale, "bao.slice", {
              index: slice + 1,
              total: manifest.bao_region.matter_ngrid,
              coordinate: coordinate.toFixed(1),
            })}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step={1 / (manifest.bao_region.matter_ngrid - 1)}
            value={sliceFraction}
            disabled={disabled}
            onChange={(event) => onSliceFractionChange?.(Number(event.target.value))}
          />
        </label>
      )}
      <button
        className={`bao-reveal-button ${reveal ? "is-active" : ""}`}
        type="button"
        aria-pressed={reveal}
        disabled={disabled || !statistic}
        onClick={() => onRevealChange?.(!reveal)}
      >
        {translate(locale, reveal ? "bao.hideReveal" : "bao.showReveal")}
      </button>
      {reveal && statistic && peak && (
        <>
          <BaoCorrelationChart locale={locale} statistic={statistic} peakIndex={peak.index} />
          <p className="bao-guide-note">
            {translate(locale, "bao.guide", { scale: peak.rMpcH.toFixed(0) })}
          </p>
        </>
      )}
    </div>
  );
}

function BaoCorrelationChart({
  locale,
  statistic,
  peakIndex,
}: {
  locale: Locale;
  statistic: BaoStatistic;
  peakIndex: number;
}): React.JSX.Element {
  const width = 320;
  const height = 142;
  const margin = { left: 35, right: 10, top: 18, bottom: 27 };
  const points = statistic.r_mpc_h
    .map((r, index) => ({ r, value: statistic.r2_xi[index] }))
    .filter(({ r }) => r >= statistic.r_max_mpc_h * 0.3 && r <= statistic.r_max_mpc_h * 0.7);
  const xMin = points[0].r;
  const xMax = points[points.length - 1].r;
  const yMin = Math.min(...points.map((point) => point.value));
  const yMax = Math.max(...points.map((point) => point.value));
  const x = (value: number) =>
    margin.left + ((value - xMin) / (xMax - xMin)) * (width - margin.left - margin.right);
  const y = (value: number) =>
    margin.top + ((yMax - value) / (yMax - yMin)) * (height - margin.top - margin.bottom);
  const path = points
    .map(
      (point, index) => `${index ? "L" : "M"}${x(point.r).toFixed(1)},${y(point.value).toFixed(1)}`,
    )
    .join(" ");
  const peakR = statistic.r_mpc_h[peakIndex];
  return (
    <figure className="bao-chart">
      <figcaption>{translate(locale, "bao.chartTitle")}</figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={translate(locale, "bao.chartAlt")}
      >
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
        />
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} />
        <path d={path} />
        <line
          className="bao-peak-line"
          x1={x(peakR)}
          y1={margin.top}
          x2={x(peakR)}
          y2={height - margin.bottom}
        />
        <circle cx={x(peakR)} cy={y(statistic.r2_xi[peakIndex])} r="3" />
        <text x={x(peakR)} y="12" textAnchor="middle">
          {peakR.toFixed(0)} Mpc/h
        </text>
        <text x={(margin.left + width - margin.right) / 2} y={height - 5} textAnchor="middle">
          r (Mpc/h)
        </text>
        <text
          transform={`translate(11 ${(margin.top + height - margin.bottom) / 2}) rotate(-90)`}
          textAnchor="middle"
        >
          r²ξ(r)
        </text>
      </svg>
    </figure>
  );
}
