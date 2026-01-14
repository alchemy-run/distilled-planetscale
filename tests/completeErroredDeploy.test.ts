import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  completeErroredDeploy,
  CompleteErroredDeployNotfound,
  CompleteErroredDeployInput,
  CompleteErroredDeployOutput,
} from "../src/operations/completeErroredDeploy";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("completeErroredDeploy", (it) => {
  it("should have the correct input schema", () => {
    expect(CompleteErroredDeployInput.fields.organization).toBeDefined();
    expect(CompleteErroredDeployInput.fields.database).toBeDefined();
    expect(CompleteErroredDeployInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CompleteErroredDeployOutput.fields.id).toBeDefined();
    expect(CompleteErroredDeployOutput.fields.number).toBeDefined();
    expect(CompleteErroredDeployOutput.fields.state).toBeDefined();
    expect(CompleteErroredDeployOutput.fields.deployment_state).toBeDefined();
    expect(CompleteErroredDeployOutput.fields.branch).toBeDefined();
    expect(CompleteErroredDeployOutput.fields.into_branch).toBeDefined();
  });

  it.effect("should return CompleteErroredDeployNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* completeErroredDeploy({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CompleteErroredDeployNotfound);
      if (result instanceof CompleteErroredDeployNotfound) {
        expect(result._tag).toBe("CompleteErroredDeployNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return CompleteErroredDeployNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* completeErroredDeploy({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CompleteErroredDeployNotfound);
      if (result instanceof CompleteErroredDeployNotfound) {
        expect(result._tag).toBe("CompleteErroredDeployNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return CompleteErroredDeployNotfound for non-existent deploy request number", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const result = yield* completeErroredDeploy({
        organization,
        database,
        number: 999999999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CompleteErroredDeployNotfound);
      if (result instanceof CompleteErroredDeployNotfound) {
        expect(result._tag).toBe("CompleteErroredDeployNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.number).toBe(999999999);
      }
    }),
  );
});
