import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  deleteBouncer,
  DeleteBouncerNotfound,
  DeleteBouncerInput,
  DeleteBouncerOutput,
} from "../src/operations/deleteBouncer";
import { createBouncer } from "../src/operations/createBouncer";
import { withMainLayer } from "./setup";

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

  it.effect("should return DeleteBouncerNotfound for non-existent organization", () =>
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

      expect(result).toBeInstanceOf(DeleteBouncerNotfound);
      if (result instanceof DeleteBouncerNotfound) {
        expect(result._tag).toBe("DeleteBouncerNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return DeleteBouncerNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
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

      expect(result).toBeInstanceOf(DeleteBouncerNotfound);
      if (result instanceof DeleteBouncerNotfound) {
        expect(result._tag).toBe("DeleteBouncerNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return DeleteBouncerNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = "test";
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

      expect(result).toBeInstanceOf(DeleteBouncerNotfound);
      if (result instanceof DeleteBouncerNotfound) {
        expect(result._tag).toBe("DeleteBouncerNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return DeleteBouncerNotfound for non-existent bouncer", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = "test";
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

      expect(result).toBeInstanceOf(DeleteBouncerNotfound);
      if (result instanceof DeleteBouncerNotfound) {
        expect(result._tag).toBe("DeleteBouncerNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.bouncer).toBe("this-bouncer-definitely-does-not-exist-12345");
      }
    }),
  );

  // Note: This test creates an actual bouncer and then deletes it.
  // It requires a valid database with a branch to exist.
  // Bouncers may incur costs and take time to provision.
  it.skip("should delete a bouncer successfully", () => {
    // Use a test database name - adjust based on your PlanetScale setup
    const database = "test";
    const branch = "main";
    let createdBouncerId: string | undefined;

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // First create a bouncer to delete
      const bouncer = yield* createBouncer({
        organization,
        database,
        branch,
      });

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
