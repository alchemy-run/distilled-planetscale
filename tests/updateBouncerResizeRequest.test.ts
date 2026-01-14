import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  updateBouncerResizeRequest,
  UpdateBouncerResizeRequestNotfound,
  UpdateBouncerResizeRequestInput,
  UpdateBouncerResizeRequestOutput,
} from "../src/operations/updateBouncerResizeRequest";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("updateBouncerResizeRequest", (it) => {
  it("should have the correct input schema", () => {
    expect(UpdateBouncerResizeRequestInput.fields.organization).toBeDefined();
    expect(UpdateBouncerResizeRequestInput.fields.database).toBeDefined();
    expect(UpdateBouncerResizeRequestInput.fields.branch).toBeDefined();
    expect(UpdateBouncerResizeRequestInput.fields.bouncer).toBeDefined();
    expect(UpdateBouncerResizeRequestInput.fields.bouncer_size).toBeDefined();
    expect(UpdateBouncerResizeRequestInput.fields.replicas_per_cell).toBeDefined();
    expect(UpdateBouncerResizeRequestInput.fields.parameters).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(UpdateBouncerResizeRequestOutput.fields.id).toBeDefined();
    expect(UpdateBouncerResizeRequestOutput.fields.state).toBeDefined();
    expect(UpdateBouncerResizeRequestOutput.fields.replicas_per_cell).toBeDefined();
    expect(UpdateBouncerResizeRequestOutput.fields.parameters).toBeDefined();
    expect(UpdateBouncerResizeRequestOutput.fields.previous_replicas_per_cell).toBeDefined();
    expect(UpdateBouncerResizeRequestOutput.fields.previous_parameters).toBeDefined();
    expect(UpdateBouncerResizeRequestOutput.fields.started_at).toBeDefined();
    expect(UpdateBouncerResizeRequestOutput.fields.completed_at).toBeDefined();
    expect(UpdateBouncerResizeRequestOutput.fields.created_at).toBeDefined();
    expect(UpdateBouncerResizeRequestOutput.fields.updated_at).toBeDefined();
    expect(UpdateBouncerResizeRequestOutput.fields.actor).toBeDefined();
    expect(UpdateBouncerResizeRequestOutput.fields.bouncer).toBeDefined();
    expect(UpdateBouncerResizeRequestOutput.fields.sku).toBeDefined();
    expect(UpdateBouncerResizeRequestOutput.fields.previous_sku).toBeDefined();
  });

  it.effect("should return UpdateBouncerResizeRequestNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* updateBouncerResizeRequest({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        bouncer: "some-bouncer-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateBouncerResizeRequestNotfound);
      if (result instanceof UpdateBouncerResizeRequestNotfound) {
        expect(result._tag).toBe("UpdateBouncerResizeRequestNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateBouncerResizeRequestNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* updateBouncerResizeRequest({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        bouncer: "some-bouncer-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateBouncerResizeRequestNotfound);
      if (result instanceof UpdateBouncerResizeRequestNotfound) {
        expect(result._tag).toBe("UpdateBouncerResizeRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateBouncerResizeRequestNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const result = yield* updateBouncerResizeRequest({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
        bouncer: "some-bouncer-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateBouncerResizeRequestNotfound);
      if (result instanceof UpdateBouncerResizeRequestNotfound) {
        expect(result._tag).toBe("UpdateBouncerResizeRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateBouncerResizeRequestNotfound for non-existent bouncer", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const branch = "main";
      const result = yield* updateBouncerResizeRequest({
        organization,
        database,
        branch,
        bouncer: "this-bouncer-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateBouncerResizeRequestNotfound);
      if (result instanceof UpdateBouncerResizeRequestNotfound) {
        expect(result._tag).toBe("UpdateBouncerResizeRequestNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.bouncer).toBe("this-bouncer-definitely-does-not-exist-12345");
      }
    }),
  );
});
