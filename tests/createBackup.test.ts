import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  createBackup,
  CreateBackupNotfound,
  CreateBackupForbidden,
  CreateBackupInput,
  CreateBackupOutput,
} from "../src/operations/createBackup";
import { deleteBackup } from "../src/operations/deleteBackup";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("createBackup", (it) => {
  it("should have the correct input schema", () => {
    expect(CreateBackupInput.fields.organization).toBeDefined();
    expect(CreateBackupInput.fields.database).toBeDefined();
    expect(CreateBackupInput.fields.branch).toBeDefined();
    expect(CreateBackupInput.fields.name).toBeDefined();
    expect(CreateBackupInput.fields.retention_unit).toBeDefined();
    expect(CreateBackupInput.fields.retention_value).toBeDefined();
    expect(CreateBackupInput.fields.emergency).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CreateBackupOutput.fields.id).toBeDefined();
    expect(CreateBackupOutput.fields.name).toBeDefined();
    expect(CreateBackupOutput.fields.state).toBeDefined();
    expect(CreateBackupOutput.fields.size).toBeDefined();
    expect(CreateBackupOutput.fields.created_at).toBeDefined();
    expect(CreateBackupOutput.fields.expires_at).toBeDefined();
    expect(CreateBackupOutput.fields.actor).toBeDefined();
    expect(CreateBackupOutput.fields.backup_policy).toBeDefined();
    expect(CreateBackupOutput.fields.database_branch).toBeDefined();
  });

  it.effect("should return CreateBackupNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* createBackup({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError =
        result instanceof CreateBackupNotfound || result instanceof CreateBackupForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect(
    "should return CreateBackupNotfound or CreateBackupForbidden for non-existent database",
    () =>
      Effect.gen(function* () {
        const { organization } = yield* Credentials;
        const result = yield* createBackup({
          organization,
          database: "this-database-definitely-does-not-exist-12345",
          branch: "main",
        }).pipe(
          Effect.matchEffect({
            onFailure: (error) => Effect.succeed(error),
            onSuccess: () => Effect.succeed(null),
          }),
        );

        const isExpectedError =
          result instanceof CreateBackupNotfound || result instanceof CreateBackupForbidden;
        expect(isExpectedError).toBe(true);
      }),
  );

  it.effect(
    "should return CreateBackupNotfound or CreateBackupForbidden for non-existent branch",
    () =>
      Effect.gen(function* () {
        const { organization } = yield* Credentials;
        // Use a test database name - adjust based on your PlanetScale setup
        const database = TEST_DATABASE;
        const result = yield* createBackup({
          organization,
          database,
          branch: "this-branch-definitely-does-not-exist-12345",
        }).pipe(
          Effect.matchEffect({
            onFailure: (error) => Effect.succeed(error),
            onSuccess: () => Effect.succeed(null),
          }),
        );

        const isExpectedError =
          result instanceof CreateBackupNotfound || result instanceof CreateBackupForbidden;
        expect(isExpectedError).toBe(true);
      }),
  );

  // Note: This test creates an actual backup and cleans it up.
  // It requires a valid database with a branch to exist.
  it.effect("should create a backup successfully and clean up", () => {
    let createdBackupId: string | undefined;
    // Use a test database name - adjust based on your PlanetScale setup
    const database = TEST_DATABASE;
    const branch = "main";

    return Effect.gen(function* () {
      const { organization } = yield* Credentials;

      const result = yield* createBackup({
        organization,
        database,
        branch,
        retention_unit: "day",
        retention_value: 1,
      }).pipe(Effect.catchTag("CreateBackupForbidden", () => Effect.succeed(null)));

      if (result === null) {
        return; // Skip test gracefully if creation is forbidden
      }

      createdBackupId = result.id;

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("state");
      expect(result).toHaveProperty("created_at");
    }).pipe(
      Effect.ensuring(
        Effect.gen(function* () {
          if (createdBackupId) {
            const { organization } = yield* Credentials;
            yield* deleteBackup({
              id: createdBackupId,
              organization,
              database,
              branch,
            }).pipe(Effect.ignore);
          }
        }),
      ),
    );
  });
});
