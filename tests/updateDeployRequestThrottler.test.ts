import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  updateDeployRequestThrottler,
  UpdateDeployRequestThrottlerNotfound,
  UpdateDeployRequestThrottlerInput,
  UpdateDeployRequestThrottlerOutput,
} from "../src/operations/updateDeployRequestThrottler";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("updateDeployRequestThrottler", (it) => {
  it("should have the correct input schema", () => {
    expect(UpdateDeployRequestThrottlerInput.fields.organization).toBeDefined();
    expect(UpdateDeployRequestThrottlerInput.fields.database).toBeDefined();
    expect(UpdateDeployRequestThrottlerInput.fields.number).toBeDefined();
    expect(UpdateDeployRequestThrottlerInput.fields.ratio).toBeDefined();
    expect(UpdateDeployRequestThrottlerInput.fields.configurations).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(UpdateDeployRequestThrottlerOutput.fields.keyspaces).toBeDefined();
    expect(UpdateDeployRequestThrottlerOutput.fields.configurable).toBeDefined();
    expect(UpdateDeployRequestThrottlerOutput.fields.configurations).toBeDefined();
  });

  it.effect(
    "should return UpdateDeployRequestThrottlerNotfound for non-existent organization",
    () =>
      Effect.gen(function* () {
        const result = yield* updateDeployRequestThrottler({
          organization: "this-org-definitely-does-not-exist-12345",
          database: "test-db",
          number: 1,
        }).pipe(
          Effect.matchEffect({
            onFailure: (error) => Effect.succeed(error),
            onSuccess: () => Effect.succeed(null),
          }),
        );

        expect(result).toBeInstanceOf(UpdateDeployRequestThrottlerNotfound);
        if (result instanceof UpdateDeployRequestThrottlerNotfound) {
          expect(result._tag).toBe("UpdateDeployRequestThrottlerNotfound");
          expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
        }
      }),
  );

  it.effect("should return UpdateDeployRequestThrottlerNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* updateDeployRequestThrottler({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateDeployRequestThrottlerNotfound);
      if (result instanceof UpdateDeployRequestThrottlerNotfound) {
        expect(result._tag).toBe("UpdateDeployRequestThrottlerNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect(
    "should return UpdateDeployRequestThrottlerNotfound for non-existent deploy request number",
    () =>
      Effect.gen(function* () {
        const { organization } = yield* Credentials;
        const database = TEST_DATABASE;
        const result = yield* updateDeployRequestThrottler({
          organization,
          database,
          number: 999999999,
        }).pipe(
          Effect.matchEffect({
            onFailure: (error) => Effect.succeed(error),
            onSuccess: () => Effect.succeed(null),
          }),
        );

        expect(result).toBeInstanceOf(UpdateDeployRequestThrottlerNotfound);
        if (result instanceof UpdateDeployRequestThrottlerNotfound) {
          expect(result._tag).toBe("UpdateDeployRequestThrottlerNotfound");
          expect(result.organization).toBe(organization);
          expect(result.database).toBe(database);
          expect(result.number).toBe(999999999);
        }
      }),
  );
});
