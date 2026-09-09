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
