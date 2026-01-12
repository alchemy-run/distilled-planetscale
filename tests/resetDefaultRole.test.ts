import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  resetDefaultRole,
  ResetDefaultRoleNotfound,
  ResetDefaultRoleInput,
  ResetDefaultRoleOutput,
} from "../src/operations/resetDefaultRole";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("resetDefaultRole", () => {
  it("should have the correct input schema", () => {
    expect(ResetDefaultRoleInput.fields.organization).toBeDefined();
    expect(ResetDefaultRoleInput.fields.database).toBeDefined();
    expect(ResetDefaultRoleInput.fields.branch).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(ResetDefaultRoleOutput.fields.id).toBeDefined();
    expect(ResetDefaultRoleOutput.fields.name).toBeDefined();
    expect(ResetDefaultRoleOutput.fields.access_host_url).toBeDefined();
    expect(ResetDefaultRoleOutput.fields.username).toBeDefined();
    expect(ResetDefaultRoleOutput.fields.password).toBeDefined();
    expect(ResetDefaultRoleOutput.fields.database_name).toBeDefined();
    expect(ResetDefaultRoleOutput.fields.created_at).toBeDefined();
    expect(ResetDefaultRoleOutput.fields.updated_at).toBeDefined();
    expect(ResetDefaultRoleOutput.fields.expired).toBeDefined();
    expect(ResetDefaultRoleOutput.fields.default).toBeDefined();
    expect(ResetDefaultRoleOutput.fields.ttl).toBeDefined();
    expect(ResetDefaultRoleOutput.fields.inherited_roles).toBeDefined();
    expect(ResetDefaultRoleOutput.fields.branch).toBeDefined();
    expect(ResetDefaultRoleOutput.fields.actor).toBeDefined();
  });

  it.effect("should return ResetDefaultRoleNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* resetDefaultRole({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ResetDefaultRoleNotfound);
      if (result instanceof ResetDefaultRoleNotfound) {
        expect(result._tag).toBe("ResetDefaultRoleNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ResetDefaultRoleNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* resetDefaultRole({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ResetDefaultRoleNotfound);
      if (result instanceof ResetDefaultRoleNotfound) {
        expect(result._tag).toBe("ResetDefaultRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return ResetDefaultRoleNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const database = "test";
      const result = yield* resetDefaultRole({
        organization,
        database,
        branch: "this-branch-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(ResetDefaultRoleNotfound);
      if (result instanceof ResetDefaultRoleNotfound) {
        expect(result._tag).toBe("ResetDefaultRoleNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe(database);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
