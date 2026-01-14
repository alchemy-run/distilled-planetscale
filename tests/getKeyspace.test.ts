import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  getKeyspace,
  GetKeyspaceNotfound,
  GetKeyspaceInput,
  GetKeyspaceOutput,
} from "../src/operations/getKeyspace";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("getKeyspace", (it) => {
  it("should have the correct input schema", () => {
    expect(GetKeyspaceInput.fields.organization).toBeDefined();
    expect(GetKeyspaceInput.fields.database).toBeDefined();
    expect(GetKeyspaceInput.fields.branch).toBeDefined();
    expect(GetKeyspaceInput.fields.keyspace).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(GetKeyspaceOutput.fields.id).toBeDefined();
    expect(GetKeyspaceOutput.fields.name).toBeDefined();
    expect(GetKeyspaceOutput.fields.shards).toBeDefined();
    expect(GetKeyspaceOutput.fields.sharded).toBeDefined();
    expect(GetKeyspaceOutput.fields.replicas).toBeDefined();
    expect(GetKeyspaceOutput.fields.extra_replicas).toBeDefined();
    expect(GetKeyspaceOutput.fields.created_at).toBeDefined();
    expect(GetKeyspaceOutput.fields.updated_at).toBeDefined();
    expect(GetKeyspaceOutput.fields.cluster_name).toBeDefined();
    expect(GetKeyspaceOutput.fields.cluster_display_name).toBeDefined();
    expect(GetKeyspaceOutput.fields.resizing).toBeDefined();
    expect(GetKeyspaceOutput.fields.resize_pending).toBeDefined();
    expect(GetKeyspaceOutput.fields.ready).toBeDefined();
    expect(GetKeyspaceOutput.fields.metal).toBeDefined();
    expect(GetKeyspaceOutput.fields.default).toBeDefined();
    expect(GetKeyspaceOutput.fields.imported).toBeDefined();
    expect(GetKeyspaceOutput.fields.vector_pool_allocation).toBeDefined();
    expect(GetKeyspaceOutput.fields.replication_durability_constraints).toBeDefined();
    expect(GetKeyspaceOutput.fields.vreplication_flags).toBeDefined();
  });

  it.effect("should return GetKeyspaceNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* getKeyspace({
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

      expect(result).toBeInstanceOf(GetKeyspaceNotfound);
      if (result instanceof GetKeyspaceNotfound) {
        expect(result._tag).toBe("GetKeyspaceNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetKeyspaceNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* getKeyspace({
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

      expect(result).toBeInstanceOf(GetKeyspaceNotfound);
      if (result instanceof GetKeyspaceNotfound) {
        expect(result._tag).toBe("GetKeyspaceNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetKeyspaceNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* getKeyspace({
        organization,
        database: TEST_DATABASE,
        branch: "this-branch-definitely-does-not-exist-12345",
        keyspace: "test-keyspace",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetKeyspaceNotfound);
      if (result instanceof GetKeyspaceNotfound) {
        expect(result._tag).toBe("GetKeyspaceNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return GetKeyspaceNotfound for non-existent keyspace", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* getKeyspace({
        organization,
        database: TEST_DATABASE,
        branch: "main",
        keyspace: "this-keyspace-definitely-does-not-exist-12345",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(GetKeyspaceNotfound);
      if (result instanceof GetKeyspaceNotfound) {
        expect(result._tag).toBe("GetKeyspaceNotfound");
        expect(result.organization).toBe(organization);
        expect(result.keyspace).toBe("this-keyspace-definitely-does-not-exist-12345");
      }
    }),
  );
});
