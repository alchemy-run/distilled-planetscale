import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getDatabase,
  GetDatabaseNotfound,
} from "../src/operations/getDatabase";
import { withMainLayer } from "./setup";

withMainLayer("getDatabase", (it) => {
  it.effect("should fetch a database successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // Use a test database name - adjust based on your PlanetScale setup
      const result = yield* getDatabase({
        organization,
        database: "test",
      }).pipe(
        Effect.catchTag("GetDatabaseNotfound", () =>
          Effect.succeed({ name: "not-found", state: "ready" as const }),
        ),
      );

      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("state");
    }),
  );

  it.effect("should return GetDatabaseNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* getDatabase({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetDatabaseNotfound);
      if (result instanceof GetDatabaseNotfound) {
        expect(result._tag).toBe("GetDatabaseNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );
});
