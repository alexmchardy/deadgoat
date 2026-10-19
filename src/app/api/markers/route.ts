import { getApp } from "@/core/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  // Number(null) is 0, so check presence before converting.
  const raw = ["west", "south", "east", "north"].map((k) => p.get(k));
  const [west, south, east, north] = raw.map(Number);
  if (raw.some((v) => v === null || v === "") || [west, south, east, north].some((n) => !Number.isFinite(n))) {
    return Response.json({ error: "west, south, east, north are required" }, { status: 400 });
  }
  return Response.json(await getApp().mapMarkers({ west, south, east, north }));
}
