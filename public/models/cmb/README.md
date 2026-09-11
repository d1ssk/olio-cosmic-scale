# Supplied CMB realization

Copied verbatim from user-provided `tmp/web` on 2026-09-11. `metadata.json` is the
authoritative manifest. All ten binaries retain their original SHA-256 hashes.
The user identifies T/E/Q/U as one joint T/E realization generated with healpy.
The manifest declares Galactic coordinates, HEALPix NESTED, little-endian float32,
uK_CMB, B=0, no beam, seed 12345, and source spectra `input/cmb_cls.txt`.
That input file, pipeline and a redistribution license were not supplied.

Runtime uses standard T/E 256 and Q/U 64, lazily. Other resolutions are preserved
but not fetched by the current UI. See `src/scenes/observable-universe/README.md`
for display conventions and independent validation. No realization is generated
by the application.
