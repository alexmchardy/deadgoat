import { migrate } from "../src/core/migrate";

const url = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:54329/deadgoat";
migrate(url).then(
  () => console.log("migrated"),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
