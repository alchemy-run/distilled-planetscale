import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  skipRevertPeriod,
  SkipRevertPeriodNotfound,
  SkipRevertPeriodInput,
  SkipRevertPeriodOutput,
} from "../src/operations/skipRevertPeriod";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("skipRevertPeriod", (it) => {
  it("should have the correct input schema", () => {
    expect(SkipRevertPeriodInput.fields.organization).toBeDefined();
    expect(SkipRevertPeriodInput.fields.database).toBeDefined();
    expect(SkipRevertPeriodInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(SkipRevertPeriodOutput.fields.id).toBeDefined();
    expect(SkipRevertPeriodOutput.fields.number).toBeDefined();
    expect(SkipRevertPeriodOutput.fields.state).toBeDefined();
    expect(SkipRevertPeriodOutput.fields.deployment_state).toBeDefined();
    expect(SkipRevertPeriodOutput.fields.branch).toBeDefined();
    expect(SkipRevertPeriodOutput.fields.into_branch).toBeDefined();
  });

  it.effect("should return SkipRevertPeriodNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* skipRevertPeriod({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(SkipRevertPeriodNotfound);
      if (result instanceof SkipRevertPeriodNotfound) {
        expect(result._tag).toBe("SkipRevertPeriodNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return SkipRevertPeriodNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* skipRevertPeriod({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(SkipRevertPeriodNotfound);
      if (result instanceof SkipRevertPeriodNotfound) {
        expect(result._tag).toBe("SkipRevertPeriodNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return SkipRevertPeriodNotfound for non-existent deploy request number", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const result = yield* skipRevertPeriod({
        organization,
        database,
        number: 999999999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(SkipRevertPeriodNotfound);
      if (result instanceof SkipRevertPeriodNotfound) {
        expect(result._tag).toBe("SkipRevertPeriodNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.number).toBe(999999999);
      }
    }),
  );
});
