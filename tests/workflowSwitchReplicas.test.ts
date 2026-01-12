import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  workflowSwitchReplicas,
  WorkflowSwitchReplicasNotfound,
  WorkflowSwitchReplicasInput,
  WorkflowSwitchReplicasOutput,
} from "../src/operations/workflowSwitchReplicas";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("workflowSwitchReplicas", () => {
  it("should have the correct input schema", () => {
    expect(WorkflowSwitchReplicasInput.fields.organization).toBeDefined();
    expect(WorkflowSwitchReplicasInput.fields.database).toBeDefined();
    expect(WorkflowSwitchReplicasInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(WorkflowSwitchReplicasOutput.fields.id).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.name).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.number).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.state).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.created_at).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.updated_at).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.started_at).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.completed_at).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.cancelled_at).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.workflow_type).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.workflow_subtype).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.defer_secondary_keys).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.on_ddl).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.actor).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.branch).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.source_keyspace).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.target_keyspace).toBeDefined();
    expect(WorkflowSwitchReplicasOutput.fields.global_keyspace).toBeDefined();
  });

  it.effect("should return WorkflowSwitchReplicasNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* workflowSwitchReplicas({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(WorkflowSwitchReplicasNotfound);
      if (result instanceof WorkflowSwitchReplicasNotfound) {
        expect(result._tag).toBe("WorkflowSwitchReplicasNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return WorkflowSwitchReplicasNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* workflowSwitchReplicas({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(WorkflowSwitchReplicasNotfound);
      if (result instanceof WorkflowSwitchReplicasNotfound) {
        expect(result._tag).toBe("WorkflowSwitchReplicasNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
