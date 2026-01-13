import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getBouncer,
  GetBouncerNotfound,
  GetBouncerForbidden,
  GetBouncerInput,
  GetBouncerOutput,
} from "../src/operations/getBouncer";
import { createBouncer, CreateBouncerForbidden } from "../src/operations/createBouncer";
import { deleteBouncer } from "../src/operations/deleteBouncer";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("getBouncer", (it) => {
  it("should have the correct input schema", () => {
    expect(GetBouncerInput.fields.organization).toBeDefined();
    expect(GetBouncerInput.fields.database).toBeDefined();
    expect(GetBouncerInput.fields.branch).toBeDefined();
    expect(GetBouncerInput.fields.bouncer).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetBouncerOutput.fields.id).toBeDefined();
    expect(GetBouncerOutput.fields.name).toBeDefined();
    expect(GetBouncerOutput.fields.sku).toBeDefined();
    expect(GetBouncerOutput.fields.target).toBeDefined();
    expect(GetBouncerOutput.fields.replicas_per_cell).toBeDefined();
    expect(GetBouncerOutput.fields.created_at).toBeDefined();
    expect(GetBouncerOutput.fields.updated_at).toBeDefined();
    expect(GetBouncerOutput.fields.deleted_at).toBeDefined();
    expect(GetBouncerOutput.fields.actor).toBeDefined();
    expect(GetBouncerOutput.fields.branch).toBeDefined();
    expect(GetBouncerOutput.fields.parameters).toBeDefined();
  });

  it.effect("should return GetBouncerNotfound or GetBouncerForbidden for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getBouncer({
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

      const isExpectedError = result instanceof GetBouncerNotfound || result instanceof GetBouncerForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return GetBouncerNotfound or GetBouncerForbidden for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getBouncer({
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

      const isExpectedError = result instanceof GetBouncerNotfound || result instanceof GetBouncerForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return GetBouncerNotfound or GetBouncerForbidden for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = TEST_DATABASE;
      const result = yield* getBouncer({
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

      const isExpectedError = result instanceof GetBouncerNotfound || result instanceof GetBouncerForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return GetBouncerNotfound or GetBouncerForbidden for non-existent bouncer", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = TEST_DATABASE;
      const branch = "main";
      const result = yield* getBouncer({
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

      const isExpectedError = result instanceof GetBouncerNotfound || result instanceof GetBouncerForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  // Note: This test creates an actual bouncer, fetches it, and cleans it up.
  // It requires a valid database with a branch to exist.
  // Bouncers may incur costs and take time to provision.
  it.effect("should get a bouncer successfully", () => {
    // Use a test database name - adjust based on your PlanetScale setup
    const database = TEST_DATABASE;
    const branch = "main";
    let createdBouncerId: string | undefined;

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // First create a bouncer to get
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

      // Now get it
      const result = yield* getBouncer({
        organization,
        database,
        branch,
        bouncer: bouncer.id,
      });

      expect(result).toHaveProperty("id", bouncer.id);
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("sku");
      expect(result).toHaveProperty("target");
      expect(result).toHaveProperty("replicas_per_cell");
      expect(result).toHaveProperty("created_at");
      expect(result).toHaveProperty("actor");
      expect(result).toHaveProperty("branch");
      expect(result).toHaveProperty("parameters");
    }).pipe(
      // Ensure cleanup even if test assertions fail
      Effect.ensuring(
        Effect.gen(function* () {
          if (createdBouncerId) {
            const { organization } = yield* PlanetScaleCredentials;
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
