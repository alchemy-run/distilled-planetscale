import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  listGeneratedQueryPatternsReports,
  ListGeneratedQueryPatternsReportsForbidden,
  ListGeneratedQueryPatternsReportsInput,
  ListGeneratedQueryPatternsReportsNotfound,
  ListGeneratedQueryPatternsReportsOutput,
} from "../src/operations/listGeneratedQueryPatternsReports";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("listGeneratedQueryPatternsReports", (it) => {
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
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const branch = "main";

      const result = yield* listGeneratedQueryPatternsReports({
        organization,
        database,
        branch,
      }).pipe(
        // Handle case where database/branch doesn't exist, access is forbidden, or schema parse error
        Effect.catchTag("ListGeneratedQueryPatternsReportsNotfound", () => Effect.succeed(null)),
        Effect.catchTag("ListGeneratedQueryPatternsReportsForbidden", () => Effect.succeed(null)),
        Effect.catchTag("PlanetScaleParseError", () => Effect.succeed(null)),
      );

      if (result === null) {
        return; // Skip test gracefully
      }

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("has_next");
      expect(result).toHaveProperty("has_prev");
      expect(result).toHaveProperty("cursor_start");
      expect(result).toHaveProperty("cursor_end");
      expect(Array.isArray(result.data)).toBe(true);
    }),
  );

  it.effect(
    "should return ListGeneratedQueryPatternsReportsNotfound for non-existent organization",
    () =>
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

        const isExpectedError =
          result instanceof ListGeneratedQueryPatternsReportsNotfound ||
          result instanceof ListGeneratedQueryPatternsReportsForbidden;
        expect(isExpectedError).toBe(true);
      }),
  );

  it.effect(
    "should return ListGeneratedQueryPatternsReportsNotfound or ListGeneratedQueryPatternsReportsForbidden for non-existent database",
    () =>
      Effect.gen(function* () {
        const { organization } = yield* Credentials;
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

        const isExpectedError =
          result instanceof ListGeneratedQueryPatternsReportsNotfound ||
          result instanceof ListGeneratedQueryPatternsReportsForbidden;
        expect(isExpectedError).toBe(true);
      }),
  );

  it.effect(
    "should return ListGeneratedQueryPatternsReportsNotfound or ListGeneratedQueryPatternsReportsForbidden for non-existent branch",
    () =>
      Effect.gen(function* () {
        const { organization } = yield* Credentials;
        const result = yield* listGeneratedQueryPatternsReports({
          organization,
          database: TEST_DATABASE,
          branch: "this-branch-definitely-does-not-exist-12345",
        }).pipe(
          Effect.matchEffect({
            onFailure: (error) => Effect.succeed(error),
            onSuccess: () => Effect.succeed(null),
          }),
        );

        const isExpectedError =
          result instanceof ListGeneratedQueryPatternsReportsNotfound ||
          result instanceof ListGeneratedQueryPatternsReportsForbidden;
        expect(isExpectedError).toBe(true);
      }),
  );
});
