import { getApp } from "@/core/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const { type, location, observedOn, description } = body ?? {};
  if (
    (type !== "find" && type !== "remove") ||
    !(Math.abs(location?.lat) <= 90) ||
    !(Math.abs(location?.lng) <= 180) ||
    typeof observedOn !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(observedOn) ||
    Number.isNaN(Date.parse(observedOn))
  ) {
    return Response.json({ error: "Invalid report" }, { status: 400 });
  }
  const result = await getApp().submitReport({ type, location, observedOn, description });
  return Response.json(result, { status: 201 });
}
