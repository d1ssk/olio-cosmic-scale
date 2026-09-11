import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { ReactNode } from "react";
import type { Vector3 } from "three";

// Screen-space label offsets only. Html's origin stays on the exact 3D tick.
const OFFSETS = [
  [0, 30],
  [-40, -40],
  [40, 36],
  [-48, -56],
  [52, 52],
  [38, 26],
] as const;

export function RadialTickAnnotation({
  point,
  index,
  children,
}: {
  point: Vector3;
  index: number;
  children: ReactNode;
}) {
  const compact = useThree((state) => state.size.width < 720);
  const [baseX, baseY] = OFFSETS[index];
  const dx = compact && index === 0 ? -28 : baseX * (compact ? 0.75 : 1);
  const dy = compact && index === 0 ? -8 : baseY * (compact ? 0.75 : 1);
  const path = `M 0 0 L ${dx} ${dy * 0.65} L ${dx} ${dy}`;
  return (
    <Html position={point} style={{ pointerEvents: "none" }} zIndexRange={[6, 0]}>
      <div className="cosmic-tick-annotation" data-radial-tick={index}>
        <svg className="cosmic-tick-leader" width="1" height="1" aria-hidden="true">
          <path d={path} fill="none" stroke="#0a101a" strokeWidth="4" />
          <path d={path} fill="none" stroke="#e2edf5" strokeWidth="1.25" />
          <circle cx="0" cy="0" r="3" fill="#e2edf5" stroke="#0a101a" strokeWidth="1.5" />
        </svg>
        <div
          className="cosmic-ruler-tick"
          style={{
            left: dx,
            top: dy,
            transform: `translate(-50%, ${dy < 0 ? "-100%" : "0"})`,
          }}
        >
          {children}
        </div>
      </div>
    </Html>
  );
}
