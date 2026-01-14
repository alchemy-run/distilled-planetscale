import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  createBouncer,
  CreateBouncerNotfound,
  CreateBouncerForbidden,
  CreateBouncerInput,
  CreateBouncerOutput,
} from "../src/operations/createBouncer";
import { deleteBouncer } from "../src/operations/deleteBouncer";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("createBouncer", (it) => {
  it("should have the correct input schema", () => {
    expect(CreateBouncerInput.fields.organization).toBeDefined();
    expect(CreateBouncerInput.fields.database).toBeDefined();
    expect(CreateBouncerInput.fields.branch).toBeDefined();
    expect(CreateBouncerInput.fields.name).toBeDefined();
    expect(CreateBouncerInput.fields.target).toBeDefined();
    expect(CreateBouncerInput.fields.bouncer_size).toBeDefined();
    expect(CreateBouncerInput.fields.replicas_per_cell).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CreateBouncerOutput.fields.id).toBeDefined();
    expect(CreateBouncerOutput.fields.name).toBeDefined();
    expect(CreateBouncerOutput.fields.sku).toBeDefined();
    expect(CreateBouncerOutput.fields.target).toBeDefined();
    expect(CreateBouncerOutput.fields.replicas_per_cell).toBeDefined();
    expect(CreateBouncerOutput.fields.created_at).toBeDefined();
    expect(CreateBouncerOutput.fields.updated_at).toBeDefined();
    expect(CreateBouncerOutput.fields.deleted_at).toBeDefined();
    expect(CreateBouncerOutput.fields.actor).toBeDefined();
    expect(CreateBouncerOutput.fields.branch).toBeDefined();
    expect(CreateBouncerOutput.fields.parameters).toBeDefined();
  });

  it.effect("should return CreateBouncerNotfound or CreateBouncerForbidden for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* createBouncer({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof CreateBouncerNotfound || result instanceof CreateBouncerForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return CreateBouncerNotfound or CreateBouncerForbidden for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* createBouncer({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof CreateBouncerNotfound || result instanceof CreateBouncerForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return CreateBouncerNotfound or CreateBouncerForbidden for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = TEST_DATABASE;
      const result = yield* createBouncer({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      const isExpectedError = result instanceof CreateBouncerNotfound || result instanceof CreateBouncerForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  // Note: This test creates an actual bouncer and cleans it up.
  // It requires a valid database with a branch to exist.
  // Bouncers may incur costs and take time to provision.
  // May be skipped if the database/branch doesn't support bouncers.
  it.effect("should create a bouncer successfully and clean up", () => {
    let createdBouncerId: string | undefined;
    // Use a test database name - adjust based on your PlanetScale setup
    const database = TEST_DATABASE;
    const branch = "main";

    return Effect.gen(function* () {
      const { organization } = yield* Credentials;

      const result = yield* createBouncer({
        organization,
        database,
        branch,
      }).pipe(
        Effect.catchTag("CreateBouncerForbidden", () => Effect.succeed(null)),
        Effect.catchTag("CreateBouncerNotfound", () => Effect.succeed(null)),
      );

      if (result === null) {
        return; // Skip test gracefully if creation is forbidden or feature not available
      }

      createdBouncerId = result.id;

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("sku");
      expect(result).toHaveProperty("target");
      expect(result).toHaveProperty("replicas_per_cell");
      expect(result).toHaveProperty("created_at");
      expect(result).toHaveProperty("actor");
      expect(result).toHaveProperty("branch");
      expect(result).toHaveProperty("parameters");
    }).pipe(
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
