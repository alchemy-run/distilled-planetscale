import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  cancelDeployRequest,
  CancelDeployRequestNotfound,
  CancelDeployRequestInput,
  CancelDeployRequestOutput,
} from "../src/operations/cancelDeployRequest";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("cancelDeployRequest", (it) => {
  it("should have the correct input schema", () => {
    expect(CancelDeployRequestInput.fields.organization).toBeDefined();
    expect(CancelDeployRequestInput.fields.database).toBeDefined();
    expect(CancelDeployRequestInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CancelDeployRequestOutput.fields.id).toBeDefined();
    expect(CancelDeployRequestOutput.fields.number).toBeDefined();
    expect(CancelDeployRequestOutput.fields.state).toBeDefined();
    expect(CancelDeployRequestOutput.fields.deployment_state).toBeDefined();
    expect(CancelDeployRequestOutput.fields.branch).toBeDefined();
    expect(CancelDeployRequestOutput.fields.into_branch).toBeDefined();
  });

  it.effect("should return CancelDeployRequestNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* cancelDeployRequest({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CancelDeployRequestNotfound);
      if (result instanceof CancelDeployRequestNotfound) {
        expect(result._tag).toBe("CancelDeployRequestNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return CancelDeployRequestNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* cancelDeployRequest({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CancelDeployRequestNotfound);
      if (result instanceof CancelDeployRequestNotfound) {
        expect(result._tag).toBe("CancelDeployRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return CancelDeployRequestNotfound for non-existent deploy request number", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = TEST_DATABASE;
      const result = yield* cancelDeployRequest({
        organization,
        database,
        number: 999999999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CancelDeployRequestNotfound);
      if (result instanceof CancelDeployRequestNotfound) {
        expect(result._tag).toBe("CancelDeployRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.number).toBe(999999999);
      }
    }),
  );
});
