import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  getQueryPatternsReport,
  GetQueryPatternsReportNotfound,
  GetQueryPatternsReportInput,
  GetQueryPatternsReportOutput,
} from "../src/operations/getQueryPatternsReport";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("getQueryPatternsReport", () => {
  it("should have the correct input schema", () => {
    expect(GetQueryPatternsReportInput.fields.organization).toBeDefined();
    expect(GetQueryPatternsReportInput.fields.database).toBeDefined();
    expect(GetQueryPatternsReportInput.fields.branch).toBeDefined();
    expect(GetQueryPatternsReportInput.fields.id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    // Output is Schema.Void - download endpoint returns void/binary
    expect(GetQueryPatternsReportOutput).toBeDefined();
  });

  it.effect("should return GetQueryPatternsReportNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getQueryPatternsReport({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        id: "non-existent-report-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetQueryPatternsReportNotfound);
      if (result instanceof GetQueryPatternsReportNotfound) {
        expect(result._tag).toBe("GetQueryPatternsReportNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return GetQueryPatternsReportNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getQueryPatternsReport({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        id: "non-existent-report-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetQueryPatternsReportNotfound);
      if (result instanceof GetQueryPatternsReportNotfound) {
        expect(result._tag).toBe("GetQueryPatternsReportNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return GetQueryPatternsReportNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getQueryPatternsReport({
        organization,
        database: "test", // Assumes a test database exists
        branch: "this-branch-definitely-does-not-exist-12345",
        id: "non-existent-report-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetQueryPatternsReportNotfound);
      if (result instanceof GetQueryPatternsReportNotfound) {
        expect(result._tag).toBe("GetQueryPatternsReportNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return GetQueryPatternsReportNotfound for non-existent report id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getQueryPatternsReport({
        organization,
        database: "test", // Assumes a test database exists
        branch: "main",
        id: "this-report-id-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetQueryPatternsReportNotfound);
      if (result instanceof GetQueryPatternsReportNotfound) {
        expect(result._tag).toBe("GetQueryPatternsReportNotfound");
        expect(result.organization).toBe(organization);
        expect(result.id).toBe("this-report-id-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
