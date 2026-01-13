import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsFromEnv } from "../src/credentials";
import {
  renewPassword,
  RenewPasswordNotfound,
  RenewPasswordInput,
  RenewPasswordOutput,
} from "../src/operations/renewPassword";
import { createPassword } from "../src/operations/createPassword";
import { deletePassword } from "../src/operations/deletePassword";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsFromEnv, FetchHttpClient.layer);

describe("renewPassword", () => {
  it("should have the correct input schema", () => {
    expect(RenewPasswordInput.fields.organization).toBeDefined();
    expect(RenewPasswordInput.fields.database).toBeDefined();
    expect(RenewPasswordInput.fields.branch).toBeDefined();
    expect(RenewPasswordInput.fields.id).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(RenewPasswordOutput.fields.id).toBeDefined();
    expect(RenewPasswordOutput.fields.name).toBeDefined();
    expect(RenewPasswordOutput.fields.role).toBeDefined();
    expect(RenewPasswordOutput.fields.cidrs).toBeDefined();
    expect(RenewPasswordOutput.fields.created_at).toBeDefined();
    expect(RenewPasswordOutput.fields.username).toBeDefined();
    expect(RenewPasswordOutput.fields.plain_text).toBeDefined();
    expect(RenewPasswordOutput.fields.access_host_url).toBeDefined();
    expect(RenewPasswordOutput.fields.region).toBeDefined();
    expect(RenewPasswordOutput.fields.database_branch).toBeDefined();
    expect(RenewPasswordOutput.fields.actor).toBeDefined();
    expect(RenewPasswordOutput.fields.expired).toBeDefined();
    expect(RenewPasswordOutput.fields.ttl_seconds).toBeDefined();
    expect(RenewPasswordOutput.fields.renewable).toBeDefined();
    expect(RenewPasswordOutput.fields.expires_at).toBeDefined();
  });

  it.effect("should return RenewPasswordNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* renewPassword({
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

      expect(result).toBeInstanceOf(RenewPasswordNotfound);
      if (result instanceof RenewPasswordNotfound) {
        expect(result._tag).toBe("RenewPasswordNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return RenewPasswordNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* renewPassword({
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

      expect(result).toBeInstanceOf(RenewPasswordNotfound);
      if (result instanceof RenewPasswordNotfound) {
        expect(result._tag).toBe("RenewPasswordNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return RenewPasswordNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const result = yield* renewPassword({
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

      expect(result).toBeInstanceOf(RenewPasswordNotfound);
      if (result instanceof RenewPasswordNotfound) {
        expect(result._tag).toBe("RenewPasswordNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return RenewPasswordNotfound for non-existent password id", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const branch = "main";
      const result = yield* renewPassword({
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

      expect(result).toBeInstanceOf(RenewPasswordNotfound);
      if (result instanceof RenewPasswordNotfound) {
        expect(result._tag).toBe("RenewPasswordNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe(branch);
        expect(result.id).toBe("this-password-id-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  // Note: This test creates a renewable password, renews it, then cleans up.
  // It requires a valid database with a branch to exist.
  // Passwords must be created with a TTL to be renewable.
  it.skip("should renew a password successfully", () => {
    const database = "test";
    const branch = "main";
    let createdPasswordId: string | undefined;

    return Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;

      // First create a password with a TTL to make it renewable
      const password = yield* createPassword({
        organization,
        database,
        branch,
        name: `test-password-${Date.now()}`,
        role: "reader",
        ttl: 86400, // 24 hours - makes the password renewable
      });

      createdPasswordId = password.id;

      // Now renew it
      const result = yield* renewPassword({
        organization,
        database,
        branch,
        id: password.id,
      });

      expect(result).toHaveProperty("id", password.id);
      expect(result).toHaveProperty("name", password.name);
      expect(result).toHaveProperty("role", "reader");
      expect(result).toHaveProperty("username");
      expect(result).toHaveProperty("plain_text");
      expect(result).toHaveProperty("access_host_url");
      expect(result).toHaveProperty("region");
      expect(result).toHaveProperty("database_branch");
      expect(result).toHaveProperty("actor");
      expect(result).toHaveProperty("renewable");
      expect(result).toHaveProperty("expires_at");
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
