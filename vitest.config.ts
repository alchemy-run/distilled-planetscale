import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 60000,
    hookTimeout: 300000, // Database creation can take a while (5 minutes)
    fileParallelism: false,
  },
});
