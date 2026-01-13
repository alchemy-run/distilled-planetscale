import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getRole,
  GetRoleNotfound,
  GetRoleInput,
  GetRoleOutput,
} from "../src/operations/getRole";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("getRole", (it) => {
  it("should have the correct input schema", () => {
    expect(GetRoleInput.fields.organization).toBeDefined();
    expect(GetRoleInput.fields.database).toBeDefined();
    expect(GetRoleInput.fields.branch).toBeDefined();
    expect(GetRoleInput.fields.id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetRoleOutput.fields.id).toBeDefined();
    expect(GetRoleOutput.fields.name).toBeDefined();
    expect(GetRoleOutput.fields.access_host_url).toBeDefined();
    expect(GetRoleOutput.fields.private_access_host_url).toBeDefined();
    expect(GetRoleOutput.fields.private_connection_service_name).toBeDefined();
    expect(GetRoleOutput.fields.username).toBeDefined();
    expect(GetRoleOutput.fields.password).toBeDefined();
    expect(GetRoleOutput.fields.database_name).toBeDefined();
    expect(GetRoleOutput.fields.created_at).toBeDefined();
    expect(GetRoleOutput.fields.updated_at).toBeDefined();
    expect(GetRoleOutput.fields.deleted_at).toBeDefined();
    expect(GetRoleOutput.fields.expires_at).toBeDefined();
    expect(GetRoleOutput.fields.dropped_at).toBeDefined();
    expect(GetRoleOutput.fields.disabled_at).toBeDefined();
    expect(GetRoleOutput.fields.drop_failed).toBeDefined();
    expect(GetRoleOutput.fields.expired).toBeDefined();
    expect(GetRoleOutput.fields.default).toBeDefined();
    expect(GetRoleOutput.fields.ttl).toBeDefined();
    expect(GetRoleOutput.fields.inherited_roles).toBeDefined();
    expect(GetRoleOutput.fields.branch).toBeDefined();
    expect(GetRoleOutput.fields.actor).toBeDefined();
  });

  it.effect("should return GetRoleNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getRole({
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

      expect(result).toBeInstanceOf(GetRoleNotfound);
      if (result instanceof GetRoleNotfound) {
        expect(result._tag).toBe("GetRoleNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetRoleNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getRole({
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

      expect(result).toBeInstanceOf(GetRoleNotfound);
      if (result instanceof GetRoleNotfound) {
        expect(result._tag).toBe("GetRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetRoleNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = TEST_DATABASE;
      const result = yield* getRole({
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

      expect(result).toBeInstanceOf(GetRoleNotfound);
      if (result instanceof GetRoleNotfound) {
        expect(result._tag).toBe("GetRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetRoleNotfound for non-existent role id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = TEST_DATABASE;
      const branch = "main";
      const result = yield* getRole({
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

      expect(result).toBeInstanceOf(GetRoleNotfound);
      if (result instanceof GetRoleNotfound) {
        expect(result._tag).toBe("GetRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.id).toBe("this-role-id-definitely-does-not-exist-12345");
      }
    }),
  );
});
