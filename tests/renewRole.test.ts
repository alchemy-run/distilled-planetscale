import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  renewRole,
  RenewRoleNotfound,
  RenewRoleInput,
  RenewRoleOutput,
} from "../src/operations/renewRole";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("renewRole", (it) => {
  it("should have the correct input schema", () => {
    expect(RenewRoleInput.fields.organization).toBeDefined();
    expect(RenewRoleInput.fields.database).toBeDefined();
    expect(RenewRoleInput.fields.branch).toBeDefined();
    expect(RenewRoleInput.fields.id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(RenewRoleOutput.fields.id).toBeDefined();
    expect(RenewRoleOutput.fields.name).toBeDefined();
    expect(RenewRoleOutput.fields.access_host_url).toBeDefined();
    expect(RenewRoleOutput.fields.private_access_host_url).toBeDefined();
    expect(RenewRoleOutput.fields.private_connection_service_name).toBeDefined();
    expect(RenewRoleOutput.fields.username).toBeDefined();
    expect(RenewRoleOutput.fields.password).toBeDefined();
    expect(RenewRoleOutput.fields.database_name).toBeDefined();
    expect(RenewRoleOutput.fields.created_at).toBeDefined();
    expect(RenewRoleOutput.fields.updated_at).toBeDefined();
    expect(RenewRoleOutput.fields.deleted_at).toBeDefined();
    expect(RenewRoleOutput.fields.expires_at).toBeDefined();
    expect(RenewRoleOutput.fields.dropped_at).toBeDefined();
    expect(RenewRoleOutput.fields.disabled_at).toBeDefined();
    expect(RenewRoleOutput.fields.drop_failed).toBeDefined();
    expect(RenewRoleOutput.fields.expired).toBeDefined();
    expect(RenewRoleOutput.fields.default).toBeDefined();
    expect(RenewRoleOutput.fields.ttl).toBeDefined();
    expect(RenewRoleOutput.fields.inherited_roles).toBeDefined();
    expect(RenewRoleOutput.fields.branch).toBeDefined();
    expect(RenewRoleOutput.fields.actor).toBeDefined();
  });

  it.effect("should return RenewRoleNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* renewRole({
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

      expect(result).toBeInstanceOf(RenewRoleNotfound);
      if (result instanceof RenewRoleNotfound) {
        expect(result._tag).toBe("RenewRoleNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return RenewRoleNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* renewRole({
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

      expect(result).toBeInstanceOf(RenewRoleNotfound);
      if (result instanceof RenewRoleNotfound) {
        expect(result._tag).toBe("RenewRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return RenewRoleNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const result = yield* renewRole({
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

      expect(result).toBeInstanceOf(RenewRoleNotfound);
      if (result instanceof RenewRoleNotfound) {
        expect(result._tag).toBe("RenewRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return RenewRoleNotfound for non-existent role id", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const branch = "main";
      const result = yield* renewRole({
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

      expect(result).toBeInstanceOf(RenewRoleNotfound);
      if (result instanceof RenewRoleNotfound) {
        expect(result._tag).toBe("RenewRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.id).toBe("this-role-id-definitely-does-not-exist-12345");
      }
    }),
  );
});
