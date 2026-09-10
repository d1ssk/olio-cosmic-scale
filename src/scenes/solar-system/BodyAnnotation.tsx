import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Point } from "../earth-sun/earthSunModel";
import { planetAnnotationOpacity, innerOrbitOpacity } from "./solarScale";
/** A screen-sized leader, anchored to the actual center; no enlarged body glyph. */
export function BodyAnnotation({
  position,
  label,
  name,
  orbitMeters,
  metersPerSceneUnit,
  below = false,
}: {
  position: Point;
  label: string;
  name: string;
  orbitMeters?: number;
  metersPerSceneUnit: number;
  below?: boolean;
}) {
  const element = useRef<HTMLDivElement>(null);
  useFrame(({ camera, size }) => {
    if (!element.current) return;
    const extent = (Math.min(size.width, size.height) / camera.zoom) * metersPerSceneUnit;
    const opacity =
      name === "Sun"
        ? innerOrbitOpacity("Mars", extent)
        : orbitMeters === undefined
          ? 1
          : planetAnnotationOpacity(extent, orbitMeters);
    element.current.style.opacity = String(opacity);
    element.current.style.visibility = opacity < 0.01 ? "hidden" : "visible";
  });
  return (
    <Html position={position} zIndexRange={[5, 0]} className="body-annotation-anchor">
      <div
        ref={element}
        className={`body-annotation ${below ? "annotation-below" : ""}`}
        data-body-annotation={name}
      >
        <svg width="48" height="32" aria-hidden="true">
          <path d={below ? "M0 0 L22 25 L44 25" : "M0 0 L22 -25 L44 -25"} />
        </svg>
        <span>{label}</span>
      </div>
    </Html>
  );
}
