import { afterAll, describe, expect, it } from "vitest";
import { closePool, denver, freshApp } from "./harness";

afterAll(closePool);

describe("submitting a find Report", () => {
  it("shows up as a reported find marker on the map", async () => {
    const app = await freshApp();

    await app.submitReport({
      type: "find",
      location: { lat: 39.7392, lng: -104.9903 },
      observedOn: "2026-06-30",
      description: "Along the fence",
    });

    const markers = await app.mapMarkers(denver);
    expect(markers).toHaveLength(1);
    expect(markers[0]).toMatchObject({
      type: "find",
      status: "reported",
      location: { lat: 39.7392, lng: -104.9903 },
    });
  });

  it("only appears in viewports that contain it", async () => {
    const app = await freshApp();
    await app.submitReport({
      type: "find",
      location: { lat: 39.7392, lng: -104.9903 },
      observedOn: "2026-06-30",
    });

    const colorado_springs = { west: -104.9, south: 38.7, east: -104.7, north: 38.9 };
    expect(await app.mapMarkers(colorado_springs)).toEqual([]);
  });
});
