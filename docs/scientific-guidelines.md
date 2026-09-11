# Scientific data and rendering guidelines

## Accuracy, provenance, and uncertainty

Prefer real values for positions, physical sizes, densities, and cosmological scales where data exists. Simplified/model-based rendering is acceptable for clarity or performance only when its status is discoverable. Distinguish measured/catalog-derived, conventionally adopted, model-dependent, and schematic information.

Do not invent uncertain values when authoritative sourcing is unavailable. Use a conservative source-needed placeholder or schedule a source-validation pass. Prefer IAU definitions/constants, NASA/ESA mission documentation, Gaia catalog/documentation, refereed papers, major survey releases, and standard cosmology references over unsourced educational summaries.

Every nontrivial dataset carries source metadata such as ID, title, organization, URL/citation, access date, and notes; objects reference source IDs. Centralize datasets and constants outside render components.

When a concept has no unique boundary—Solar System size, Milky Way edge, Local Group boundary, spiral arms, Galactic-center density, BAO convention, or observable-universe distance—say “adopted definition” or “this visualization uses,” never imply false uniqueness.

## Coordinate integrity

Document each scene's origin, axes, reference frame, epoch where relevant, and transform into normalized scene units. Test transforms independently. Object labels and geometry consume the same scene model; labels never justify moving objects away from their data positions.

## Physical size versus visible representation

Actual radii frequently become subpixel. Never enlarge an object silently. Encode one of:

- `physical`: geometry uses the physical radius;
- `marker`: explicit screen-space symbol, not to scale;
- `exaggerated`: physical radius multiplied by a stated factor;
- `density-proxy`: one point represents a stated number of objects.

The active convention must be visible or easily discoverable. Labels and leader lines should anchor to actual positions, support both languages, avoid severe overlap, and reduce density on small screens.

## Stellar density comparison

The two neighborhood scenes must use the same physical volume and representation convention. Stellar radii are markers and must say so. Use catalog positions for nearby stars where practical. If the Galactic-center population is modeled or subsampled, use deterministic seeded sampling, preserve relative density meaning, and disclose how many physical stars one point represents. Never claim one point equals one star unless it does. If named local stars overlay a density layer, distinguish the two layers visually.

## Statistical and modeled structures

Spiral arms are model-dependent and should not look exact; encode confidence with more than color alone. BAO is a statistical excess in pair separation, not literal shells around individual galaxies. The observable-universe view is conceptual and must distinguish present-day comoving distance from light-travel time; it must not imply a complete 3D matter catalog.

## Determinism and performance honesty

The Cosmic Web slab is a spatial cross-section of one periodic z = 0.2 snapshot.
Its camera depth is not redshift, lookback time, or observer distance. The later
Observable Universe scene must make the change to a past-light-cone
representation explicit.

Use seeded randomness for procedural or sampled distributions so tests and screenshots reproduce. Instancing, point rendering, level of detail, and device-aware decorative particle density are encouraged. If scientifically meaningful density is reduced, disclose the representation rule rather than quietly thinning it.
