import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  listDatabasePostgresCidrs,
  ListDatabasePostgresCidrsNotfound,
  ListDatabasePostgresCidrsInput,
  ListDatabasePostgresCidrsOutput,
} from "../src/operations/listDatabasePostgresCidrs";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("listDatabasePostgresCidrs", () => {
  it("should have the correct input schema", () => {
    expect(ListDatabasePostgresCidrsInput.fields.organization).toBeDefined();
    expect(ListDatabasePostgresCidrsInput.fields.database).toBeDefined();
    expect(ListDatabasePostgresCidrsInput.fields.page).toBeDefined();
    expect(ListDatabasePostgresCidrsInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListDatabasePostgresCidrsOutput.fields.data).toBeDefined();
    expect(ListDatabasePostgresCidrsOutput.fields.current_page).toBeDefined();
    expect(ListDatabasePostgresCidrsOutput.fields.next_page).toBeDefined();
    expect(ListDatabasePostgresCidrsOutput.fields.next_page_url).toBeDefined();
    expect(ListDatabasePostgresCidrsOutput.fields.prev_page).toBeDefined();
    expect(ListDatabasePostgresCidrsOutput.fields.prev_page_url).toBeDefined();
  });

  it.effect("should return ListDatabasePostgresCidrsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listDatabasePostgresCidrs({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "some-db",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListDatabasePostgresCidrsNotfound);
      if (result instanceof ListDatabasePostgresCidrsNotfound) {
        expect(result._tag).toBe("ListDatabasePostgresCidrsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ListDatabasePostgresCidrsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* listDatabasePostgresCidrs({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListDatabasePostgresCidrsNotfound);
      if (result instanceof ListDatabasePostgresCidrsNotfound) {
        expect(result._tag).toBe("ListDatabasePostgresCidrsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test is skipped because it requires a PostgreSQL-enabled database.
  // PlanetScale's CIDR allowlist feature is only available for PostgreSQL databases.
  // When you have a PostgreSQL database available, you can enable this test.
  it.skip("should list PostgreSQL CIDR allowlist entries successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const testDatabase = "your-postgres-db"; // Replace with actual PostgreSQL database name

      const result = yield* listDatabasePostgresCidrs({
        organization,
        database: testDatabase,
      });

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
      expect(result).toHaveProperty("next_page");
      expect(result).toHaveProperty("prev_page");
      expect(Array.isArray(result.data)).toBe(true);
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test is skipped because it requires a PostgreSQL-enabled database.
  it.skip("should support pagination parameters", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const testDatabase = "your-postgres-db"; // Replace with actual PostgreSQL database name

      const result = yield* listDatabasePostgresCidrs({
        organization,
        database: testDatabase,
        page: 1,
        per_page: 5,
      });

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
    }).pipe(Effect.provide(MainLayer)),
  );
});
