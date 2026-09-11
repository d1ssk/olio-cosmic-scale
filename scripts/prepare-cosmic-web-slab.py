#!/usr/bin/env python3
"""Extract a byte-identical central slab from an authenticated source volume."""
import argparse
import hashlib
import json
import math
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--source", type=Path, required=True)
parser.add_argument("--lod", type=int, required=True)
parser.add_argument("--target-thickness-mpc-h", type=float, required=True)
parser.add_argument("--root", type=Path, default=Path("public/data/bao"))
args = parser.parse_args()
manifest = json.loads((args.root / "manifest.json").read_text())
source_key = f"matter_full_{args.lod}"
source = manifest["files"][source_key]
shape = source["shape"]
assert source["dtype"] == "uint8" and source["order"] == "C"
assert shape == [args.lod] * 3
data = args.source.read_bytes()
assert len(data) == source["byte_size"] == math.prod(shape)
assert hashlib.sha256(data).hexdigest() == source["sha256"], "Source SHA-256 mismatch"
assert math.isfinite(args.target_thickness_mpc_h) and args.target_thickness_mpc_h > 0
cell_size = manifest["box"]["size_mpc_h"] / shape[0]
# Match JS Math.round for positive values (not Python's bankers' rounding).
layers = min(shape[0], 2 * max(1, math.floor(args.target_thickness_mpc_h / cell_size / 2 + 0.5)))
first = (shape[0] - layers) // 2
start = first * shape[1] * shape[2]
end = (first + layers) * shape[1] * shape[2]
slab = data[start:end]
path = f"matter/slab_{args.lod}.u8"
descriptor = {
    "path": path,
    "byte_size": len(slab),
    "sha256": hashlib.sha256(slab).hexdigest(),
    "dtype": source["dtype"],
    "order": source["order"],
    "shape": [layers, shape[1], shape[2]],
    "axis_order": manifest["matter"]["axis_order"],
    "source_key": source_key,
    "source_path": source["path"],
    "source_sha256": source["sha256"],
    "source_byte_size": source["byte_size"],
    "source_byte_start": start,
    "source_byte_end_exclusive": end,
    "first_layer": first,
    "layer_count": layers,
    "thickness_mpc_h": layers * cell_size,
}
(args.root / path).write_bytes(slab)
(args.root / "cosmic-slab.json").write_text(json.dumps(descriptor, indent=2) + "\n")
print(f"{path}: {len(slab)} bytes; source [{start}, {end}); SHA-256 {descriptor['sha256']}")
