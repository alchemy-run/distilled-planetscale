import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  getDatabasePostgresCidr,
  GetDatabasePostgresCidrNotfound,
  GetDatabasePostgresCidrInput,
  GetDatabasePostgresCidrOutput,
} from "../src/operations/getDatabasePostgresCidr";
import { createDatabasePostgresCidr } from "../src/operations/createDatabasePostgresCidr";
import { deleteDatabasePostgresCidr } from "../src/operations/deleteDatabasePostgresCidr";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("getDatabasePostgresCidr", () => {
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

      expect(result).toBeInstanceOf(GetDatabasePostgresCidrNotfound);
      if (result instanceof GetDatabasePostgresCidrNotfound) {
        expect(result._tag).toBe("GetDatabasePostgresCidrNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return GetDatabasePostgresCidrNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
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

      expect(result).toBeInstanceOf(GetDatabasePostgresCidrNotfound);
      if (result instanceof GetDatabasePostgresCidrNotfound) {
        expect(result._tag).toBe("GetDatabasePostgresCidrNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return GetDatabasePostgresCidrNotfound for non-existent CIDR id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getDatabasePostgresCidr({
        organization,
        database: "test", // Assumes a test database exists
        id: "this-cidr-id-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetDatabasePostgresCidrNotfound);
      if (result instanceof GetDatabasePostgresCidrNotfound) {
        expect(result._tag).toBe("GetDatabasePostgresCidrNotfound");
        expect(result.organization).toBe(organization);
        expect(result.id).toBe("this-cidr-id-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test is skipped because it requires a PostgreSQL-enabled database.
  // PlanetScale's CIDR allowlist feature is only available for PostgreSQL databases.
  // When you have a PostgreSQL database available, you can enable this test.
  it.skip("should get a PostgreSQL CIDR allowlist entry successfully", () => {
    const testDatabase = "your-postgres-db"; // Replace with actual PostgreSQL database name
    let createdCidrId: string | undefined;

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // First create a CIDR entry to get
      const created = yield* createDatabasePostgresCidr({
        organization,
        database: testDatabase,
        cidrs: ["10.0.0.0/24"],
      });

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
            const { organization } = yield* PlanetScaleCredentials;
            yield* deleteDatabasePostgresCidr({
              organization,
              database: testDatabase,
              id: createdCidrId,
            }).pipe(Effect.ignore);
          }
        }),
      ),
      Effect.provide(MainLayer),
    );
  });
});
