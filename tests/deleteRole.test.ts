import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  deleteRole,
  DeleteRoleNotfound,
  DeleteRoleInput,
  DeleteRoleOutput,
} from "../src/operations/deleteRole";
import { createRole } from "../src/operations/createRole";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("deleteRole", () => {
  it("should have the correct input schema", () => {
    expect(DeleteRoleInput.fields.organization).toBeDefined();
    expect(DeleteRoleInput.fields.database).toBeDefined();
    expect(DeleteRoleInput.fields.branch).toBeDefined();
    expect(DeleteRoleInput.fields.id).toBeDefined();
    expect(DeleteRoleInput.fields.successor).toBeDefined();
  });

  it("should have a void output schema", () => {
    // DeleteRoleOutput is Schema.Void
    expect(DeleteRoleOutput).toBeDefined();
  });

  it.effect("should return DeleteRoleNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* deleteRole({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        id: "some-role-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteRoleNotfound);
      if (result instanceof DeleteRoleNotfound) {
        expect(result._tag).toBe("DeleteRoleNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DeleteRoleNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* deleteRole({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        id: "some-role-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteRoleNotfound);
      if (result instanceof DeleteRoleNotfound) {
        expect(result._tag).toBe("DeleteRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DeleteRoleNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = "test";
      const result = yield* deleteRole({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
        id: "some-role-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteRoleNotfound);
      if (result instanceof DeleteRoleNotfound) {
        expect(result._tag).toBe("DeleteRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DeleteRoleNotfound for non-existent role id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = "test";
      const branch = "main";
      const result = yield* deleteRole({
        organization,
        database,
        branch,
        id: "this-role-id-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DeleteRoleNotfound);
      if (result instanceof DeleteRoleNotfound) {
        expect(result._tag).toBe("DeleteRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.id).toBe("this-role-id-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test creates an actual role and then deletes it.
  // It requires a valid database with a branch to exist.
  it.skip("should delete a role successfully", () => {
    // Use a test database name - adjust based on your PlanetScale setup
    const database = "test";
    const branch = "main";
    let createdRoleId: string | undefined;

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // First create a role to delete
      const role = yield* createRole({
        organization,
        database,
        branch,
        name: `test-role-${Date.now()}`,
      });

      createdRoleId = role.id;

      // Now delete it
      const result = yield* deleteRole({
        id: role.id,
        organization,
        database,
        branch,
      });

      // deleteRole returns void on success
      expect(result).toBeUndefined();
      createdRoleId = undefined; // Clear so cleanup doesn't try to delete again
    }).pipe(
      // Ensure cleanup even if test assertions fail
      Effect.ensuring(
        Effect.gen(function* () {
          if (createdRoleId) {
            const { organization } = yield* PlanetScaleCredentials;
            yield* deleteRole({
              id: createdRoleId,
              organization,
              database,
              branch,
            }).pipe(Effect.ignore);
          }
        }),
      ),
      Effect.provide(MainLayer),
    );
  });
});
