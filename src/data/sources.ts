export type SourceInfo = {
  id: string;
  title: string;
  organization?: string;
  url?: string;
  citation?: string;
  accessed?: string;
  notes?: string;
};

export const SOURCES: readonly SourceInfo[] = [
  {
    id: "50mgc-2024",
    title: "Ohlson et al. (2024) — 50 Mpc Galaxy Catalog",
    url: "https://github.com/davidohlson/50MGC",
    accessed: "2026-09-11",
    notes:
      "Static bestdist subset within 20 Mpc of adopted observer–Virgo midpoint. Prefer recognized independent zind_dist indicators over flow/group estimates; retain earlier SBF bestdist. Method retained; mem and EVCC adopted. Unknown techniques remain estimated. Not volume complete.",
  },
  {
    id: "evcc-2014",
    title: "Kim et al. (2014) — Extended Virgo Cluster Catalog (EVCC)",
    url: "https://vizier.cfa.harvard.edu/viz-bin/VizieR-3?-source=J/ApJS/215/22/table2",
    accessed: "2026-09-11",
    notes:
      "User-supplied evcc_table2_with_Mg.csv, all 1589 rows; M=1028 members, P=561 possible. RAdeg/DEdeg retained for new entries; existing independently sourced coordinates preferred for matches. M_g used literally as absolute g magnitude with priority over B-band photometry, never recomputed from synthetic depths. Raw CSV and SHA-256 retained. Duplicate NGC4257 aliases are excluded from identity matching; distinct EVCC324/VCC323 and EVCC2057/VCC321 retained. NGVS II excerpt removed.",
  },
  {
    id: "ngvs-sbf-2024",
    title: "Cantiello et al. (2024) — NGVS III, 278 SBF distances",
    url: "https://arxiv.org/abs/2403.16235",
    accessed: "2026-09-11",
    notes:
      "All 278 targets from arXiv full tables, including three non-VCC targets. d_ref, individual uncertainty, J2000 coordinates, B_T, quality flags. Includes q3 and background structures. Derived factual subset; article CC BY 4.0.",
  },
  {
    id: "virgo-convention",
    title: "Virgo scene adopted conventions",
    notes:
      "16.5 Mpc reference, 44 Mpc view. Milky Way approximated by observer origin; J2000 rotation toward M87. Default synthetic depths: angularly weighted SBF resampling for unmeasured Virgo members; independent-neighbor resampling for other missing distances. Toggle collapses only modeled objects to representative distances. EVCC g and other B absolute-magnitude markers. Model assumptions are not observed galaxy positions. See src/scenes/virgo/README.md.",
  },
  {
    id: "mcconnachie-2012",
    title: "McConnachie (2012), AJ 144, 4 — Local Group catalog",
    organization: "CDS / Alan W. McConnachie",
    url: "https://cdsarc.cds.unistra.fr/viz-bin/ReadMe/J/AJ/144/4?format=html&tex=true",
    accessed: "2026-09-11",
    notes:
      "Tables 1–3: all 75 entries with membership G, A or L, including disputed candidates. Fixed 2012 snapshot, not a modern census; no volume-completeness claim. J2000 RA/Dec, heliocentric distance and errors, semimajor half-light radii, PA east of north, ellipticity, source flags. Rounded tabulated distances and radii retained. Milky Way center overrides catalog position. Raw subset and reproducible parser committed.",
  },
  {
    id: "local-group-shapes",
    title: "M31 — representative extent (NASA/JPL)",
    url: "https://www.jpl.nasa.gov/images/pia16682-cool-andromeda/",
    accessed: "2026-09-11",
    notes:
      "Representative 200,000 ly diameter, not a unique stellar edge. Other model conventions and source links are documented in src/scenes/local-group/README.md.",
  },
  {
    id: "local-group-m31-orientation",
    title: "M31 disk geometry — rotation-curve study (2024)",
    url: "https://academic.oup.com/mnras/article/528/2/2653/7512223",
    accessed: "2026-09-11",
    notes:
      "Adopt PA 38 degrees, inclination 77 degrees. No signed near-side reconstruction; opposite tilt remains an ambiguity.",
  },
  {
    id: "local-group-m33",
    title: "M33 optical disk — A&A 700, A57 (2025)",
    url: "https://www.aanda.org/articles/aa/pdf/2025/08/aa55408-25.pdf",
    accessed: "2026-09-11",
    notes:
      "R25 approximately 8.6 kpc adopted as representative optical radius. Inclination 54 degrees; PA 23 degrees from McConnachie table 3 (paper uses 22). Warp beyond optical disk omitted. M33 has no prominent bulge; no bulge sampled.",
  },
  {
    id: "local-group-clouds",
    title: "Magellanic Clouds — ESO",
    url: "https://www.eso.org/public/images/potw2216a/",
    accessed: "2026-09-11",
    notes:
      "Representative diameters LMC 14,000 ly and SMC 7,000 ly. SMC spherical envelope is explicitly adopted, not a reconstructed shape.",
  },
  {
    id: "local-group-lmc-orientation",
    title: "LMC geometry — van der Marel & Cioni (2001)",
    url: "https://ned.ipac.caltech.edu/level5/March04/Marel/Marel6.html",
    accessed: "2026-09-11",
    notes:
      "LMC inclination 34.7 degrees and line of nodes PA 122.5 degrees; population-dependent estimate. Circular irregular disk simplification; no reconstructed bar or tidal structure.",
  },
  {
    id: "bipm-light-second",
    title: "SI defining constants — speed of light in vacuum",
    organization: "BIPM",
    url: "https://www.bipm.org/en/measurement-units/si-defining-constants",
    accessed: "2026-09-10",
    notes:
      "Exact c = 299,792,458 m/s; one SI second gives a 299,792,458 m auxiliary ruler in Earth and Moon. Centered parallel placement and yellow color are display conventions.",
  },
  {
    id: "openspace-milky-way-volume",
    title: "OpenSpace — Milky Way Volume (NAOJ simulation)",
    organization: "OpenSpace Team / NAOJ",
    url: "https://docs.openspaceproject.com/latest/content/milky-way/galaxy/milky-way-volume/index.html",
    accessed: "2026-09-10",
    notes:
      "User-provided version-1 raw asset, downsampled from 1024×1024×128 to 256×256×32 in squared (decoded) space then sqrt-encoded RGBA8. Asset documentation lists MIT and credits Jon Parker, Emil Axelsson, Carter Emmart and OpenSpace Team; see local README/license/manifest. Simulation-based visual model, not a measured Galactic map. Size 1.2e21×1.2e21×0.15e21 m is the volume support, not the 30 kpc scene reference. Rx(pi) Ry(3.1248) Rz(4.45741), then Galactic→scene (-x,z,y). Shader inspected at OpenSpace cfa5b4d12f6fe52c7f3754ed5f590b587494e0e4; simplified physical-length step and tone mapping, no point/halo layers.",
  },
  {
    id: "esa-galaxy-guide",
    title: "Guide to our galaxy",
    organization: "ESA",
    url: "https://www.esa.int/content/view/full/423444",
    accessed: "2026-09-10",
    notes:
      "Rounded adopted stellar disk diameter 30 kpc, thin-disc full thickness 0.3 kpc, bar half-length 3 kpc, based on approximate 100,000 / 1,000 / 10,000 ly descriptions. No unique Galactic edge. Procedural arm count, pitch, bar orientation, bulge minor axes, colors and sample counts are illustrative; no stellar-count or luminosity calibration. Halo, gas, dust and warp omitted.",
  },
  {
    id: "gravity-2019-distance",
    title: "GRAVITY (2019) — Galactic center distance",
    organization: "GRAVITY Collaboration",
    url: "https://arxiv.org/abs/1904.05721",
    accessed: "2026-09-10",
    notes:
      "Adopt R0 = 8178 pc from S2 orbit: ±13 pc statistical, ±22 pc systematic. Fixed reference measurement, not a claim to the latest estimate. Sun placed in the model midplane; its height is omitted.",
  },
  {
    id: "esa-iso-psf",
    title: "ISO Handbook — Point Spread Function",
    organization: "ESA",
    url: "https://general-tools.cosmos.esa.int/iso/manuals/HANDBOOK/cam_hb/node33.php",
    accessed: "2026-09-10",
    notes:
      "Background for unresolved-source imaging only. The solar glow uses an adopted 24 CSS px display footprint, not this instrument's calibrated PSF, flux or angular resolution.",
  },
  {
    id: "cassini-major-rings",
    title: "Cassini Launch Press Kit — The Rings of Saturn",
    organization: "NASA / JPL",
    url: "https://www.jpl.nasa.gov/news/press_kits/cassini.pdf",
    accessed: "2026-09-10",
    notes:
      "Printed p.10 (PDF p.12), October 1997. Adopted C ring 74510–92000 km; B 92000–117580 km; A 122170–136780 km from the center. Thin flat annuli, no thickness or small ringlets; colors and optical depths illustrative.",
  },
  {
    id: "sss-planets",
    title: "Solar System Scope planet and Moon textures",
    organization: "Solar System Scope / INOVE",
    url: "https://www.solarsystemscope.com/textures/",
    accessed: "2026-09-10",
    notes:
      "CC BY 4.0 unmodified 2k JPG maps: Mercury, Venus atmosphere, Mars, Jupiter, Saturn, Uranus, Neptune and Moon. Local assets. Tuned colors and synthesized gaps; not dated maps. Mean spherical radii, no oblateness; texture longitudes are illustrative.",
  },
  {
    id: "nasa-lunar-period",
    title: "Eclipses and the Moon’s Orbit",
    organization: "NASA GSFC / Fred Espenak",
    url: "https://eclipse.gsfc.nasa.gov/SEhelp/moonorbit.html",
    accessed: "2026-09-10",
    notes:
      "Sidereal month 27.32166 days, adopted solely for the lunar trajectory sampling interval.",
  },
  {
    id: "iau-solar-radius",
    title: "IAU 2015 Resolution B3",
    organization: "IAU",
    url: "https://arxiv.org/abs/1510.07674",
    accessed: "2026-09-10",
    notes:
      "Nominal photospheric radius 6.957e8 m; replaces provisional solar diameter. Fixed conversion constant, not instantaneous measurement.",
  },
  {
    id: "sss-sun",
    title: "Solar System Scope textures",
    organization: "Solar System Scope / INOVE",
    url: "https://www.solarsystemscope.com/textures/",
    accessed: "2026-09-10",
    notes:
      "Unmodified 2k Sun JPEG, CC BY 4.0. Illustrative texture with shader brightness evolution and limb darkening; no dated surface claim.",
  },
  {
    id: "astronomy-engine",
    title: "Astronomy Engine",
    organization: "Don Cross",
    url: "https://github.com/cosinekitty/astronomy",
    accessed: "2026-09-10",
    notes:
      "MIT-licensed local ephemeris. Geometric heliocentric EQJ vectors transformed to fixed J2000 ecliptic. UI supports 1900–2100; one-period trajectories extend by up to about 82.4 years outside it for Neptune. RotationAxis supplies pole directions, but surface longitude and lighting are illustrative. No light-time or aberration corrections. Library target angular accuracy approximately one arcminute, not a uniform positional error guarantee.",
  },
  {
    id: "jpl-planet-radii",
    title: "Planetary Physical Parameters",
    organization: "NASA/JPL",
    url: "https://ssd.jpl.nasa.gov/planets/phys_par.html",
    accessed: "2026-09-10",
    notes:
      "Mean radii (km): Mercury 2439.4, Venus 6051.8, Mars 3389.50, Jupiter 69911, Saturn 58232, Uranus 25362, Neptune 24622. Sidereal periods (Julian years): Mercury 0.2408467, Venus 0.61519726, Earth 1.0000174, Mars 1.8808476, Jupiter 11.862615, Saturn 29.447498, Uranus 84.016846, Neptune 164.79132. Curves are open time samples, not exact closed ellipses.",
  },
  {
    id: "jpl-lunar-distance",
    title: "Lunar distance (LD)",
    organization: "NASA/JPL",
    url: "https://ssd.jpl.nasa.gov/glossary/LD.html",
    accessed: "2026-09-10",
    notes:
      "Mean lunar semimajor axis 384400 km, adopted as fixed center-to-center separation. Not instantaneous distance.",
  },
  {
    id: "nasa-ladee-moon-radius",
    title: "LADEE Press Kit — Moon Facts",
    organization: "NASA",
    url: "https://science.nasa.gov/wp-content/uploads/2023/05/ladee-press-kit-08292013.pdf",
    accessed: "2026-09-10",
    notes:
      "Mean lunar radius 1737.4 km, diameter 3474.8 km. Smooth spherical approximation without terrain or exaggerated size.",
  },
  {
    id: "jpl-earth-mean-radius",
    title: "Planetary Physical Parameters",
    organization: "NASA/JPL Solar System Dynamics",
    url: "https://ssd.jpl.nasa.gov/planets/phys_par.html",
    accessed: "2026-09-10",
    notes:
      "Earth mean radius 6371.0084 km. The scene retains the ladder's rounded spherical diameter of 12,742 km. Oblateness, terrain geometry, atmosphere, and real-time illumination are not modeled.",
  },
  {
    id: "nasa-bmng-july-2004",
    title: "Blue Marble: Next Generation with Topography — July 2004",
    organization: "NASA Earth Observatory",
    url: "https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography/",
    accessed: "2026-09-10",
    notes:
      "Global equirectangular monthly composite with baked terrain shading; resized from 5400×2700 to 2048×1024 JPEG. Credit NASA Earth Observatory. Use follows NASA Images and Media Usage Guidelines; no NASA branding is incorporated. Local static asset, not live imagery.",
  },
  {
    id: "svay-hachiko-2016",
    title: "Hachikō",
    organization: "Maurice Svay",
    url: "https://sketchfab.com/3d-models/hachiko-fffee43c3cbc4b7ea20d6556a360b25f",
    accessed: "2026-09-09",
    notes:
      "CC BY 4.0, verified via the official Sketchfab v3 model metadata. 97,157 triangles; 48,819 vertices; one texture. Photogrammetry from 45 photos. No metric calibration stated by author. Imported from user-supplied official GLB. Uses the supplied smaller JPEG variant; index buffer repacked losslessly to uint16. Model displayed at an adopted full height of 1.7 m, not a measured statue height.",
  },
  {
    id: "iau-2012-au",
    title: "Resolution B2: re-definition of the astronomical unit of length",
    organization: "International Astronomical Union",
    url: "https://www.iau.org/static/resolutions/IAU2012_English.pdf",
    citation: "IAU 2012 Resolution B2",
    notes: "Defines the astronomical unit as exactly 149,597,870,700 metres.",
  },
  {
    id: "iau-2015-units",
    title: "Resolution B2: recommended zero points for the absolute and apparent magnitudes",
    organization: "International Astronomical Union",
    url: "https://www.iau.org/static/resolutions/IAU2015_English.pdf",
    citation: "IAU 2015 Resolution B2, footnote 4",
    notes: "Records the conventional parsec definition and Julian-year light-year convention.",
  },
] as const;
