import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  completeGatedDeployRequest,
  CompleteGatedDeployRequestNotfound,
  CompleteGatedDeployRequestInput,
  CompleteGatedDeployRequestOutput,
} from "../src/operations/completeGatedDeployRequest";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("completeGatedDeployRequest", () => {
  it("should have the correct input schema", () => {
    expect(CompleteGatedDeployRequestInput.fields.organization).toBeDefined();
    expect(CompleteGatedDeployRequestInput.fields.database).toBeDefined();
    expect(CompleteGatedDeployRequestInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CompleteGatedDeployRequestOutput.fields.id).toBeDefined();
    expect(CompleteGatedDeployRequestOutput.fields.number).toBeDefined();
    expect(CompleteGatedDeployRequestOutput.fields.state).toBeDefined();
    expect(CompleteGatedDeployRequestOutput.fields.deployment_state).toBeDefined();
    expect(CompleteGatedDeployRequestOutput.fields.branch).toBeDefined();
    expect(CompleteGatedDeployRequestOutput.fields.into_branch).toBeDefined();
    expect(CompleteGatedDeployRequestOutput.fields.deployment).toBeDefined();
  });

  it.effect("should return CompleteGatedDeployRequestNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* completeGatedDeployRequest({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CompleteGatedDeployRequestNotfound);
      if (result instanceof CompleteGatedDeployRequestNotfound) {
        expect(result._tag).toBe("CompleteGatedDeployRequestNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return CompleteGatedDeployRequestNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* completeGatedDeployRequest({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CompleteGatedDeployRequestNotfound);
      if (result instanceof CompleteGatedDeployRequestNotfound) {
        expect(result._tag).toBe("CompleteGatedDeployRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return CompleteGatedDeployRequestNotfound for non-existent deploy request number", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const result = yield* completeGatedDeployRequest({
        organization,
        database,
        number: 999999999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CompleteGatedDeployRequestNotfound);
      if (result instanceof CompleteGatedDeployRequestNotfound) {
        expect(result._tag).toBe("CompleteGatedDeployRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.number).toBe(999999999);
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
