import type { SceneMetadata } from "../types";
import { translate, type Locale } from "../../i18n";
import { AU_METERS } from "../../physics/constants";
import { SUN_DIAMETER_METERS } from "../sun/sunData";
import { SceneReferenceBar } from "../shared/SceneReferenceBar";
import { OUTER_REFERENCE_METERS, solarDiameterOpacity } from "./solarScale";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { SolarModel } from "./SolarCameraRig";
import { EARTH_DIAMETER_METERS } from "../earth/earthData";
import { closeupRulerOpacity } from "./solarCamera";
/** World-fixed rulers, plus an exact-length camera-plane comparison for close inspection. */
export function SolarRulers({
  metadata,
  locale,
  model,
}: {
  metadata: SceneMetadata;
  locale: Locale;
  model: SolarModel;
}) {
  const { camera, size } = useThree();
  const closeupOpacity = (earth = false) => {
    let diameter = 0;
    for (const body of model.bodies) {
      const p = new Vector3(...body.position).project(camera);
      const radiusPixels = body.radius * camera.zoom;
      if (
        Math.abs(p.x) <= 1 + (2 * radiusPixels) / size.width &&
        Math.abs(p.y) <= 1 + (2 * radiusPixels) / size.height &&
        Math.abs(p.z) <= 1
      )
        diameter = Math.max(diameter, 2 * radiusPixels);
    }
    return closeupRulerOpacity(diameter, earth);
  };
  const outer = metadata.id === "solar-system";
  return (
    <>
      <SceneReferenceBar
        metadata={{ ...metadata, referenceLengthMeters: AU_METERS, preferredPrimaryUnit: "AU" }}
        locale={locale}
        barName="solar-au-world-bar"
        base={model.referenceBase}
        kind={outer ? "auxiliary" : "reference"}
        direction={[1, 0, 0]}
        labelAlign="center"
        labelOffsetY={18}
        labelOffsetX={(pixels) => Math.min(65, pixels / 4)}
      />
      <SceneReferenceBar
        metadata={{
          ...metadata,
          referenceLengthMeters: SUN_DIAMETER_METERS,
          preferredPrimaryUnit: "Gm",
        }}
        locale={locale}
        barName="solar-diameter-world-bar"
        base={model.comparisonBase}
        kind="comparison"
        direction={[1, 0, 0]}
        labelAlign="center"
        labelOffsetY={size.height < 400 ? 6 : 28}
        opacityForExtent={solarDiameterOpacity}
      />
      <SceneReferenceBar
        metadata={{
          ...metadata,
          referenceLengthMeters: OUTER_REFERENCE_METERS,
          preferredPrimaryUnit: "AU",
        }}
        locale={locale}
        barName="solar-outer-world-bar"
        base={model.outerReferenceBase}
        kind={outer ? "reference" : "auxiliary"}
        direction={[1, 0, 0]}
        labelAlign="center"
        labelOffsetY={12}
      />
      <SceneReferenceBar
        metadata={{
          ...metadata,
          referenceLengthMeters: SUN_DIAMETER_METERS,
          preferredPrimaryUnit: "Gm",
        }}
        locale={locale}
        base={[0, 0, 0]}
        kind="auxiliary"
        screenBottom={26}
        labelAlign="center"
        labelOffsetY={12}
        labelSuffix={translate(locale, "solar.sunDiameter")}
        opacityForExtent={() => closeupOpacity()}
      />
      <SceneReferenceBar
        metadata={{
          ...metadata,
          referenceLengthMeters: EARTH_DIAMETER_METERS,
          preferredPrimaryUnit: "km",
        }}
        locale={locale}
        base={[0, 0, 0]}
        kind="auxiliary"
        screenBottom={64}
        labelAlign="center"
        labelOffsetY={12}
        labelSuffix={translate(locale, "solar.earthDiameter")}
        opacityForExtent={() => closeupOpacity(true)}
      />
    </>
  );
}
