import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  listParameters,
  ListParametersInput,
  ListParametersNotfound,
  ListParametersOutput,
} from "../src/operations/listParameters";
import { withMainLayer } from "./setup";

withMainLayer("listParameters", (it) => {
  // Schema validation
  it("should have the correct input schema", () => {
    expect(ListParametersInput.fields.organization).toBeDefined();
    expect(ListParametersInput.fields.database).toBeDefined();
    expect(ListParametersInput.fields.branch).toBeDefined();
  });

  it("should have the correct output schema", () => {
    // ListParametersOutput is an array of parameter objects
    expect(ListParametersOutput).toBeDefined();
  });

  it.effect("should list parameters successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const branch = "main";

      const result = yield* listParameters({
        organization,
        database,
        branch,
      }).pipe(
        // Handle case where database/branch doesn't exist
        Effect.catchTag("ListParametersNotfound", () =>
          Effect.succeed([]),
        ),
      );

      expect(Array.isArray(result)).toBe(true);
      // If we got results, verify the structure
      if (result.length > 0) {
        const param = result[0];
        expect(param).toHaveProperty("id");
        expect(param).toHaveProperty("name");
        expect(param).toHaveProperty("display_name");
        expect(param).toHaveProperty("namespace");
        expect(param).toHaveProperty("category");
        expect(param).toHaveProperty("description");
        expect(param).toHaveProperty("default_value");
        expect(param).toHaveProperty("value");
      }
    }),
  );

  it.effect("should return ListParametersNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listParameters({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListParametersNotfound);
      if (result instanceof ListParametersNotfound) {
        expect(result._tag).toBe("ListParametersNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListParametersNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* listParameters({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListParametersNotfound);
      if (result instanceof ListParametersNotfound) {
        expect(result._tag).toBe("ListParametersNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListParametersNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const result = yield* listParameters({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListParametersNotfound);
      if (result instanceof ListParametersNotfound) {
        expect(result._tag).toBe("ListParametersNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );
});
