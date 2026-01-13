import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  createBranch,
  CreateBranchNotfound,
  CreateBranchInput,
  CreateBranchOutput,
} from "../src/operations/createBranch";
import { deleteBranch } from "../src/operations/deleteBranch";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("createBranch", (it) => {
  it("should have the correct input schema", () => {
    expect(CreateBranchInput.fields.organization).toBeDefined();
    expect(CreateBranchInput.fields.database).toBeDefined();
    expect(CreateBranchInput.fields.name).toBeDefined();
    expect(CreateBranchInput.fields.parent_branch).toBeDefined();
    expect(CreateBranchInput.fields.backup_id).toBeDefined();
    expect(CreateBranchInput.fields.region).toBeDefined();
    expect(CreateBranchInput.fields.restore_point).toBeDefined();
    expect(CreateBranchInput.fields.seed_data).toBeDefined();
    expect(CreateBranchInput.fields.cluster_size).toBeDefined();
    expect(CreateBranchInput.fields.major_version).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CreateBranchOutput.fields.id).toBeDefined();
    expect(CreateBranchOutput.fields.name).toBeDefined();
    expect(CreateBranchOutput.fields.created_at).toBeDefined();
    expect(CreateBranchOutput.fields.updated_at).toBeDefined();
    expect(CreateBranchOutput.fields.state).toBeDefined();
    expect(CreateBranchOutput.fields.ready).toBeDefined();
    expect(CreateBranchOutput.fields.production).toBeDefined();
    expect(CreateBranchOutput.fields.region).toBeDefined();
    expect(CreateBranchOutput.fields.parent_branch).toBeDefined();
  });

  it.effect("should return CreateBranchNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* createBranch({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        name: "test-branch",
        parent_branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateBranchNotfound);
      if (result instanceof CreateBranchNotfound) {
        expect(result._tag).toBe("CreateBranchNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return CreateBranchNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* createBranch({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        name: "test-branch",
        parent_branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateBranchNotfound);
      if (result instanceof CreateBranchNotfound) {
        expect(result._tag).toBe("CreateBranchNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  // Note: This test is skipped because creating branches requires an existing database
  // and may incur costs. When enabled, it demonstrates proper cleanup using Effect.ensuring.
  it.effect("should create a branch successfully and clean up", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = TEST_DATABASE;
      const testBranchName = `test-branch-${Date.now()}`;

      const result = yield* createBranch({
        organization,
        database,
        name: testBranchName,
        parent_branch: "main",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", testBranchName);
      expect(result).toHaveProperty("state");
      expect(result).toHaveProperty("parent_branch", "main");
    }).pipe(
      // Always clean up the branch, even if the test fails
      Effect.ensuring(
        Effect.gen(function* () {
          const { organization } = yield* PlanetScaleCredentials;
          const database = TEST_DATABASE;
          const testBranchName = `test-branch-${Date.now()}`;
          yield* deleteBranch({
            organization,
            database,
            branch: testBranchName,
          }).pipe(Effect.ignore);
        }),
      ),
    ),
  );
});
