import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import { createDatabase, CreateDatabaseForbidden } from "../src/operations/createDatabase";
import {
  deleteDatabase,
  DeleteDatabaseNotfound,
  DeleteDatabaseForbidden,
  DeleteDatabaseInput,
  DeleteDatabaseOutput,
} from "../src/operations/deleteDatabase";
import { withMainLayer } from "./setup";

withMainLayer("deleteDatabase", (it) => {
  it("should have the correct input schema", () => {
    // Verify the schema structure
    expect(DeleteDatabaseInput.fields.organization).toBeDefined();
    expect(DeleteDatabaseInput.fields.database).toBeDefined();
  });

  it("should have a void output schema", () => {
    // DeleteDatabaseOutput is Schema.Void
    expect(DeleteDatabaseOutput).toBeDefined();
  });

  it.effect("should return DeleteDatabaseNotfound or DeleteDatabaseForbidden for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;

      const result = yield* deleteDatabase({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof DeleteDatabaseNotfound || result instanceof DeleteDatabaseForbidden;
      expect(isExpectedError).toBe(true);
      if (result instanceof DeleteDatabaseNotfound) {
        expect(result._tag).toBe("DeleteDatabaseNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return DeleteDatabaseNotfound or DeleteDatabaseForbidden for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* deleteDatabase({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "some-db",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof DeleteDatabaseNotfound || result instanceof DeleteDatabaseForbidden;
      expect(isExpectedError).toBe(true);
      if (result instanceof DeleteDatabaseNotfound) {
        expect(result._tag).toBe("DeleteDatabaseNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );
  it.effect("should delete a database successfully", () => {
    let testDbName: string | null = null;

    return Effect.gen(function* () {
      const { organization } = yield* Credentials;
      testDbName = `test-db-delete-${Date.now()}`;

      // First create a database to delete
      const database = yield* createDatabase({
        organization,
        name: testDbName,
        cluster_size: "PS_10",
      }).pipe(
        Effect.catchTag("CreateDatabaseForbidden", () => Effect.succeed(null)),
      );

      if (database === null) {
        testDbName = null;
        return; // Skip test gracefully if creation is forbidden
      }

      // Now delete it
      const result = yield* deleteDatabase({
        organization,
        database: testDbName,
      });

      // deleteDatabase returns void (null) on success
      expect(result).toBeNull();
      testDbName = null; // Clear so cleanup doesn't try to delete again
    }).pipe(
      // Ensure cleanup even if test assertions fail
      Effect.ensuring(
        Effect.gen(function* () {
          if (testDbName) {
            const { organization } = yield* Credentials;
            yield* deleteDatabase({
              organization,
              database: testDbName,
            }).pipe(Effect.ignore);
          }
        }),
      ),
    );
  });
});
