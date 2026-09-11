import { Html, Line } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Quaternion, Vector3 } from "three";
import { translate } from "../../i18n";
import { BarVisibilityContext } from "../shared/barVisibility";
import { SceneReferenceBar } from "../shared/SceneReferenceBar";
import type { ScaleSceneProps } from "../types";
import { CmbSurface } from "./CmbSurface";
import {
  AXIS,
  SIDE,
  UP,
  LAST_SCATTERING_RADIUS,
  PARTICLE_HORIZON_RADIUS,
  HORIZONTAL_SEGMENTS,
  VERTICAL_SEGMENTS,
  patchPoint,
} from "./cmbPatch";
import {
  CMB_TEMPERATURE_KELVIN,
  COSMIC_WEB_COMPARISON_METERS,
  cosmologyAtComovingDistance,
  LAST_SCATTERING_TEMPERATURE_KELVIN,
  PARTICLE_HORIZON_DISTANCE_GPC,
  RADIAL_DIRECTION,
  RADIAL_RULER_TICKS,
} from "./observableUniverseModel";

function sphericalPatchGeometry(radius: number): BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let y = 0; y <= VERTICAL_SEGMENTS; y += 1) {
    const v = (y / VERTICAL_SEGMENTS) * 2 - 1;
    for (let x = 0; x <= HORIZONTAL_SEGMENTS; x += 1) {
      const u = (x / HORIZONTAL_SEGMENTS) * 2 - 1;
      const point = patchPoint(u, v, radius);
      positions.push(point.x, point.y, point.z);
      uvs.push(x / HORIZONTAL_SEGMENTS, y / VERTICAL_SEGMENTS);
    }
  }
  for (let y = 0; y < VERTICAL_SEGMENTS; y += 1) {
    for (let x = 0; x < HORIZONTAL_SEGMENTS; x += 1) {
      const a = y * (HORIZONTAL_SEGMENTS + 1) + x;
      const b = a + 1;
      const c = a + HORIZONTAL_SEGMENTS + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function shellSidesGeometry(): BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const appendStrip = (points: Array<readonly [number, number]>) => {
    const start = positions.length / 3;
    for (const [u, v] of points) {
      for (const radius of [LAST_SCATTERING_RADIUS, PARTICLE_HORIZON_RADIUS]) {
        const point = patchPoint(u, v, radius);
        positions.push(point.x, point.y, point.z);
      }
    }
    for (let index = 0; index < points.length - 1; index += 1) {
      const a = start + index * 2;
      indices.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
    }
  };
  appendStrip(
    Array.from({ length: VERTICAL_SEGMENTS + 1 }, (_, index) => [
      -1,
      (index / VERTICAL_SEGMENTS) * 2 - 1,
    ]),
  );
  appendStrip(
    Array.from({ length: VERTICAL_SEGMENTS + 1 }, (_, index) => [
      1,
      (index / VERTICAL_SEGMENTS) * 2 - 1,
    ]),
  );
  appendStrip(
    Array.from({ length: HORIZONTAL_SEGMENTS + 1 }, (_, index) => [
      (index / HORIZONTAL_SEGMENTS) * 2 - 1,
      -1,
    ]),
  );
  appendStrip(
    Array.from({ length: HORIZONTAL_SEGMENTS + 1 }, (_, index) => [
      (index / HORIZONTAL_SEGMENTS) * 2 - 1,
      1,
    ]),
  );
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function lightConeSliceGeometry(): BufferGeometry {
  const segments = 40;
  const halfAngle = (13 * Math.PI) / 180;
  const halfThickness = 0.07;
  const positions: number[] = [];
  const indices: number[] = [];
  for (const height of [-halfThickness, halfThickness]) {
    positions.push(UP.x * height, UP.y * height, UP.z * height);
    for (let index = 0; index <= segments; index += 1) {
      const angle = -halfAngle + (2 * halfAngle * index) / segments;
      const direction = AXIS.clone()
        .multiplyScalar(Math.cos(angle))
        .addScaledVector(SIDE, Math.sin(angle));
      const point = direction.multiplyScalar(LAST_SCATTERING_RADIUS).addScaledVector(UP, height);
      positions.push(point.x, point.y, point.z);
    }
  }
  const row = segments + 2;
  for (let index = 0; index < segments; index += 1) {
    indices.push(0, index + 1, index + 2);
    indices.push(row, row + index + 2, row + index + 1);
    const lower = index + 1;
    const upper = row + index + 1;
    indices.push(lower, upper, lower + 1, lower + 1, upper, upper + 1);
  }
  const lowerLast = segments + 1;
  const upperLast = row + segments + 1;
  indices.push(0, row, 1, 1, row, row + 1);
  indices.push(0, lowerLast, row, lowerLast, upperLast, row);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function formatRedshift(value: number): string {
  if (value < 0.01) return "0";
  if (value < 10) return value.toFixed(value < 1 ? 2 : 1);
  return Math.round(value).toLocaleString("en-US");
}

export default function ObservableUniverseScene({
  locale,
  metadata,
  onReady,
  cmbDisplayMode = "uniform",
  entryBarKind,
  referenceBarVisible = true,
}: ScaleSceneProps): React.JSX.Element {
  const visibility = useContext(BarVisibilityContext);
  const innerShell = useMemo(() => sphericalPatchGeometry(LAST_SCATTERING_RADIUS), []);
  const outerShell = useMemo(() => sphericalPatchGeometry(PARTICLE_HORIZON_RADIUS), []);
  const shellSides = useMemo(() => shellSidesGeometry(), []);
  const lightCone = useMemo(() => lightConeSliceGeometry(), []);
  const [hoverDistance, setHoverDistance] = useState<number | null>(null);
  const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelHoverLeave = () => {
    if (hoverLeaveTimer.current !== null) clearTimeout(hoverLeaveTimer.current);
    hoverLeaveTimer.current = null;
  };
  useEffect(
    () => () => {
      if (hoverLeaveTimer.current !== null) clearTimeout(hoverLeaveTimer.current);
    },
    [],
  );
  const axisEnd = useMemo(() => AXIS.clone().multiplyScalar(LAST_SCATTERING_RADIUS), []);
  const tooltipPoint = useMemo(
    () => AXIS.clone().multiplyScalar(((hoverDistance ?? 0) / 14) * LAST_SCATTERING_RADIUS),
    [hoverDistance],
  );
  const comparisonMetadata = useMemo(
    () => ({
      ...metadata,
      referenceLengthMeters: COSMIC_WEB_COMPARISON_METERS,
      preferredPrimaryUnit: "Gpc" as const,
      secondaryUnits: ["Gly", "Mpc"] as const,
    }),
    [metadata],
  );
  const comparisonBase = useMemo(
    () =>
      AXIS.clone().multiplyScalar(0.18).addScaledVector(SIDE, -0.92).toArray() as [
        number,
        number,
        number,
      ],
    [],
  );
  const hovered = hoverDistance === null ? null : cosmologyAtComovingDistance(hoverDistance);
  useEffect(() => {
    onReady?.();
    return () => {
      innerShell.dispose();
      outerShell.dispose();
      shellSides.dispose();
      lightCone.dispose();
    };
  }, [innerShell, lightCone, onReady, outerShell, shellSides]);
  const updateHover = (event: ThreeEvent<PointerEvent>) => {
    cancelHoverLeave();
    event.stopPropagation();
    const radialUnits = Math.min(LAST_SCATTERING_RADIUS, Math.max(0, event.point.dot(AXIS)));
    setHoverDistance((radialUnits / LAST_SCATTERING_RADIUS) * 14);
  };
  return (
    <group>
      <SceneReferenceBar
        metadata={comparisonMetadata}
        locale={locale}
        base={comparisonBase}
        direction={RADIAL_DIRECTION}
        kind="comparison"
        visible={entryBarKind !== "comparison" || referenceBarVisible}
        labelOffsetY={20}
      />
      {visibility.only === null && (
        <>
          <mesh geometry={outerShell} renderOrder={-4}>
            <meshBasicMaterial
              color="#df6725"
              side={DoubleSide}
              transparent
              opacity={0.38}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          <mesh geometry={shellSides} renderOrder={-3}>
            <meshBasicMaterial color="#ff7b27" side={DoubleSide} toneMapped={false} />
          </mesh>
          <CmbSurface geometry={innerShell} mode={cmbDisplayMode} />
          <mesh geometry={lightCone} renderOrder={-1}>
            <meshBasicMaterial
              color="#7595b8"
              side={DoubleSide}
              transparent
              opacity={0.105}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          {!visibility.hidden && (
            <>
              <Line points={[[0, 0, 0], axisEnd]} color="#d8e4ee" lineWidth={1.35} />
              <mesh
                position={axisEnd.clone().multiplyScalar(0.5)}
                quaternion={new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), AXIS)}
                onPointerMove={updateHover}
                onPointerEnter={updateHover}
                onPointerLeave={() => {
                  cancelHoverLeave();
                  // Keep the readout stable across brief boundary crossings.
                  hoverLeaveTimer.current = setTimeout(() => {
                    hoverLeaveTimer.current = null;
                    setHoverDistance(null);
                  }, 150);
                }}
              >
                <cylinderGeometry args={[0.3, 0.3, LAST_SCATTERING_RADIUS, 16]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            </>
          )}
          <mesh>
            <sphereGeometry args={[0.052, 16, 10]} />
            <meshBasicMaterial color="#eef5f7" toneMapped={false} />
          </mesh>
          {!visibility.hidden &&
            RADIAL_RULER_TICKS.map((tick, index) => {
              const point = AXIS.clone().multiplyScalar(
                (tick.comovingDistanceGpc / 14) * LAST_SCATTERING_RADIUS,
              );
              const tickHalf = 0.13;
              const labelOffset =
                index === 1 ? 0.52 : index === 3 ? 0.82 : index === 4 ? -0.82 : -0.45;
              const distanceLabel = tick.comovingDistanceGpc.toLocaleString(locale, {
                maximumFractionDigits: 1,
              });
              const lookbackLabel = tick.lookbackTimeGyr.toLocaleString(locale, {
                maximumFractionDigits: 1,
              });
              return (
                <group key={tick.redshift.toFixed(3)}>
                  <Line
                    points={[
                      point.clone().addScaledVector(UP, -tickHalf),
                      point.clone().addScaledVector(UP, tickHalf),
                    ]}
                    color="#d8e4ee"
                    lineWidth={1.2}
                  />
                  <Html
                    style={{ pointerEvents: "none" }}
                    position={point.clone().addScaledVector(UP, labelOffset)}
                    center
                    zIndexRange={[5, 0]}
                  >
                    <div className="cosmic-ruler-tick">
                      <span>{distanceLabel} Gpc</span>
                      <span>
                        {tick.redshift === 0 ? "z=0" : `z≈${formatRedshift(tick.redshift)}`}
                      </span>
                      <span>
                        {tick.redshift === 0
                          ? translate(locale, "observable.now")
                          : translate(locale, "observable.lookbackShort", { value: lookbackLabel })}
                      </span>
                    </div>
                  </Html>
                </group>
              );
            })}
          <Html
            style={{ pointerEvents: "none" }}
            position={axisEnd.clone().addScaledVector(UP, 1.28)}
            center
            zIndexRange={[5, 0]}
          >
            <div className="cosmic-shell-label">
              <strong>{translate(locale, "observable.shell")}</strong>
              <span>
                {translate(locale, "observable.shellTemperature", {
                  emitted: LAST_SCATTERING_TEMPERATURE_KELVIN.toLocaleString(locale, {
                    maximumSignificantDigits: 3,
                  }),
                  observed: CMB_TEMPERATURE_KELVIN,
                })}
              </span>
              <span>
                {translate(locale, "observable.particleHorizon", {
                  distance: PARTICLE_HORIZON_DISTANCE_GPC.toLocaleString(locale, {
                    maximumFractionDigits: 2,
                  }),
                })}
              </span>
            </div>
          </Html>
          <Html
            style={{ pointerEvents: "none" }}
            position={AXIS.clone()
              .multiplyScalar(LAST_SCATTERING_RADIUS * 0.5)
              .addScaledVector(SIDE, -1.55)}
            center
          >
            <span className="cosmic-cone-label">{translate(locale, "observable.lightCone")}</span>
          </Html>
          {!visibility.hidden && hovered && (
            <Html
              style={{ pointerEvents: "none" }}
              position={tooltipPoint.clone().addScaledVector(UP, 0.6)}
              center
              zIndexRange={[20, 10]}
            >
              <dl className="cosmic-ruler-tooltip" role="status">
                <dt>{translate(locale, "observable.comovingDistance")}</dt>
                <dd>{hovered.comovingDistanceGpc.toFixed(2)} Gpc</dd>
                <dt>{translate(locale, "observable.redshift")}</dt>
                <dd>{formatRedshift(hovered.redshift)}</dd>
                <dt>{translate(locale, "observable.lookbackTime")}</dt>
                <dd>{hovered.lookbackTimeGyr.toFixed(2)} Gyr</dd>
                <dt>{translate(locale, "observable.universeAge")}</dt>
                <dd>{hovered.universeAgeGyr.toFixed(2)} Gyr</dd>
                <dt>{translate(locale, "observable.scaleFactor")}</dt>
                <dd>{hovered.scaleFactor.toPrecision(3)}</dd>
              </dl>
            </Html>
          )}
        </>
      )}
    </group>
  );
}
