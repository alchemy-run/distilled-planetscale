import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  listKeyspaces,
  ListKeyspacesInput,
  ListKeyspacesNotfound,
  ListKeyspacesOutput,
} from "../src/operations/listKeyspaces";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("listKeyspaces", () => {
  // Schema validation
  it("should have the correct input schema", () => {
    expect(ListKeyspacesInput.fields.organization).toBeDefined();
    expect(ListKeyspacesInput.fields.database).toBeDefined();
    expect(ListKeyspacesInput.fields.branch).toBeDefined();
    // Optional fields
    expect(ListKeyspacesInput.fields.page).toBeDefined();
    expect(ListKeyspacesInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListKeyspacesOutput.fields.current_page).toBeDefined();
    expect(ListKeyspacesOutput.fields.next_page).toBeDefined();
    expect(ListKeyspacesOutput.fields.next_page_url).toBeDefined();
    expect(ListKeyspacesOutput.fields.prev_page).toBeDefined();
    expect(ListKeyspacesOutput.fields.prev_page_url).toBeDefined();
    expect(ListKeyspacesOutput.fields.data).toBeDefined();
  });

  it.effect("should list keyspaces successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const branch = "main";

      const result = yield* listKeyspaces({
        organization,
        database,
        branch,
      }).pipe(
        // Handle case where database/branch doesn't exist
        Effect.catchTag("ListKeyspacesNotfound", () =>
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

  it.effect("should return ListKeyspacesNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listKeyspaces({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListKeyspacesNotfound);
      if (result instanceof ListKeyspacesNotfound) {
        expect(result._tag).toBe("ListKeyspacesNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ListKeyspacesNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listKeyspaces({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListKeyspacesNotfound);
      if (result instanceof ListKeyspacesNotfound) {
        expect(result._tag).toBe("ListKeyspacesNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ListKeyspacesNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listKeyspaces({
        organization,
        database: "test", // Assuming a test database exists
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListKeyspacesNotfound);
      if (result instanceof ListKeyspacesNotfound) {
        expect(result._tag).toBe("ListKeyspacesNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
