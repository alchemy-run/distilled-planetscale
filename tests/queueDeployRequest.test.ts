import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  queueDeployRequest,
  QueueDeployRequestNotfound,
  QueueDeployRequestInput,
  QueueDeployRequestOutput,
} from "../src/operations/queueDeployRequest";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("queueDeployRequest", (it) => {
  it("should have the correct input schema", () => {
    expect(QueueDeployRequestInput.fields.organization).toBeDefined();
    expect(QueueDeployRequestInput.fields.database).toBeDefined();
    expect(QueueDeployRequestInput.fields.number).toBeDefined();
    expect(QueueDeployRequestInput.fields.instant_ddl).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(QueueDeployRequestOutput.fields.id).toBeDefined();
    expect(QueueDeployRequestOutput.fields.number).toBeDefined();
    expect(QueueDeployRequestOutput.fields.state).toBeDefined();
    expect(QueueDeployRequestOutput.fields.deployment_state).toBeDefined();
    expect(QueueDeployRequestOutput.fields.branch).toBeDefined();
    expect(QueueDeployRequestOutput.fields.into_branch).toBeDefined();
    expect(QueueDeployRequestOutput.fields.approved).toBeDefined();
    expect(QueueDeployRequestOutput.fields.deployment).toBeDefined();
  });

  it.effect("should return QueueDeployRequestNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* queueDeployRequest({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(QueueDeployRequestNotfound);
      if (result instanceof QueueDeployRequestNotfound) {
        expect(result._tag).toBe("QueueDeployRequestNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return QueueDeployRequestNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* queueDeployRequest({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 1,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(QueueDeployRequestNotfound);
      if (result instanceof QueueDeployRequestNotfound) {
        expect(result._tag).toBe("QueueDeployRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return QueueDeployRequestNotfound for non-existent deploy request number", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const result = yield* queueDeployRequest({
        organization,
        database,
        number: 999999999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(QueueDeployRequestNotfound);
      if (result instanceof QueueDeployRequestNotfound) {
        expect(result._tag).toBe("QueueDeployRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.number).toBe(999999999);
      }
    }),
  );
});
