"""Independent HEALPix coordinate/convention fixtures; no realization generation.
Run: python scripts/cmb-healpy-references.py (requires numpy and healpy).
"""
import json
from pathlib import Path
import healpy as hp
import numpy as np

root = Path(__file__).resolve().parents[1]
base = root / 'public/models/cmb'
meta = json.loads((base / 'metadata.json').read_text())
centers = []
for nside in sorted({asset['nside'] for asset in meta['assets'].values()} | {1, 2}):
    size = nside * nside
    for face in range(12):
        for index in sorted({0, size // 3, size - 1}):
            pixel = face * size + index
            centers.append(dict(nside=nside, pixel=pixel,
                                sky=list(hp.pix2vec(nside, pixel, nest=True))))
# Deterministic directions independent of pixel centers, exercising inverse mapping.
directions = []
for theta in [0.0, 0.0001, 0.3, float(np.arccos(2/3)), 1.2, 1.5708, 2.1, 2.9, float(np.pi)]:
    for phi in [0.0, 0.001, 0.9, 1.571, 3.141, 4.713, 6.28]:
        for nside in [32, 256]:
            directions.append(dict(nside=nside, theta=theta, phi=phi,
                                   pixel=int(hp.ang2pix(nside, theta, phi, nest=True))))
qa = meta['assets']['Q_nside32']
ua = meta['assets']['U_nside32']
q = np.fromfile(base / qa['file'], dtype='<f4')
u = np.fromfile(base / ua['file'], dtype='<f4')
polarization = []
rotation = np.array([[1, 0, 0], [0, 0, 1], [0, -1, 0]])
for pixel in [0, 731, 1023, 2048, 4096, 6143, 8192, 10001, 12287]:
    theta, phi = hp.pix2ang(qa['nside'], pixel, nest=True)
    sky = np.array(hp.pix2vec(qa['nside'], pixel, nest=True))
    et = rotation @ np.array([np.cos(theta)*np.cos(phi), np.cos(theta)*np.sin(phi), -np.sin(theta)])
    ep = rotation @ np.array([-np.sin(phi), np.cos(phi), 0])
    psi = float(np.arctan2(float(u[pixel]), float(q[pixel])) / 2)
    polarization.append(dict(nside=qa['nside'], pixel=pixel, q=float(q[pixel]), u=float(u[pixel]),
                             psi=psi, sky=sky.tolist(), world=(rotation @ sky).tolist(),
                             eTheta=et.tolist(), ePhi=ep.tolist(),
                             direction=(np.cos(psi)*et + np.sin(psi)*ep).tolist()))
output = dict(generator=f'healpy {hp.__version__}; pix2vec/pix2ang/ang2pix nest=True',
              convention='HEALPix COSMO (e_theta south, e_phi east); world=(sky.x,sky.z,-sky.y)',
              centers=centers, directions=directions, polarization=polarization)
(root / 'tests/fixtures/cmb-healpy.json').write_text(json.dumps(output, indent=2) + '\n')
print(f'{len(centers)} centers, {len(directions)} inverse directions, {len(polarization)} Q/U records')
