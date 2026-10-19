/** Deployment-level settings. Domain rules read these; nothing hard-codes them. */
export type Config = {
  weedType: string;
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
};

export const defaultConfig: Config = {
  weedType: "goat's head",
  // Denver, Colorado
  mapCenter: { lat: 39.7392, lng: -104.9903 },
  mapZoom: 11,
};

export function configFromEnv(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    weedType: env.WEED_TYPE ?? defaultConfig.weedType,
    mapCenter: {
      lat: env.MAP_CENTER_LAT ? Number(env.MAP_CENTER_LAT) : defaultConfig.mapCenter.lat,
      lng: env.MAP_CENTER_LNG ? Number(env.MAP_CENTER_LNG) : defaultConfig.mapCenter.lng,
    },
    mapZoom: env.MAP_ZOOM ? Number(env.MAP_ZOOM) : defaultConfig.mapZoom,
  };
}
