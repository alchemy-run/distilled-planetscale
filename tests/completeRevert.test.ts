import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  completeRevert,
  CompleteRevertNotfound,
  CompleteRevertInput,
  CompleteRevertOutput,
} from "../src/operations/completeRevert";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("completeRevert", (it) => {
  it("should have the correct input schema", () => {
    expect(CompleteRevertInput.fields.organization).toBeDefined();
    expect(CompleteRevertInput.fields.database).toBeDefined();
    expect(CompleteRevertInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CompleteRevertOutput.fields.id).toBeDefined();
    expect(CompleteRevertOutput.fields.number).toBeDefined();
    expect(CompleteRevertOutput.fields.state).toBeDefined();
    expect(CompleteRevertOutput.fields.deployment_state).toBeDefined();
    expect(CompleteRevertOutput.fields.branch).toBeDefined();
    expect(CompleteRevertOutput.fields.into_branch).toBeDefined();
  });

  it.effect("should return CompleteRevertNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* completeRevert({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CompleteRevertNotfound);
      if (result instanceof CompleteRevertNotfound) {
        expect(result._tag).toBe("CompleteRevertNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return CompleteRevertNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* completeRevert({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CompleteRevertNotfound);
      if (result instanceof CompleteRevertNotfound) {
        expect(result._tag).toBe("CompleteRevertNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return CompleteRevertNotfound for non-existent deploy request number", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = TEST_DATABASE;
      const result = yield* completeRevert({
        organization,
        database,
        number: 999999999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CompleteRevertNotfound);
      if (result instanceof CompleteRevertNotfound) {
        expect(result._tag).toBe("CompleteRevertNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.number).toBe(999999999);
      }
    }),
  );
});
