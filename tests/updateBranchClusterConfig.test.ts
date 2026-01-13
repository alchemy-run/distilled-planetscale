import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  updateBranchClusterConfig,
  UpdateBranchClusterConfigNotfound,
  UpdateBranchClusterConfigInput,
  UpdateBranchClusterConfigOutput,
} from "../src/operations/updateBranchClusterConfig";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("updateBranchClusterConfig", () => {
  it("should have the correct input schema", () => {
    expect(UpdateBranchClusterConfigInput.fields.organization).toBeDefined();
    expect(UpdateBranchClusterConfigInput.fields.database).toBeDefined();
    expect(UpdateBranchClusterConfigInput.fields.branch).toBeDefined();
    expect(UpdateBranchClusterConfigInput.fields.cluster_size).toBeDefined();
  });

  it("should have the correct output schema", () => {
    // Output is Schema.Void, so we just verify it's defined
    expect(UpdateBranchClusterConfigOutput).toBeDefined();
  });

  it.effect("should return UpdateBranchClusterConfigNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* updateBranchClusterConfig({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        cluster_size: "PS-10",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateBranchClusterConfigNotfound);
      if (result instanceof UpdateBranchClusterConfigNotfound) {
        expect(result._tag).toBe("UpdateBranchClusterConfigNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return UpdateBranchClusterConfigNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* updateBranchClusterConfig({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        cluster_size: "PS-10",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateBranchClusterConfigNotfound);
      if (result instanceof UpdateBranchClusterConfigNotfound) {
        expect(result._tag).toBe("UpdateBranchClusterConfigNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return UpdateBranchClusterConfigNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* updateBranchClusterConfig({
        organization,
        database: "test",
        branch: "this-branch-definitely-does-not-exist-12345",
        cluster_size: "PS-10",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateBranchClusterConfigNotfound);
      if (result instanceof UpdateBranchClusterConfigNotfound) {
        expect(result._tag).toBe("UpdateBranchClusterConfigNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("test");
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
