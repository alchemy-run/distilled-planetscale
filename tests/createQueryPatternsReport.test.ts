import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  createQueryPatternsReport,
  CreateQueryPatternsReportNotfound,
  CreateQueryPatternsReportInput,
  CreateQueryPatternsReportOutput,
} from "../src/operations/createQueryPatternsReport";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("createQueryPatternsReport", () => {
  it("should have the correct input schema", () => {
    expect(CreateQueryPatternsReportInput.fields.organization).toBeDefined();
    expect(CreateQueryPatternsReportInput.fields.database).toBeDefined();
    expect(CreateQueryPatternsReportInput.fields.branch).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CreateQueryPatternsReportOutput.fields.id).toBeDefined();
    expect(CreateQueryPatternsReportOutput.fields.state).toBeDefined();
    expect(CreateQueryPatternsReportOutput.fields.created_at).toBeDefined();
    expect(CreateQueryPatternsReportOutput.fields.finished_at).toBeDefined();
    expect(CreateQueryPatternsReportOutput.fields.url).toBeDefined();
    expect(CreateQueryPatternsReportOutput.fields.download_url).toBeDefined();
    expect(CreateQueryPatternsReportOutput.fields.actor).toBeDefined();
  });

  it.effect("should return CreateQueryPatternsReportNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* createQueryPatternsReport({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateQueryPatternsReportNotfound);
      if (result instanceof CreateQueryPatternsReportNotfound) {
        expect(result._tag).toBe("CreateQueryPatternsReportNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return CreateQueryPatternsReportNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* createQueryPatternsReport({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateQueryPatternsReportNotfound);
      if (result instanceof CreateQueryPatternsReportNotfound) {
        expect(result._tag).toBe("CreateQueryPatternsReportNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return CreateQueryPatternsReportNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* createQueryPatternsReport({
        organization,
        database: "test", // Assumes a test database exists
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateQueryPatternsReportNotfound);
      if (result instanceof CreateQueryPatternsReportNotfound) {
        expect(result._tag).toBe("CreateQueryPatternsReportNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
