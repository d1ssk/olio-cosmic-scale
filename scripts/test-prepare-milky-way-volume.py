#!/usr/bin/env python3
"""Focused preprocessing tests; run with Python 3 + NumPy."""
import importlib.util
from pathlib import Path
import unittest
import json
import tempfile
import numpy as np

spec = importlib.util.spec_from_file_location('prepare', Path(__file__).with_name('prepare-milky-way-volume.py'))
prepare = importlib.util.module_from_spec(spec)
spec.loader.exec_module(prepare)


class VolumeReductionTests(unittest.TestCase):
    def test_decode_before_average_including_alpha(self):
        data = np.zeros((4, 4, 4, 4), dtype=np.uint8)
        data[:2, :, :, :] = 255
        reduced = prepare.reduce_block(data)
        # Half full linear intensity encodes to sqrt(0.5)*255 ≈180, never 128.
        self.assertTrue(np.all(reduced == 180))
        self.assertLess(abs((int(reduced[0, 0, 0, 3]) / 255) ** 2 - 0.5), 0.003)

    def test_preserve_axis_and_channel_order_and_constant_blocks(self):
        data = np.zeros((8, 8, 8, 4), dtype=np.uint8)
        for z in range(2):
            for y in range(2):
                for x in range(2):
                    data[z*4:(z+1)*4, y*4:(y+1)*4, x*4:(x+1)*4] = [z*100, y*90, x*80, 255]
        result = prepare.reduce_block(data)
        for z in range(2):
            for y in range(2):
                for x in range(2):
                    self.assertEqual(result[z,y,x].tolist(), [z*100, y*90, x*80, 255])

    def test_committed_artifact_integrity(self):
        asset = Path(__file__).resolve().parents[1] / 'public/models/milky-way/volume-256x256x32.rgba'
        manifest = json.loads(asset.with_suffix('.json').read_text())
        self.assertEqual(asset.stat().st_size, 256 * 256 * 32 * 4)
        self.assertEqual(prepare.sha256(asset), manifest['outputSha256'])

    def test_alternative_output_keeps_upstream_metadata_and_full_license(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / 'source.raw'
            output = root / 'export' / 'volume.rgba'
            source.write_bytes(bytes([0, 64, 128, 255]))
            output.parent.mkdir()
            output.write_bytes(bytes([0, 64, 128, 255]))
            manifest = prepare.write_metadata(source, output)
            upstream = json.loads((prepare.ASSET_DIRECTORY / 'ATTRIBUTION.json').read_text())
            self.assertEqual(manifest['upstreamAsset'], upstream)
            self.assertEqual(upstream['Author'], 'OpenSpace Team')
            self.assertEqual(upstream['License'], 'MIT License')
            self.assertIn('simulations from NAOJ', upstream['Description'])
            for field in ('attributionFile', 'licenseFile'):
                filename = manifest[field]
                self.assertEqual((output.parent / filename).read_bytes(),
                                 (prepare.ASSET_DIRECTORY / filename).read_bytes())
            self.assertEqual(json.loads(output.with_suffix('.json').read_text()), manifest)

    def test_reject_partial_blocks(self):
        with self.assertRaises(ValueError):
            prepare.reduce_block(np.zeros((3, 4, 4, 4), dtype=np.uint8))


if __name__ == '__main__':
    unittest.main()
