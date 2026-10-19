"use client";

import * as maplibregl from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Location, Marker } from "@/core/app";


export function MapView({ center, zoom }: { center: Location; zoom: number }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const pins = useRef<maplibregl.Marker[]>([]);
  const [lastSubmit, setLastSubmit] = useState("");

  const refresh = useCallback(async () => {
    const b = map.current!.getBounds();
    const qs = new URLSearchParams({
      west: String(b.getWest()),
      south: String(b.getSouth()),
      east: String(b.getEast()),
      north: String(b.getNorth()),
    });
    const markers: Marker[] = await (await fetch(`/api/markers?${qs}`)).json();
    pins.current.forEach((p) => p.remove());
    pins.current = markers.map((m) => {
      const el = document.createElement("div");
      el.title = `${m.type} (${m.status})`;
      el.style.cssText = `width:16px;height:16px;border-radius:50%;border:2px solid #fff;background:${
        m.type === "find" ? "#c0392b" : "#7f8c8d"
      };opacity:${m.status === "reported" ? 0.6 : 1}`;
      return new maplibregl.Marker({ element: el }).setLngLat([m.location.lng, m.location.lat]).addTo(map.current!);
    });
  }, []);

  useEffect(() => {
    map.current = new maplibregl.Map({
      container: container.current!,
      center: [center.lng, center.lat],
      zoom,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
    });
    map.current.on("moveend", refresh);
    map.current.on("load", refresh);
    return () => map.current?.remove();
  }, [center.lat, center.lng, zoom, refresh]);

  // Bare-bones submit form; replaced by the "+" flow in ticket 03.
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "find",
        location: { lat: Number(f.get("lat")), lng: Number(f.get("lng")) },
        observedOn: f.get("observedOn"),
        description: f.get("description") || undefined,
      }),
    });
    setLastSubmit(res.ok ? "Submitted" : "Failed");
    if (res.ok) refresh();
  }

  const c = map.current?.getCenter();
  return (
    <div style={{ position: "relative", height: "100dvh" }}>
      <div ref={container} style={{ position: "absolute", inset: 0 }} />
      <form
        onSubmit={submit}
        style={{ position: "absolute", top: 8, left: 8, background: "#fff", padding: 8, display: "grid", gap: 4, maxWidth: "calc(100% - 16px)" }}
      >
        <strong>Report a find</strong>
        <input name="lat" placeholder="lat" defaultValue={c?.lat ?? center.lat} />
        <input name="lng" placeholder="lng" defaultValue={c?.lng ?? center.lng} />
        <input name="observedOn" type="date" required />
        <input name="description" placeholder="description (optional)" />
        <button type="submit">Submit</button>
        {lastSubmit && <span>{lastSubmit}</span>}
      </form>
    </div>
  );
}
