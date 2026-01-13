import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getDeployRequestThrottler,
  GetDeployRequestThrottlerNotfound,
  GetDeployRequestThrottlerInput,
  GetDeployRequestThrottlerOutput,
} from "../src/operations/getDeployRequestThrottler";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("getDeployRequestThrottler", (it) => {
  it("should have the correct input schema", () => {
    expect(GetDeployRequestThrottlerInput.fields.organization).toBeDefined();
    expect(GetDeployRequestThrottlerInput.fields.database).toBeDefined();
    expect(GetDeployRequestThrottlerInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetDeployRequestThrottlerOutput.fields.keyspaces).toBeDefined();
    expect(GetDeployRequestThrottlerOutput.fields.configurable).toBeDefined();
    expect(GetDeployRequestThrottlerOutput.fields.configurations).toBeDefined();
  });

  it.effect("should return GetDeployRequestThrottlerNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getDeployRequestThrottler({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetDeployRequestThrottlerNotfound);
      if (result instanceof GetDeployRequestThrottlerNotfound) {
        expect(result._tag).toBe("GetDeployRequestThrottlerNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetDeployRequestThrottlerNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getDeployRequestThrottler({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetDeployRequestThrottlerNotfound);
      if (result instanceof GetDeployRequestThrottlerNotfound) {
        expect(result._tag).toBe("GetDeployRequestThrottlerNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetDeployRequestThrottlerNotfound for non-existent deploy request number", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = TEST_DATABASE;
      const result = yield* getDeployRequestThrottler({
        organization,
        database,
        number: 999999999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetDeployRequestThrottlerNotfound);
      if (result instanceof GetDeployRequestThrottlerNotfound) {
        expect(result._tag).toBe("GetDeployRequestThrottlerNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.number).toBe(999999999);
      }
    }),
  );
});
