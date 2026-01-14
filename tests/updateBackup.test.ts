import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  updateBackup,
  UpdateBackupNotfound,
  UpdateBackupForbidden,
  UpdateBackupInput,
  UpdateBackupOutput,
} from "../src/operations/updateBackup";
import { createBackup } from "../src/operations/createBackup";
import { deleteBackup } from "../src/operations/deleteBackup";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("updateBackup", (it) => {
  it("should have the correct input schema", () => {
    expect(UpdateBackupInput.fields.id).toBeDefined();
    expect(UpdateBackupInput.fields.organization).toBeDefined();
    expect(UpdateBackupInput.fields.database).toBeDefined();
    expect(UpdateBackupInput.fields.branch).toBeDefined();
    expect(UpdateBackupInput.fields.protected).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(UpdateBackupOutput.fields.id).toBeDefined();
    expect(UpdateBackupOutput.fields.name).toBeDefined();
    expect(UpdateBackupOutput.fields.state).toBeDefined();
    expect(UpdateBackupOutput.fields.size).toBeDefined();
    expect(UpdateBackupOutput.fields.created_at).toBeDefined();
    expect(UpdateBackupOutput.fields.updated_at).toBeDefined();
    expect(UpdateBackupOutput.fields.expires_at).toBeDefined();
    expect(UpdateBackupOutput.fields.protected).toBeDefined();
    expect(UpdateBackupOutput.fields.required).toBeDefined();
    expect(UpdateBackupOutput.fields.actor).toBeDefined();
    expect(UpdateBackupOutput.fields.backup_policy).toBeDefined();
    expect(UpdateBackupOutput.fields.database_branch).toBeDefined();
    expect(UpdateBackupOutput.fields.restored_branches).toBeDefined();
    expect(UpdateBackupOutput.fields.schema_snapshot).toBeDefined();
  });

  it.effect("should return UpdateBackupNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* updateBackup({
        id: "some-backup-id",
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        protected: true,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateBackupNotfound);
      if (result instanceof UpdateBackupNotfound) {
        expect(result._tag).toBe("UpdateBackupNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateBackupNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* updateBackup({
        id: "some-backup-id",
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        protected: true,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateBackupNotfound);
      if (result instanceof UpdateBackupNotfound) {
        expect(result._tag).toBe("UpdateBackupNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateBackupNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = TEST_DATABASE;
      const result = yield* updateBackup({
        id: "some-backup-id",
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
        protected: true,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateBackupNotfound);
      if (result instanceof UpdateBackupNotfound) {
        expect(result._tag).toBe("UpdateBackupNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect(
    "should return UpdateBackupNotfound or UpdateBackupForbidden for non-existent backup id",
    () =>
      Effect.gen(function* () {
        const { organization } = yield* Credentials;
        // Use a test database name - adjust based on your PlanetScale setup
        const database = TEST_DATABASE;
        const branch = "main";
        const result = yield* updateBackup({
          id: "this-backup-id-definitely-does-not-exist-12345",
          organization,
          database,
          branch,
          protected: true,
        }).pipe(
          Effect.matchEffect({
            onFailure: (error) => Effect.succeed(error),
            onSuccess: () => Effect.succeed(null),
          }),
        );

        // API may return Forbidden instead of NotFound depending on service token permissions
        const isExpectedError =
          result instanceof UpdateBackupNotfound || result instanceof UpdateBackupForbidden;
        expect(isExpectedError).toBe(true);
        if (result instanceof UpdateBackupNotfound) {
          expect(result._tag).toBe("UpdateBackupNotfound");
          expect(result.organization).toBe(organization);
          expect(result.database).toBe(database);
          expect(result.branch).toBe(branch);
          expect(result.id).toBe("this-backup-id-definitely-does-not-exist-12345");
        } else if (result instanceof UpdateBackupForbidden) {
          expect(result._tag).toBe("UpdateBackupForbidden");
          expect(result.organization).toBe(organization);
        }
      }),
  );

  // Note: This test creates an actual backup, updates it, and cleans it up.
  // It requires a valid database with a branch to exist.
  // May be skipped if service token lacks backup permissions.
  it.effect("should update a backup successfully or return forbidden", () => {
    // Use a test database name - adjust based on your PlanetScale setup
    const database = TEST_DATABASE;
    const branch = "main";
    let createdBackupId: string | undefined;

    return Effect.gen(function* () {
      const { organization } = yield* Credentials;

      // First create a backup to update
      const backup = yield* createBackup({
        organization,
        database,
        branch,
        retention_unit: "day",
        retention_value: 1,
      }).pipe(Effect.catchTag("CreateBackupForbidden", () => Effect.succeed(null)));

      // If we couldn't create a backup (forbidden), skip the test
      if (backup === null) {
        return;
      }

      createdBackupId = backup.id;

      // Now update it to set protected = true
      const result = yield* updateBackup({
        id: backup.id,
        organization,
        database,
        branch,
        protected: true,
      });

      expect(result).toHaveProperty("id", backup.id);
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("state");
      expect(result).toHaveProperty("size");
      expect(result).toHaveProperty("created_at");
      expect(result).toHaveProperty("updated_at");
      expect(result).toHaveProperty("protected", true);
      expect(result).toHaveProperty("actor");
      expect(result).toHaveProperty("database_branch");
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
