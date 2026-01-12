import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  updateKeyspace,
  UpdateKeyspaceNotfound,
  UpdateKeyspaceInput,
  UpdateKeyspaceOutput,
} from "../src/operations/updateKeyspace";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("updateKeyspace", () => {
  it("should have the correct input schema", () => {
    expect(UpdateKeyspaceInput.fields.organization).toBeDefined();
    expect(UpdateKeyspaceInput.fields.database).toBeDefined();
    expect(UpdateKeyspaceInput.fields.branch).toBeDefined();
    expect(UpdateKeyspaceInput.fields.keyspace).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(UpdateKeyspaceOutput.fields.id).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.name).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.shards).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.sharded).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.replicas).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.extra_replicas).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.created_at).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.updated_at).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.cluster_name).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.cluster_display_name).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.resizing).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.resize_pending).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.ready).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.metal).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.default).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.imported).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.vector_pool_allocation).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.replication_durability_constraints).toBeDefined();
    expect(UpdateKeyspaceOutput.fields.vreplication_flags).toBeDefined();
  });

  it.effect("should return UpdateKeyspaceNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* updateKeyspace({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        keyspace: "test-keyspace",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateKeyspaceNotfound);
      if (result instanceof UpdateKeyspaceNotfound) {
        expect(result._tag).toBe("UpdateKeyspaceNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return UpdateKeyspaceNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* updateKeyspace({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        keyspace: "test-keyspace",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateKeyspaceNotfound);
      if (result instanceof UpdateKeyspaceNotfound) {
        expect(result._tag).toBe("UpdateKeyspaceNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return UpdateKeyspaceNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* updateKeyspace({
        organization,
        database: "test", // Assuming a test database exists
        branch: "this-branch-definitely-does-not-exist-12345",
        keyspace: "test-keyspace",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateKeyspaceNotfound);
      if (result instanceof UpdateKeyspaceNotfound) {
        expect(result._tag).toBe("UpdateKeyspaceNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return UpdateKeyspaceNotfound for non-existent keyspace", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* updateKeyspace({
        organization,
        database: "test", // Assuming a test database exists
        branch: "main",
        keyspace: "this-keyspace-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(UpdateKeyspaceNotfound);
      if (result instanceof UpdateKeyspaceNotfound) {
        expect(result._tag).toBe("UpdateKeyspaceNotfound");
        expect(result.organization).toBe(organization);
        expect(result.keyspace).toBe("this-keyspace-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
