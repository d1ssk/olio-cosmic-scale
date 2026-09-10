#!/usr/bin/env python3
"""Reduce OpenSpace sqrt-encoded RGBA in linear space; Python 3 + NumPy.

Usage: python3 scripts/prepare-milky-way-volume.py [source.raw] [output.raw]
Reads four Z slices at a time (16 MiB input), never the entire decoded source.
Byte layout is Z,Y,X,RGBA: channel then X vary fastest. No axis flips.
"""
import hashlib
import json
import shutil
from pathlib import Path
import sys
import numpy as np

SOURCE_SHAPE = (128, 1024, 1024, 4)
FACTOR = 4
ASSET_DIRECTORY = Path(__file__).resolve().parents[1] / "public/models/milky-way"


def reduce_block(block, factor=FACTOR):
    """Decode → box average per channel → re-encode, rounded to nearest byte."""
    z, y, x, channels = block.shape
    if channels != 4 or any(d % factor for d in (z, y, x)):
        raise ValueError("Expected RGBA dimensions divisible by reduction factor")
    linear = np.square(block.astype(np.float32) / 255.0)
    mean = linear.reshape(z // factor, factor, y // factor, factor,
                          x // factor, factor, channels).mean(axis=(1, 3, 5))
    return np.rint(np.sqrt(mean) * 255.0).astype(np.uint8)


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(8 * 1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def main():
    source = Path(sys.argv[1] if len(sys.argv) > 1 else
                  'tmp/milkyway_volume_data/MilkyWayRGBAVolume1024x1024x128.raw')
    output = Path(sys.argv[2] if len(sys.argv) > 2 else
                  'public/models/milky-way/volume-256x256x32.rgba')
    expected = int(np.prod(SOURCE_SHAPE))
    if source.stat().st_size != expected:
        raise ValueError(f'Expected {expected} source bytes')
    raw = np.memmap(source, mode='r', dtype=np.uint8, shape=SOURCE_SHAPE)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open('wb') as stream:
        for z in range(0, SOURCE_SHAPE[0], FACTOR):
            stream.write(reduce_block(raw[z:z + FACTOR]).tobytes())
    metadata = write_metadata(source, output)
    print(json.dumps(metadata, indent=2))


def write_metadata(source, output):
    """Package upstream attribution and MIT notice alongside each derived volume."""
    output.parent.mkdir(parents=True, exist_ok=True)
    attribution = json.loads((ASSET_DIRECTORY / 'ATTRIBUTION.json').read_text())
    for filename in ('ATTRIBUTION.json', 'LICENSE-OpenSpace.md'):
        original = ASSET_DIRECTORY / filename
        destination = output.parent / filename
        if original.resolve() != destination.resolve():
            shutil.copyfile(original, destination)
    metadata = {
        'upstreamAsset': attribution,
        'attributionFile': 'ATTRIBUTION.json',
        'licenseFile': 'LICENSE-OpenSpace.md',
        'source': source.name, 'sourceSha256': sha256(source),
        'sourceDimensionsXYZ': [1024, 1024, 128],
        'output': output.name, 'outputSha256': sha256(output),
        'dimensionsXYZ': [256, 256, 32], 'channels': 'RGBA', 'type': 'uint8',
        'layout': 'Z,Y,X,RGBA (X fastest voxel axis)',
        'encoding': 'sqrt; square all four channels in shader',
        'reduction': '4x4x4 box mean in decoded linear space, sqrt and round to uint8',
        'bytes': output.stat().st_size,
        'physicalSizeMetersXYZ': [1.2e21, 1.2e21, 0.15e21],
    }
    output.with_suffix('.json').write_text(json.dumps(metadata, indent=2) + '\n')
    return metadata


if __name__ == '__main__':
    main()
