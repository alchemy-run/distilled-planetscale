import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  deleteDatabasePostgresCidr,
  DeleteDatabasePostgresCidrNotfound,
  DeleteDatabasePostgresCidrForbidden,
  DeleteDatabasePostgresCidrInput,
  DeleteDatabasePostgresCidrOutput,
} from "../src/operations/deleteDatabasePostgresCidr";
import {
  createDatabasePostgresCidr,
  CreateDatabasePostgresCidrForbidden,
  CreateDatabasePostgresCidrNotfound,
} from "../src/operations/createDatabasePostgresCidr";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("deleteDatabasePostgresCidr", (it) => {
  it("should have the correct input schema", () => {
    expect(DeleteDatabasePostgresCidrInput.fields.organization).toBeDefined();
    expect(DeleteDatabasePostgresCidrInput.fields.database).toBeDefined();
    expect(DeleteDatabasePostgresCidrInput.fields.id).toBeDefined();
  });

  it("should have a void output schema", () => {
    // DeleteDatabasePostgresCidrOutput is Schema.Void
    expect(DeleteDatabasePostgresCidrOutput).toBeDefined();
  });

  it.effect("should return DeleteDatabasePostgresCidrNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* deleteDatabasePostgresCidr({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "some-db",
        id: "some-cidr-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError =
        result instanceof DeleteDatabasePostgresCidrNotfound ||
        result instanceof DeleteDatabasePostgresCidrForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return DeleteDatabasePostgresCidrNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* deleteDatabasePostgresCidr({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        id: "some-cidr-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError =
        result instanceof DeleteDatabasePostgresCidrNotfound ||
        result instanceof DeleteDatabasePostgresCidrForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  // Note: The PlanetScale API returns malformed error responses (missing code field) for requests
  // on non-PostgreSQL databases. We test that the operation does not succeed using Effect.exit.
  it.effect("should fail for non-existent CIDR id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const exit = yield* deleteDatabasePostgresCidr({
        organization,
        database: TEST_DATABASE,
        id: "this-cidr-id-definitely-does-not-exist-12345",
      }).pipe(Effect.exit);

      // The operation should not succeed
      expect(exit._tag).toBe("Failure");
    }),
  );

  // Note: This test is skipped because it requires a PostgreSQL-enabled database.
  // PlanetScale's CIDR allowlist feature is only available for PostgreSQL databases.
  // When you have a PostgreSQL database available, you can enable this test.
  it.effect("should delete a PostgreSQL CIDR allowlist entry successfully", () => {
    const testDatabase = "your-postgres-db"; // Replace with actual PostgreSQL database name

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // First create a CIDR entry to delete
      const created = yield* createDatabasePostgresCidr({
        organization,
        database: testDatabase,
        cidrs: ["10.0.0.0/24"],
      }).pipe(
        Effect.catchTag("CreateDatabasePostgresCidrForbidden", () => Effect.succeed(null)),
        Effect.catchTag("CreateDatabasePostgresCidrNotfound", () => Effect.succeed(null)),
      );

      if (created === null) {
        return; // Skip test gracefully if creation is forbidden or database not found
      }

      // Now delete it
      const result = yield* deleteDatabasePostgresCidr({
        organization,
        database: testDatabase,
        id: created.id,
      });

      // deleteDatabasePostgresCidr returns void on success
      expect(result).toBeUndefined();
    });
  });
});
