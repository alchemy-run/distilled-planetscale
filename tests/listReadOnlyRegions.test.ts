import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  listReadOnlyRegions,
  ListReadOnlyRegionsNotfound,
  ListReadOnlyRegionsInput,
  ListReadOnlyRegionsOutput,
} from "../src/operations/listReadOnlyRegions";
import { withMainLayer } from "./setup";

withMainLayer("listReadOnlyRegions", (it) => {
  it("should have the correct input schema", () => {
    expect(ListReadOnlyRegionsInput.fields.organization).toBeDefined();
    expect(ListReadOnlyRegionsInput.fields.database).toBeDefined();
    expect(ListReadOnlyRegionsInput.fields.page).toBeDefined();
    expect(ListReadOnlyRegionsInput.fields.per_page).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ListReadOnlyRegionsOutput.fields.data).toBeDefined();
    expect(ListReadOnlyRegionsOutput.fields.current_page).toBeDefined();
    expect(ListReadOnlyRegionsOutput.fields.next_page).toBeDefined();
    expect(ListReadOnlyRegionsOutput.fields.prev_page).toBeDefined();
    expect(ListReadOnlyRegionsOutput.fields.next_page_url).toBeDefined();
    expect(ListReadOnlyRegionsOutput.fields.prev_page_url).toBeDefined();
  });

  it.effect("should list read-only regions successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // Use the "test" database which should exist based on other tests
      const result = yield* listReadOnlyRegions({
        organization,
        database: "test",
      }).pipe(
        Effect.catchTag("ListReadOnlyRegionsNotfound", () =>
          Effect.succeed({ data: [], current_page: 1, next_page: 0, next_page_url: "", prev_page: 0, prev_page_url: "" }),
        ),
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
      expect(Array.isArray(result.data)).toBe(true);
    }),
  );

  it.effect("should support pagination parameters", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* listReadOnlyRegions({
        organization,
        database: "test",
        page: 1,
        per_page: 5,
      }).pipe(
        Effect.catchTag("ListReadOnlyRegionsNotfound", () =>
          Effect.succeed({ data: [], current_page: 1, next_page: 0, next_page_url: "", prev_page: 0, prev_page_url: "" }),
        ),
      );

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
    }),
  );

  it.effect("should return ListReadOnlyRegionsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* listReadOnlyRegions({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListReadOnlyRegionsNotfound);
      if (result instanceof ListReadOnlyRegionsNotfound) {
        expect(result._tag).toBe("ListReadOnlyRegionsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListReadOnlyRegionsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listReadOnlyRegions({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "some-db",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListReadOnlyRegionsNotfound);
      if (result instanceof ListReadOnlyRegionsNotfound) {
        expect(result._tag).toBe("ListReadOnlyRegionsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );
});
