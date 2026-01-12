import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  deleteDatabasePostgresCidr,
  DeleteDatabasePostgresCidrNotfound,
  DeleteDatabasePostgresCidrInput,
  DeleteDatabasePostgresCidrOutput,
} from "../src/operations/deleteDatabasePostgresCidr";
import { createDatabasePostgresCidr } from "../src/operations/createDatabasePostgresCidr";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("deleteDatabasePostgresCidr", () => {
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

      expect(result).toBeInstanceOf(DeleteDatabasePostgresCidrNotfound);
      if (result instanceof DeleteDatabasePostgresCidrNotfound) {
        expect(result._tag).toBe("DeleteDatabasePostgresCidrNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
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

      expect(result).toBeInstanceOf(DeleteDatabasePostgresCidrNotfound);
      if (result instanceof DeleteDatabasePostgresCidrNotfound) {
        expect(result._tag).toBe("DeleteDatabasePostgresCidrNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DeleteDatabasePostgresCidrNotfound for non-existent CIDR id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* deleteDatabasePostgresCidr({
        organization,
        database: "test", // Assumes a test database exists
        id: "this-cidr-id-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteDatabasePostgresCidrNotfound);
      if (result instanceof DeleteDatabasePostgresCidrNotfound) {
        expect(result._tag).toBe("DeleteDatabasePostgresCidrNotfound");
        expect(result.organization).toBe(organization);
        expect(result.id).toBe("this-cidr-id-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test is skipped because it requires a PostgreSQL-enabled database.
  // PlanetScale's CIDR allowlist feature is only available for PostgreSQL databases.
  // When you have a PostgreSQL database available, you can enable this test.
  it.skip("should delete a PostgreSQL CIDR allowlist entry successfully", () => {
    const testDatabase = "your-postgres-db"; // Replace with actual PostgreSQL database name

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // First create a CIDR entry to delete
      const created = yield* createDatabasePostgresCidr({
        organization,
        database: testDatabase,
        cidrs: ["10.0.0.0/24"],
      });

      // Now delete it
      const result = yield* deleteDatabasePostgresCidr({
        organization,
        database: testDatabase,
        id: created.id,
      });

      // deleteDatabasePostgresCidr returns void on success
      expect(result).toBeUndefined();
    }).pipe(Effect.provide(MainLayer));
  });
});
