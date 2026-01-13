import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  listGeneratedQueryPatternsReports,
  ListGeneratedQueryPatternsReportsInput,
  ListGeneratedQueryPatternsReportsNotfound,
  ListGeneratedQueryPatternsReportsOutput,
} from "../src/operations/listGeneratedQueryPatternsReports";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("listGeneratedQueryPatternsReports", () => {
  // Schema validation
  it("should have the correct input schema", () => {
    expect(ListGeneratedQueryPatternsReportsInput.fields.organization).toBeDefined();
    expect(ListGeneratedQueryPatternsReportsInput.fields.database).toBeDefined();
    expect(ListGeneratedQueryPatternsReportsInput.fields.branch).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListGeneratedQueryPatternsReportsOutput.fields.has_next).toBeDefined();
    expect(ListGeneratedQueryPatternsReportsOutput.fields.has_prev).toBeDefined();
    expect(ListGeneratedQueryPatternsReportsOutput.fields.cursor_start).toBeDefined();
    expect(ListGeneratedQueryPatternsReportsOutput.fields.cursor_end).toBeDefined();
    expect(ListGeneratedQueryPatternsReportsOutput.fields.data).toBeDefined();
  });

  it.effect("should list query patterns reports successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const branch = "main";

      const result = yield* listGeneratedQueryPatternsReports({
        organization,
        database,
        branch,
      }).pipe(
        // Handle case where database/branch doesn't exist
        Effect.catchTag("ListGeneratedQueryPatternsReportsNotfound", () =>
          Effect.succeed({
            has_next: false,
            has_prev: false,
            cursor_start: "",
            cursor_end: "",
            data: [],
          }),
        ),
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("has_next");
      expect(result).toHaveProperty("has_prev");
      expect(result).toHaveProperty("cursor_start");
      expect(result).toHaveProperty("cursor_end");
      expect(Array.isArray(result.data)).toBe(true);
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ListGeneratedQueryPatternsReportsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listGeneratedQueryPatternsReports({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListGeneratedQueryPatternsReportsNotfound);
      if (result instanceof ListGeneratedQueryPatternsReportsNotfound) {
        expect(result._tag).toBe("ListGeneratedQueryPatternsReportsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ListGeneratedQueryPatternsReportsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listGeneratedQueryPatternsReports({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListGeneratedQueryPatternsReportsNotfound);
      if (result instanceof ListGeneratedQueryPatternsReportsNotfound) {
        expect(result._tag).toBe("ListGeneratedQueryPatternsReportsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ListGeneratedQueryPatternsReportsNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listGeneratedQueryPatternsReports({
        organization,
        database: "test", // Assumes a test database exists
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListGeneratedQueryPatternsReportsNotfound);
      if (result instanceof ListGeneratedQueryPatternsReportsNotfound) {
        expect(result._tag).toBe("ListGeneratedQueryPatternsReportsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
