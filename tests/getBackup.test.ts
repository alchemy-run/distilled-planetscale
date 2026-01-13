import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getBackup,
  GetBackupNotfound,
  GetBackupForbidden,
  GetBackupInput,
  GetBackupOutput,
} from "../src/operations/getBackup";
import { createBackup, CreateBackupForbidden } from "../src/operations/createBackup";
import { deleteBackup } from "../src/operations/deleteBackup";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("getBackup", (it) => {
  it("should have the correct input schema", () => {
    expect(GetBackupInput.fields.id).toBeDefined();
    expect(GetBackupInput.fields.organization).toBeDefined();
    expect(GetBackupInput.fields.database).toBeDefined();
    expect(GetBackupInput.fields.branch).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetBackupOutput.fields.id).toBeDefined();
    expect(GetBackupOutput.fields.name).toBeDefined();
    expect(GetBackupOutput.fields.state).toBeDefined();
    expect(GetBackupOutput.fields.size).toBeDefined();
    expect(GetBackupOutput.fields.created_at).toBeDefined();
    expect(GetBackupOutput.fields.updated_at).toBeDefined();
    expect(GetBackupOutput.fields.expires_at).toBeDefined();
    expect(GetBackupOutput.fields.protected).toBeDefined();
    expect(GetBackupOutput.fields.required).toBeDefined();
    expect(GetBackupOutput.fields.actor).toBeDefined();
    expect(GetBackupOutput.fields.backup_policy).toBeDefined();
    expect(GetBackupOutput.fields.database_branch).toBeDefined();
    expect(GetBackupOutput.fields.restored_branches).toBeDefined();
    expect(GetBackupOutput.fields.schema_snapshot).toBeDefined();
  });

  it.effect("should return GetBackupNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getBackup({
        id: "some-backup-id",
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
        result instanceof GetBackupNotfound || result instanceof GetBackupForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return GetBackupNotfound or GetBackupForbidden for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getBackup({
        id: "some-backup-id",
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
        result instanceof GetBackupNotfound || result instanceof GetBackupForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return GetBackupNotfound or GetBackupForbidden for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = TEST_DATABASE;
      const result = yield* getBackup({
        id: "some-backup-id",
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
        result instanceof GetBackupNotfound || result instanceof GetBackupForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return GetBackupNotfound or GetBackupForbidden for non-existent backup id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = TEST_DATABASE;
      const branch = "main";
      const result = yield* getBackup({
        id: "this-backup-id-definitely-does-not-exist-12345",
        organization,
        database,
        branch,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError =
        result instanceof GetBackupNotfound || result instanceof GetBackupForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  // Note: This test creates an actual backup, fetches it, and cleans it up.
  // It requires a valid database with a branch to exist.
  it.effect("should get a backup successfully", () => {
    // Use a test database name - adjust based on your PlanetScale setup
    const database = TEST_DATABASE;
    const branch = "main";
    let createdBackupId: string | undefined;

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // First create a backup to fetch
      const backup = yield* createBackup({
        organization,
        database,
        branch,
        retention_unit: "day",
        retention_value: 1,
      }).pipe(Effect.catchTag("CreateBackupForbidden", () => Effect.succeed(null)));

      if (backup === null) {
        return; // Skip test gracefully if creation is forbidden
      }

      createdBackupId = backup.id;

      // Now fetch it
      const result = yield* getBackup({
        id: backup.id,
        organization,
        database,
        branch,
      });

      expect(result).toHaveProperty("id", backup.id);
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("state");
      expect(result).toHaveProperty("size");
      expect(result).toHaveProperty("created_at");
      expect(result).toHaveProperty("actor");
      expect(result).toHaveProperty("database_branch");
    }).pipe(
      // Ensure cleanup even if test assertions fail
      Effect.ensuring(
        Effect.gen(function* () {
          if (createdBackupId) {
            const { organization } = yield* PlanetScaleCredentials;
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
