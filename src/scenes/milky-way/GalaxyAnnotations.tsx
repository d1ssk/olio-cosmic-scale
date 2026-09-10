import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Vector3 } from "three";
import { translate, type Locale } from "../../i18n";

type Point = [number, number, number];
/** Fixed DOM identities; project true anchors after controls on every rendered frame. */
export function GalaxyAnnotations({ sun, locale }: { sun: Point; locale: Locale }) {
  const { size } = useThree();
  const scratch = useMemo(() => new Vector3(), []);
  const groups = useRef<(SVGGElement | null)[]>([]);
  const compact = size.width < 600;
  const labels = [
    { position: sun, name: translate(locale, compact ? "milkyWay.sunShort" : "milkyWay.sun") },
    {
      position: [0, 0, 0] as Point,
      name: translate(locale, compact ? "milkyWay.centerShort" : "milkyWay.center"),
    },
  ];
  useFrame(({ camera }) => {
    // OrbitControls runs at priority -1; refresh matrices before SVG projection.
    camera.updateMatrixWorld();
    labels.forEach(({ position, name }, index) => {
      const group = groups.current[index];
      if (!group) return;
      scratch.fromArray(position).project(camera);
      const visible =
        Math.abs(scratch.x) <= 1 && Math.abs(scratch.y) <= 1 && Math.abs(scratch.z) <= 1;
      group.style.visibility = visible ? "visible" : "hidden";
      if (!visible) return;
      const width = Math.min(size.width - 16, name.length * (locale === "ja" ? 12 : 7));
      const x = ((scratch.x + 1) * size.width) / 2;
      const y = ((1 - scratch.y) * size.height) / 2;
      const tx = Math.max(8, Math.min(size.width - width - 8, x + 24));
      const ty = Math.max(16, Math.min(size.height - 12, y + (index === 0 ? 38 : -38)));
      group.children[0].setAttribute("d", `M${x},${y} L${tx},${ty - 5}`);
      group.children[1].setAttribute("x", String(tx));
      group.children[1].setAttribute("y", String(ty));
    });
  });
  return (
    <Html
      fullscreen
      calculatePosition={() => [size.width / 2, size.height / 2]}
      style={{ pointerEvents: "none" }}
      zIndexRange={[5, 0]}
    >
      <svg
        className="stellar-annotations"
        width={size.width}
        height={size.height}
        aria-hidden="true"
      >
        {labels.map(({ name }, index) => (
          <g
            key={index}
            ref={(element) => {
              groups.current[index] = element;
            }}
            data-galaxy-annotation={index}
            style={{ visibility: "hidden" }}
          >
            <path />
            <text>{name}</text>
          </g>
        ))}
      </svg>
    </Html>
  );
}
