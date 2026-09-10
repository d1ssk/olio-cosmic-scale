import { OrbitLine } from "../solar-system/OrbitLine";
import { useEffect, useMemo } from "react";
import { Body } from "astronomy-engine";
import { translate } from "../../i18n";
import type { ScaleSceneProps } from "../types";
import { SunSphere } from "../sun/SunSphere";
import { earthSunModel } from "./earthSunModel";
import { Planet } from "../solar-system/Planet";
import { BodyAnnotation } from "../solar-system/BodyAnnotation";
import { SolarRulers } from "../solar-system/SolarRulers";
import { SolarCameraRig } from "../solar-system/SolarCameraRig";
export default function EarthSunScene({
  metadata,
  locale,
  onReady,
  observationDate,
}: ScaleSceneProps) {
  const model = useMemo(
    () => earthSunModel(new Date(observationDate!), metadata.metersPerSceneUnit),
    [observationDate, metadata.metersPerSceneUnit],
  );
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return (
    <group name="continuous-solar-world">
      <SolarCameraRig model={model} />
      <SunSphere radius={model.sunRadius} />
      <BodyAnnotation
        position={[0, 0, 0]}
        label={translate(locale, "scene.sun.title")}
        name="Sun"
        metersPerSceneUnit={metadata.metersPerSceneUnit}
      />
      {model.bodies.map((body) => (
        <group key={body.body}>
          <OrbitLine body={body} scale={metadata.metersPerSceneUnit} />
          <Planet model={body} metersPerSceneUnit={metadata.metersPerSceneUnit} />
          <BodyAnnotation
            position={body.position}
            label={translate(locale, body.labelKey)}
            name={body.body}
            orbitMeters={Math.hypot(...body.positionMeters)}
            metersPerSceneUnit={metadata.metersPerSceneUnit}
            below={body.body === Body.Moon}
          />
        </group>
      ))}
      <SolarRulers metadata={metadata} locale={locale} model={model} />
    </group>
  );
}
