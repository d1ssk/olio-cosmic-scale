import { Line } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import { BufferGeometry, DoubleSide } from "three";
import type { CmbDisplayMode } from "../types";
import { cmbLoader, type CmbField, type CmbMap } from "./cmbAssets";
import { makeCmbTexture, makePolarizationGeometry } from "./cmbRendering";

function useCmbMap(field: CmbField, enabled: boolean): CmbMap | null {
  const [map, setMap] = useState<CmbMap | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void cmbLoader
      .load(field)
      .then((value) => {
        if (active) setMap(value);
      })
      .catch((error: unknown) => {
        console.error(`[CMB ${field}] Asset overlay unavailable; no procedural fallback.`, error);
      });
    return () => {
      active = false;
    };
  }, [field, enabled]);
  return map;
}

export function CmbSurface({ geometry, mode }: { geometry: BufferGeometry; mode: CmbDisplayMode }) {
  const temperature = mode === "temperature" || mode === "both";
  const polarization = mode === "polarization" || mode === "both";
  const t = useCmbMap("T", temperature);
  // Preserve the existing E scalar background in polarization-only mode. When
  // combined, T supplies the scalar colors and Q/U alone supply the sticks.
  const e = useCmbMap("E", mode === "polarization");
  const q = useCmbMap("Q", polarization);
  const u = useCmbMap("U", polarization);
  const tTexture = useMemo(() => (t ? makeCmbTexture(t, "T") : null), [t]);
  const eTexture = useMemo(() => (e ? makeCmbTexture(e, "E") : null), [e]);
  const glyphs = useMemo(() => {
    if (!q || !u) return null;
    try {
      return makePolarizationGeometry(q, u);
    } catch (error) {
      console.error("[CMB Q/U] Invalid polarization pair", error);
      return null;
    }
  }, [q, u]);
  // One batched wide-line draw; native WebGL lines often ignore linewidth.
  const glyphPoints = useMemo(() => {
    if (!glyphs) return [];
    const positions = glyphs.getAttribute("position");
    return Array.from({ length: positions.count }, (_, index): [number, number, number] => [
      positions.getX(index),
      positions.getY(index),
      positions.getZ(index),
    ]);
  }, [glyphs]);
  useEffect(
    () => () => {
      tTexture?.dispose();
    },
    [tTexture],
  );
  useEffect(
    () => () => {
      eTexture?.dispose();
    },
    [eTexture],
  );
  useEffect(
    () => () => {
      glyphs?.dispose();
    },
    [glyphs],
  );
  const surfaceMap = temperature ? tTexture : mode === "polarization" && glyphs ? eTexture : null;
  return (
    <>
      <mesh geometry={geometry} renderOrder={-2}>
        <meshBasicMaterial
          key={surfaceMap ? "map" : "uniform"}
          color={surfaceMap ? "#b8b0a2" : "#b8aa8f"}
          map={surfaceMap}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {polarization && glyphs && (
        <Line
          points={glyphPoints}
          segments
          color="#000000"
          lineWidth={1.5}
          depthTest
          depthWrite={false}
          toneMapped={false}
        />
      )}
    </>
  );
}
