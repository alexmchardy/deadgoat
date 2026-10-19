import { configFromEnv } from "@/core/config";
import { MapView } from "./map-view";

export const dynamic = "force-dynamic";

export default function Home() {
  const { mapCenter, mapZoom } = configFromEnv();
  return <MapView center={mapCenter} zoom={mapZoom} />;
}
