import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // Tests share one real Postgres, so files must not run concurrently.
    fileParallelism: false,
  },
});
