/* React Three Fiber exposes mutable Three.js camera/control objects by design. */
/* eslint-disable react-hooks/immutability */
import { Canvas, useThree } from "@react-three/fiber";
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
} from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { cameraStateKey, cameraStateStore, type CameraSnapshot } from "../../app/cameraState";
import { translate, type Locale } from "../../i18n";
import type { SceneMetadata } from "../types";

type SceneHostProps = PropsWithChildren<{
  metadata: SceneMetadata;
  locale: Locale;
  resetVersion: number;
}>;

export function SceneHost({
  metadata,
  locale,
  resetVersion,
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
          <CameraController metadata={metadata} resetVersion={resetVersion} />
        </Canvas>
      </div>
    </SceneErrorBoundary>
  );
}

function CameraController({
  metadata,
  resetVersion,
}: {
  metadata: SceneMetadata;
  resetVersion: number;
}): React.JSX.Element {
  const { camera, size } = useThree();
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
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const initialResetVersion = useRef(resetVersion);
  const storeKey = cameraStateKey(metadata.id);

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

  const defaultSnapshot = useCallback(
    (): CameraSnapshot => ({
      position: metadata.camera.position.map(
        (value, i) => metadata.camera.target[i] + (value - metadata.camera.target[i]) * fitFactor,
      ) as [number, number, number],
      target: metadata.camera.target,
      zoom: metadata.camera.projection === "orthographic" ? 60 : 1,
    }),
    [metadata.camera, fitFactor],
  );

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
      minZoom={metadata.camera.minZoom}
      maxZoom={metadata.camera.maxZoom}
      onEnd={saveCamera}
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
