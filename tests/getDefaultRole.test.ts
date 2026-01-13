import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getDefaultRole,
  GetDefaultRoleNotfound,
  GetDefaultRoleInput,
  GetDefaultRoleOutput,
} from "../src/operations/getDefaultRole";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("getDefaultRole", (it) => {
  it("should have the correct input schema", () => {
    expect(GetDefaultRoleInput.fields.organization).toBeDefined();
    expect(GetDefaultRoleInput.fields.database).toBeDefined();
    expect(GetDefaultRoleInput.fields.branch).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetDefaultRoleOutput.fields.id).toBeDefined();
    expect(GetDefaultRoleOutput.fields.name).toBeDefined();
    expect(GetDefaultRoleOutput.fields.access_host_url).toBeDefined();
    expect(GetDefaultRoleOutput.fields.username).toBeDefined();
    expect(GetDefaultRoleOutput.fields.password).toBeDefined();
    expect(GetDefaultRoleOutput.fields.database_name).toBeDefined();
    expect(GetDefaultRoleOutput.fields.created_at).toBeDefined();
    expect(GetDefaultRoleOutput.fields.updated_at).toBeDefined();
    expect(GetDefaultRoleOutput.fields.expired).toBeDefined();
    expect(GetDefaultRoleOutput.fields.default).toBeDefined();
    expect(GetDefaultRoleOutput.fields.ttl).toBeDefined();
    expect(GetDefaultRoleOutput.fields.inherited_roles).toBeDefined();
    expect(GetDefaultRoleOutput.fields.branch).toBeDefined();
    expect(GetDefaultRoleOutput.fields.actor).toBeDefined();
  });

  it.effect("should return GetDefaultRoleNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getDefaultRole({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetDefaultRoleNotfound);
      if (result instanceof GetDefaultRoleNotfound) {
        expect(result._tag).toBe("GetDefaultRoleNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetDefaultRoleNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getDefaultRole({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetDefaultRoleNotfound);
      if (result instanceof GetDefaultRoleNotfound) {
        expect(result._tag).toBe("GetDefaultRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetDefaultRoleNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = TEST_DATABASE;
      const result = yield* getDefaultRole({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetDefaultRoleNotfound);
      if (result instanceof GetDefaultRoleNotfound) {
        expect(result._tag).toBe("GetDefaultRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );
});
