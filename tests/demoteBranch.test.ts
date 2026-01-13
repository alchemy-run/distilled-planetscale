import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  demoteBranch,
  DemoteBranchNotfound,
  DemoteBranchInput,
  DemoteBranchOutput,
} from "../src/operations/demoteBranch";
import { withMainLayer } from "./setup";

withMainLayer("demoteBranch", (it) => {
  it("should have the correct input schema", () => {
    expect(DemoteBranchInput.fields.organization).toBeDefined();
    expect(DemoteBranchInput.fields.database).toBeDefined();
    expect(DemoteBranchInput.fields.branch).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(DemoteBranchOutput.fields.id).toBeDefined();
    expect(DemoteBranchOutput.fields.name).toBeDefined();
    expect(DemoteBranchOutput.fields.created_at).toBeDefined();
    expect(DemoteBranchOutput.fields.updated_at).toBeDefined();
    expect(DemoteBranchOutput.fields.state).toBeDefined();
    expect(DemoteBranchOutput.fields.ready).toBeDefined();
    expect(DemoteBranchOutput.fields.production).toBeDefined();
    expect(DemoteBranchOutput.fields.region).toBeDefined();
    expect(DemoteBranchOutput.fields.parent_branch).toBeDefined();
  });

  it.effect("should return DemoteBranchNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* demoteBranch({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "some-db",
        branch: "some-branch",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DemoteBranchNotfound);
      if (result instanceof DemoteBranchNotfound) {
        expect(result._tag).toBe("DemoteBranchNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return DemoteBranchNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* demoteBranch({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "some-branch",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DemoteBranchNotfound);
      if (result instanceof DemoteBranchNotfound) {
        expect(result._tag).toBe("DemoteBranchNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return DemoteBranchNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* demoteBranch({
        organization,
        database: "test", // Assumes a test database exists
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DemoteBranchNotfound);
      if (result instanceof DemoteBranchNotfound) {
        expect(result._tag).toBe("DemoteBranchNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  // Note: This test is skipped because demoting a branch requires a production branch
  // and modifies its state. Running this test could affect real production data.
  // To test successfully, you would need to:
  // 1. Create a branch
  // 2. Promote it to production
  // 3. Demote it back to development
  // 4. Clean up by deleting the branch
  it.skip("should demote a production branch successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test"; // Replace with an actual test database
      const branchName = "main"; // Replace with an actual production branch

      const result = yield* demoteBranch({
        organization,
        database,
        branch: branchName,
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", branchName);
      expect(result).toHaveProperty("production", false);
      expect(result).toHaveProperty("state");
    }),
  );
});
