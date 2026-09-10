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
