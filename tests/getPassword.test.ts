import { Effect } from "effect";
import { expect } from "vitest";
import { PlanetScaleCredentials } from "../src/credentials";
import {
  getPassword,
  GetPasswordNotfound,
  GetPasswordInput,
  GetPasswordOutput,
} from "../src/operations/getPassword";
import { createPassword } from "../src/operations/createPassword";
import { deletePassword } from "../src/operations/deletePassword";
import { withMainLayer } from "./setup";

withMainLayer("getPassword", (it) => {
  it("should have the correct input schema", () => {
    expect(GetPasswordInput.fields.organization).toBeDefined();
    expect(GetPasswordInput.fields.database).toBeDefined();
    expect(GetPasswordInput.fields.branch).toBeDefined();
    expect(GetPasswordInput.fields.id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetPasswordOutput.fields.id).toBeDefined();
    expect(GetPasswordOutput.fields.name).toBeDefined();
    expect(GetPasswordOutput.fields.role).toBeDefined();
    expect(GetPasswordOutput.fields.cidrs).toBeDefined();
    expect(GetPasswordOutput.fields.created_at).toBeDefined();
    expect(GetPasswordOutput.fields.username).toBeDefined();
    expect(GetPasswordOutput.fields.plain_text).toBeDefined();
    expect(GetPasswordOutput.fields.access_host_url).toBeDefined();
    expect(GetPasswordOutput.fields.region).toBeDefined();
    expect(GetPasswordOutput.fields.database_branch).toBeDefined();
    expect(GetPasswordOutput.fields.actor).toBeDefined();
    expect(GetPasswordOutput.fields.expired).toBeDefined();
    expect(GetPasswordOutput.fields.ttl_seconds).toBeDefined();
  });

  it.effect("should return GetPasswordNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getPassword({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        id: "some-password-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetPasswordNotfound);
      if (result instanceof GetPasswordNotfound) {
        expect(result._tag).toBe("GetPasswordNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetPasswordNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* getPassword({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        id: "some-password-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetPasswordNotfound);
      if (result instanceof GetPasswordNotfound) {
        expect(result._tag).toBe("GetPasswordNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetPasswordNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const result = yield* getPassword({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
        id: "some-password-id",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetPasswordNotfound);
      if (result instanceof GetPasswordNotfound) {
        expect(result._tag).toBe("GetPasswordNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetPasswordNotfound for non-existent password id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const branch = "main";
      const result = yield* getPassword({
        organization,
        database,
        branch,
        id: "this-password-id-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetPasswordNotfound);
      if (result instanceof GetPasswordNotfound) {
        expect(result._tag).toBe("GetPasswordNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.id).toBe("this-password-id-definitely-does-not-exist-12345");
      }
    }),
  );

  // Note: This test creates a password, fetches it, then cleans up.
  // It requires a valid database with a branch to exist.
  it.skip("should fetch a password successfully", () => {
    const database = "test";
    const branch = "main";
    let createdPasswordId: string | undefined;

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // First create a password to fetch
      const password = yield* createPassword({
        organization,
        database,
        branch,
        name: `test-password-${Date.now()}`,
        role: "reader",
      });

      createdPasswordId = password.id;

      // Now fetch it
      const result = yield* getPassword({
        organization,
        database,
        branch,
        id: password.id,
      });

      expect(result).toHaveProperty("id", password.id);
      expect(result).toHaveProperty("name", password.name);
      expect(result).toHaveProperty("role", "reader");
      expect(result).toHaveProperty("username");
      expect(result).toHaveProperty("access_host_url");
      expect(result).toHaveProperty("region");
      expect(result).toHaveProperty("database_branch");
      expect(result).toHaveProperty("actor");
    }).pipe(
      // Ensure cleanup even if test assertions fail
      Effect.ensuring(
        Effect.gen(function* () {
          if (createdPasswordId) {
            const { organization } = yield* PlanetScaleCredentials;
            yield* deletePassword({
              id: createdPasswordId,
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
