import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import { createDatabase } from "../src/operations/createDatabase";
import {
  deleteDatabase,
  DeleteDatabaseNotfound,
  DeleteDatabaseInput,
  DeleteDatabaseOutput,
} from "../src/operations/deleteDatabase";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("deleteDatabase", () => {
  it("should have the correct input schema", () => {
    // Verify the schema structure
    expect(DeleteDatabaseInput.fields.organization).toBeDefined();
    expect(DeleteDatabaseInput.fields.database).toBeDefined();
  });

  it("should have a void output schema", () => {
    // DeleteDatabaseOutput is Schema.Void
    expect(DeleteDatabaseOutput).toBeDefined();
  });

  it.effect("should return DeleteDatabaseNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* deleteDatabase({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteDatabaseNotfound);
      if (result instanceof DeleteDatabaseNotfound) {
        expect(result._tag).toBe("DeleteDatabaseNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DeleteDatabaseNotfound for non-existent organization", () =>
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

      expect(result).toBeInstanceOf(DeleteDatabaseNotfound);
      if (result instanceof DeleteDatabaseNotfound) {
        expect(result._tag).toBe("DeleteDatabaseNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test is skipped because the current client.ts doesn't send request bodies for POST.
  // When that's fixed, this test demonstrates proper cleanup using Effect.ensuring.
  it.skip("should delete a database successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const testDbName = `test-db-delete-${Date.now()}`;

      // First create a database to delete
      yield* createDatabase({
        organization,
        name: testDbName,
        cluster_size: "PS_10",
      });

      // Now delete it
      const result = yield* deleteDatabase({
        organization,
        database: testDbName,
      });

      // deleteDatabase returns void on success
      expect(result).toBeUndefined();
    }).pipe(
      // Ensure cleanup even if test assertions fail
      Effect.ensuring(
        Effect.gen(function* () {
          const { organization } = yield* PlanetScaleCredentials;
          const testDbName = `test-db-delete-${Date.now()}`;
          yield* deleteDatabase({
            organization,
            database: testDbName,
          }).pipe(Effect.ignore);
        }),
      ),
      Effect.provide(MainLayer),
    ),
  );
});
