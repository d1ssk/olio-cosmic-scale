# Cosmic Web fixed-slab conventions

`public/data/bao/manifest.json` is the runtime source of truth for file paths,
shapes, byte sizes, C/axis order, full-box and BAO bounds, density encoding,
master-grid cell size, and redshift. `provenance.json` remains alongside it.

The renderer deliberately does not create a full-box 3D texture. It chooses the
manifest's slowest C-order axis as the slab normal, so the centered slab is one
contiguous byte range. The default High mode loads 12 central planes pre-extracted byte-for-byte from
`full_512.u8` as `matter/slab_512.u8` (3 MiB); the lighter Standard mode requests 6 from `full_256.u8`
(384 KiB). Both are symmetric and
46.875 Mpc/h thick—the closest shared even-plane support to the adopted roughly
50 Mpc/h target. For Standard, a 200 response fallback streams past unwanted bytes and cancels
after the window, rather than materializing the full source in JavaScript memory.

The retained bytes remain encoded as the manifest's `log10(rho/rho_mean)` and
are uploaded to an R8 3D texture. A slab-only ray marcher supplies an illustrative
transfer function. The full-box outline and central BAO-cube outline derive their
relative render dimensions from manifest sizes; the existing BAO normalization
is not changed.

Ordinary BAO entry mounts only `BaoScene` and does not request either density asset. Pressing the explicit scale button mounts the destination slab, waits for
its bytes, then animates the shared-coordinate camera and layer opacity. Returning
mounts the cached BAO data before reversing the animation, then disposes the slab
texture after the scene switch. Manual zoom does not navigate.

The adopted 3 Gpc ladder ruler and the 147 Mpc BAO comparison ruler are vertical,
centered beside the slab's right edge, and lie in the slab's central plane. On explicit BAO/cosmic transition,
the 147 Mpc ruler's base is interpolated between scene positions while its SI
length and shared scene-unit scale remain fixed.

## Preparing the distributable high-quality slab

The 128 MiB original is too large for ordinary GitHub files. It is not deployed
or tracked. Keep it locally outside public; `manifest.json` and
`provenance.json` remain the unmodified source declarations.
`cosmic-slab.json` records the derived file SHA-256, original SHA-256,
C-order shape/axis order and exact half-open source byte window
[65,536,000, 68,681,728), layers 250–261 inclusive. The runtime checks that the
descriptor matches the scientific slab window and rejects mismatches or
truncated responses. High requests the complete 3,145,728-byte file with no
Range header or full-source fallback. The grid, values, density encoding,
physical thickness, GPU texture and scene transitions are unchanged.

Reproduce from an original matching the source manifest:

```sh
python3 scripts/prepare-cosmic-web-slab.py --source /path/to/full_512.u8 --lod 512 --target-thickness-mpc-h 50
```

The explicit 50 Mpc/h target matches `COSMIC_SLAB_TARGET_MPC_H`; source
dimensions and the even-plane rounding determine the actual support.
The extractor checks the original SHA-256 before writing any derived asset.
Tests verify the slab's SHA-256, coordinate window, direct-fetch path and
failure handling. Standard continues using the original 16 MiB 256³ source.
