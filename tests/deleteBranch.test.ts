import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import { createBranch } from "../src/operations/createBranch";
import {
  deleteBranch,
  DeleteBranchNotfound,
  DeleteBranchInput,
  DeleteBranchOutput,
} from "../src/operations/deleteBranch";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("deleteBranch", () => {
  it("should have the correct input schema", () => {
    expect(DeleteBranchInput.fields.organization).toBeDefined();
    expect(DeleteBranchInput.fields.database).toBeDefined();
    expect(DeleteBranchInput.fields.branch).toBeDefined();
  });

  it("should have a void output schema", () => {
    // DeleteBranchOutput is Schema.Void
    expect(DeleteBranchOutput).toBeDefined();
  });

  it.effect("should return DeleteBranchNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* deleteBranch({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "some-db",
        branch: "some-branch",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteBranchNotfound);
      if (result instanceof DeleteBranchNotfound) {
        expect(result._tag).toBe("DeleteBranchNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DeleteBranchNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* deleteBranch({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "some-branch",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteBranchNotfound);
      if (result instanceof DeleteBranchNotfound) {
        expect(result._tag).toBe("DeleteBranchNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DeleteBranchNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* deleteBranch({
        organization,
        database: "test", // Assumes a test database exists
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteBranchNotfound);
      if (result instanceof DeleteBranchNotfound) {
        expect(result._tag).toBe("DeleteBranchNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test is skipped because it requires creating and deleting branches
  // which may incur costs and require an existing database.
  it.skip("should delete a branch successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test"; // Replace with an actual test database
      const testBranchName = `test-branch-delete-${Date.now()}`;

      // First create a branch to delete
      yield* createBranch({
        organization,
        database,
        name: testBranchName,
        parent_branch: "main",
      });

      // Now delete it
      const result = yield* deleteBranch({
        organization,
        database,
        branch: testBranchName,
      });

      // deleteBranch returns void on success
      expect(result).toBeUndefined();
    }).pipe(Effect.provide(MainLayer)),
  );
});
