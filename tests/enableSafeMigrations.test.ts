import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  enableSafeMigrations,
  EnableSafeMigrationsNotfound,
  EnableSafeMigrationsInput,
  EnableSafeMigrationsOutput,
} from "../src/operations/enableSafeMigrations";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("enableSafeMigrations", (it) => {
  it("should have the correct input schema", () => {
    expect(EnableSafeMigrationsInput.fields.organization).toBeDefined();
    expect(EnableSafeMigrationsInput.fields.database).toBeDefined();
    expect(EnableSafeMigrationsInput.fields.branch).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(EnableSafeMigrationsOutput.fields.id).toBeDefined();
    expect(EnableSafeMigrationsOutput.fields.name).toBeDefined();
    expect(EnableSafeMigrationsOutput.fields.created_at).toBeDefined();
    expect(EnableSafeMigrationsOutput.fields.updated_at).toBeDefined();
    expect(EnableSafeMigrationsOutput.fields.state).toBeDefined();
    expect(EnableSafeMigrationsOutput.fields.ready).toBeDefined();
    expect(EnableSafeMigrationsOutput.fields.production).toBeDefined();
    expect(EnableSafeMigrationsOutput.fields.safe_migrations).toBeDefined();
    expect(EnableSafeMigrationsOutput.fields.region).toBeDefined();
    expect(EnableSafeMigrationsOutput.fields.parent_branch).toBeDefined();
  });

  it.effect("should return EnableSafeMigrationsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* enableSafeMigrations({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "some-db",
        branch: "some-branch",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(EnableSafeMigrationsNotfound);
      if (result instanceof EnableSafeMigrationsNotfound) {
        expect(result._tag).toBe("EnableSafeMigrationsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return EnableSafeMigrationsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* enableSafeMigrations({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "some-branch",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(EnableSafeMigrationsNotfound);
      if (result instanceof EnableSafeMigrationsNotfound) {
        expect(result._tag).toBe("EnableSafeMigrationsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return EnableSafeMigrationsNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* enableSafeMigrations({
        organization,
        database: TEST_DATABASE,
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(EnableSafeMigrationsNotfound);
      if (result instanceof EnableSafeMigrationsNotfound) {
        expect(result._tag).toBe("EnableSafeMigrationsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  // Note: This test is skipped because enabling safe migrations is a
  // state-modifying operation on a production branch. To test successfully:
  // 1. Have an existing production branch with safe migrations disabled
  // 2. Enable safe migrations
  // 3. Disable safe migrations to clean up (using disableSafeMigrations)
  it.effect("should enable safe migrations on a branch successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const branchName = "main"; // Replace with an actual production branch

      const result = yield* enableSafeMigrations({
        organization,
        database,
        branch: branchName,
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", branchName);
      expect(result).toHaveProperty("safe_migrations", true);
      expect(result).toHaveProperty("state");
    }),
  );
});
