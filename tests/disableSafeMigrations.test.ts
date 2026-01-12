import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  disableSafeMigrations,
  DisableSafeMigrationsNotfound,
  DisableSafeMigrationsInput,
  DisableSafeMigrationsOutput,
} from "../src/operations/disableSafeMigrations";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("disableSafeMigrations", () => {
  it("should have the correct input schema", () => {
    expect(DisableSafeMigrationsInput.fields.organization).toBeDefined();
    expect(DisableSafeMigrationsInput.fields.database).toBeDefined();
    expect(DisableSafeMigrationsInput.fields.branch).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(DisableSafeMigrationsOutput.fields.id).toBeDefined();
    expect(DisableSafeMigrationsOutput.fields.name).toBeDefined();
    expect(DisableSafeMigrationsOutput.fields.created_at).toBeDefined();
    expect(DisableSafeMigrationsOutput.fields.updated_at).toBeDefined();
    expect(DisableSafeMigrationsOutput.fields.state).toBeDefined();
    expect(DisableSafeMigrationsOutput.fields.ready).toBeDefined();
    expect(DisableSafeMigrationsOutput.fields.production).toBeDefined();
    expect(DisableSafeMigrationsOutput.fields.safe_migrations).toBeDefined();
    expect(DisableSafeMigrationsOutput.fields.region).toBeDefined();
  });

  it.effect("should return DisableSafeMigrationsNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* disableSafeMigrations({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DisableSafeMigrationsNotfound);
      if (result instanceof DisableSafeMigrationsNotfound) {
        expect(result._tag).toBe("DisableSafeMigrationsNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DisableSafeMigrationsNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* disableSafeMigrations({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DisableSafeMigrationsNotfound);
      if (result instanceof DisableSafeMigrationsNotfound) {
        expect(result._tag).toBe("DisableSafeMigrationsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return DisableSafeMigrationsNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* disableSafeMigrations({
        organization,
        database: "test",
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(DisableSafeMigrationsNotfound);
      if (result instanceof DisableSafeMigrationsNotfound) {
        expect(result._tag).toBe("DisableSafeMigrationsNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("test");
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
