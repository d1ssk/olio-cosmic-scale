import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Vector3 } from "three";
import { translate, type Locale } from "../../i18n";
import { placeGalaxyLabel, type LabelBox } from "../local-group/localGroupLabels";
import type { VirgoGalaxy } from "./virgoData";
import { virgoPosition } from "./virgoModel";

// M87 / M49 label offsets in screen pixels. Increase these to lengthen their leaders.
// Horizontal offsets are clamped at screen edges; placement also avoids HUD panels.
const VIRGO_CLUSTER_LABEL_LAYOUT = {
  desktopLeaderPixels: 180,
  mobileLeaderPixels: 65,
  verticalOffsetPixels: 55,
};

export function VirgoAnnotations({
  galaxies,
  locale,
}: {
  galaxies: VirgoGalaxy[];
  locale: Locale;
}) {
  const { size, gl } = useThree();
  const groups = useRef<(SVGGElement | null)[]>([]);
  const positions = useMemo(
    () => galaxies.map((g) => new Vector3(...virgoPosition(g))),
    [galaxies],
  );
  const scratch = useMemo(() => new Vector3(), []);
  useFrame(({ camera }) => {
    camera.updateMatrixWorld();
    const occupied: LabelBox[] = [];
    // Overlay panels can grow when either legend is open. Keep labels outside them.
    const canvas = gl.domElement.getBoundingClientRect();
    for (const panel of document.querySelectorAll(
      ".virgo-view .scene-heading, .virgo-view .scene-status, .virgo-view .scale-readout",
    )) {
      const rect = panel.getBoundingClientRect();
      const top = Math.max(0, rect.top - canvas.top),
        bottom = Math.min(size.height, rect.bottom - canvas.top);
      for (let y = top; y <= bottom; y += 12)
        occupied.push({ x: rect.left - canvas.left, y, width: rect.width });
    }
    galaxies.forEach((galaxy, i) => {
      const group = groups.current[i];
      if (!group) return;
      scratch.copy(positions[i]).project(camera);
      const visible =
        Math.abs(scratch.x) < 0.98 && Math.abs(scratch.y) < 0.95 && Math.abs(scratch.z) <= 1;
      group.style.display = visible ? "" : "none";
      if (!visible) return;
      const x = ((scratch.x + 1) * size.width) / 2,
        y = ((1 - scratch.y) * size.height) / 2;
      const label = group.children[1] as SVGTextElement;
      const placement = placeGalaxyLabel(
        x,
        y,
        label.getComputedTextLength(),
        size.width,
        size.height,
        occupied,
        true,
        galaxy.name === "Milky Way" || galaxy.name === "NGC4472" ? 1 : -1,
        galaxy.name === "NGC4486" || galaxy.name === "NGC4472"
          ? VIRGO_CLUSTER_LABEL_LAYOUT
          : undefined,
      );
      group.style.display = placement ? "" : "none";
      if (!placement) return;
      occupied.push(placement);
      group.children[0].setAttribute("d", `M${x},${y} L${placement.endpointX},${placement.y - 4}`);
      label.setAttribute("x", String(placement.x));
      label.setAttribute("y", String(placement.y));
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
        {galaxies.map((g, i) => (
          <g
            key={g.name}
            data-virgo-galaxy={g.name}
            ref={(el) => {
              groups.current[i] = el;
            }}
            style={{ display: "none" }}
          >
            <path />
            <text>
              {g.name === "Milky Way"
                ? translate(locale, "scene.milkyWay.title")
                : g.name === "Andromeda"
                  ? translate(locale, "localGroup.m31")
                  : g.name === "NGC4486"
                    ? translate(locale, "virgo.m87")
                    : g.name === "NGC4472"
                      ? "M49"
                      : g.name}
            </text>
          </g>
        ))}
      </svg>
    </Html>
  );
}
