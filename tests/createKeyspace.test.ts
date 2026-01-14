import { Effect } from "effect";
import { expect } from "vitest";
import { Credentials } from "../src/credentials";
import {
  createKeyspace,
  CreateKeyspaceNotfound,
  CreateKeyspaceInput,
  CreateKeyspaceOutput,
} from "../src/operations/createKeyspace";
import { deleteKeyspace } from "../src/operations/deleteKeyspace";
import { withMainLayer, TEST_DATABASE } from "./setup";

withMainLayer("createKeyspace", (it) => {
  it("should have the correct input schema", () => {
    expect(CreateKeyspaceInput.fields.organization).toBeDefined();
    expect(CreateKeyspaceInput.fields.database).toBeDefined();
    expect(CreateKeyspaceInput.fields.branch).toBeDefined();
    expect(CreateKeyspaceInput.fields.name).toBeDefined();
    expect(CreateKeyspaceInput.fields.cluster_size).toBeDefined();
    expect(CreateKeyspaceInput.fields.extra_replicas).toBeDefined();
    expect(CreateKeyspaceInput.fields.shards).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CreateKeyspaceOutput.fields.id).toBeDefined();
    expect(CreateKeyspaceOutput.fields.name).toBeDefined();
    expect(CreateKeyspaceOutput.fields.shards).toBeDefined();
    expect(CreateKeyspaceOutput.fields.sharded).toBeDefined();
    expect(CreateKeyspaceOutput.fields.replicas).toBeDefined();
    expect(CreateKeyspaceOutput.fields.extra_replicas).toBeDefined();
    expect(CreateKeyspaceOutput.fields.created_at).toBeDefined();
    expect(CreateKeyspaceOutput.fields.updated_at).toBeDefined();
    expect(CreateKeyspaceOutput.fields.cluster_name).toBeDefined();
    expect(CreateKeyspaceOutput.fields.cluster_display_name).toBeDefined();
    expect(CreateKeyspaceOutput.fields.resizing).toBeDefined();
    expect(CreateKeyspaceOutput.fields.resize_pending).toBeDefined();
    expect(CreateKeyspaceOutput.fields.ready).toBeDefined();
    expect(CreateKeyspaceOutput.fields.metal).toBeDefined();
    expect(CreateKeyspaceOutput.fields.default).toBeDefined();
    expect(CreateKeyspaceOutput.fields.imported).toBeDefined();
    expect(CreateKeyspaceOutput.fields.vector_pool_allocation).toBeDefined();
    expect(CreateKeyspaceOutput.fields.replication_durability_constraints).toBeDefined();
    expect(CreateKeyspaceOutput.fields.vreplication_flags).toBeDefined();
  });

  it.effect("should return CreateKeyspaceNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* createKeyspace({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        branch: "main",
        name: "test-keyspace",
        cluster_size: "PS-10",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateKeyspaceNotfound);
      if (result instanceof CreateKeyspaceNotfound) {
        expect(result._tag).toBe("CreateKeyspaceNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return CreateKeyspaceNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* createKeyspace({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        branch: "main",
        name: "test-keyspace",
        cluster_size: "PS-10",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateKeyspaceNotfound);
      if (result instanceof CreateKeyspaceNotfound) {
        expect(result._tag).toBe("CreateKeyspaceNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }),
  );

  it.effect("should return CreateKeyspaceNotfound for non-existent branch", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const result = yield* createKeyspace({
        organization,
        database: TEST_DATABASE,
        branch: "this-branch-definitely-does-not-exist-12345",
        name: "test-keyspace",
        cluster_size: "PS-10",
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateKeyspaceNotfound);
      if (result instanceof CreateKeyspaceNotfound) {
        expect(result._tag).toBe("CreateKeyspaceNotfound");
        expect(result.organization).toBe(organization);
        expect(result.branch).toBe("this-branch-definitely-does-not-exist-12345");
      }
    }),
  );

  // Note: This test is skipped because creating keyspaces requires an existing database/branch
  // and may incur costs. When enabled, it demonstrates proper cleanup using Effect.ensuring.
  it.effect("should create a keyspace successfully and clean up", () =>
    Effect.gen(function* () {
      const { organization } = yield* Credentials;
      const database = TEST_DATABASE;
      const branch = "main";
      const testKeyspaceName = `test-keyspace-${Date.now()}`;

      const result = yield* createKeyspace({
        organization,
        database,
        branch,
        name: testKeyspaceName,
        cluster_size: "PS-10",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", testKeyspaceName);
      expect(result).toHaveProperty("shards");
      expect(result).toHaveProperty("sharded");
      expect(result).toHaveProperty("replicas");
      expect(result).toHaveProperty("cluster_name");
    }).pipe(
      // Always clean up the keyspace, even if the test fails
      Effect.ensuring(
        Effect.gen(function* () {
          const { organization } = yield* Credentials;
          const database = TEST_DATABASE;
          const branch = "main";
          const testKeyspaceName = `test-keyspace-${Date.now()}`;
          yield* deleteKeyspace({
            organization,
            database,
            branch,
            keyspace: testKeyspaceName,
          }).pipe(Effect.ignore);
        }),
      ),
    ),
  );
});
