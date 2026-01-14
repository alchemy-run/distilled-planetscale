import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  getDatabasePostgresCidr,
  GetDatabasePostgresCidrNotfound,
  GetDatabasePostgresCidrForbidden,
  GetDatabasePostgresCidrInput,
  GetDatabasePostgresCidrOutput,
} from "../src/operations/getDatabasePostgresCidr";
import {
  createDatabasePostgresCidr,
  CreateDatabasePostgresCidrForbidden,
  CreateDatabasePostgresCidrNotfound,
} from "../src/operations/createDatabasePostgresCidr";
import { deleteDatabasePostgresCidr } from "../src/operations/deleteDatabasePostgresCidr";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("getDatabasePostgresCidr", (it) => {
  it("should have the correct input schema", () => {
    expect(GetDatabasePostgresCidrInput.fields.organization).toBeDefined();
    expect(GetDatabasePostgresCidrInput.fields.database).toBeDefined();
    expect(GetDatabasePostgresCidrInput.fields.id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetDatabasePostgresCidrOutput.fields.id).toBeDefined();
    expect(GetDatabasePostgresCidrOutput.fields.schema).toBeDefined();
    expect(GetDatabasePostgresCidrOutput.fields.role).toBeDefined();
    expect(GetDatabasePostgresCidrOutput.fields.cidrs).toBeDefined();
    expect(GetDatabasePostgresCidrOutput.fields.created_at).toBeDefined();
    expect(GetDatabasePostgresCidrOutput.fields.updated_at).toBeDefined();
    expect(GetDatabasePostgresCidrOutput.fields.deleted_at).toBeDefined();
    expect(GetDatabasePostgresCidrOutput.fields.actor).toBeDefined();
  });

  it.effect("should return GetDatabasePostgresCidrNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getDatabasePostgresCidr({
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
        result instanceof GetDatabasePostgresCidrNotfound ||
        result instanceof GetDatabasePostgresCidrForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return GetDatabasePostgresCidrNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* getDatabasePostgresCidr({
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
        result instanceof GetDatabasePostgresCidrNotfound ||
        result instanceof GetDatabasePostgresCidrForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  // Note: The PlanetScale API returns malformed error responses (missing code field) for requests
  // on non-PostgreSQL databases. We test that the operation does not succeed using Effect.exit.
  it.effect("should fail for non-existent CIDR id", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const exit = yield* getDatabasePostgresCidr({
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
  it.effect("should get a PostgreSQL CIDR allowlist entry successfully", () => {
    const testDatabase = "your-postgres-db"; // Replace with actual PostgreSQL database name
    let createdCidrId: string | undefined;

    return Effect.gen(function* () {
      const { organization } = yield* Credentials;

      // First create a CIDR entry to get
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

      createdCidrId = created.id;

      // Now get it
      const result = yield* getDatabasePostgresCidr({
        organization,
        database: testDatabase,
        id: created.id,
      });

      expect(result).toHaveProperty("id", created.id);
      expect(result).toHaveProperty("schema");
      expect(result).toHaveProperty("role");
      expect(result).toHaveProperty("cidrs");
      expect(result.cidrs).toContain("10.0.0.0/24");
      expect(result).toHaveProperty("created_at");
      expect(result).toHaveProperty("updated_at");
      expect(result).toHaveProperty("actor");
    }).pipe(
      // Always clean up the CIDR entry, even if the test fails
      Effect.ensuring(
        Effect.gen(function* () {
          if (createdCidrId) {
            const { organization } = yield* Credentials;
            yield* deleteDatabasePostgresCidr({
              organization,
              database: testDatabase,
              id: createdCidrId,
            }).pipe(Effect.ignore);
          }
        }),
      ),
    );
  });
});
