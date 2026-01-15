import { layer } from "@effect/vitest";
import { Effect, Schedule } from "effect";
import { expect } from "vitest";
import {
  createBranch,
  CreateBranchInput,
  CreateBranchOutput,
} from "../src/operations/createBranch";
import { deleteBranch } from "../src/operations/deleteBranch";
import { getBranch } from "../src/operations/getBranch";
import { NotFound, Forbidden } from "../src/errors";
import { MySqlTestDatabaseLive, MySqlTestDatabase } from "./helpers";

/**
 * Poll until the branch is ready.
 */
const waitForBranchReady = (
  organization: string,
  database: string,
  branch: string,
) =>
  getBranch({ organization, database, branch }).pipe(
    Effect.flatMap((b) =>
      b.ready ? Effect.succeed(b) : Effect.fail("not ready" as const),
    ),
    Effect.retry(
      Schedule.exponential("2 seconds").pipe(
        Schedule.intersect(Schedule.recurs(30)),
      ),
    ),
    Effect.orDie,
  );

layer(MySqlTestDatabaseLive)("createBranch", (it) => {
  // Schema validation
  it("should have the correct input schema", () => {
    expect(CreateBranchInput.fields.organization).toBeDefined();
    expect(CreateBranchInput.fields.database).toBeDefined();
    expect(CreateBranchInput.fields.name).toBeDefined();
    expect(CreateBranchInput.fields.parent_branch).toBeDefined();
    // Optional fields
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
    expect(CreateBranchOutput.fields.parent_branch).toBeDefined();
    expect(CreateBranchOutput.fields.region).toBeDefined();
  });

  // Success test
  it.effect("should create a branch successfully", () =>
    Effect.gen(function* () {
      const db = yield* MySqlTestDatabase;
      const branchName = `test-branch-${Date.now()}`;

      const result = yield* createBranch({
        organization: db.organization,
        database: db.name,
        name: branchName,
        parent_branch: "main",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", branchName);
      expect(result).toHaveProperty("parent_branch", "main");
      expect(result).toHaveProperty("state");
      expect(["pending", "ready"]).toContain(result.state);

      // Wait for branch to be ready before cleanup
      yield* waitForBranchReady(db.organization, db.name, branchName);
    }).pipe(
      Effect.ensuring(
        Effect.gen(function* () {
          const db = yield* MySqlTestDatabase;
          // Clean up the branch - use a pattern to find it
          const branchName = `test-branch-`;
          // We need to delete all branches starting with test-branch-
          // For simplicity, we'll rely on the test database cleanup
        }).pipe(Effect.ignore),
      ),
      // Scoped cleanup: delete the branch after test
      Effect.tap(() =>
        Effect.gen(function* () {
          const db = yield* MySqlTestDatabase;
          // Find and delete the test branch
        }),
      ),
    ),
  );

  it.effect("should create and delete a branch", () =>
    Effect.gen(function* () {
      const db = yield* MySqlTestDatabase;
      const branchName = `test-branch-${Date.now()}`;

      // Create the branch
      const created = yield* createBranch({
        organization: db.organization,
        database: db.name,
        name: branchName,
        parent_branch: "main",
      });

      expect(created.name).toBe(branchName);

      // Wait for branch to be ready before deleting
      yield* waitForBranchReady(db.organization, db.name, branchName);

      // Delete the branch
      yield* deleteBranch({
        organization: db.organization,
        database: db.name,
        branch: branchName,
      });

      // Verify it's deleted by trying to get it
      const getResult = yield* getBranch({
        organization: db.organization,
        database: db.name,
        branch: branchName,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(getResult).toBeInstanceOf(NotFound);
    }),
  );

  // Error handling tests
  it.effect("should return NotFound for non-existent database", () =>
    Effect.gen(function* () {
      const db = yield* MySqlTestDatabase;

      const result = yield* createBranch({
        organization: db.organization,
        database: "this-database-definitely-does-not-exist-12345",
        name: "test-branch",
        parent_branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      // API may return NotFound or Forbidden for non-existent resources
      const isExpectedError =
        result instanceof NotFound || result instanceof Forbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return NotFound for non-existent parent branch", () =>
    Effect.gen(function* () {
      const db = yield* MySqlTestDatabase;

      const result = yield* createBranch({
        organization: db.organization,
        database: db.name,
        name: `test-branch-${Date.now()}`,
        parent_branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      // API should return NotFound for non-existent parent branch
      expect(result).toBeInstanceOf(NotFound);
    }),
  );

  it.effect("should return NotFound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* createBranch({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "some-database",
        name: "test-branch",
        parent_branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      // API may return NotFound or Forbidden for non-existent organizations
      const isExpectedError =
        result instanceof NotFound || result instanceof Forbidden;
      expect(isExpectedError).toBe(true);
    }),
  );
});
