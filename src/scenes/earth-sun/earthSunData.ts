import { Body } from "astronomy-engine";
import { EARTH_DIAMETER_METERS, EARTH_TEXTURE } from "../earth/earthData";
import { MOON_DIAMETER_METERS } from "../earth-moon/earthMoonData";
/** Mean spherical radii from JPL; Earth/Moon preserve the existing scenes' conventions. */
export const SYSTEM_BODIES = [
  {
    body: Body.Mercury,
    texture: `${import.meta.env.BASE_URL}models/planets/mercury.jpg`,
    radiusMeters: 2_439_400,
    color: "#bcb3a7",
    labelKey: "earthSun.mercury",
    sourceId: "jpl-planet-radii",
    periodDays: 0.2408467 * 365.25,
  },
  {
    body: Body.Venus,
    texture: `${import.meta.env.BASE_URL}models/planets/venus_atmosphere.jpg`,
    radiusMeters: 6_051_800,
    color: "#e9cd94",
    labelKey: "earthSun.venus",
    sourceId: "jpl-planet-radii",
    periodDays: 0.61519726 * 365.25,
  },
  {
    body: Body.Earth,
    texture: EARTH_TEXTURE.url,
    radiusMeters: EARTH_DIAMETER_METERS / 2,
    color: "#7faee0",
    labelKey: "scene.earth.title",
    sourceId: "jpl-earth-mean-radius",
    periodDays: 1.0000174 * 365.25,
  },
  {
    body: Body.Moon,
    texture: `${import.meta.env.BASE_URL}models/planets/moon.jpg`,
    radiusMeters: MOON_DIAMETER_METERS / 2,
    color: "#c4c3bf",
    labelKey: "earthMoon.moon",
    sourceId: "nasa-ladee-moon-radius",
    periodDays: 27.32166,
    periodSourceId: "nasa-lunar-period",
  },
  {
    body: Body.Mars,
    texture: `${import.meta.env.BASE_URL}models/planets/mars.jpg`,
    radiusMeters: 3389500,
    color: "#c58c70",
    labelKey: "solar.mars",
    sourceId: "jpl-planet-radii",
    periodDays: 1.8808476 * 365.25,
  },
  {
    body: Body.Jupiter,
    texture: `${import.meta.env.BASE_URL}models/planets/jupiter.jpg`,
    radiusMeters: 69911000,
    color: "#cbb99f",
    labelKey: "solar.jupiter",
    sourceId: "jpl-planet-radii",
    periodDays: 11.862615 * 365.25,
  },
  {
    body: Body.Saturn,
    texture: `${import.meta.env.BASE_URL}models/planets/saturn.jpg`,
    radiusMeters: 58232000,
    color: "#d6c498",
    labelKey: "solar.saturn",
    sourceId: "jpl-planet-radii",
    periodDays: 29.447498 * 365.25,
  },
  {
    body: Body.Uranus,
    texture: `${import.meta.env.BASE_URL}models/planets/uranus.jpg`,
    radiusMeters: 25362000,
    color: "#a4d3d7",
    labelKey: "solar.uranus",
    sourceId: "jpl-planet-radii",
    periodDays: 84.016846 * 365.25,
  },
  {
    body: Body.Neptune,
    texture: `${import.meta.env.BASE_URL}models/planets/neptune.jpg`,
    radiusMeters: 24622000,
    color: "#779ed5",
    labelKey: "solar.neptune",
    sourceId: "jpl-planet-radii",
    periodDays: 164.79132 * 365.25,
  },
] as const;
export const DATE_MIN = "1900-01-01T00:00";
export const DATE_MAX = "2100-12-31T23:59";
export const ORBIT_SEGMENTS = 256;
