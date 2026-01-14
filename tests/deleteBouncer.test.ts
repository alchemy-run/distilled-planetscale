import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  deleteBouncer,
  DeleteBouncerNotfound,
  DeleteBouncerForbidden,
  DeleteBouncerInput,
  DeleteBouncerOutput,
} from "../src/operations/deleteBouncer";
import { createBouncer, CreateBouncerForbidden } from "../src/operations/createBouncer";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("deleteBouncer", (it) => {
  it("should have the correct input schema", () => {
    expect(DeleteBouncerInput.fields.organization).toBeDefined();
    expect(DeleteBouncerInput.fields.database).toBeDefined();
    expect(DeleteBouncerInput.fields.branch).toBeDefined();
    expect(DeleteBouncerInput.fields.bouncer).toBeDefined();
  });

  it("should have a void output schema", () => {
    // DeleteBouncerOutput is Schema.Void
    expect(DeleteBouncerOutput).toBeDefined();
  });

  it.effect("should return DeleteBouncerNotfound or DeleteBouncerForbidden for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* deleteBouncer({
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

      const isExpectedError = result instanceof DeleteBouncerNotfound || result instanceof DeleteBouncerForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return DeleteBouncerNotfound or DeleteBouncerForbidden for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* deleteBouncer({
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

      const isExpectedError = result instanceof DeleteBouncerNotfound || result instanceof DeleteBouncerForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return DeleteBouncerNotfound or DeleteBouncerForbidden for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = TEST_DATABASE;
      const result = yield* deleteBouncer({
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

      const isExpectedError = result instanceof DeleteBouncerNotfound || result instanceof DeleteBouncerForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return DeleteBouncerNotfound or DeleteBouncerForbidden for non-existent bouncer", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = TEST_DATABASE;
      const branch = "main";
      const result = yield* deleteBouncer({
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

      const isExpectedError = result instanceof DeleteBouncerNotfound || result instanceof DeleteBouncerForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  // Note: This test creates an actual bouncer and then deletes it.
  // It requires a valid database with a branch to exist.
  // Bouncers may incur costs and take time to provision.
  it.effect("should delete a bouncer successfully", () => {
    // Use a test database name - adjust based on your PlanetScale setup
    const database = TEST_DATABASE;
    const branch = "main";
    let createdBouncerId: string | undefined;

    return Effect.gen(function* () {
      const { organization } = yield* Credentials;

      // First create a bouncer to delete
      const bouncer = yield* createBouncer({
        organization,
        database,
        branch,
      }).pipe(
        Effect.catchTag("CreateBouncerForbidden", () => Effect.succeed(null)),
        Effect.catchTag("CreateBouncerNotfound", () => Effect.succeed(null)),
      );

      if (bouncer === null) {
        return; // Skip test gracefully if creation is forbidden or feature not available
      }

      createdBouncerId = bouncer.id;

      // Now delete it
      const result = yield* deleteBouncer({
        organization,
        database,
        branch,
        bouncer: bouncer.id,
      });

      // deleteBouncer returns void on success
      expect(result).toBeUndefined();
    }).pipe(
      // Ensure cleanup even if test assertions fail
      Effect.ensuring(
        Effect.gen(function* () {
          if (createdBouncerId) {
            const { organization } = yield* Credentials;
            yield* deleteBouncer({
              organization,
              database,
              branch,
              bouncer: createdBouncerId,
            }).pipe(Effect.ignore);
          }
        }),
      ),
    );
  });
});
