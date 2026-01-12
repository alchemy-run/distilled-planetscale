import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  deleteQueryPatternsReport,
  DeleteQueryPatternsReportNotfound,
  DeleteQueryPatternsReportInput,
  DeleteQueryPatternsReportOutput,
} from "../src/operations/deleteQueryPatternsReport";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("deleteQueryPatternsReport", () => {
  it("should have the correct input schema", () => {
    expect(DeleteQueryPatternsReportInput.fields.organization).toBeDefined();
    expect(DeleteQueryPatternsReportInput.fields.database).toBeDefined();
    expect(DeleteQueryPatternsReportInput.fields.branch).toBeDefined();
    expect(DeleteQueryPatternsReportInput.fields.id).toBeDefined();
  });

  it("should have a void output schema", () => {
    // DeleteQueryPatternsReportOutput is Schema.Void
    expect(DeleteQueryPatternsReportOutput).toBeDefined();
  });

  it.effect("should return DeleteQueryPatternsReportNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* deleteQueryPatternsReport({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        id: "some-report-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteQueryPatternsReportNotfound);
      if (result instanceof DeleteQueryPatternsReportNotfound) {
        expect(result._tag).toBe("DeleteQueryPatternsReportNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DeleteQueryPatternsReportNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* deleteQueryPatternsReport({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        id: "some-report-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteQueryPatternsReportNotfound);
      if (result instanceof DeleteQueryPatternsReportNotfound) {
        expect(result._tag).toBe("DeleteQueryPatternsReportNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DeleteQueryPatternsReportNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const result = yield* deleteQueryPatternsReport({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
        id: "some-report-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteQueryPatternsReportNotfound);
      if (result instanceof DeleteQueryPatternsReportNotfound) {
        expect(result._tag).toBe("DeleteQueryPatternsReportNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DeleteQueryPatternsReportNotfound for non-existent report id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const branch = "main";
      const result = yield* deleteQueryPatternsReport({
        organization,
        database,
        branch,
        id: "this-report-id-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteQueryPatternsReportNotfound);
      if (result instanceof DeleteQueryPatternsReportNotfound) {
        expect(result._tag).toBe("DeleteQueryPatternsReportNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.id).toBe("this-report-id-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
