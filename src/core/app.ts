import type { Pool } from "pg";

export type Location = { lat: number; lng: number };
export type ReportType = "find" | "remove";
export type ReportStatus = "reported" | "verified";
export type Viewport = { west: number; south: number; east: number; north: number };

export type SubmitReportInput = {
  type: ReportType;
  location: Location;
  /** ISO date (YYYY-MM-DD) the submitter saw the weeds. */
  observedOn: string;
  description?: string;
};

export type Marker = {
  infestationId: string;
  type: ReportType;
  status: ReportStatus;
  location: Location;
};

export type AppDeps = {
  pool: Pool;
  clock: () => Date;
  newId: () => string;
};

/** The application interface: commands and queries. The UI is a thin client of this. */
export function createApp({ pool, clock, newId }: AppDeps) {
  return {
    /** Records a Report Submitted event and updates projections in one transaction. */
    async submitReport(input: SubmitReportInput): Promise<{ reportId: string; infestationId: string }> {
      const reportId = newId();
      const infestationId = newId();
      const now = clock();
      const point = [input.location.lng, input.location.lat];
      const client = await pool.connect();
      try {
        await client.query("begin");
        await client.query(
          `insert into events (kind, report_id, occurred_at, payload) values ('report_submitted', $1, $2, $3)`,
          [reportId, now, JSON.stringify({ ...input, infestationId, link: { kind: "new" } })],
        );
        await client.query(
          `insert into infestations (id, location, type, status, latest_report_id)
           values ($1, st_makepoint($2, $3)::geography, $4, 'reported', $5)`,
          [infestationId, ...point, input.type, reportId],
        );
        await client.query(
          `insert into reports (id, infestation_id, type, location, observed_on, submitted_at, description)
           values ($1, $2, $3, st_makepoint($4, $5)::geography, $6, $7, $8)`,
          [reportId, infestationId, input.type, ...point, input.observedOn, now, input.description ?? null],
        );
        await client.query("commit");
      } catch (err) {
        await client.query("rollback");
        throw err;
      } finally {
        client.release();
      }
      return { reportId, infestationId };
    },

    /** Infestations whose location falls inside the viewport. */
    async mapMarkers(viewport: Viewport): Promise<Marker[]> {
      const { rows } = await pool.query(
        `select id, type, status, st_y(location::geometry) as lat, st_x(location::geometry) as lng
           from infestations
          where location::geometry && st_makeenvelope($1, $2, $3, $4, 4326)
          order by id`,
        [viewport.west, viewport.south, viewport.east, viewport.north],
      );
      return rows.map((r) => ({
        infestationId: r.id,
        type: r.type,
        status: r.status,
        location: { lat: r.lat, lng: r.lng },
      }));
    },
  };
}

export type App = ReturnType<typeof createApp>;
