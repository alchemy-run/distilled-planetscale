import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  updateRole,
  UpdateRoleNotfound,
  UpdateRoleInput,
  UpdateRoleOutput,
} from "../src/operations/updateRole";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("updateRole", (it) => {
  it("should have the correct input schema", () => {
    expect(UpdateRoleInput.fields.organization).toBeDefined();
    expect(UpdateRoleInput.fields.database).toBeDefined();
    expect(UpdateRoleInput.fields.branch).toBeDefined();
    expect(UpdateRoleInput.fields.id).toBeDefined();
    expect(UpdateRoleInput.fields.name).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(UpdateRoleOutput.fields.id).toBeDefined();
    expect(UpdateRoleOutput.fields.name).toBeDefined();
    expect(UpdateRoleOutput.fields.access_host_url).toBeDefined();
    expect(UpdateRoleOutput.fields.private_access_host_url).toBeDefined();
    expect(UpdateRoleOutput.fields.private_connection_service_name).toBeDefined();
    expect(UpdateRoleOutput.fields.username).toBeDefined();
    expect(UpdateRoleOutput.fields.password).toBeDefined();
    expect(UpdateRoleOutput.fields.database_name).toBeDefined();
    expect(UpdateRoleOutput.fields.created_at).toBeDefined();
    expect(UpdateRoleOutput.fields.updated_at).toBeDefined();
    expect(UpdateRoleOutput.fields.deleted_at).toBeDefined();
    expect(UpdateRoleOutput.fields.expires_at).toBeDefined();
    expect(UpdateRoleOutput.fields.dropped_at).toBeDefined();
    expect(UpdateRoleOutput.fields.disabled_at).toBeDefined();
    expect(UpdateRoleOutput.fields.drop_failed).toBeDefined();
    expect(UpdateRoleOutput.fields.expired).toBeDefined();
    expect(UpdateRoleOutput.fields.default).toBeDefined();
    expect(UpdateRoleOutput.fields.ttl).toBeDefined();
    expect(UpdateRoleOutput.fields.inherited_roles).toBeDefined();
    expect(UpdateRoleOutput.fields.branch).toBeDefined();
    expect(UpdateRoleOutput.fields.actor).toBeDefined();
  });

  it.effect("should return UpdateRoleNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* updateRole({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        id: "test-role-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateRoleNotfound);
      if (result instanceof UpdateRoleNotfound) {
        expect(result._tag).toBe("UpdateRoleNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateRoleNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* updateRole({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        id: "test-role-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateRoleNotfound);
      if (result instanceof UpdateRoleNotfound) {
        expect(result._tag).toBe("UpdateRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateRoleNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const result = yield* updateRole({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
        id: "test-role-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateRoleNotfound);
      if (result instanceof UpdateRoleNotfound) {
        expect(result._tag).toBe("UpdateRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return UpdateRoleNotfound for non-existent role id", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const branch = "main";
      const result = yield* updateRole({
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

      expect(result).toBeInstanceOf(UpdateRoleNotfound);
      if (result instanceof UpdateRoleNotfound) {
        expect(result._tag).toBe("UpdateRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.id).toBe("this-role-id-definitely-does-not-exist-12345");
      }
    }),
  );
});
