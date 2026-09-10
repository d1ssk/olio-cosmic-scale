import { useGalaxyHover } from "./useGalaxyHover";
import { LocalGroupCameraRig } from "./LocalGroupCameraRig";
import { placeGalaxyLabel } from "./localGroupLabels";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, Vector3, type ShaderMaterial } from "three";
import type { Locale } from "../../i18n";
import { galaxyName } from "./galaxyName";
import { MILKY_WAY_DIAMETER_METERS } from "../milky-way/milkyWayData";
import { BarVisibilityContext } from "../shared/barVisibility";
import { SceneReferenceBar } from "../shared/SceneReferenceBar";
import type { ScaleSceneProps } from "../types";
import {
  LOCAL_GROUP_GALAXIES,
  LOCAL_GROUP_RULER_Y_METERS,
  type LocalGalaxy,
} from "./localGroupData";
import { galaxyCloud, galaxyPosition } from "./localGroupModel";

function GalaxyCloud({ galaxy, unit }: { galaxy: LocalGalaxy; unit: number }) {
  const cloud = useMemo(() => galaxyCloud(galaxy, unit), [galaxy, unit]);
  const radius = (galaxy.radiusMeters ?? 0) / unit;
  const { gl } = useThree();
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ physicalSize: { value: radius * 0.022 }, pixelHeight: { value: 1 } }),
    [radius],
  );
  useFrame(({ size }) => {
    if (material.current)
      material.current.uniforms.pixelHeight.value = size.height * gl.getPixelRatio();
  });
  return (
    <points position={galaxyPosition(galaxy, unit)} userData={{ localGalaxyId: galaxy.id }}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[cloud.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[cloud.colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexColors
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        vertexShader={`uniform float physicalSize; uniform float pixelHeight; varying vec3 tint; varying float coverage;
          void main() { tint=color; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
            float pixels=physicalSize*projectionMatrix[1][1]*pixelHeight*0.5;
            coverage=min(1.0,pixels*pixels); gl_PointSize=clamp(pixels,1.0,12.0); }`}
        fragmentShader={`varying vec3 tint; varying float coverage;
          void main() { float r=length(gl_PointCoord-0.5)*2.0; if(r>1.0) discard;
            gl_FragColor=vec4(tint,exp(-3.5*r*r)*0.55*coverage); }`}
      />
    </points>
  );
}
function Annotations({
  locale,
  selected,
  all,
  unit,
}: {
  locale: Locale;
  selected?: number | null;
  all?: boolean;
  unit: number;
}) {
  const { size } = useThree();
  const hovered = useGalaxyHover(unit);
  const barVisibility = useContext(BarVisibilityContext);
  const groups = useRef<(SVGGElement | null)[]>([]);
  const positions = useMemo(
    () => LOCAL_GROUP_GALAXIES.map((g) => new Vector3(...galaxyPosition(g, unit))),
    [unit],
  );
  const scratch = useMemo(() => new Vector3(), []);
  useFrame(({ camera }) => {
    camera.updateMatrixWorld();
    const occupied: { x: number; y: number; width: number }[] = [];
    if (!barVisibility.hidden) {
      for (const [kind, yMeters] of Object.entries(LOCAL_GROUP_RULER_Y_METERS)) {
        scratch.set(0, yMeters / unit, 0).project(camera);
        if (Math.abs(scratch.x) <= 1 && Math.abs(scratch.y) <= 1 && Math.abs(scratch.z) <= 1)
          occupied.push({
            x: ((scratch.x + 1) * size.width) / 2 - 50,
            y: ((1 - scratch.y) * size.height) / 2 + (kind === "reference" ? -18 : 20),
            width: 100,
          });
      }
    }
    const order = [...LOCAL_GROUP_GALAXIES].sort(
      (a, b) =>
        Number(b.id === hovered) - Number(a.id === hovered) ||
        Number(b.id === selected) - Number(a.id === selected) ||
        Number(b.sizeConvention === "extent") - Number(a.sizeConvention === "extent") ||
        a.id - b.id,
    );
    for (const g of order) {
      const group = groups.current[g.id];
      if (!group) continue;
      scratch.copy(positions[g.id]).project(camera);
      const visible =
        Math.abs(scratch.x) < 0.98 && Math.abs(scratch.y) < 0.98 && Math.abs(scratch.z) <= 1;
      group.style.display = visible ? "" : "none";
      if (!visible) continue;
      const x = ((scratch.x + 1) * size.width) / 2,
        y = ((1 - scratch.y) * size.height) / 2;
      const marker = group.children[0];
      marker.setAttribute("cx", String(x));
      marker.setAttribute("cy", String(y));
      const label = group.children[2],
        leader = group.children[1];
      const width = Math.min(size.width - 20, (label as SVGTextElement).getComputedTextLength());
      const prominent = g.id === hovered || g.id === selected || g.sizeConvention === "extent";
      const placement =
        all || prominent
          ? placeGalaxyLabel(x, y, width, size.width, size.height, occupied, prominent)
          : null;
      label.setAttribute("visibility", placement ? "visible" : "hidden");
      leader.setAttribute("visibility", placement ? "visible" : "hidden");
      if (placement) {
        occupied.push(placement);
        const elbowX = placement.endpointX - placement.side * 16;
        leader.setAttribute(
          "d",
          `M${x},${y} L${elbowX},${placement.y - 4} L${placement.endpointX},${placement.y - 4}`,
        );
        label.setAttribute("x", String(placement.x));
        label.setAttribute("y", String(placement.y));
      }
    }
  });
  return (
    <Html
      fullscreen
      calculatePosition={() => [size.width / 2, size.height / 2]}
      style={{ pointerEvents: "none" }}
      zIndexRange={[5, 0]}
    >
      <svg
        className="stellar-annotations local-group-annotations"
        width={size.width}
        height={size.height}
        aria-hidden="true"
      >
        {LOCAL_GROUP_GALAXIES.map((g) => (
          <g
            key={g.id}
            ref={(el) => {
              groups.current[g.id] = el;
            }}
            data-local-galaxy={g.name}
            className={g.id === selected || g.id === hovered ? "is-selected" : ""}
            style={{ display: "none" }}
          >
            <circle r={g.id === selected ? 5 : 2} />
            <path />
            <text>{galaxyName(g, locale)}</text>
          </g>
        ))}
      </svg>
    </Html>
  );
}
export default function LocalGroupScene({
  metadata,
  locale,
  onReady,
  selectedGalaxyId,
  showAllGalaxyLabels,
}: ScaleSceneProps) {
  const visibility = useContext(BarVisibilityContext);
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  const unit = metadata.metersPerSceneUnit;
  return (
    <group>
      <LocalGroupCameraRig unit={unit} />
      <group visible={visibility.only === null}>
        {LOCAL_GROUP_GALAXIES.filter((g) => g.radiusMeters !== null).map((g) => (
          <GalaxyCloud key={g.id} galaxy={g} unit={unit} />
        ))}
        {visibility.only === null && (
          <Annotations
            locale={locale}
            selected={selectedGalaxyId}
            all={showAllGalaxyLabels}
            unit={unit}
          />
        )}
      </group>
      <SceneReferenceBar
        metadata={metadata}
        locale={locale}
        base={[
          -metadata.referenceLengthMeters / unit / 2,
          LOCAL_GROUP_RULER_Y_METERS.reference / unit,
          0,
        ]}
        direction={[1, 0, 0]}
        kind="reference"
        labelAlign="center"
        labelOffsetY={-18}
      />
      <SceneReferenceBar
        metadata={{
          ...metadata,
          referenceLengthMeters: MILKY_WAY_DIAMETER_METERS,
          preferredPrimaryUnit: "kpc",
        }}
        locale={locale}
        base={[
          -MILKY_WAY_DIAMETER_METERS / unit / 2,
          LOCAL_GROUP_RULER_Y_METERS.comparison / unit,
          0,
        ]}
        direction={[1, 0, 0]}
        kind="comparison"
        labelAlign="center"
        labelOffsetY={20}
      />
    </group>
  );
}
