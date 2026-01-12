import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  updateAutoApply,
  UpdateAutoApplyNotfound,
  UpdateAutoApplyInput,
  UpdateAutoApplyOutput,
} from "../src/operations/updateAutoApply";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("updateAutoApply", () => {
  it("should have the correct input schema", () => {
    expect(UpdateAutoApplyInput.fields.organization).toBeDefined();
    expect(UpdateAutoApplyInput.fields.database).toBeDefined();
    expect(UpdateAutoApplyInput.fields.number).toBeDefined();
    expect(UpdateAutoApplyInput.fields.enable).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(UpdateAutoApplyOutput.fields.id).toBeDefined();
    expect(UpdateAutoApplyOutput.fields.number).toBeDefined();
    expect(UpdateAutoApplyOutput.fields.state).toBeDefined();
    expect(UpdateAutoApplyOutput.fields.deployment_state).toBeDefined();
    expect(UpdateAutoApplyOutput.fields.branch).toBeDefined();
    expect(UpdateAutoApplyOutput.fields.into_branch).toBeDefined();
  });

  it.effect("should return UpdateAutoApplyNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* updateAutoApply({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 1,
        enable: true,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateAutoApplyNotfound);
      if (result instanceof UpdateAutoApplyNotfound) {
        expect(result._tag).toBe("UpdateAutoApplyNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return UpdateAutoApplyNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* updateAutoApply({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 1,
        enable: true,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateAutoApplyNotfound);
      if (result instanceof UpdateAutoApplyNotfound) {
        expect(result._tag).toBe("UpdateAutoApplyNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return UpdateAutoApplyNotfound for non-existent deploy request number", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const result = yield* updateAutoApply({
        organization,
        database,
        number: 999999999,
        enable: true,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateAutoApplyNotfound);
      if (result instanceof UpdateAutoApplyNotfound) {
        expect(result._tag).toBe("UpdateAutoApplyNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.number).toBe(999999999);
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
