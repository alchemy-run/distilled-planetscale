import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  updatePassword,
  UpdatePasswordNotfound,
  UpdatePasswordInput,
  UpdatePasswordOutput,
} from "../src/operations/updatePassword";
import { createPassword } from "../src/operations/createPassword";
import { deletePassword } from "../src/operations/deletePassword";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("updatePassword", () => {
  it("should have the correct input schema", () => {
    expect(UpdatePasswordInput.fields.organization).toBeDefined();
    expect(UpdatePasswordInput.fields.database).toBeDefined();
    expect(UpdatePasswordInput.fields.branch).toBeDefined();
    expect(UpdatePasswordInput.fields.id).toBeDefined();
    expect(UpdatePasswordInput.fields.name).toBeDefined();
    expect(UpdatePasswordInput.fields.cidrs).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(UpdatePasswordOutput.fields.id).toBeDefined();
    expect(UpdatePasswordOutput.fields.name).toBeDefined();
    expect(UpdatePasswordOutput.fields.role).toBeDefined();
    expect(UpdatePasswordOutput.fields.cidrs).toBeDefined();
    expect(UpdatePasswordOutput.fields.created_at).toBeDefined();
    expect(UpdatePasswordOutput.fields.username).toBeDefined();
    expect(UpdatePasswordOutput.fields.plain_text).toBeDefined();
    expect(UpdatePasswordOutput.fields.access_host_url).toBeDefined();
    expect(UpdatePasswordOutput.fields.region).toBeDefined();
    expect(UpdatePasswordOutput.fields.database_branch).toBeDefined();
    expect(UpdatePasswordOutput.fields.actor).toBeDefined();
    expect(UpdatePasswordOutput.fields.expired).toBeDefined();
    expect(UpdatePasswordOutput.fields.ttl_seconds).toBeDefined();
  });

  it.effect("should return UpdatePasswordNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* updatePassword({
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

      expect(result).toBeInstanceOf(UpdatePasswordNotfound);
      if (result instanceof UpdatePasswordNotfound) {
        expect(result._tag).toBe("UpdatePasswordNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return UpdatePasswordNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* updatePassword({
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

      expect(result).toBeInstanceOf(UpdatePasswordNotfound);
      if (result instanceof UpdatePasswordNotfound) {
        expect(result._tag).toBe("UpdatePasswordNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return UpdatePasswordNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const result = yield* updatePassword({
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

      expect(result).toBeInstanceOf(UpdatePasswordNotfound);
      if (result instanceof UpdatePasswordNotfound) {
        expect(result._tag).toBe("UpdatePasswordNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return UpdatePasswordNotfound for non-existent password id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const branch = "main";
      const result = yield* updatePassword({
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

      expect(result).toBeInstanceOf(UpdatePasswordNotfound);
      if (result instanceof UpdatePasswordNotfound) {
        expect(result._tag).toBe("UpdatePasswordNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.id).toBe("this-password-id-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test creates a password, updates it, then cleans up.
  // It requires a valid database with a branch to exist.
  it.skip("should update a password successfully", () => {
    const database = "test";
    const branch = "main";
    let createdPasswordId: string | undefined;

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // First create a password to update
      const password = yield* createPassword({
        organization,
        database,
        branch,
        name: `test-password-${Date.now()}`,
        role: "reader",
      });

      createdPasswordId = password.id;

      // Now update it with a new name
      const updatedName = `updated-password-${Date.now()}`;
      const result = yield* updatePassword({
        organization,
        database,
        branch,
        id: password.id,
        name: updatedName,
      });

      expect(result).toHaveProperty("id", password.id);
      expect(result).toHaveProperty("name", updatedName);
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
