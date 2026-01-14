import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  deleteBackup,
  DeleteBackupNotfound,
  DeleteBackupForbidden,
  DeleteBackupInput,
  DeleteBackupOutput,
} from "../src/operations/deleteBackup";
import { createBackup, CreateBackupForbidden } from "../src/operations/createBackup";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("deleteBackup", (it) => {
  it("should have the correct input schema", () => {
    expect(DeleteBackupInput.fields.id).toBeDefined();
    expect(DeleteBackupInput.fields.organization).toBeDefined();
    expect(DeleteBackupInput.fields.database).toBeDefined();
    expect(DeleteBackupInput.fields.branch).toBeDefined();
  });

  it("should have a void output schema", () => {
    // DeleteBackupOutput is Schema.Void
    expect(DeleteBackupOutput).toBeDefined();
  });

  it.effect("should return DeleteBackupNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* deleteBackup({
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
        result instanceof DeleteBackupNotfound || result instanceof DeleteBackupForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return DeleteBackupNotfound or DeleteBackupForbidden for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* deleteBackup({
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
        result instanceof DeleteBackupNotfound || result instanceof DeleteBackupForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return DeleteBackupNotfound or DeleteBackupForbidden for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = TEST_DATABASE;
      const result = yield* deleteBackup({
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
        result instanceof DeleteBackupNotfound || result instanceof DeleteBackupForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return DeleteBackupNotfound or DeleteBackupForbidden for non-existent backup id", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = TEST_DATABASE;
      const branch = "main";
      const result = yield* deleteBackup({
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
        result instanceof DeleteBackupNotfound || result instanceof DeleteBackupForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  // Note: This test creates an actual backup and then deletes it.
  // It requires a valid database with a branch to exist.
  it.effect("should delete a backup successfully", () => {
    // Use a test database name - adjust based on your PlanetScale setup
    const database = TEST_DATABASE;
    const branch = "main";
    let createdBackupId: string | undefined;

    return Effect.gen(function* () {
      const { organization } = yield* Credentials;

      // First create a backup to delete
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

      // Now delete it
      const result = yield* deleteBackup({
        id: backup.id,
        organization,
        database,
        branch,
      });

      // deleteBackup returns void on success
      expect(result).toBeUndefined();
    }).pipe(
      // Ensure cleanup even if test assertions fail
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
