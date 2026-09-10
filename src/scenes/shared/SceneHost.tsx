import { AU_METERS } from "../../physics/constants";
import {
  isSolarWorld,
  solarRecoveryPreset,
  solarZoomLimits,
  SOLAR_ZOOM_DURATION_MS,
  interpolateSolarZoom,
} from "../solar-system/solarScale";
import {
  solarExitIntent,
  visibleSegmentFraction,
  solarViewLabel,
  visibleBarPair,
} from "../solar-system/solarNavigation";
import { solarDiameterOpacity } from "../solar-system/solarScale";
import type { Line2 } from "three-stdlib";
import { reducedMotion } from "../../bridges/transitionTiming";
import { Vector3, Quaternion, Matrix4 } from "three";
/* React Three Fiber exposes mutable Three.js camera/control objects by design. */
/* eslint-disable react-hooks/immutability */
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  Component,
  type ErrorInfo,
  type PropsWithChildren,
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useImperativeHandle,
  type Ref,
} from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { cameraStateKey, cameraStateStore, type CameraSnapshot } from "../../app/cameraState";
import { translate, type Locale } from "../../i18n";
import type { SceneMetadata } from "../types";

export type SceneHostControls = {
  animateTo: (metadata: SceneMetadata, duration?: number) => Promise<boolean>;
  exitIntent: (
    direction: "previous" | "next",
  ) => "sun" | "outer-direct" | "outer-exit" | "outer-preset" | "inner-preset" | null;
  recoveryPreset: () => "earth-sun" | "solar-system" | null;
};

type SceneHostProps = PropsWithChildren<{
  ref?: Ref<SceneHostControls>;
  metadata: SceneMetadata;
  locale: Locale;
  resetVersion: number;
  onSolarViewChange?: (id: "earth-sun" | "solar-system") => void;
  onBarPairChange?: (pair: readonly [number, number] | null) => void;
}>;

export function SceneHost({
  ref,
  metadata,
  locale,
  resetVersion,
  onSolarViewChange,
  onBarPairChange,
  children,
}: SceneHostProps): React.JSX.Element {
  const camera = metadata.camera;
  return (
    <SceneErrorBoundary
      fallback={<div className="scene-error">{translate(locale, "error.scene")}</div>}
    >
      <div className="scene-canvas" aria-label={translate(locale, metadata.titleKey)}>
        <Canvas
          orthographic={camera.projection === "orthographic"}
          dpr={[1, 1.75]}
          camera={{
            position: [...camera.position],
            near: camera.near,
            far: camera.far,
            zoom: camera.projection === "orthographic" ? 60 : 1,
            fov: camera.projection === "perspective" ? 45 : undefined,
          }}
        >
          <color
            attach="background"
            args={[getComputedStyle(document.documentElement).getPropertyValue("--canvas").trim()]}
          />
          <ambientLight intensity={1.3} />
          <directionalLight position={[8, 10, 6]} intensity={1.8} />
          <Suspense fallback={null}>{children}</Suspense>
          <CameraController
            ref={ref}
            metadata={metadata}
            resetVersion={resetVersion}
            onSolarViewChange={onSolarViewChange}
            onBarPairChange={onBarPairChange}
          />
        </Canvas>
      </div>
    </SceneErrorBoundary>
  );
}

function CameraController({
  ref,
  metadata,
  resetVersion,
  onSolarViewChange,
  onBarPairChange,
}: {
  ref?: Ref<SceneHostControls>;
  metadata: SceneMetadata;
  resetVersion: number;
  onSolarViewChange?: (id: "earth-sun" | "solar-system") => void;
  onBarPairChange?: (pair: readonly [number, number] | null) => void;
}): React.JSX.Element {
  const { camera, size, scene } = useThree();
  const originalDistance = Math.hypot(
    ...metadata.camera.position.map((value, i) => value - metadata.camera.target[i]),
  );
  const fitFactor =
    metadata.camera.fitToViewport && metadata.camera.projection === "perspective"
      ? Math.max(
          1,
          metadata.defaultViewportExtentMeters /
            metadata.metersPerSceneUnit /
            (2 * Math.tan(Math.PI / 8) * (size.width / size.height)) /
            originalDistance,
        )
      : 1;
  const rightGutter =
    metadata.camera.projection === "orthographic" ? (metadata.camera.rightGutterPixels ?? 0) : 0;
  const fittedZoom =
    metadata.camera.fitToViewport && metadata.camera.projection === "orthographic"
      ? Math.min(Math.max(1, size.width - rightGutter), size.height) /
        (metadata.defaultViewportExtentMeters / metadata.metersPerSceneUnit)
      : 60;
  const zoomLimits = solarZoomLimits(size.width, size.height, metadata.metersPerSceneUnit);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const lastPair = useRef("");
  const sampleElapsed = useRef(0);
  useFrame((_, delta) => {
    sampleElapsed.current += delta;
    if (sampleElapsed.current < 0.1) return;
    sampleElapsed.current = 0;
    const lengths: number[] = [];
    scene.traverse((object) => {
      if (typeof object.userData.visibleBarMeters === "number")
        lengths.push(object.userData.visibleBarMeters);
    });
    const pair = visibleBarPair(lengths);
    const key = JSON.stringify(pair);
    if (key !== lastPair.current) {
      lastPair.current = key;
      onBarPairChange?.(pair);
    }
    const controls = controlsRef.current;
    if (!onSolarViewChange || !controls?.enabled || animation.current || !isSolarWorld(metadata.id))
      return;
    const extentAu =
      ((Math.min(size.width, size.height) / camera.zoom) * metadata.metersPerSceneUnit) / AU_METERS;
    const next = solarViewLabel(metadata.id as "earth-sun" | "solar-system", extentAu);
    if (next !== metadata.id) {
      cameraStateStore.set(cameraStateKey(next), {
        position: camera.position.toArray(),
        target: controls.target.toArray(),
        zoom: camera.zoom,
      });
      onSolarViewChange(next);
    }
  });
  const initialResetVersion = useRef(resetVersion);
  const storeKey = cameraStateKey(metadata.id);
  const animation = useRef<{ frame: number; resolve: (success: boolean) => void } | null>(null);
  useEffect(
    () => () => {
      if (animation.current) {
        cancelAnimationFrame(animation.current.frame);
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
          controlsRef.current.enableDamping = true;
        }
        animation.current.resolve(false);
        animation.current = null;
      }
    },
    [metadata.id],
  );
  useImperativeHandle(
    ref,
    () => ({
      exitIntent(direction) {
        camera.updateMatrixWorld();
        const projectBar = (name: string) => {
          const line = scene.getObjectByName(name)?.children[0] as Line2 | undefined;
          if (!line) return { fraction: 0, pixels: 0 };
          const a = line.geometry.attributes.instanceStart;
          const b = line.geometry.attributes.instanceEnd;
          const start = line
            .localToWorld(new Vector3(a.getX(0), a.getY(0), a.getZ(0)))
            .project(camera);
          const end = line
            .localToWorld(new Vector3(b.getX(0), b.getY(0), b.getZ(0)))
            .project(camera);
          return {
            fraction: visibleSegmentFraction(start.toArray(), end.toArray()),
            pixels: Math.hypot(
              ((end.x - start.x) * size.width) / 2,
              ((end.y - start.y) * size.height) / 2,
            ),
          };
        };
        const au = projectBar("solar-au-world-bar");
        const solar = projectBar("solar-diameter-world-bar"),
          outer = projectBar("solar-outer-world-bar");
        const extent =
          (Math.min(size.width, size.height) / camera.zoom) * metadata.metersPerSceneUnit;
        return solarExitIntent(
          direction,
          solar.fraction,
          solarDiameterOpacity(extent),
          solar.pixels,
          outer.fraction * outer.pixels,
          au.fraction,
          au.pixels,
          outer.fraction,
        );
      },
      recoveryPreset() {
        const controls = controlsRef.current;
        if (!controls || !isSolarWorld(metadata.id)) return null;
        const direction = camera.position.clone().sub(controls.target).normalize();
        const defaultDirection = new Vector3(...metadata.camera.position)
          .sub(new Vector3(...metadata.camera.target))
          .normalize();
        return solarRecoveryPreset(
          (Math.min(size.width, size.height) / camera.zoom) * metadata.metersPerSceneUnit,
          controls.target.length() * metadata.metersPerSceneUnit,
          direction.angleTo(defaultDirection),
          metadata.id,
        );
      },
      animateTo(destination, duration = SOLAR_ZOOM_DURATION_MS) {
        const controls = controlsRef.current;
        if (
          !controls ||
          !(
            (isSolarWorld(metadata.id) && isSolarWorld(destination.id)) ||
            (metadata.id === "milky-way" && destination.id === metadata.id)
          ) ||
          animation.current
        )
          return Promise.resolve(false);
        const damping = controls.enableDamping;
        controls.enableDamping = false;
        controls.update();
        controls.enabled = false;
        const fromZoom = camera.zoom;
        const toZoom =
          Math.min(size.width, size.height) /
          (destination.defaultViewportExtentMeters / destination.metersPerSceneUnit);
        const fromTarget = controls.target.clone();
        const distance = camera.position.distanceTo(fromTarget);
        const fromRotation = camera.quaternion.clone();
        const toRotation = new Quaternion().setFromRotationMatrix(
          new Matrix4().lookAt(
            new Vector3(...destination.camera.position),
            new Vector3(...destination.camera.target),
            new Vector3(0, 1, 0),
          ),
        );
        if (
          metadata.id === destination.id &&
          Math.abs(Math.log(fromZoom / toZoom)) < 1e-7 &&
          fromTarget.distanceTo(new Vector3(...destination.camera.target)) < 1e-7 &&
          fromRotation.angleTo(toRotation) < 1e-7
        ) {
          controls.enabled = true;
          controls.enableDamping = damping;
          return Promise.resolve(true);
        }
        const rotation = new Quaternion();
        const offset = new Vector3();
        const destinationTarget = new Vector3(...destination.camera.target);
        const start = performance.now();
        return new Promise<boolean>((resolve) => {
          const tick = (now: number) => {
            const progress = reducedMotion() ? 1 : Math.min(1, (now - start) / duration);
            const eased = progress * progress * (3 - 2 * progress);
            controls.target.lerpVectors(fromTarget, destinationTarget, eased);
            rotation.slerpQuaternions(fromRotation, toRotation, eased);
            offset.set(0, 0, distance).applyQuaternion(rotation);
            camera.position.copy(controls.target).add(offset);
            camera.up.set(0, 1, 0);
            camera.zoom = interpolateSolarZoom(fromZoom, toZoom, progress);
            camera.updateProjectionMatrix();
            controls.update();
            if (progress < 1) animation.current = { frame: requestAnimationFrame(tick), resolve };
            else {
              cameraStateStore.set(cameraStateKey(destination.id), {
                position: camera.position.toArray() as [number, number, number],
                target: controls.target.toArray() as [number, number, number],
                zoom: camera.zoom,
              });
              controls.enabled = true;
              controls.enableDamping = damping;
              animation.current = null;
              resolve(true);
            }
          };
          animation.current = { frame: requestAnimationFrame(tick), resolve };
        });
      },
    }),
    [camera, metadata, size, scene],
  );

  const applySnapshot = useCallback(
    (snapshot: CameraSnapshot) => {
      const controls = controlsRef.current;
      const damping = controls?.enableDamping;
      if (controls) {
        // Drain residual orbit/pan momentum before applying the exact stored view.
        controls.enableDamping = false;
        controls.update();
      }
      camera.position.fromArray(snapshot.position);
      camera.up.set(0, 1, 0);
      camera.zoom = snapshot.zoom;
      camera.updateProjectionMatrix();
      if (controls) {
        controls.target.fromArray(snapshot.target);
        controls.update();
        controls.enableDamping = damping ?? true;
      }
    },
    [camera],
  );

  const defaultSnapshot = useCallback((): CameraSnapshot => {
    const position = new Vector3(...metadata.camera.position);
    const target = new Vector3(...metadata.camera.target);
    const right = new Vector3()
      .setFromMatrixColumn(new Matrix4().lookAt(position, target, new Vector3(0, 1, 0)), 0)
      .multiplyScalar(rightGutter / (2 * fittedZoom));
    position.sub(target).multiplyScalar(fitFactor).add(target).add(right);
    target.add(right);
    return {
      position: position.toArray() as [number, number, number],
      target: target.toArray() as [number, number, number],
      zoom: metadata.camera.projection === "orthographic" ? fittedZoom : 1,
    };
  }, [metadata.camera, fitFactor, fittedZoom, rightGutter]);

  useEffect(() => {
    applySnapshot(cameraStateStore.get(storeKey) ?? defaultSnapshot());
  }, [applySnapshot, defaultSnapshot, storeKey]);

  useEffect(() => {
    if (initialResetVersion.current === resetVersion) return;
    initialResetVersion.current = resetVersion;
    cameraStateStore.delete(storeKey);
    applySnapshot(defaultSnapshot());
  }, [applySnapshot, defaultSnapshot, resetVersion, storeKey]);

  const saveCamera = () => {
    const target = controlsRef.current?.target.toArray() ?? [...metadata.camera.target];
    cameraStateStore.set(storeKey, {
      position: camera.position.toArray() as [number, number, number],
      target: target as [number, number, number],
      zoom: camera.zoom,
    });
  };

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      target={[...metadata.camera.target]}
      minDistance={metadata.camera.minDistance}
      maxDistance={metadata.camera.maxDistance}
      zoomToCursor
      zoomSpeed={isSolarWorld(metadata.id) ? 2 : 1}
      minZoom={isSolarWorld(metadata.id) ? zoomLimits.min : metadata.camera.minZoom}
      maxZoom={isSolarWorld(metadata.id) ? zoomLimits.max : metadata.camera.maxZoom}
      onEnd={saveCamera}
      // Damping continues after pointer-up; lateral comparisons need the last rendered view.
      onChange={storeKey === "stellar-neighborhood-comparison" ? saveCamera : undefined}
    />
  );
}

class SceneErrorBoundary extends Component<
  PropsWithChildren<{ fallback: ReactNode }>,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Scene host failed", error, info);
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
