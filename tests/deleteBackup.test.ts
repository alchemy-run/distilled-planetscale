import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  deleteBackup,
  DeleteBackupNotfound,
  DeleteBackupInput,
  DeleteBackupOutput,
} from "../src/operations/deleteBackup";
import { createBackup } from "../src/operations/createBackup";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("deleteBackup", () => {
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

      expect(result).toBeInstanceOf(DeleteBackupNotfound);
      if (result instanceof DeleteBackupNotfound) {
        expect(result._tag).toBe("DeleteBackupNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DeleteBackupNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
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

      expect(result).toBeInstanceOf(DeleteBackupNotfound);
      if (result instanceof DeleteBackupNotfound) {
        expect(result._tag).toBe("DeleteBackupNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DeleteBackupNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = "test";
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

      expect(result).toBeInstanceOf(DeleteBackupNotfound);
      if (result instanceof DeleteBackupNotfound) {
        expect(result._tag).toBe("DeleteBackupNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DeleteBackupNotfound for non-existent backup id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = "test";
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

      expect(result).toBeInstanceOf(DeleteBackupNotfound);
      if (result instanceof DeleteBackupNotfound) {
        expect(result._tag).toBe("DeleteBackupNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.id).toBe("this-backup-id-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test creates an actual backup and then deletes it.
  // It requires a valid database with a branch to exist.
  it.skip("should delete a backup successfully", () => {
    // Use a test database name - adjust based on your PlanetScale setup
    const database = "test";
    const branch = "main";
    let createdBackupId: string | undefined;

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // First create a backup to delete
      const backup = yield* createBackup({
        organization,
        database,
        branch,
        retention_unit: "day",
        retention_value: 1,
      });

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
      Effect.provide(MainLayer),
    );
  });
});
