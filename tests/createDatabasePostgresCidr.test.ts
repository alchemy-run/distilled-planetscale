import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  createDatabasePostgresCidr,
  CreateDatabasePostgresCidrNotfound,
  CreateDatabasePostgresCidrInput,
  CreateDatabasePostgresCidrOutput,
} from "../src/operations/createDatabasePostgresCidr";
import { deleteDatabasePostgresCidr } from "../src/operations/deleteDatabasePostgresCidr";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("createDatabasePostgresCidr", () => {
  it("should have the correct input schema", () => {
    // Verify the schema structure
    expect(CreateDatabasePostgresCidrInput.fields.organization).toBeDefined();
    expect(CreateDatabasePostgresCidrInput.fields.database).toBeDefined();
    expect(CreateDatabasePostgresCidrInput.fields.cidrs).toBeDefined();
    expect(CreateDatabasePostgresCidrInput.fields.schema).toBeDefined();
    expect(CreateDatabasePostgresCidrInput.fields.role).toBeDefined();
  });

  it("should have the correct output schema", () => {
    // Verify the output schema has expected fields
    expect(CreateDatabasePostgresCidrOutput.fields.id).toBeDefined();
    expect(CreateDatabasePostgresCidrOutput.fields.schema).toBeDefined();
    expect(CreateDatabasePostgresCidrOutput.fields.role).toBeDefined();
    expect(CreateDatabasePostgresCidrOutput.fields.cidrs).toBeDefined();
    expect(CreateDatabasePostgresCidrOutput.fields.created_at).toBeDefined();
    expect(CreateDatabasePostgresCidrOutput.fields.updated_at).toBeDefined();
    expect(CreateDatabasePostgresCidrOutput.fields.deleted_at).toBeDefined();
    expect(CreateDatabasePostgresCidrOutput.fields.actor).toBeDefined();
  });

  it.effect("should return CreateDatabasePostgresCidrNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* createDatabasePostgresCidr({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        cidrs: ["10.0.0.0/24"],
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateDatabasePostgresCidrNotfound);
      if (result instanceof CreateDatabasePostgresCidrNotfound) {
        expect(result._tag).toBe("CreateDatabasePostgresCidrNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return CreateDatabasePostgresCidrNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* createDatabasePostgresCidr({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        cidrs: ["10.0.0.0/24"],
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateDatabasePostgresCidrNotfound);
      if (result instanceof CreateDatabasePostgresCidrNotfound) {
        expect(result._tag).toBe("CreateDatabasePostgresCidrNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test is skipped because it requires a PostgreSQL-enabled database.
  // PlanetScale's CIDR allowlist feature is only available for PostgreSQL databases.
  // When you have a PostgreSQL database available, you can enable this test.
  it.skip("should create a PostgreSQL CIDR allowlist entry and clean up", () => {
    let createdCidrId: string | undefined;
    const testDatabase = "your-postgres-db"; // Replace with actual PostgreSQL database name

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* createDatabasePostgresCidr({
        organization,
        database: testDatabase,
        cidrs: ["10.0.0.0/24"],
      });

      createdCidrId = result.id;

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("schema");
      expect(result).toHaveProperty("role");
      expect(result).toHaveProperty("cidrs");
      expect(result.cidrs).toContain("10.0.0.0/24");
      expect(result).toHaveProperty("created_at");
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
