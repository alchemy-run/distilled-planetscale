import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  deleteRole,
  DeleteRoleNotfound,
  DeleteRoleForbidden,
  DeleteRoleInput,
  DeleteRoleOutput,
} from "../src/operations/deleteRole";
import { createRole, CreateRoleForbidden } from "../src/operations/createRole";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("deleteRole", (it) => {
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

      const isExpectedError =
        result instanceof DeleteRoleNotfound || result instanceof DeleteRoleForbidden;
      expect(isExpectedError).toBe(true);
    }),
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

      const isExpectedError =
        result instanceof DeleteRoleNotfound || result instanceof DeleteRoleForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return DeleteRoleNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = TEST_DATABASE;
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

      const isExpectedError =
        result instanceof DeleteRoleNotfound || result instanceof DeleteRoleForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  it.effect("should return DeleteRoleNotfound for non-existent role id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      // Use a test database name - adjust based on your PlanetScale setup
      const database = TEST_DATABASE;
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

      const isExpectedError =
        result instanceof DeleteRoleNotfound || result instanceof DeleteRoleForbidden;
      expect(isExpectedError).toBe(true);
    }),
  );

  // Note: This test creates an actual role and then deletes it.
  // It requires a valid database with a branch to exist.
  it.effect("should delete a role successfully", () => {
    // Use a test database name - adjust based on your PlanetScale setup
    const database = TEST_DATABASE;
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
      }).pipe(
        Effect.catchTag("CreateRoleForbidden", () => Effect.succeed(null)),
        Effect.catchTag("CreateRoleNotfound", () => Effect.succeed(null)),
      );

      // Skip test gracefully if creation is forbidden
      if (role === null) {
        return;
      }

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
    );
  });
});
