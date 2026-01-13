import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  updateDatabaseThrottler,
  UpdateDatabaseThrottlerNotfound,
  UpdateDatabaseThrottlerInput,
  UpdateDatabaseThrottlerOutput,
} from "../src/operations/updateDatabaseThrottler";
import { withMainLayer } from "./setup";

withMainLayer("updateDatabaseThrottler", (it) => {
  it("should have the correct input schema", () => {
    expect(UpdateDatabaseThrottlerInput.fields.organization).toBeDefined();
    expect(UpdateDatabaseThrottlerInput.fields.database).toBeDefined();
    expect(UpdateDatabaseThrottlerInput.fields.ratio).toBeDefined();
    expect(UpdateDatabaseThrottlerInput.fields.configurations).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(UpdateDatabaseThrottlerOutput.fields.keyspaces).toBeDefined();
    expect(UpdateDatabaseThrottlerOutput.fields.configurable).toBeDefined();
    expect(UpdateDatabaseThrottlerOutput.fields.configurations).toBeDefined();
  });

  it.effect("should return UpdateDatabaseThrottlerNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* updateDatabaseThrottler({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateDatabaseThrottlerNotfound);
      if (result instanceof UpdateDatabaseThrottlerNotfound) {
        expect(result._tag).toBe("UpdateDatabaseThrottlerNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateDatabaseThrottlerNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* updateDatabaseThrottler({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "some-db",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateDatabaseThrottlerNotfound);
      if (result instanceof UpdateDatabaseThrottlerNotfound) {
        expect(result._tag).toBe("UpdateDatabaseThrottlerNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );
});
