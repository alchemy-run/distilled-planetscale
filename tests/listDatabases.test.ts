import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import { listDatabases, ListDatabasesNotfound } from "../src/operations/listDatabases";
import { withMainLayer } from "./setup";

withMainLayer("listDatabases", (it) => {
  it.effect("should list databases successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;

      const result = yield* listDatabases({ organization });

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
      expect(Array.isArray(result.data)).toBe(true);
    }),
  );

  it.effect("should support pagination parameters", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;

      const result = yield* listDatabases({
        organization,
        page: 1,
        per_page: 5,
      });

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("current_page");
    }),
  );

  it.effect("should return ListDatabasesNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* listDatabases({
        organization: "this-org-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ListDatabasesNotfound);
      if (result instanceof ListDatabasesNotfound) {
        expect(result._tag).toBe("ListDatabasesNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );
});
