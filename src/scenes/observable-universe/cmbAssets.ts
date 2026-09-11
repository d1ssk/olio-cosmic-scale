export type CmbField = "T" | "E" | "Q" | "U";
export type CmbAsset = {
  file: string;
  nside: number;
  npix: number;
  byte_length: number;
  effective_lmax: number;
  mean: number;
  std: number;
  sha256: string;
};
export type CmbMetadata = {
  format_version: number;
  pixelization: string;
  ordering: string;
  dtype: string;
  endianness: string;
  coordinates: string;
  units: string;
  fields: Record<CmbField, { nsides: number[]; spin: number }>;
  assets: Record<string, CmbAsset>;
};
export type CmbMap = { asset: CmbAsset; values: Float32Array };

export function validateMetadata(value: CmbMetadata): CmbMetadata {
  if (
    value.format_version !== 1 ||
    value.pixelization !== "HEALPix" ||
    value.ordering !== "NESTED" ||
    value.dtype !== "float32" ||
    value.endianness !== "little" ||
    value.coordinates !== "Galactic" ||
    value.units !== "uK_CMB"
  )
    throw new Error("Unsupported CMB metadata convention");
  for (const asset of Object.values(value.assets)) {
    if (
      !Number.isInteger(asset.nside) ||
      asset.nside < 1 ||
      (asset.nside & (asset.nside - 1)) !== 0 ||
      asset.npix !== 12 * asset.nside ** 2 ||
      asset.byte_length !== asset.npix * 4 ||
      !Number.isFinite(asset.mean) ||
      !Number.isFinite(asset.std) ||
      asset.std <= 0 ||
      !/^[\w-]+\.f32$/.test(asset.file)
    )
      throw new Error("Invalid CMB asset metadata");
  }
  return value;
}

export function decodeCmbMap(buffer: ArrayBuffer, asset: CmbAsset): CmbMap {
  if (buffer.byteLength !== asset.byte_length)
    throw new Error(`CMB ${asset.file}: byte length mismatch`);
  // Raw files explicitly declare little endian; retain physical floats even on a big-endian host.
  const values = new Float32Array(buffer);
  if (new Uint8Array(new Uint32Array([1]).buffer)[0] !== 1) {
    const view = new DataView(buffer);
    for (let i = 0; i < values.length; i++) values[i] = view.getFloat32(i * 4, true);
  }
  if (values.length !== asset.npix) throw new Error(`CMB ${asset.file}: pixel count mismatch`);
  let mean = 0,
    m2 = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (!Number.isFinite(v)) throw new Error(`CMB ${asset.file}: nonfinite pixel ${i}`);
    const delta = v - mean;
    mean += delta / (i + 1);
    m2 += delta * (v - mean);
  }
  const std = Math.sqrt(m2 / values.length);
  const tolerance = Math.max(1e-6, asset.std * 1e-4);
  if (Math.abs(mean - asset.mean) > tolerance || Math.abs(std - asset.std) > tolerance) {
    throw new Error(`CMB ${asset.file}: statistics mismatch (mean=${mean}, std=${std})`);
  }
  return { asset, values };
}

/** One immutable manifest and cached promises bind every field to the same supplied realization. */
export function createCmbLoader(base = `${import.meta.env.BASE_URL}models/cmb/`, fetcher = fetch) {
  let manifest: Promise<CmbMetadata> | undefined;
  const maps = new Map<string, Promise<CmbMap>>();
  const metadata = () =>
    (manifest ??= fetcher(`${base}metadata.json`).then(async (response) => {
      if (!response.ok) throw new Error(`CMB metadata HTTP ${response.status}`);
      return validateMetadata((await response.json()) as CmbMetadata);
    }));
  return {
    metadata,
    async load(field: CmbField): Promise<CmbMap> {
      const meta = await metadata();
      // Standard is a display preference only. All file/shape/bandlimit data come from metadata.
      const preferred = field === "T" || field === "E" ? 256 : 64;
      const available = meta.fields[field].nsides;
      const nside = available.includes(preferred) ? preferred : Math.min(...available);
      const asset = Object.entries(meta.assets).find(
        ([key, item]) => key.startsWith(`${field}_`) && item.nside === nside,
      )?.[1];
      if (!asset) throw new Error(`CMB missing ${field} asset`);
      if (!maps.has(asset.file)) {
        maps.set(
          asset.file,
          fetcher(`${base}${asset.file}`).then(async (response) => {
            if (!response.ok) throw new Error(`CMB ${asset.file}: HTTP ${response.status}`);
            return decodeCmbMap(await response.arrayBuffer(), asset);
          }),
        );
      }
      return maps.get(asset.file)!;
    },
  };
}
export const cmbLoader = createCmbLoader();
