import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getQueryPatternsReportStatus,
  GetQueryPatternsReportStatusNotfound,
  GetQueryPatternsReportStatusInput,
  GetQueryPatternsReportStatusOutput,
} from "../src/operations/getQueryPatternsReportStatus";
import { withMainLayer } from "./setup";

withMainLayer("getQueryPatternsReportStatus", (it) => {
  it("should have the correct input schema", () => {
    expect(GetQueryPatternsReportStatusInput.fields.organization).toBeDefined();
    expect(GetQueryPatternsReportStatusInput.fields.database).toBeDefined();
    expect(GetQueryPatternsReportStatusInput.fields.branch).toBeDefined();
    expect(GetQueryPatternsReportStatusInput.fields.id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetQueryPatternsReportStatusOutput.fields.id).toBeDefined();
    expect(GetQueryPatternsReportStatusOutput.fields.state).toBeDefined();
    expect(GetQueryPatternsReportStatusOutput.fields.created_at).toBeDefined();
    expect(GetQueryPatternsReportStatusOutput.fields.finished_at).toBeDefined();
    expect(GetQueryPatternsReportStatusOutput.fields.url).toBeDefined();
    expect(GetQueryPatternsReportStatusOutput.fields.download_url).toBeDefined();
    expect(GetQueryPatternsReportStatusOutput.fields.actor).toBeDefined();
  });

  it.effect("should return GetQueryPatternsReportStatusNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getQueryPatternsReportStatus({
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

      expect(result).toBeInstanceOf(GetQueryPatternsReportStatusNotfound);
      if (result instanceof GetQueryPatternsReportStatusNotfound) {
        expect(result._tag).toBe("GetQueryPatternsReportStatusNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetQueryPatternsReportStatusNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getQueryPatternsReportStatus({
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

      expect(result).toBeInstanceOf(GetQueryPatternsReportStatusNotfound);
      if (result instanceof GetQueryPatternsReportStatusNotfound) {
        expect(result._tag).toBe("GetQueryPatternsReportStatusNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetQueryPatternsReportStatusNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getQueryPatternsReportStatus({
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

      expect(result).toBeInstanceOf(GetQueryPatternsReportStatusNotfound);
      if (result instanceof GetQueryPatternsReportStatusNotfound) {
        expect(result._tag).toBe("GetQueryPatternsReportStatusNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetQueryPatternsReportStatusNotfound for non-existent report id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getQueryPatternsReportStatus({
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

      expect(result).toBeInstanceOf(GetQueryPatternsReportStatusNotfound);
      if (result instanceof GetQueryPatternsReportStatusNotfound) {
        expect(result._tag).toBe("GetQueryPatternsReportStatusNotfound");
        expect(result.organization).toBe(organization);
        expect(result.id).toBe("this-report-id-definitely-does-not-exist-12345");
      }
    }),
  );
});
