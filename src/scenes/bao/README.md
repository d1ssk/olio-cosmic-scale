# BAO scene data and conventions

The runtime loader reads `public/data/bao/manifest.json` first. File paths, shapes,
byte sizes, axis order, coordinate bounds, quantization ranges, density decoding,
redshift, tracer type and caveats come from that manifest; rendering modules do
not repeat those values. `provenance.json` preserves the supplied generation
environment and input inventory.

The 500 Mpc/h subvolume is normalized to a ten-unit render cube without changing
its Abacus-centered Cartesian axes. Halo records are decoded with `DataView` as
little-endian uint16 and rendered in one point draw call. The matter layer is a
movable, one-cell z slice extracted using the manifest's C-order strides and axis
order, then uploaded as a single-channel GPU texture. The shader applies the
manifest's log-density range before its explicitly illustrative color/opacity map.

The hierarchy keeps its adopted 147 Mpc reference. In this scene two render units
correspond to the approximately 100 Mpc/h BAO feature; this mapping compares the
two conventional unit expressions and does not supply a new value of `h`.
The 147 Mpc ruler and the preceding 16.5 Mpc Virgo ruler are centered vertically
beside the far, screen-right vertical cube edge in the default view. They are
parallel and slightly separated outward. The 16.5 Mpc ruler is the physical
carrier for the direct Virgo ↔ BAO transition in both directions; an explored BAO
view recovers its default framing only when that carrier is outside the view.
`baoPeak` finds the local maximum of the supplied `r²ξ(r)` in the BAO-scale portion
of the tabulation. The optional sphere and radius use that measured separation and
are a statistical guide centered on the scene origin, not a claimed shell around
an individual halo. `BaoGuideLayer` is intentionally separate from the halo and
matter renderers so a future stacking layer can replace or augment it.
