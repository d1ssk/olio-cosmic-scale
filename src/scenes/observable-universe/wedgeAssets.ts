import { GIGAPARSEC_METERS } from "../../physics/constants";
import { OBSERVABLE_UNIVERSE_METERS_PER_UNIT } from "./observableUniverseModel";

export const WEDGE_UNITS_PER_GPC = GIGAPARSEC_METERS / OBSERVABLE_UNIVERSE_METERS_PER_UNIT;
export type WedgeMetadata = {
  geometry: {
    chi_max_gpc: number;
    opening_angle_deg: number;
    half_angle_deg: number;
    thickness_gpc: number;
    half_thickness_gpc: number;
    observer: number[];
    axis_convention: string;
  };
  counts: { matter_count: number; tracer_count: number };
  formats: {
    matter_stride: number;
    tracer_stride: number;
    matter_fields: string[];
    tracer_fields: string[];
    [key: string]: unknown;
  };
  radial_ticks: Array<{
    z: number;
    chi_gpc: number;
    lookback_time_gyr: number;
    scale_factor: number;
  }>;
  [key: string]: unknown;
};
export type WedgeLayer = {
  positions: Float32Array;
  sizes: Float32Array;
  intensities: Float32Array;
};
export type WedgeAsset = { metadata: WedgeMetadata; matter: WedgeLayer; tracer: WedgeLayer };

export function validateWedgeMetadata(value: unknown): WedgeMetadata {
  const m = value as WedgeMetadata;
  const g = m?.geometry;
  if (
    !g ||
    g.axis_convention !== "right-handed; +Z wedge axis, opening in XZ, thickness along Y" ||
    !Array.isArray(g.observer) ||
    g.observer.length !== 3 ||
    g.observer.some((v) => v !== 0) ||
    ![
      g.chi_max_gpc,
      g.opening_angle_deg,
      g.half_angle_deg,
      g.thickness_gpc,
      g.half_thickness_gpc,
    ].every((v) => Number.isFinite(v) && v > 0) ||
    g.opening_angle_deg >= 180 ||
    g.half_angle_deg * 2 !== g.opening_angle_deg ||
    g.half_thickness_gpc * 2 !== g.thickness_gpc ||
    !Array.isArray(m.radial_ticks) ||
    !m.radial_ticks.every((t) =>
      [t.z, t.chi_gpc, t.lookback_time_gyr, t.scale_factor].every(Number.isFinite),
    )
  ) {
    throw new Error("Wedge metadata: invalid geometry, coordinate convention or radial ticks");
  }
  for (const kind of ["matter", "tracer"] as const) {
    const count = m.counts?.[`${kind}_count`];
    const stride = m.formats?.[`${kind}_stride`];
    const fields = m.formats?.[`${kind}_fields`];
    const file = kind === "matter" ? "matter_splats.f32" : "tracer_points.f32";
    const format = m.formats?.[file] as
      { dtype?: string; shape?: number[]; stride_bytes?: number; fields?: string[] } | undefined;
    if (
      !Number.isSafeInteger(count) ||
      count <= 0 ||
      !Number.isSafeInteger(stride) ||
      stride < 5 ||
      !Array.isArray(fields) ||
      fields.length !== stride ||
      new Set(fields).size !== stride ||
      !["x_gpc", "y_gpc", "z_gpc", "size_gpc", kind === "matter" ? "alpha" : "brightness"].every(
        (f) => fields.includes(f),
      ) ||
      format?.dtype !== "little-endian float32" ||
      format.shape?.[0] !== count ||
      format.shape?.[1] !== stride ||
      format.stride_bytes !== stride * 4 ||
      JSON.stringify(format.fields) !== JSON.stringify(fields)
    ) {
      throw new Error(`Wedge metadata: invalid ${kind} format`);
    }
  }
  return m;
}

export function decodeWedgeLayer(
  buffer: ArrayBuffer,
  metadata: WedgeMetadata,
  kind: "matter" | "tracer",
): WedgeLayer {
  const count = metadata.counts[`${kind}_count`];
  const stride = metadata.formats[`${kind}_stride`];
  const fields = metadata.formats[`${kind}_fields`];
  if (buffer.byteLength !== count * stride * 4)
    throw new Error(
      `Wedge ${kind}: expected ${count * stride * 4} bytes, received ${buffer.byteLength}`,
    );
  const view = new DataView(buffer);
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const intensities = new Float32Array(count);
  const offsets = [
    "x_gpc",
    "y_gpc",
    "z_gpc",
    "size_gpc",
    kind === "matter" ? "alpha" : "brightness",
  ].map((f) => fields.indexOf(f));
  for (let i = 0; i < count; i++) {
    for (let field = 0; field < offsets.length; field++) {
      const v = view.getFloat32((i * stride + offsets[field]) * 4, true);
      if (!Number.isFinite(v) || (field >= 3 && v < 0))
        throw new Error(`Wedge ${kind}: invalid value at row ${i}`);
      if (field < 3) positions[i * 3 + field] = v;
      else if (field === 3) sizes[i] = v;
      else intensities[i] = v;
    }
  }
  return { positions, sizes, intensities };
}

let cached: Promise<WedgeAsset> | undefined;
export function loadWedgeAsset(): Promise<WedgeAsset> {
  cached ??= (async () => {
    const base = `${import.meta.env.BASE_URL}models/observable-universe-wedge/`;
    const fetchFile = async (name: string) => {
      const response = await fetch(base + name);
      if (!response.ok) throw new Error(`Wedge ${name}: HTTP ${response.status}`);
      return response;
    };
    const metadata = validateWedgeMetadata(await (await fetchFile("metadata.json")).json());
    const [matter, tracer] = await Promise.all([
      fetchFile("matter_splats.f32")
        .then((r) => r.arrayBuffer())
        .then((b) => decodeWedgeLayer(b, metadata, "matter")),
      fetchFile("tracer_points.f32")
        .then((r) => r.arrayBuffer())
        .then((b) => decodeWedgeLayer(b, metadata, "tracer")),
    ]);
    return { metadata, matter, tracer };
  })();
  return cached;
}
