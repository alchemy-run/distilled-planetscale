import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  createBouncer,
  CreateBouncerNotfound,
  CreateBouncerInput,
  CreateBouncerOutput,
} from "../src/operations/createBouncer";
import { deleteBouncer } from "../src/operations/deleteBouncer";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("createBouncer", () => {
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

  it.effect("should return CreateBouncerNotfound for non-existent organization", () =>
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

      expect(result).toBeInstanceOf(CreateBouncerNotfound);
      if (result instanceof CreateBouncerNotfound) {
        expect(result._tag).toBe("CreateBouncerNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return CreateBouncerNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
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

      expect(result).toBeInstanceOf(CreateBouncerNotfound);
      if (result instanceof CreateBouncerNotfound) {
        expect(result._tag).toBe("CreateBouncerNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return CreateBouncerNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = "test";
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

      expect(result).toBeInstanceOf(CreateBouncerNotfound);
      if (result instanceof CreateBouncerNotfound) {
        expect(result._tag).toBe("CreateBouncerNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test creates an actual bouncer and cleans it up.
  // It requires a valid database with a branch to exist.
  // Bouncers may incur costs and take time to provision.
  it.skip("should create a bouncer successfully and clean up", () => {
    let createdBouncerId: string | undefined;
    // Use a test database name - adjust based on your PlanetScale setup
    const database = "test";
    const branch = "main";

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      const result = yield* createBouncer({
        organization,
        database,
        branch,
      });

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
      Effect.provide(MainLayer),
    );
  });
});
