import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  resetRole,
  ResetRoleNotfound,
  ResetRoleInput,
  ResetRoleOutput,
} from "../src/operations/resetRole";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("resetRole", (it) => {
  it("should have the correct input schema", () => {
    expect(ResetRoleInput.fields.organization).toBeDefined();
    expect(ResetRoleInput.fields.database).toBeDefined();
    expect(ResetRoleInput.fields.branch).toBeDefined();
    expect(ResetRoleInput.fields.id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ResetRoleOutput.fields.id).toBeDefined();
    expect(ResetRoleOutput.fields.name).toBeDefined();
    expect(ResetRoleOutput.fields.access_host_url).toBeDefined();
    expect(ResetRoleOutput.fields.private_access_host_url).toBeDefined();
    expect(ResetRoleOutput.fields.private_connection_service_name).toBeDefined();
    expect(ResetRoleOutput.fields.username).toBeDefined();
    expect(ResetRoleOutput.fields.password).toBeDefined();
    expect(ResetRoleOutput.fields.database_name).toBeDefined();
    expect(ResetRoleOutput.fields.created_at).toBeDefined();
    expect(ResetRoleOutput.fields.updated_at).toBeDefined();
    expect(ResetRoleOutput.fields.deleted_at).toBeDefined();
    expect(ResetRoleOutput.fields.expires_at).toBeDefined();
    expect(ResetRoleOutput.fields.dropped_at).toBeDefined();
    expect(ResetRoleOutput.fields.disabled_at).toBeDefined();
    expect(ResetRoleOutput.fields.drop_failed).toBeDefined();
    expect(ResetRoleOutput.fields.expired).toBeDefined();
    expect(ResetRoleOutput.fields.default).toBeDefined();
    expect(ResetRoleOutput.fields.ttl).toBeDefined();
    expect(ResetRoleOutput.fields.inherited_roles).toBeDefined();
    expect(ResetRoleOutput.fields.branch).toBeDefined();
    expect(ResetRoleOutput.fields.actor).toBeDefined();
  });

  it.effect("should return ResetRoleNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* resetRole({
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

      expect(result).toBeInstanceOf(ResetRoleNotfound);
      if (result instanceof ResetRoleNotfound) {
        expect(result._tag).toBe("ResetRoleNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ResetRoleNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* resetRole({
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

      expect(result).toBeInstanceOf(ResetRoleNotfound);
      if (result instanceof ResetRoleNotfound) {
        expect(result._tag).toBe("ResetRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ResetRoleNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = TEST_DATABASE;
      const result = yield* resetRole({
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

      expect(result).toBeInstanceOf(ResetRoleNotfound);
      if (result instanceof ResetRoleNotfound) {
        expect(result._tag).toBe("ResetRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return ResetRoleNotfound for non-existent role id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = TEST_DATABASE;
      const branch = "main";
      const result = yield* resetRole({
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

      expect(result).toBeInstanceOf(ResetRoleNotfound);
      if (result instanceof ResetRoleNotfound) {
        expect(result._tag).toBe("ResetRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.id).toBe("this-role-id-definitely-does-not-exist-12345");
      }
    }),
  );
});
