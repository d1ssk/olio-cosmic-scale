import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { Vector3 } from "three";
import { translate, type Locale } from "../../i18n";

type Point = [number, number, number];
type Label = { name: string; x: number; y: number; tx: number; ty: number; width: number };
/** Leaders stay at physical positions; only their text is fitted to the viewport. */
export function GalaxyAnnotations({ sun, locale }: { sun: Point; locale: Locale }) {
  const { size } = useThree();
  const scratch = useMemo(() => new Vector3(), []);
  const elapsed = useRef(0);
  const [labels, setLabels] = useState<Label[]>([]);
  useFrame(({ camera }, delta) => {
    elapsed.current += delta;
    if (elapsed.current < 0.05) return;
    elapsed.current = 0;
    const compact = size.width < 600;
    const next = ([sun, [0, 0, 0]] as Point[]).flatMap((position, index) => {
      scratch.fromArray(position).project(camera);
      if (Math.abs(scratch.x) > 1 || Math.abs(scratch.y) > 1 || Math.abs(scratch.z) > 1) return [];
      const name = translate(
        locale,
        index === 0
          ? compact
            ? "milkyWay.sunShort"
            : "milkyWay.sun"
          : compact
            ? "milkyWay.centerShort"
            : "milkyWay.center",
      );
      const width = Math.min(size.width - 16, name.length * (locale === "ja" ? 12 : 7));
      const x = ((scratch.x + 1) * size.width) / 2;
      const y = ((1 - scratch.y) * size.height) / 2;
      return [
        {
          name,
          width,
          x,
          y,
          tx: Math.max(8, Math.min(size.width - width - 8, x + 24)),
          ty: Math.max(16, Math.min(size.height - 12, y + (index === 0 ? 38 : -38))),
        },
      ];
    });
    setLabels((previous) => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next));
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
        {labels.map((label, index) => (
          <g key={index} data-galaxy-annotation={index}>
            <path d={`M${label.x},${label.y} L${label.tx},${label.ty - 5}`} />
            <text x={label.tx} y={label.ty}>
              {label.name}
            </text>
          </g>
        ))}
      </svg>
    </Html>
  );
}
