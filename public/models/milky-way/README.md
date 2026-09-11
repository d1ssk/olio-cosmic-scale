# OpenSpace Milky Way volume

The lightweight asset is derived from the user-provided
`tmp/milkyway_volume_data/MilkyWayRGBAVolume1024x1024x128.raw`.
The original is 536,870,912 bytes (512 MiB); only the derived 8,388,608-byte
(8 MiB) file is served by this app. The temporary raw source, `MilkyWayPoints.off` and
`halo.png` are no longer retained locally. The latter two are unused.
To repeat preprocessing, obtain the source data and place it at the input path above.

## Provenance and license

[ATTRIBUTION.json](ATTRIBUTION.json) preserves the upstream asset metadata:
**Name:** Milky Way Volume; **Author:** OpenSpace Team;
**Description:** Volumetric rendering of Milky Way galaxy based on simulations from NAOJ;
**License:** MIT License; **URL:** https://openspaceproject.com.

Redistribute the lightweight `.rgba` together with its `.json` manifest,
`ATTRIBUTION.json`, and `LICENSE-OpenSpace.md`. The manifest embeds the upstream
metadata as well as links to both notices, and records the source/output hashes
and downsampling operation. The preparation script writes this information on
every generation and copies the attribution and full MIT notice even when an
alternative output directory is supplied. The derivative is a downsampled asset;
its reduced dimensions and processing method are documented here, not an upstream OpenSpace release.

- [OpenSpace Milky Way Volume documentation](https://docs.openspaceproject.com/latest/content/milky-way/galaxy/milky-way-volume/index.html)
  identifies version-1 volume data as a model based on NAOJ simulations and lists
  MIT licensing. Prepared by Jon Parker, Emil Axelsson, Carter Emmart, OpenSpace Team.
  This is a simulated visual model, not an observed Galactic map.
- Shader/transform implementation inspected at OpenSpace commit
  `cfa5b4d12f6fe52c7f3754ed5f590b587494e0e4`, accessed 2026-09-10:
  [galaxyraycast.glsl](https://github.com/OpenSpace/OpenSpace/blob/cfa5b4d12f6fe52c7f3754ed5f590b587494e0e4/modules/galaxy/shaders/galaxyraycast.glsl),
  [renderablegalaxy.cpp](https://github.com/OpenSpace/OpenSpace/blob/cfa5b4d12f6fe52c7f3754ed5f590b587494e0e4/modules/galaxy/rendering/renderablegalaxy.cpp).
- See [MIT license notice](LICENSE-OpenSpace.md). Our volume shader adapts the
  square decode, dust absorption tint and emission approach from this code.
- [Manifest](volume-256x256x32.json) records source and derived SHA-256 hashes.
  The source hash identifies the supplied local file; it was not checked against
  a separately downloaded upstream binary.

## Reproduction

With Python 3 and NumPy installed, from the repository root:

```sh
python3 scripts/prepare-milky-way-volume.py
python3 scripts/test-prepare-milky-way-volume.py
npx prettier --write public/models/milky-way/volume-256x256x32.json
```

Input dimensions are XYZ 1024×1024×128, interleaved RGBA8, channel fastest then X.
Output is XYZ 256×256×32, same ordering. Every independent RGBA channel follows
`uint8 / 255 → square → 4×4×4 box mean → sqrt → round ×255 → uint8`.
The preprocessing script uses four source Z slices per batch, avoiding a full
floating-point source allocation. It does not flip axes, premultiply RGB by alpha,
apply sRGB conversion, normalize brightness, or change physical support.

Runtime uses `Data3DTexture`, RGBA8/unsigned byte, no color space conversion,
linear filtering, clamped wrapping, no mipmaps. The shader squares **all four**
channels after filtering; alpha encodes dust, not directly a surface opacity.
CPU data and GPU texture each require about 8 MiB while mounted; textures are
explicitly disposed and pending requests aborted when leaving the volume variant.
The browser may separately cache the download.

## Geometry and renderer conventions

The volume support is 1.2e21 × 1.2e21 × 0.15e21 m, approximately
38.89 × 38.89 × 4.86 kpc. These are box dimensions, not a stellar disk boundary
or thickness. The existing 30 kpc reference, ruler positions, scene host,
camera, controls, 12-level hierarchy and single incoming bridge stay shared.

Texture axes first receive OpenSpace's `Rx(pi) * Ry(3.1248) * Rz(4.45741)`.
Galactic coordinates then map to this scene as `(-gX, gZ, gY)`: X toward the Sun,
Y toward Galactic north, origin at the Galactic center. This is a proper
rotation; texture Z becomes nearly scene Y with OpenSpace's slight tilt retained.
The Sun annotation remains the existing 8,178 pc / zero-height comparison,
not a match to a simulation particle. OpenSpace's Solar System parent translation
is omitted because this scene is already Galactocentric.

A back-face box shader reconstructs parallel orthographic rays from the near
plane and analytically intersects the volume. It integrates far-to-near emission
and tinted extinction. Defaults are step size 0.5/256 (half a voxel), absorption 200 and emission 250. Step size here means a fraction of physical box width; OpenSpace's adaptive
step rule is not reproduced. A 768-iteration bound covers the box diagonal at
this setting. OpenSpace's cylindrical mask (`x²+y² ≤ 0.7` in [-1,1] texture XY)
is retained. RGB uses an exponential display tone curve and output color-space
conversion, not photometric calibration. No random jitter, animation or points.

The prototype renders at the shared Canvas resolution, without OpenSpace's
separate 0.4-resolution raycasting pass or distance-dependent opacity fade.
Close and edge-on views may be blurry or show layer/marching bands after the
32-layer reduction. Translucent volume/ruler ordering is approximate: this pass
does not implement per-fragment depth compositing with ruler geometry. It never
writes an opaque depth for the whole bounding box. Brightness and color will
therefore differ from OpenSpace; mobile GPU performance still needs real-device
measurement. OpenSpace volume is the initial selection; the original simple renderer remains selectable.

## Local performance check

2026-09-10, headless Chrome / Apple M2 (ANGLE Metal), 1440×1000 viewport:
100-frame normal-view samples had ~16.7 ms median frames for both the simple
and volume variants. 120-frame edge-on and close edge-on samples were also
~16.7 ms (p95 ≤16.8 ms). Desktop-emulated 390/320×844 viewports were similar.
These are VSync-limited requestAnimationFrame timings, not isolated GPU timings
or physical mobile-device results. Across three switches, renderer texture
counts returned from 3 to 2, and geometry counts from 5 to 4.

### Stability revision

The current renderer synchronizes inverse model-view in `onBeforeRender`, samples
half a voxel apart on a galaxy-centered lattice, clips end cells, and integrates
within-cell emission/absorption analytically. It does not redistribute every
sample when the number of intersected cells changes. The 0.01 step remains only
an OpenSpace reference; the prototype now uses 0.5/256 with a 768-step bound.
The coarse-renderer measurements above are historical: current M2/Chrome frame
times are ~16.7 ms normally and ~33.3 ms in the enlarged edge-on stress view.
A 12-angle, 160×160 comparison to quarter-voxel sampling gave about 3.7% of the
coarse step's absolute RGB error. This is a numerical comparison, not a claim of
physical accuracy. Returning to the preceding scale first frames the physical
comparison bar, then follows the single bridge. Volume is the default; loading
or failed requests retain the simple fallback, and bridge arrivals wait for load
completion or failure before reveal.
