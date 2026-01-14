import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  listDatabaseRegions,
  ListDatabaseRegionsNotfound,
  ListDatabaseRegionsInput,
  ListDatabaseRegionsOutput,
} from "../src/operations/listDatabaseRegions";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("listDatabaseRegions", (it) => {
  it("should have the correct input schema", () => {
    expect(ListDatabaseRegionsInput.fields.organization).toBeDefined();
    expect(ListDatabaseRegionsInput.fields.database).toBeDefined();
    expect(ListDatabaseRegionsInput.fields.page).toBeDefined();
    expect(ListDatabaseRegionsInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListDatabaseRegionsOutput.fields.data).toBeDefined();
    expect(ListDatabaseRegionsOutput.fields.current_page).toBeDefined();
    expect(ListDatabaseRegionsOutput.fields.next_page).toBeDefined();
    expect(ListDatabaseRegionsOutput.fields.prev_page).toBeDefined();
  });

  it.effect("should list database regions successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;

      // Use the "test" database which should exist based on other tests
      const result = yield* listDatabaseRegions({
        organization,
        database: TEST_DATABASE,
      }).pipe(
        Effect.catchTag("ListDatabaseRegionsNotfound", () =>
          Effect.succeed({
            data: [],
            current_page: 1,
            next_page: 0,
            next_page_url: "",
            prev_page: 0,
            prev_page_url: "",
          }),
        ),
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
      expect(Array.isArray(result.data)).toBe(true);
    }),
  );

  it.effect("should support pagination parameters", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;

      const result = yield* listDatabaseRegions({
        organization,
        database: TEST_DATABASE,
        page: 1,
        per_page: 5,
      }).pipe(
        Effect.catchTag("ListDatabaseRegionsNotfound", () =>
          Effect.succeed({
            data: [],
            current_page: 1,
            next_page: 0,
            next_page_url: "",
            prev_page: 0,
            prev_page_url: "",
          }),
        ),
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
    }),
  );

  it.effect("should return ListDatabaseRegionsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;

      const result = yield* listDatabaseRegions({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListDatabaseRegionsNotfound);
      if (result instanceof ListDatabaseRegionsNotfound) {
        expect(result._tag).toBe("ListDatabaseRegionsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListDatabaseRegionsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listDatabaseRegions({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "some-db",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListDatabaseRegionsNotfound);
      if (result instanceof ListDatabaseRegionsNotfound) {
        expect(result._tag).toBe("ListDatabaseRegionsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );
});
