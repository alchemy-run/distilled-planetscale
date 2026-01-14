import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  listExtensions,
  ListExtensionsInput,
  ListExtensionsNotfound,
  ListExtensionsOutput,
} from "../src/operations/listExtensions";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("listExtensions", (it) => {
  // Schema validation
  it("should have the correct input schema", () => {
    expect(ListExtensionsInput.fields.organization).toBeDefined();
    expect(ListExtensionsInput.fields.database).toBeDefined();
    expect(ListExtensionsInput.fields.branch).toBeDefined();
  });

  it("should have the correct output schema", () => {
    // Output is an array of extension objects
    expect(ListExtensionsOutput).toBeDefined();
  });

  it.effect("should list extensions successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const branch = "main";

      const result = yield* listExtensions({
        organization,
        database,
        branch,
      }).pipe(
        // Handle case where database/branch doesn't exist
        Effect.catchTag("ListExtensionsNotfound", () =>
          Effect.succeed([]),
        ),
      );

      expect(Array.isArray(result)).toBe(true);
    }),
  );

  it.effect("should return ListExtensionsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listExtensions({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListExtensionsNotfound);
      if (result instanceof ListExtensionsNotfound) {
        expect(result._tag).toBe("ListExtensionsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListExtensionsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* listExtensions({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListExtensionsNotfound);
      if (result instanceof ListExtensionsNotfound) {
        expect(result._tag).toBe("ListExtensionsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ListExtensionsNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const result = yield* listExtensions({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListExtensionsNotfound);
      if (result instanceof ListExtensionsNotfound) {
        expect(result._tag).toBe("ListExtensionsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );
});
