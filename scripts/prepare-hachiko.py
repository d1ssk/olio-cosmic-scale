"""Losslessly repack the supplied Sketchfab GLB's indices as uint16.

Usage: python3 scripts/prepare-hachiko.py '/path/to/hachiko-lighter.glb'
The smaller supplied GLB already has a lighter JPEG texture. Geometry, UVs,
materials, node transforms, and embedded author/license metadata are preserved.
"""
import json
from pathlib import Path
import struct
import sys

source = Path(sys.argv[1])
raw = source.read_bytes()
magic, version, total = struct.unpack_from('<III', raw)
assert (magic, version, total) == (0x46546C67, 2, len(raw))
json_size, json_type = struct.unpack_from('<II', raw, 12)
assert json_type == 0x4E4F534A
model = json.loads(raw[20:20 + json_size])
bin_size, bin_type = struct.unpack_from('<II', raw, 20 + json_size)
assert bin_type == 0x004E4942
binary = raw[28 + json_size:28 + json_size + bin_size]
views = model['bufferViews']
chunks = [binary[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']] for v in views]
for mesh in model['meshes']:
    for primitive in mesh['primitives']:
        accessor = model['accessors'][primitive['indices']]
        if accessor['componentType'] != 5125:
            continue
        view_index = accessor['bufferView']
        assert accessor.get('byteOffset', 0) == 0
        assert len(chunks[view_index]) == accessor['count'] * 4
        indices = struct.unpack('<' + 'I' * accessor['count'], chunks[view_index])
        assert max(indices) < 65535
        chunks[view_index] = struct.pack('<' + 'H' * len(indices), *indices)
        accessor['componentType'] = 5123
packed = bytearray()
for view, chunk in zip(views, chunks):
    packed.extend(b'\x00' * (-len(packed) % 4))
    view['byteOffset'] = len(packed)
    view['byteLength'] = len(chunk)
    packed.extend(chunk)
model['buffers'][0]['byteLength'] = len(packed)
packed.extend(b'\x00' * (-len(packed) % 4))
encoded = json.dumps(model, separators=(',', ':'), ensure_ascii=False).encode()
encoded += b' ' * (-len(encoded) % 4)
output = struct.pack('<III', magic, 2, 28 + len(encoded) + len(packed))
output += struct.pack('<II', len(encoded), json_type) + encoded
output += struct.pack('<II', len(packed), bin_type) + packed
path = Path('public/models/hachiko/hachiko.glb')
path.parent.mkdir(parents=True, exist_ok=True)
path.write_bytes(output)
print(f'{source}: {len(raw):,} bytes -> {path}: {len(output):,} bytes')
