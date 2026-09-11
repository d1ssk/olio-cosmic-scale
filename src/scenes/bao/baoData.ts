export type BaoManifest = {
  bao_region: {
    bounds_mpc_h: [number, number];
    master_grid_slice: [number, number];
    matter_ngrid: number;
    size_mpc_h: number;
  };
  bao_statistic: {
    N_cut: number;
    full_box_halo_count: number;
    path: string;
  };
  box: {
    bounds_mpc_h: [number, number];
    coordinate_system: string;
    size_mpc_h: number;
  };
  files: Record<
    string,
    {
      byte_size: number;
      dtype: string;
      order?: string;
      path: string;
      sha256: string;
      shape: number[] | null;
    }
  >;
  matter: {
    assignment: string;
    axis_order: [string, string, string];
    cell_size_mpc_h: number;
    clip_max: number;
    clip_min: number;
    decode: string;
    dtype: string;
    grid_index_coordinate: string;
    master_ngrid: number;
    order: string;
    stored_quantity: string;
  };
  redshift: number;
  scientific_notes: string[];
  simulation: string;
  source: {
    dataset: string;
    particle_subsample: string;
    particle_subsample_fraction: number;
  };
  tracers: {
    binary_dtype: string;
    cleaned: boolean;
    count: number;
    mass_decode: string;
    mass_proxy: string;
    maximum_logM: number;
    maximum_selected_N: number;
    minimum_logM: number;
    minimum_selected_N: number;
    particle_mass_hmsun: number;
    position: string;
    position_decode: string;
    record_fields: string[];
    record_stride_bytes: number;
    sort: string;
    type: string;
  };
};

export type BaoStatistic = {
  box_size_mpc_h: number;
  counts: number[];
  dr_mpc_h: number;
  estimator: string;
  halo_N_min: number;
  halo_count: number;
  ngrid: number;
  r2_xi: number[];
  r_max_mpc_h: number;
  r_mpc_h: number[];
  xi: number[];
};

export type BaoDataset = {
  manifest: BaoManifest;
  halos: {
    positionsMpcH: Float32Array;
    logMassHMsun: Float32Array;
  };
  matter: Uint8Array;
  statistic: BaoStatistic;
};

const DATA_ROOT = `${import.meta.env.BASE_URL}data/bao/`;
let manifestPromise: Promise<BaoManifest> | undefined;
let statisticPromise: Promise<BaoStatistic> | undefined;
let datasetPromise: Promise<BaoDataset> | undefined;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function finiteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Invalid BAO manifest number: ${label}`);
  }
  return value;
}

function positionDecode(manifest: BaoManifest): {
  lower: number;
  span: number;
  quantizedMaximum: number;
} {
  const match = manifest.tracers.position_decode.match(
    /^x\s*=\s*(-?[\d.]+)\s*\+\s*([\d.]+)\s*\*\s*q\s*\/\s*(\d+)$/,
  );
  if (!match) throw new Error("Unsupported BAO position decode expression");
  return {
    lower: Number(match[1]),
    span: Number(match[2]),
    quantizedMaximum: Number(match[3]),
  };
}

export function matterGridCellOffset(manifest: BaoManifest): number {
  const match = manifest.matter.grid_index_coordinate.match(
    /\(i\s*\+\s*(\d+)\s*\/\s*(\d+)\)\s*\*\s*cell_size/,
  );
  if (!match || Number(match[2]) === 0) {
    throw new Error("Unsupported BAO grid coordinate expression");
  }
  return Number(match[1]) / Number(match[2]);
}

export function matterDensityBase(manifest: BaoManifest): number {
  const match = manifest.matter.decode.match(/rho_rel\s*=\s*([\d.]+)\s*\*\*\s*s/);
  if (!match || Number(match[1]) <= 0) {
    throw new Error("Unsupported BAO matter decode expression");
  }
  return Number(match[1]);
}

function assetUrl(path: string): string {
  if (!path || path.startsWith("/") || path.includes("..") || path.includes("\\")) {
    throw new Error(`Unsafe BAO asset path: ${path}`);
  }
  return `${DATA_ROOT}${path}`;
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`BAO data HTTP ${response.status}: ${url}`);
  return response.json() as Promise<unknown>;
}

async function fetchBytes(path: string, expectedBytes: number): Promise<ArrayBuffer> {
  const response = await fetch(assetUrl(path));
  if (!response.ok) throw new Error(`BAO data HTTP ${response.status}: ${path}`);
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength !== expectedBytes) {
    throw new Error(`BAO byte length mismatch for ${path}`);
  }
  return buffer;
}

export function validateBaoManifest(value: unknown): BaoManifest {
  if (!isRecord(value)) throw new Error("Invalid BAO manifest");
  const manifest = value as BaoManifest;
  const region = manifest.bao_region;
  const matterFile = manifest.files?.matter_bao_128;
  const haloFile = manifest.files?.halos_bao;
  if (!region || !matterFile || !haloFile || !manifest.matter || !manifest.tracers) {
    throw new Error("BAO manifest is missing required sections");
  }
  const [lower, upper] = region.bounds_mpc_h;
  if (
    !Number.isInteger(region.matter_ngrid) ||
    region.matter_ngrid <= 0 ||
    finiteNumber(upper, "bao_region upper bound") <=
      finiteNumber(lower, "bao_region lower bound") ||
    Math.abs(upper - lower - finiteNumber(region.size_mpc_h, "bao_region size")) > 1e-9
  ) {
    throw new Error("Invalid BAO region geometry");
  }
  const ngrid = region.matter_ngrid;
  if (
    matterFile.dtype !== "uint8" ||
    matterFile.order !== "C" ||
    matterFile.shape?.length !== 3 ||
    matterFile.shape.some((n) => n !== ngrid) ||
    matterFile.byte_size !== ngrid ** 3 ||
    manifest.matter.dtype !== matterFile.dtype ||
    manifest.matter.order !== matterFile.order ||
    [...manifest.matter.axis_order].sort().join() !== "x,y,z"
  ) {
    throw new Error("Unsupported BAO matter encoding");
  }
  if (
    haloFile.dtype !== "little-endian uint16" ||
    haloFile.order !== "C" ||
    haloFile.shape?.[0] !== manifest.tracers.count ||
    haloFile.shape?.[1] !== manifest.tracers.record_fields.length ||
    manifest.tracers.record_stride_bytes !== manifest.tracers.record_fields.length * 2 ||
    haloFile.byte_size !== manifest.tracers.count * manifest.tracers.record_stride_bytes ||
    manifest.tracers.record_fields.join() !== "qx,qy,qz,qlogM"
  ) {
    throw new Error("Unsupported BAO halo encoding");
  }
  if (
    finiteNumber(manifest.matter.clip_max, "matter clip_max") <=
      finiteNumber(manifest.matter.clip_min, "matter clip_min") ||
    finiteNumber(manifest.tracers.maximum_logM, "tracer maximum_logM") <=
      finiteNumber(manifest.tracers.minimum_logM, "tracer minimum_logM")
  ) {
    throw new Error("Invalid BAO decode range");
  }
  const position = positionDecode(manifest);
  if (
    position.quantizedMaximum !== 2 ** 16 - 1 ||
    Math.abs(position.lower - lower) > 1e-9 ||
    Math.abs(position.span - region.size_mpc_h) > 1e-9
  ) {
    throw new Error("BAO position decode conflicts with region or dtype");
  }
  matterGridCellOffset(manifest);
  matterDensityBase(manifest);
  return manifest;
}

export function validateBaoStatistic(value: unknown): BaoStatistic {
  if (!isRecord(value)) throw new Error("Invalid BAO statistic");
  const statistic = value as BaoStatistic;
  const length = statistic.r_mpc_h?.length;
  if (
    !length ||
    statistic.xi?.length !== length ||
    statistic.r2_xi?.length !== length ||
    statistic.counts?.length !== length ||
    !statistic.r_mpc_h.every(Number.isFinite) ||
    !statistic.r2_xi.every(Number.isFinite)
  ) {
    throw new Error("Invalid BAO correlation arrays");
  }
  return statistic;
}

export function decodeHaloBuffer(buffer: ArrayBuffer, manifest: BaoManifest) {
  const { tracers } = manifest;
  if (buffer.byteLength !== tracers.count * tracers.record_stride_bytes) {
    throw new Error("BAO halo buffer length does not match manifest");
  }
  const positionsMpcH = new Float32Array(tracers.count * 3);
  const logMassHMsun = new Float32Array(tracers.count);
  const view = new DataView(buffer);
  const position = positionDecode(manifest);
  const massSpan = tracers.maximum_logM - tracers.minimum_logM;
  const massField = tracers.record_fields.indexOf("qlogM");
  for (let i = 0; i < tracers.count; i += 1) {
    const offset = i * tracers.record_stride_bytes;
    for (let axis = 0; axis < 3; axis += 1) {
      const q = view.getUint16(offset + axis * 2, true);
      positionsMpcH[i * 3 + axis] =
        position.lower + (position.span * q) / position.quantizedMaximum;
    }
    const qlogM = view.getUint16(offset + massField * 2, true);
    logMassHMsun[i] = tracers.minimum_logM + (massSpan * qlogM) / position.quantizedMaximum;
  }
  return { positionsMpcH, logMassHMsun };
}

export function loadBaoManifest(): Promise<BaoManifest> {
  manifestPromise ??= fetchJson(`${DATA_ROOT}manifest.json`).then(validateBaoManifest);
  return manifestPromise;
}

export function loadBaoStatistic(): Promise<BaoStatistic> {
  statisticPromise ??= loadBaoManifest().then(async (manifest) => {
    const statistic = validateBaoStatistic(await fetchJson(assetUrl(manifest.bao_statistic.path)));
    if (
      statistic.halo_count !== manifest.bao_statistic.full_box_halo_count ||
      statistic.halo_N_min !== manifest.bao_statistic.N_cut
    ) {
      throw new Error("BAO statistic selection does not match manifest");
    }
    return statistic;
  });
  return statisticPromise;
}

export function loadBaoDataset(): Promise<BaoDataset> {
  datasetPromise ??= loadBaoManifest().then(async (manifest) => {
    const haloFile = manifest.files.halos_bao;
    const matterFile = manifest.files.matter_bao_128;
    const [haloBuffer, matterBuffer, statistic] = await Promise.all([
      fetchBytes(haloFile.path, haloFile.byte_size),
      fetchBytes(matterFile.path, matterFile.byte_size),
      loadBaoStatistic(),
    ]);
    return {
      manifest,
      halos: decodeHaloBuffer(haloBuffer, manifest),
      matter: new Uint8Array(matterBuffer),
      statistic,
    };
  });
  return datasetPromise;
}
