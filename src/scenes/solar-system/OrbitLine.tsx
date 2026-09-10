import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Line2 } from "three-stdlib";
import type { SolarModel } from "./SolarCameraRig";
import { innerOrbitOpacity } from "./solarScale";
export function OrbitLine({ body, scale }: { body: SolarModel["bodies"][number]; scale: number }) {
  const line = useRef<Line2>(null);
  useFrame(({ camera, size }) => {
    if (!line.current) return;
    const opacity = innerOrbitOpacity(
      body.body,
      (Math.min(size.width, size.height) / camera.zoom) * scale,
    );
    line.current.material.opacity = 0.4 * opacity;
    line.current.visible = opacity > 0.001;
  });
  return (
    <Line
      ref={line}
      name={`orbit-${body.body}`}
      points={body.orbit}
      color={body.color}
      lineWidth={1}
      transparent
      opacity={0.4}
    />
  );
}
