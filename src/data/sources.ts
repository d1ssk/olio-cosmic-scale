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
