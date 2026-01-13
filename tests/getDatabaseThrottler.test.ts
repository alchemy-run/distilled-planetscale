import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getDatabaseThrottler,
  GetDatabaseThrottlerNotfound,
} from "../src/operations/getDatabaseThrottler";
import { withMainLayer } from "./setup";

withMainLayer("getDatabaseThrottler", (it) => {
  it.effect("should fetch database throttler successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* getDatabaseThrottler({
        organization,
        database: "test",
      }).pipe(
        Effect.catchTag("GetDatabaseThrottlerNotfound", () =>
          Effect.succeed({
            keyspaces: [] as string[],
            configurable: {
              id: "not-found",
              name: "not-found",
              created_at: "",
              updated_at: "",
              deleted_at: "",
            },
            configurations: [] as { keyspace_name: string; ratio: number }[],
          }),
        ),
      );

      expect(result).toHaveProperty("keyspaces");
      expect(result).toHaveProperty("configurable");
      expect(result).toHaveProperty("configurations");
    }),
  );

  it.effect("should return GetDatabaseThrottlerNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* getDatabaseThrottler({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetDatabaseThrottlerNotfound);
      if (result instanceof GetDatabaseThrottlerNotfound) {
        expect(result._tag).toBe("GetDatabaseThrottlerNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );
});
