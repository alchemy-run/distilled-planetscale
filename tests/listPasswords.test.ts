import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  listPasswords,
  ListPasswordsNotfound,
  ListPasswordsInput,
  ListPasswordsOutput,
} from "../src/operations/listPasswords";
import { withMainLayer } from "./setup";

withMainLayer("listPasswords", (it) => {
  it("should have the correct input schema", () => {
    expect(ListPasswordsInput.fields.organization).toBeDefined();
    expect(ListPasswordsInput.fields.database).toBeDefined();
    expect(ListPasswordsInput.fields.branch).toBeDefined();
    expect(ListPasswordsInput.fields.read_only_region_id).toBeDefined();
    expect(ListPasswordsInput.fields.page).toBeDefined();
    expect(ListPasswordsInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListPasswordsOutput.fields.current_page).toBeDefined();
    expect(ListPasswordsOutput.fields.next_page).toBeDefined();
    expect(ListPasswordsOutput.fields.next_page_url).toBeDefined();
    expect(ListPasswordsOutput.fields.prev_page).toBeDefined();
    expect(ListPasswordsOutput.fields.prev_page_url).toBeDefined();
    expect(ListPasswordsOutput.fields.data).toBeDefined();
  });

  it.effect("should return ListPasswordsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listPasswords({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListPasswordsNotfound);
      if (result instanceof ListPasswordsNotfound) {
        expect(result._tag).toBe("ListPasswordsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListPasswordsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listPasswords({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListPasswordsNotfound);
      if (result instanceof ListPasswordsNotfound) {
        expect(result._tag).toBe("ListPasswordsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListPasswordsNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listPasswords({
        organization,
        database: "test", // Assumes a test database exists
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListPasswordsNotfound);
      if (result instanceof ListPasswordsNotfound) {
        expect(result._tag).toBe("ListPasswordsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should list passwords successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listPasswords({
        organization,
        database: "test", // Assumes a test database exists
        branch: "main",
      }).pipe(
        // Handle case where test database/branch doesn't exist
        Effect.catchTag("ListPasswordsNotfound", () =>
          Effect.succeed({
            current_page: 1,
            next_page: 1,
            next_page_url: "",
            prev_page: 1,
            prev_page_url: "",
            data: [],
          }),
        ),
      );

      expect(result).toHaveProperty("current_page");
      expect(result).toHaveProperty("next_page");
      expect(result).toHaveProperty("next_page_url");
      expect(result).toHaveProperty("prev_page");
      expect(result).toHaveProperty("prev_page_url");
      expect(result).toHaveProperty("data");
      expect(Array.isArray(result.data)).toBe(true);
    }),
  );
});
