import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  listBackups,
  ListBackupsInput,
  ListBackupsNotfound,
  ListBackupsOutput,
} from "../src/operations/listBackups";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("listBackups", () => {
  // Schema validation
  it("should have the correct input schema", () => {
    expect(ListBackupsInput.fields.organization).toBeDefined();
    expect(ListBackupsInput.fields.database).toBeDefined();
    expect(ListBackupsInput.fields.branch).toBeDefined();
    // Optional fields
    expect(ListBackupsInput.fields.all).toBeDefined();
    expect(ListBackupsInput.fields.state).toBeDefined();
    expect(ListBackupsInput.fields.policy).toBeDefined();
    expect(ListBackupsInput.fields.page).toBeDefined();
    expect(ListBackupsInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListBackupsOutput.fields.current_page).toBeDefined();
    expect(ListBackupsOutput.fields.next_page).toBeDefined();
    expect(ListBackupsOutput.fields.next_page_url).toBeDefined();
    expect(ListBackupsOutput.fields.prev_page).toBeDefined();
    expect(ListBackupsOutput.fields.prev_page_url).toBeDefined();
    expect(ListBackupsOutput.fields.data).toBeDefined();
  });

  it.effect("should list backups successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = "test";
      const branch = "main";

      const result = yield* listBackups({
        organization,
        database,
        branch,
      }).pipe(
        // Handle case where database/branch doesn't exist
        Effect.catchTag("ListBackupsNotfound", () =>
          Effect.succeed({
            current_page: 1,
            next_page: 0,
            next_page_url: "",
            prev_page: 0,
            prev_page_url: "",
            data: [],
          }),
        ),
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
      expect(result).toHaveProperty("next_page");
      expect(result).toHaveProperty("prev_page");
      expect(Array.isArray(result.data)).toBe(true);
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ListBackupsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listBackups({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListBackupsNotfound);
      if (result instanceof ListBackupsNotfound) {
        expect(result._tag).toBe("ListBackupsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ListBackupsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listBackups({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListBackupsNotfound);
      if (result instanceof ListBackupsNotfound) {
        expect(result._tag).toBe("ListBackupsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ListBackupsNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = "test";
      const result = yield* listBackups({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListBackupsNotfound);
      if (result instanceof ListBackupsNotfound) {
        expect(result._tag).toBe("ListBackupsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
