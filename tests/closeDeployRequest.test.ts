import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  closeDeployRequest,
  CloseDeployRequestNotfound,
  CloseDeployRequestInput,
  CloseDeployRequestOutput,
} from "../src/operations/closeDeployRequest";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("closeDeployRequest", () => {
  it("should have the correct input schema", () => {
    expect(CloseDeployRequestInput.fields.organization).toBeDefined();
    expect(CloseDeployRequestInput.fields.database).toBeDefined();
    expect(CloseDeployRequestInput.fields.number).toBeDefined();
    expect(CloseDeployRequestInput.fields.state).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CloseDeployRequestOutput.fields.id).toBeDefined();
    expect(CloseDeployRequestOutput.fields.number).toBeDefined();
    expect(CloseDeployRequestOutput.fields.state).toBeDefined();
    expect(CloseDeployRequestOutput.fields.deployment_state).toBeDefined();
    expect(CloseDeployRequestOutput.fields.branch).toBeDefined();
    expect(CloseDeployRequestOutput.fields.into_branch).toBeDefined();
  });

  it.effect("should return CloseDeployRequestNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* closeDeployRequest({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CloseDeployRequestNotfound);
      if (result instanceof CloseDeployRequestNotfound) {
        expect(result._tag).toBe("CloseDeployRequestNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return CloseDeployRequestNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* closeDeployRequest({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CloseDeployRequestNotfound);
      if (result instanceof CloseDeployRequestNotfound) {
        expect(result._tag).toBe("CloseDeployRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return CloseDeployRequestNotfound for non-existent deploy request number", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const result = yield* closeDeployRequest({
        organization,
        database,
        number: 999999999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CloseDeployRequestNotfound);
      if (result instanceof CloseDeployRequestNotfound) {
        expect(result._tag).toBe("CloseDeployRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.number).toBe(999999999);
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
