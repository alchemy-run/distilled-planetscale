import { FetchHttpClient } from "@effect/platform";
import { it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe, expect } from "vitest";
import { PlanetScaleCredentials, PlanetScaleCredentialsLive } from "../src/credentials";
import {
  workflowReverseCutover,
  WorkflowReverseCutoverNotfound,
  WorkflowReverseCutoverInput,
  WorkflowReverseCutoverOutput,
} from "../src/operations/workflowReverseCutover";
import "./setup";

const MainLayer = Layer.merge(PlanetScaleCredentialsLive, FetchHttpClient.layer);

describe("workflowReverseCutover", () => {
  it("should have the correct input schema", () => {
    expect(WorkflowReverseCutoverInput.fields.organization).toBeDefined();
    expect(WorkflowReverseCutoverInput.fields.database).toBeDefined();
    expect(WorkflowReverseCutoverInput.fields.number).toBeDefined();
  });

  it("should have the correct output schema", () => {
    expect(WorkflowReverseCutoverOutput.fields.id).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.name).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.number).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.state).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.created_at).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.updated_at).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.started_at).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.completed_at).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.cancelled_at).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.reversed_at).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.workflow_type).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.workflow_subtype).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.defer_secondary_keys).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.on_ddl).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.actor).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.branch).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.source_keyspace).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.target_keyspace).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.global_keyspace).toBeDefined();
    expect(WorkflowReverseCutoverOutput.fields.reversed_cutover_by).toBeDefined();
  });

  it.effect("should return WorkflowReverseCutoverNotfound for non-existent organization", () =>
    Effect.gen(function* () {
      const result = yield* workflowReverseCutover({
        organization: "this-org-definitely-does-not-exist-12345",
        database: "test-db",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(WorkflowReverseCutoverNotfound);
      if (result instanceof WorkflowReverseCutoverNotfound) {
        expect(result._tag).toBe("WorkflowReverseCutoverNotfound");
        expect(result.organization).toBe("this-org-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );

  it.effect("should return WorkflowReverseCutoverNotfound for non-existent database", () =>
    Effect.gen(function* () {
      const { organization } = yield* PlanetScaleCredentials;
      const result = yield* workflowReverseCutover({
        organization,
        database: "this-database-definitely-does-not-exist-12345",
        number: 99999,
      }).pipe(
        Effect.matchEffect({
          onFailure: (error) => Effect.succeed(error),
          onSuccess: () => Effect.succeed(null),
        }),
      );

      expect(result).toBeInstanceOf(WorkflowReverseCutoverNotfound);
      if (result instanceof WorkflowReverseCutoverNotfound) {
        expect(result._tag).toBe("WorkflowReverseCutoverNotfound");
        expect(result.organization).toBe(organization);
        expect(result.database).toBe("this-database-definitely-does-not-exist-12345");
      }
    }).pipe(Effect.provide(MainLayer)),
  );
});
