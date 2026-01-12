import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  cancelBranchChangeRequest,
  CancelBranchChangeRequestNotfound,
  CancelBranchChangeRequestInput,
  CancelBranchChangeRequestOutput,
} from "../src/operations/cancelBranchChangeRequest";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("cancelBranchChangeRequest", () => {
  it("should have the correct input schema", () => {
    expect(CancelBranchChangeRequestInput.fields.organization).toBeDefined();
    expect(CancelBranchChangeRequestInput.fields.database).toBeDefined();
    expect(CancelBranchChangeRequestInput.fields.branch).toBeDefined();
  });

  it("should have a void output schema", () => {
    // CancelBranchChangeRequestOutput is Schema.Void
    expect(CancelBranchChangeRequestOutput).toBeDefined();
  });

  it.effect("should return CancelBranchChangeRequestNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* cancelBranchChangeRequest({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CancelBranchChangeRequestNotfound);
      if (result instanceof CancelBranchChangeRequestNotfound) {
        expect(result._tag).toBe("CancelBranchChangeRequestNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return CancelBranchChangeRequestNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* cancelBranchChangeRequest({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CancelBranchChangeRequestNotfound);
      if (result instanceof CancelBranchChangeRequestNotfound) {
        expect(result._tag).toBe("CancelBranchChangeRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return CancelBranchChangeRequestNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const result = yield* cancelBranchChangeRequest({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CancelBranchChangeRequestNotfound);
      if (result instanceof CancelBranchChangeRequestNotfound) {
        expect(result._tag).toBe("CancelBranchChangeRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
