import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  createRole,
  CreateRoleNotfound,
  CreateRoleInput,
  CreateRoleOutput,
} from "../src/operations/createRole";
import { deleteRole } from "../src/operations/deleteRole";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("createRole", () => {
  it("should have the correct input schema", () => {
    expect(CreateRoleInput.fields.organization).toBeDefined();
    expect(CreateRoleInput.fields.database).toBeDefined();
    expect(CreateRoleInput.fields.branch).toBeDefined();
    expect(CreateRoleInput.fields.name).toBeDefined();
    expect(CreateRoleInput.fields.ttl).toBeDefined();
    expect(CreateRoleInput.fields.inherited_roles).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CreateRoleOutput.fields.id).toBeDefined();
    expect(CreateRoleOutput.fields.name).toBeDefined();
    expect(CreateRoleOutput.fields.access_host_url).toBeDefined();
    expect(CreateRoleOutput.fields.private_access_host_url).toBeDefined();
    expect(CreateRoleOutput.fields.username).toBeDefined();
    expect(CreateRoleOutput.fields.password).toBeDefined();
    expect(CreateRoleOutput.fields.database_name).toBeDefined();
    expect(CreateRoleOutput.fields.created_at).toBeDefined();
    expect(CreateRoleOutput.fields.updated_at).toBeDefined();
    expect(CreateRoleOutput.fields.expired).toBeDefined();
    expect(CreateRoleOutput.fields.default).toBeDefined();
    expect(CreateRoleOutput.fields.ttl).toBeDefined();
    expect(CreateRoleOutput.fields.inherited_roles).toBeDefined();
    expect(CreateRoleOutput.fields.branch).toBeDefined();
    expect(CreateRoleOutput.fields.actor).toBeDefined();
  });

  it.effect("should return CreateRoleNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* createRole({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateRoleNotfound);
      if (result instanceof CreateRoleNotfound) {
        expect(result._tag).toBe("CreateRoleNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return CreateRoleNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* createRole({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateRoleNotfound);
      if (result instanceof CreateRoleNotfound) {
        expect(result._tag).toBe("CreateRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return CreateRoleNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* createRole({
        organization,
        database: "test", // Assumes a test database exists
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateRoleNotfound);
      if (result instanceof CreateRoleNotfound) {
        expect(result._tag).toBe("CreateRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test is skipped because creating roles requires an existing database/branch
  // and roles may incur costs or have limits. When enabled, it demonstrates proper cleanup.
  it.skip("should create a role successfully and clean up", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test"; // Replace with an actual test database
      const branch = "main";
      const testRoleName = `test-role-${Date.now()}`;

      const result = yield* createRole({
        organization,
        database,
        branch,
        name: testRoleName,
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", testRoleName);
      expect(result).toHaveProperty("username");
      expect(result).toHaveProperty("password");
      expect(result).toHaveProperty("access_host_url");
      expect(result).toHaveProperty("database_name");
      expect(result).toHaveProperty("branch");
      expect(result.branch).toHaveProperty("name", branch);

      // Clean up the created role
      yield* deleteRole({
        organization,
        database,
        branch,
        id: result.id,
      });
    }).pipe(Effect.provide(MainLayer)),
  );
});
