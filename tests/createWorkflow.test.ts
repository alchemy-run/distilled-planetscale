import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  createWorkflow,
  CreateWorkflowNotfound,
  CreateWorkflowInput,
  CreateWorkflowOutput,
} from "../src/operations/createWorkflow";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("createWorkflow", () => {
  it("should have the correct input schema", () => {
    expect(CreateWorkflowInput.fields.organization).toBeDefined();
    expect(CreateWorkflowInput.fields.database).toBeDefined();
    expect(CreateWorkflowInput.fields.name).toBeDefined();
    expect(CreateWorkflowInput.fields.source_keyspace).toBeDefined();
    expect(CreateWorkflowInput.fields.target_keyspace).toBeDefined();
    expect(CreateWorkflowInput.fields.global_keyspace).toBeDefined();
    expect(CreateWorkflowInput.fields.defer_secondary_keys).toBeDefined();
    expect(CreateWorkflowInput.fields.on_ddl).toBeDefined();
    expect(CreateWorkflowInput.fields.tables).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(CreateWorkflowOutput.fields.id).toBeDefined();
    expect(CreateWorkflowOutput.fields.name).toBeDefined();
    expect(CreateWorkflowOutput.fields.number).toBeDefined();
    expect(CreateWorkflowOutput.fields.state).toBeDefined();
    expect(CreateWorkflowOutput.fields.created_at).toBeDefined();
    expect(CreateWorkflowOutput.fields.updated_at).toBeDefined();
    expect(CreateWorkflowOutput.fields.started_at).toBeDefined();
    expect(CreateWorkflowOutput.fields.completed_at).toBeDefined();
    expect(CreateWorkflowOutput.fields.cancelled_at).toBeDefined();
    expect(CreateWorkflowOutput.fields.workflow_type).toBeDefined();
    expect(CreateWorkflowOutput.fields.workflow_subtype).toBeDefined();
    expect(CreateWorkflowOutput.fields.defer_secondary_keys).toBeDefined();
    expect(CreateWorkflowOutput.fields.on_ddl).toBeDefined();
    expect(CreateWorkflowOutput.fields.actor).toBeDefined();
    expect(CreateWorkflowOutput.fields.branch).toBeDefined();
    expect(CreateWorkflowOutput.fields.source_keyspace).toBeDefined();
    expect(CreateWorkflowOutput.fields.target_keyspace).toBeDefined();
    expect(CreateWorkflowOutput.fields.global_keyspace).toBeDefined();
  });

  it.effect("should return CreateWorkflowNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* createWorkflow({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        name: "test-workflow",
        source_keyspace: "source",
        target_keyspace: "target",
        tables: ["test_table"],
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateWorkflowNotfound);
      if (result instanceof CreateWorkflowNotfound) {
        expect(result._tag).toBe("CreateWorkflowNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return CreateWorkflowNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* createWorkflow({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        name: "test-workflow",
        source_keyspace: "source",
        target_keyspace: "target",
        tables: ["test_table"],
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(CreateWorkflowNotfound);
      if (result instanceof CreateWorkflowNotfound) {
        expect(result._tag).toBe("CreateWorkflowNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
