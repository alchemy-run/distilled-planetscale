import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  createPassword,
  CreatePasswordNotfound,
  CreatePasswordInput,
  CreatePasswordOutput,
} from "../src/operations/createPassword";
import { deletePassword } from "../src/operations/deletePassword";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("createPassword", (it) => {
  it("should have the correct input schema", () => {
    expect(CreatePasswordInput.fields.organization).toBeDefined();
    expect(CreatePasswordInput.fields.database).toBeDefined();
    expect(CreatePasswordInput.fields.branch).toBeDefined();
    expect(CreatePasswordInput.fields.name).toBeDefined();
    expect(CreatePasswordInput.fields.role).toBeDefined();
    expect(CreatePasswordInput.fields.replica).toBeDefined();
    expect(CreatePasswordInput.fields.ttl).toBeDefined();
    expect(CreatePasswordInput.fields.cidrs).toBeDefined();
    expect(CreatePasswordInput.fields.direct_vtgate).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CreatePasswordOutput.fields.id).toBeDefined();
    expect(CreatePasswordOutput.fields.name).toBeDefined();
    expect(CreatePasswordOutput.fields.role).toBeDefined();
    expect(CreatePasswordOutput.fields.cidrs).toBeDefined();
    expect(CreatePasswordOutput.fields.created_at).toBeDefined();
    expect(CreatePasswordOutput.fields.username).toBeDefined();
    expect(CreatePasswordOutput.fields.plain_text).toBeDefined();
    expect(CreatePasswordOutput.fields.access_host_url).toBeDefined();
    expect(CreatePasswordOutput.fields.region).toBeDefined();
    expect(CreatePasswordOutput.fields.database_branch).toBeDefined();
  });

  it.effect("should return CreatePasswordNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* createPassword({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreatePasswordNotfound);
      if (result instanceof CreatePasswordNotfound) {
        expect(result._tag).toBe("CreatePasswordNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return CreatePasswordNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* createPassword({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreatePasswordNotfound);
      if (result instanceof CreatePasswordNotfound) {
        expect(result._tag).toBe("CreatePasswordNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return CreatePasswordNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* createPassword({
        organization,
        database: TEST_DATABASE,
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreatePasswordNotfound);
      if (result instanceof CreatePasswordNotfound) {
        expect(result._tag).toBe("CreatePasswordNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  // Note: This test is skipped because creating passwords requires an existing database/branch
  // and passwords may incur costs or have limits. When enabled, it demonstrates proper cleanup.
  it.effect("should create a password successfully and clean up", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = TEST_DATABASE;
      const branch = "main";
      const testPasswordName = `test-password-${Date.now()}`;

      const result = yield* createPassword({
        organization,
        database,
        branch,
        name: testPasswordName,
        role: "reader",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", testPasswordName);
      expect(result).toHaveProperty("role", "reader");
      expect(result).toHaveProperty("username");
      expect(result).toHaveProperty("plain_text");
      expect(result).toHaveProperty("access_host_url");

      // Clean up the created password
      yield* deletePassword({
        organization,
        database,
        branch,
        id: result.id,
      });
    }),
  );
});
