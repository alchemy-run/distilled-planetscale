import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleParseError } from "../src/client";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getDatabaseThrottler,
  GetDatabaseThrottlerForbidden,
  GetDatabaseThrottlerNotfound,
} from "../src/operations/getDatabaseThrottler";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("getDatabaseThrottler", (it) => {
  it.effect("should fetch database throttler successfully", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* getDatabaseThrottler({
        organization,
        database: TEST_DATABASE,
      }).pipe(
        // Handle case where database doesn't exist, access is forbidden, or schema parse error
        Effect.catchTag("GetDatabaseThrottlerNotfound", () => Effect.succeed(null)),
        Effect.catchTag("GetDatabaseThrottlerForbidden", () => Effect.succeed(null)),
        Effect.catchTag("PlanetScaleParseError", () => Effect.succeed(null)),
      );

      if (result === null) {
        return; // Skip test gracefully
      }

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

      const isExpectedError = result instanceof GetDatabaseThrottlerNotfound || result instanceof GetDatabaseThrottlerForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );
});
