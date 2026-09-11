# Cosmic Web fixed-slab conventions

`public/data/bao/manifest.json` is the runtime source of truth for file paths,
shapes, byte sizes, C/axis order, full-box and BAO bounds, density encoding,
master-grid cell size, and redshift. `provenance.json` remains alongside it.

The renderer deliberately does not create a full-box 3D texture. It chooses the
manifest's slowest C-order axis as the slab normal, so the centered slab is one
contiguous byte range. The default High mode requests 12 central planes from
`full_512.u8` (3 MiB); the lighter Standard mode requests 6 from `full_256.u8`
(384 KiB). Both are symmetric and
46.875 Mpc/h thick—the closest shared even-plane support to the adopted roughly
50 Mpc/h target. A 200 response fallback streams past unwanted bytes and cancels
after the window, rather than materializing the full source in JavaScript memory.

The retained bytes remain encoded as the manifest's `log10(rho/rho_mean)` and
are uploaded to an R8 3D texture. A slab-only ray marcher supplies an illustrative
transfer function. The full-box outline and central BAO-cube outline derive their
relative render dimensions from manifest sizes; the existing BAO normalization
is not changed.

Ordinary BAO entry mounts only `BaoScene` and does not request either full-box
file. Pressing the explicit scale button mounts the destination slab, waits for
its range, then animates the shared-coordinate camera and layer opacity. Returning
mounts the cached BAO data before reversing the animation, then disposes the slab
texture after the scene switch. Manual zoom does not navigate.

The adopted 3 Gpc ladder ruler and the 147 Mpc BAO comparison ruler are vertical,
centered beside the slab's right edge, and lie in the slab's central plane. On explicit BAO/cosmic transition,
the 147 Mpc ruler's base is interpolated between scene positions while its SI
length and shared scene-unit scale remain fixed.
